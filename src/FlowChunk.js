import {abortableSleep, each, evalOpts} from './tools.js';
import {sendRequest} from './Transport.js';
import Deferred from './Deferred.js';

/**
 * One uploaded chunk.
 *
 * FlowChunk owns an explicit state machine:
 *
 *   pending -> reading -> uploading -> success
 *      ^          |           |
 *      |          v           v
 *      +------ paused      error (permanent)
 *      |
 *      +------ cancelled
 *
 * XHR listeners only resolve Transport promises. This class never schedules
 * another chunk or another upload from an event handler.
 */
export default class FlowChunk {
  constructor(flowObj, fileObj, offset) {
    this.flowObj = flowObj;
    this.fileObj = fileObj;
    this.offset = offset;

    this.tested = false;
    this.retries = 0;
    this.pendingRetry = false;

    this.preprocessState = 0;
    this.readState = 0;

    /**
     * undefined = not read, null = EOF/no data, anything else = payload.
     * A zero-length Blob is a valid payload (empty file).
     */
    this.payload = undefined;
    this.readBytes = -1;
    this.checksum = null;
    this._checksumComputed = false;

    this.loaded = 0;
    this.total = 0;

    this.chunkSize = this.fileObj.chunkSize;
    this.startByte = this.offset * this.chunkSize;
    this.filename = null;
    this.endByte = this.computeEndByte();
    this.xhr = null;

    this.state = 'pending';
    this.isLastChunk = false;
    this._abortReason = null;
    this._controller = null;
    this._uploadPromise = null;
    this._responseText = '';
    this.uploadState = new Deferred();
  }

  computeEndByte() {
    if (this.fileObj.streaming) {
      if (this.fileObj.size > 0 && this.startByte < this.fileObj.size) {
        return Math.min(this.fileObj.size, this.startByte + this.chunkSize);
      }
      return this.startByte + this.chunkSize;
    }
    var endByte = Math.min(this.fileObj.size, (this.offset + 1) * this.chunkSize);
    if (this.fileObj.size - endByte < this.chunkSize && !this.flowObj.opts.forceChunkSize) {
      // The last chunk will be bigger than the chunk size,
      // but less than 2 * this.chunkSize
      endByte = this.fileObj.size;
    }
    return endByte;
  }

  /**
   * Send a chunk event to the parent FlowFile.
   */
  event(event, ...args) {
    this.fileObj.chunkEvent(this, event, ...args);
  }

  progressHandler(event) {
    if (event.lengthComputable) {
      this.loaded = event.loaded;
      this.total = event.total;
    }
    this.event('progress', event);
  }

  /**
   * Read this chunk once. Returns undefined=not read, null=EOF, or data.
   * A zero-length Blob is data.
   */
  async read(signal) {
    if (this.payload !== undefined) {
      if (this.payload !== null &&
          !this._checksumComputed &&
          typeof this.flowObj.opts.chunkChecksum === 'function') {
        this.checksum = await this.flowObj.opts.chunkChecksum(this, this.payload);
        this._checksumComputed = true;
      }
      return this.payload;
    }

    const preprocess = this.flowObj.opts.preprocess;
    if (typeof preprocess === 'function') {
      this.preprocessState = 1;
      try {
        await preprocess(this);
      } finally {
        this.preprocessState = 2;
      }
      // Re-compute endByte after preprocess, which may change fileObj.size.
      this.endByte = this.computeEndByte();
    }

    this.readState = 1;
    this.state = 'reading';

    // Give the reader its own cancellable signal. The session signal is
    // linked in, so a session pause/cancel and a per-file pause/cancel both
    // abort the read. A reader that ignores the signal is still discarded by
    // the state checks below.
    const controller = new AbortController();
    this._controller = controller;
    const onParentAbort = () => controller.abort();
    if (signal) {
      if (signal.aborted) {
        controller.abort();
      } else {
        signal.addEventListener('abort', onParentAbort, {once: true});
      }
    }

    if (controller.signal.aborted) {
      if (signal) {
        signal.removeEventListener('abort', onParentAbort);
      }
      if (this._controller === controller) {
        this._controller = null;
      }
      this.readState = 2;
      return null;
    }

    let data;
    try {
      data = await this.flowObj.opts.readFileFn(
        this.fileObj,
        this.startByte,
        this.endByte,
        this.fileObj.file.type,
        this,
        {signal: controller.signal}
      );
    } catch (error) {
      if (controller.signal.aborted ||
          this.fileObj.paused ||
          this.fileObj.cancelled ||
          this.fileObj.error) {
        return null;
      }
      throw error;
    } finally {
      if (signal) {
        signal.removeEventListener('abort', onParentAbort);
      }
      if (this._controller === controller) {
        this._controller = null;
      }
      this.readState = 2;
    }

    // Cache the completed read even if pause/cancel/error raced with it. A
    // stateful reader (stream cipher, GPG packetizer, ...) has already
    // consumed those bytes; discarding them would corrupt the stream on
    // resume. The session still decides whether to upload this payload.
    if (data === null || typeof data === 'undefined') {
      this.payload = null;
      this.readBytes = 0;
      this._checksumComputed = true;
    } else {
      if (typeof data === 'string') {
        data = new Blob([data], {type: 'application/octet-stream'});
      }
      this.payload = data;
      if (typeof data.size === 'number') {
        this.readBytes = data.size;
      } else if (typeof data.byteLength === 'number') {
        this.readBytes = data.byteLength;
      } else if (typeof data.length === 'number') {
        this.readBytes = data.length;
      } else {
        this.readBytes = -1;
      }
      if (this.chunkSize && this.readBytes > this.chunkSize) {
        console.warn(
          `Chunk ${this.offset}: returned too much data. ` +
          `Got ${this.readBytes}. Expected no more than ${this.chunkSize}.`
        );
      }
    }

    if (this.payload !== null &&
        typeof this.flowObj.opts.chunkChecksum === 'function') {
      this.checksum = await this.flowObj.opts.chunkChecksum(this, this.payload);
      this._checksumComputed = true;
    }

    return this.payload;
  }

  /**
   * Upload one payload. Handles test requests and retries in a loop.
   * Resolves with 'success', 'error', 'pending' or 'cancelled'.
   */
  async upload(payload, signal) {
    if (this.state === 'success' || this.state === 'error' || this.state === 'cancelled') {
      return this.state;
    }

    this.isLastChunk = false;
    if (this.fileObj.streaming && this.fileObj.eof &&
        this.offset === this.fileObj.eofOffset) {
      this.isLastChunk = true;
    }
    if (payload === null || typeof payload === 'undefined') {
      if (this.fileObj.streaming) {
        if (this.fileObj.eof && this.offset > this.fileObj.eofOffset) {
          this.endByte = this.startByte;
          return this._succeed('');
        }
        this.fileObj.eof = true;
        this.fileObj.eofOffset = this.offset;
        this.isLastChunk = true;
        this.endByte = this.startByte;
        // Pre-created estimate chunks beyond EOF are never sent.
        for (const other of this.fileObj.chunks) {
          if (other.offset > this.offset &&
              !['success', 'error', 'cancelled'].includes(other.state)) {
            other.endByte = other.startByte;
            other.state = 'success';
            other.uploadState.resolve({status: 'success'});
          }
        }
        // Send a zero-byte final marker so a streaming server knows the end
        // even when the last data chunk was exactly full.
        payload = new Blob([]);
      } else if (this.fileObj.size === 0) {
        // An empty file still deserves exactly one zero-byte request.
        payload = new Blob([]);
      } else if (this.flowObj.opts.allowShortStream) {
        // Opt-in compatibility for streams whose declared size is an upper
        // bound. Silent truncation is otherwise treated as an error.
        this.fileObj.eof = true;
        return this._succeed('');
      } else {
        return this._fail({
          responseText: `Unexpected EOF at chunk ${this.offset + 1}/` +
            `${this.fileObj.chunks.length}; the file may be truncated`
        });
      }
    } else if (this.fileObj.streaming && payload.size === 0 && this.offset > 0) {
      // Blob-backed streaming sources signal EOF with an empty slice.
      this.fileObj.eof = true;
      this.fileObj.eofOffset = this.offset;
      this.isLastChunk = true;
      this.endByte = this.startByte;
      for (const other of this.fileObj.chunks) {
        if (other.offset > this.offset &&
            !['success', 'error', 'cancelled'].includes(other.state)) {
          other.endByte = other.startByte;
          other.state = 'success';
          other.uploadState.resolve({status: 'success'});
        }
      }
    }

    if (this.uploadState.settled) {
      this.uploadState = new Deferred();
    }

    const controller = new AbortController();
    this._controller = controller;
    this._abortReason = null;
    const onParentAbort = () => controller.abort();
    if (signal) {
      if (signal.aborted) {
        controller.abort();
      } else {
        signal.addEventListener('abort', onParentAbort, {once: true});
      }
    }

    const promise = (async () => {
      while (true) {
        if (controller.signal.aborted) {
          return this._aborted();
        }

        const opts = this.flowObj.opts;

        if (opts.testChunks && !this.tested) {
          const testResult = await this._test(controller.signal);
          if (controller.signal.aborted) {
            return this._aborted();
          }
          if (testResult.ok) {
            if (opts.successStatuses.includes(testResult.status)) {
              this.tested = true;
              return this._succeed(testResult.responseText);
            }
            if ((opts.testNotFoundStatuses || []).includes(testResult.status)) {
              // The chunk is not on the server yet.
              this.tested = true;
            } else if (opts.permanentErrors.includes(testResult.status)) {
              return this._fail(testResult);
            } else {
              if (this.retries >= opts.maxChunkRetries) {
                return this._fail(testResult);
              }
              this.retries++;
              this.state = 'pending';
              this.pendingRetry = true;
              this.event('retry', testResult.responseText || '');
              await abortableSleep(opts.chunkRetryInterval, controller.signal);
              this.pendingRetry = false;
              continue;
            }
          } else if (testResult.aborted) {
            return this._aborted();
          } else {
            if (this.retries >= opts.maxChunkRetries) {
              return this._fail(testResult);
            }
            this.retries++;
            this.state = 'pending';
            this.pendingRetry = true;
            this.event('retry', testResult.responseText || '');
            await abortableSleep(opts.chunkRetryInterval, controller.signal);
            this.pendingRetry = false;
            continue;
          }
        }

        this.state = 'uploading';
        this.loaded = 0;
        this.total = 0;
        this.pendingRetry = false;

        const result = await this._xhrSend(payload, controller.signal);
        if (controller.signal.aborted) {
          return this._aborted();
        }
        if (result.ok && opts.successStatuses.includes(result.status)) {
          return this._succeed(result.responseText);
        }
        if (result.ok && opts.permanentErrors.includes(result.status)) {
          return this._fail(result);
        }
        if (result.aborted) {
          return this._aborted();
        }
        if (this.retries >= opts.maxChunkRetries) {
          return this._fail(result);
        }

        this.retries++;
        this.state = 'pending';
        this.pendingRetry = true;
        this.event('retry', result.responseText || '');
        await abortableSleep(opts.chunkRetryInterval, controller.signal);
        this.pendingRetry = false;
      }
    })();

    this._uploadPromise = promise;
    try {
      return await promise;
    } finally {
      if (signal) {
        signal.removeEventListener('abort', onParentAbort);
      }
      if (this._controller === controller) {
        this._controller = null;
      }
      if (this._uploadPromise === promise) {
        this._uploadPromise = null;
      }
    }
  }

  _succeed(message) {
    this.state = 'success';
    this.pendingRetry = false;
    const size = this.endByte - this.startByte;
    this.loaded = size;
    this.total = size;
    this._responseText = message || '';
    this.uploadState.resolve({status: 'success', message: this._responseText});
    this.event('success', this._responseText);
    // Free the payload after a successful upload. A later force-retry must
    // read (and checksum) the data again.
    this.payload = undefined;
    this.checksum = null;
    this._checksumComputed = false;
    return 'success';
  }

  _fail(result) {
    this.state = 'error';
    this.pendingRetry = false;
    this._responseText = (result && result.responseText) || '';
    this.uploadState.resolve({status: 'error', message: this._responseText});
    this.event('error', this._responseText);
    return 'error';
  }

  _aborted() {
    const reason = this._abortReason || 'pending';
    this.state = reason === 'cancelled' || reason === 'error' ? reason : 'pending';
    this.pendingRetry = false;
    this.uploadState.resolve({status: this.state});
    return this.state;
  }

  /**
   * Abort the active read/request. `reason` is the state to return to.
   */
  abort(reason = 'pending') {
    this._abortReason = reason;
    if (this._controller) {
      this._controller.abort();
    }
    // A read cannot be interrupted synchronously. Leave it in 'reading'
    // until the reader settles; the session discards the result if the file
    // was paused or cancelled meanwhile.
    if (this.state === 'uploading' || this.state === 'retrying') {
      this.state = reason === 'cancelled' || reason === 'error' ? reason : 'pending';
    }
  }

  /**
   * Low-level convenience used by tests: read then upload this chunk.
   * Resolves when the attempt reaches a terminal state (or pause/cancel).
   */
  async send(signal) {
    if (this.state === 'success' || this.state === 'error' || this.state === 'cancelled') {
      return this.state;
    }
    if (this.uploadState.settled) {
      this.uploadState = new Deferred();
    }
    const payload = await this.read(signal);
    if (this.fileObj.cancelled) {
      this.state = 'cancelled';
      this.uploadState.resolve({status: 'cancelled'});
      return 'cancelled';
    }
    if (this.fileObj.error) {
      this.state = 'error';
      this.uploadState.resolve({status: 'error', message: this.fileObj.errorMessage || ''});
      return 'error';
    }
    if (this.fileObj.paused) {
      this.state = 'pending';
      this.uploadState.resolve({status: 'pending'});
      return 'pending';
    }
    this.upload(payload, signal);
    return this.uploadState.promise;
  }

  async _test(signal) {
    const opts = this.flowObj.opts;
    const method = evalOpts(opts.testMethod, this.fileObj, this, true);
    const request = this.buildRequest(method, true);
    return sendRequest(Object.assign(request, {
      withCredentials: opts.withCredentials,
      timeout: opts.xhrTimeout || 0,
      signal
    }));
  }

  async _xhrSend(payload, signal) {
    const opts = this.flowObj.opts;
    const method = evalOpts(opts.uploadMethod, this.fileObj, this, false);
    const request = this.buildRequest(method, false, opts.method, payload);
    if (typeof opts.changeRawDataBeforeSend === 'function') {
      const changed = await opts.changeRawDataBeforeSend(this, request.body);
      if (typeof changed !== 'undefined') {
        request.body = changed;
      }
    }
    return sendRequest(Object.assign(request, {
      withCredentials: opts.withCredentials,
      timeout: opts.xhrTimeout || 0,
      onProgress: event => this.progressHandler(event),
      signal
    }));
  }

  /**
   * Bookkeeping parameters describing this chunk, for the receiving server.
   *
   * Not sent when `sendFlowParams` is false: see buildRequest().
   */
  getParams() {
    var params = {
      flowChunkNumber: this.offset + 1,
      flowChunkSize: this.chunkSize,
      flowCurrentChunkSize: this.endByte - this.startByte,
      flowTotalSize: this.fileObj.size,
      flowIdentifier: this.fileObj.uniqueIdentifier,
      flowFilename: this.fileObj.name,
      flowRelativePath: this.fileObj.relativePath,
      flowTotalChunks: this.fileObj.chunks.length
    };
    if (this.fileObj.streaming) {
      params.flowTotalSize = -1;
      params.flowIsStreaming = 'true';
      params.flowChunkIsLast = this.isLastChunk ? 'true' : 'false';
    }
    if (this.checksum !== null && typeof this.checksum !== 'undefined') {
      params.flowChunkHash = this.checksum;
    }
    return params;
  }

  getTarget(target, params) {
    if (params.length === 0) {
      return target;
    }
    if (target.indexOf('?') < 0) {
      target += '?';
    } else {
      target += '&';
    }
    return target + params.join('&');
  }

  /**
   * Build a transport request without opening or sending it.
   */
  buildRequest(method, isTest, paramsMethod, blob) {
    const opts = this.flowObj.opts;
    var query = evalOpts(opts.query, this.fileObj, this, isTest);
    // `sendFlowParams: false` keeps the request byte-exact: no flow.js
    // bookkeeping is appended to the URL (octet) or to the body (multipart).
    // Required by endpoints whose URL is signed, such as an S3 pre-signed
    // UploadPart URL, where any extra query parameter invalidates the
    // signature. Incompatible with `testChunks`, which needs those parameters
    // to let the server recognise an already-uploaded chunk.
    if (opts.sendFlowParams !== false) {
      query = Object.assign({}, query || {}, this.getParams());
    } else {
      query = Object.assign({}, query || {});
    }

    var target = evalOpts(opts.target, this.fileObj, this, isTest);
    var body = null;
    if (method === 'GET' || paramsMethod === 'octet') {
      var params = [];
      each(query, (value, key) => {
        params.push([encodeURIComponent(key), encodeURIComponent(value)].join('='));
      });
      target = this.getTarget(target, params);
      body = blob || null;
    } else {
      body = new FormData();
      each(query, (value, key) => {
        body.append(key, value);
      });
      if (typeof blob !== 'undefined' && blob !== null) {
        body.append(opts.fileParameterName, blob, this.filename || this.fileObj.file.name);
      }
    }

    return {
      method,
      url: target,
      body,
      headers: evalOpts(opts.headers, this.fileObj, this, isTest) || {}
    };
  }

  status() {
    return this.state;
  }

  message() {
    return this._responseText;
  }

  getState() {
    return `#${this.offset} state:${this.state} read:${this.readState} ` +
      `up:${this.loaded}/${this.total} size:${this.payload && this.payload.size}`;
  }

  progress() {
    if (this.state === 'success' || this.state === 'error') {
      return 1;
    }
    if (this.state === 'pending' || this.state === 'cancelled') {
      return 0;
    }
    return this.total > 0 ? this.loaded / this.total : 0;
  }

  sizeUploaded() {
    var size = this.endByte - this.startByte;
    if (this.state !== 'success') {
      size = this.progress() * size;
    }
    return size;
  }
}
