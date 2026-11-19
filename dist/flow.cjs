'use strict';

const __FLOW_VERSION__ = "3.0.0-alpha.1";

/**
 * If option is a function, evaluate it with given params
 * @param {*} data
 * @param {...} args arguments of a callback
 * @returns {*}
 */
function evalOpts(data, args) {
  if (typeof data === "function") {
    // `arguments` is an object, not array, in FF, so:
    args = Array.prototype.slice.call(arguments);
    data = data.apply(null, args.slice(1));
  }
  return data;
}

/**
 * Iterate each element of an object
 * @function
 * @param {Array|Object} obj object or an array to iterate
 * @param {Function} callback first argument is a value and second is a key.
 * @param {Object=} context Object to become context (`this`) for the iterator function.
 */
function each(obj, callback, context) {
  if (!obj) {
    return ;
  }
  var key;
  // Is Array?
  // Array.isArray won't work, not only arrays can be iterated by index https://github.com/flowjs/ng-flow/issues/236#
  if (typeof(obj.length) !== 'undefined') {
    for (key = 0; key < obj.length; key++) {
      if (callback.call(context, obj[key], key) === false) {
        return ;
      }
    }
  } else {
    for (key in obj) {
      if (obj.hasOwnProperty(key) && callback.call(context, obj[key], key) === false) {
        return ;
      }
    }
  }
}

/**
 * Exclusively for test purposes
 * (Until Grunt+Karma+Jasmine can allow test to use (ES) `import` of tools.js)
 */
var g$4 = typeof window !== 'undefined' ? window
    : typeof global !== 'undefined' ? global
    : typeof self !== 'undefined' ? self : {};
g$4.evalOpts = evalOpts;
g$4.FlowTools = {abortableSleep, each, evalOpts, sleep};


/**
 * Resolve after `milliseconds`, or as soon as `signal` aborts.
 * @param {number} milliseconds
 * @param {AbortSignal} [signal]
 * @returns {Promise<void>}
 */
function abortableSleep(milliseconds, signal) {
  if (!milliseconds || milliseconds <= 0) {
    return Promise.resolve();
  }
  return new Promise(resolve => {
    let timer = setTimeout(finish, milliseconds);
    function finish() {
      clearTimeout(timer);
      if (signal) {
        signal.removeEventListener('abort', finish);
      }
      resolve();
    }
    if (signal) {
      if (signal.aborted) {
        finish();
        return;
      }
      signal.addEventListener('abort', finish, {once: true});
    }
  });
}

/**
 * Plain delay, mostly useful for tests and custom readers.
 * @param {number} milliseconds
 * @returns {Promise<void>}
 */
function sleep(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

/**
 * Promise wrapper for one XMLHttpRequest.
 *
 * This is the only place that listens to XHR events. Listeners resolve the
 * request promise; they never schedule work or call back into Flow.
 *
 * @param {Object} request
 * @param {string} request.method
 * @param {string} request.url
 * @param {Object} [request.headers]
 * @param {*} [request.body]
 * @param {boolean} [request.withCredentials]
 * @param {number} [request.timeout] milliseconds, 0 = no timeout
 * @param {Function} [request.onProgress]
 * @param {AbortSignal} [request.signal]
 * @returns {Promise<Object>} request result
 */
function sendRequest({
  method,
  url,
  headers = {},
  body = null,
  withCredentials = false,
  timeout = 0,
  onProgress = null,
  signal = null
}) {
  return new Promise(resolve => {
    const xhr = new XMLHttpRequest();
    let settled = false;

    function cleanup() {
      xhr.removeEventListener('load', onLoad);
      xhr.removeEventListener('error', onError);
      xhr.removeEventListener('abort', onAbort);
      xhr.removeEventListener('timeout', onTimeout);
      if (onProgress && xhr.upload) {
        xhr.upload.removeEventListener('progress', onProgress);
      }
      if (signal) {
        signal.removeEventListener('abort', onSignalAbort);
      }
    }

    function done(result) {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      resolve(Object.assign({xhr}, result));
    }

    function onLoad() {
      done({ok: true, status: xhr.status, responseText: xhr.responseText});
    }

    function onError() {
      done({ok: false, status: 0, networkError: true, responseText: ''});
    }

    function onAbort() {
      done({ok: false, status: 0, aborted: true, responseText: ''});
    }

    function onTimeout() {
      done({ok: false, status: 0, timedOut: true, responseText: ''});
    }

    function onSignalAbort() {
      try { xhr.abort(); } catch (error) { onAbort(); }
    }

    xhr.addEventListener('load', onLoad);
    xhr.addEventListener('error', onError);
    xhr.addEventListener('abort', onAbort);
    xhr.addEventListener('timeout', onTimeout);
    if (onProgress && xhr.upload) {
      xhr.upload.addEventListener('progress', onProgress);
    }
    if (signal) {
      if (signal.aborted) {
        onAbort();
        return;
      }
      signal.addEventListener('abort', onSignalAbort, {once: true});
    }

    try {
      if (timeout) {
        xhr.timeout = timeout;
      }
      xhr.open(method, url, true);
      xhr.withCredentials = withCredentials;
      for (const name of Object.keys(headers || {})) {
        xhr.setRequestHeader(name, headers[name]);
      }
      xhr.send(body);
    } catch (error) {
      done({ok: false, status: 0, error});
    }
  });
}

/**
 * Exclusively for test purposes.
 */
var g$3 = typeof window !== 'undefined' ? window
    : typeof global !== 'undefined' ? global
    : typeof self !== 'undefined' ? self : {};
g$3.FlowTransport = {sendRequest};

/**
 * Small idempotent deferred helper.
 */
class Deferred {
  constructor() {
    this.settled = false;
    this.promise = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
  }

  resolve(value) {
    if (this.settled) {
      return;
    }
    this.settled = true;
    this._resolve(value);
  }

  reject(error) {
    if (this.settled) {
      return;
    }
    this.settled = true;
    this._reject(error);
  }
}

/**
 * Exclusively for test purposes.
 */
var g$2 = typeof window !== 'undefined' ? window
    : typeof global !== 'undefined' ? global
    : typeof self !== 'undefined' ? self : {};
g$2.FlowDeferred = Deferred;

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
class FlowChunk {
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
    const request = await this.buildRequest(method, true);
    return sendRequest(Object.assign(request, {
      withCredentials: opts.withCredentials,
      timeout: opts.xhrTimeout || 0,
      signal
    }));
  }

  async _xhrSend(payload, signal) {
    const opts = this.flowObj.opts;
    const method = evalOpts(opts.uploadMethod, this.fileObj, this, false);
    const request = await this.buildRequest(method, false, opts.method, payload);
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
  /**
   * Resolve the request for this chunk.
   *
   * `target`, `query` and `headers` may return a promise. They are evaluated
   * here, after the payload has been read and `chunk.checksum` computed, so a
   * consumer can negotiate the destination or the integrity headers using the
   * digest of the exact bytes about to be sent. That is what endpoints with
   * per-chunk integrity checks require: an S3 pre-signed UploadPart URL, for
   * instance, is signed over the checksum it commits to, so it cannot be
   * produced before the chunk exists.
   */
  async buildRequest(method, isTest, paramsMethod, blob) {
    const opts = this.flowObj.opts;
    var query = await evalOpts(opts.query, this.fileObj, this, isTest);
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

    var target = await evalOpts(opts.target, this.fileObj, this, isTest);
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
      headers: (await evalOpts(opts.headers, this.fileObj, this, isTest)) || {}
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

/**
 * A file being uploaded by Flow.
 */
class FlowFile {
  constructor(flowObj, file, uniqueIdentifier) {
    this.flowObj = flowObj;
    this.file = file;
    this.name = file.fileName || file.name;
    this.size = file.size;
    this.relativePath = file.relativePath || file.webkitRelativePath || this.name;
    this.uniqueIdentifier = (
      uniqueIdentifier === undefined
        ? flowObj.generateUniqueIdentifier(file)
        : uniqueIdentifier
    );

    this.chunkSize = 0;
    this.chunks = [];

    this.paused = false;
    this.cancelled = false;
    this.error = false;
    this.errorMessage = null;
    this.streaming = !!flowObj.opts.streaming;
    this.eof = false;
    this.eofOffset = null;

    this.averageSpeed = 0;
    this.currentSpeed = 0;
    this._lastProgressCallback = Date.now();
    this._prevUploadedSize = 0;
    this._prevProgress = 0;
    this._successEmitted = false;
  }

  measureSpeed() {
    var timeSpan = Date.now() - this._lastProgressCallback;
    if (!timeSpan) {
      return;
    }
    var smoothingFactor = this.flowObj.opts.speedSmoothingFactor;
    var uploaded = this.sizeUploaded();
    this.currentSpeed = Math.max((uploaded - this._prevUploadedSize) / timeSpan * 1000, 0);
    this.averageSpeed = smoothingFactor * this.currentSpeed + (1 - smoothingFactor) * this.averageSpeed;
    this._prevUploadedSize = uploaded;
  }

  /**
   * Called by FlowChunk on progress/success/error/retry.
   */
  chunkEvent(chunk, event, message) {
    switch (event) {
      case 'progress':
        if (Date.now() - this._lastProgressCallback < this.flowObj.opts.progressCallbacksInterval) {
          break;
        }
        this.measureSpeed();
        this.flowObj._emit('file-progress', {
          file: this,
          chunk,
          progress: this.progress()
        });
        this.flowObj._emit('progress', {
          file: this,
          chunk,
          progress: this.flowObj.progress()
        });
        this._lastProgressCallback = Date.now();
        break;

      case 'error':
        if (this.error) {
          return;
        }
        this.error = true;
        this.errorMessage = message || '';
        this.currentSpeed = 0;
        this.averageSpeed = 0;
        // A permanent error terminates the file. Other outstanding chunks are
        // stopped and marked as errors so the session can settle.
        for (const other of this.chunks) {
          if (other === chunk || ['success', 'error', 'cancelled'].includes(other.state)) {
            continue;
          }
          other.abort('error');
          other.state = 'error';
          other.uploadState.resolve({status: 'error', message: this.errorMessage});
        }
        this.flowObj._emit('file-error', {file: this, message, chunk});
        this.flowObj._emit('error', {message, file: this, chunk});
        break;

      case 'success':
        if (this.error) {
          return;
        }
        this.measureSpeed();
        this.flowObj._emit('file-progress', {
          file: this,
          chunk,
          progress: this.progress()
        });
        this.flowObj._emit('progress', {
          file: this,
          chunk,
          progress: this.flowObj.progress()
        });
        this._lastProgressCallback = Date.now();
        if (this.isComplete() && !this._successEmitted) {
          this._successEmitted = true;
          this.currentSpeed = 0;
          this.averageSpeed = 0;
          this.flowObj._emit('file-success', {file: this, message, chunk});
        }
        break;

      case 'retry':
        this.flowObj._emit('file-retry', {file: this, chunk});
        break;
    }
  }

  pause() {
    this.paused = true;
    return this.abort('pending');
  }

  resume() {
    this.paused = false;
    return this.flowObj._resumeFiles([this]);
  }

  /**
   * Abort active chunks.
   * @param {string} reason 'pending' (pause), 'cancelled', or 'error'
   * @param {boolean} reset also drop the chunk list
   */
  abort(reason = 'pending', reset = false) {
    this.currentSpeed = 0;
    this.averageSpeed = 0;
    if (reason === 'cancelled') {
      this.cancelled = true;
    }
    const active = [];
    for (const chunk of this.chunks) {
      if (['reading', 'uploading', 'retrying'].includes(chunk.state)) {
        chunk.abort(reason);
        if (chunk._uploadPromise) {
          active.push(chunk._uploadPromise.catch(() => {}));
        }
      } else if (reason === 'cancelled' && !['success', 'error', 'cancelled'].includes(chunk.state)) {
        chunk.state = 'cancelled';
      } else if (reason === 'error' && !['success', 'error', 'cancelled'].includes(chunk.state)) {
        chunk.state = 'error';
      }
    }
    if (reset) {
      this.chunks = [];
    }
    return Promise.all(active);
  }

  cancel() {
    return this.flowObj.removeFile(this);
  }

  async retry() {
    if (this.chunks.length === 0) {
      await this.bootstrap({event: null, flow: this.flowObj});
    }
    this.error = false;
    this.errorMessage = null;
    this._successEmitted = false;
    this._prevProgress = 0;
    this._prevUploadedSize = 0;
    this._lastProgressCallback = Date.now();
    this.cancelled = false;
    this.paused = false;
    const hasFailure = this.chunks.some(chunk =>
      chunk.state === 'error' || chunk.state === 'cancelled'
    );
    const needsReset = this.chunks.some(chunk =>
      (chunk.state === 'error' || chunk.state === 'cancelled') &&
      typeof chunk.payload === 'undefined'
    );
    if (needsReset) {
      // A read failure has no cached payload. The source position is unknown
      // (especially for a stream), so reinitialize via initFileFn and rebuild
      // all chunks instead of reading a partially consumed stream.
      await this.bootstrap({event: null, flow: this.flowObj});
    } else {
      for (const chunk of this.chunks) {
        // Retry failed chunks after an error. If the file was fully uploaded,
        // retry() re-uploads the whole file (useful to re-run with new options).
        if (hasFailure && chunk.state !== 'error' && chunk.state !== 'cancelled') {
          continue;
        }
        chunk.state = 'pending';
        chunk.retries = 0;
        chunk.pendingRetry = false;
        chunk.tested = false;
        chunk._abortReason = null;
        // Keep a cached payload if the reader already produced one. For
        // non-rewindable streams this is what makes retry safe.
      }
    }
    return this.flowObj._resumeFiles([this]);
  }

  async bootstrap(context = {}, initFileFn = this.flowObj.opts.initFileFn) {
    if (typeof initFileFn === 'function') {
      await initFileFn(this, context);
    }
    this._bootstrap();
    return this;
  }

  _bootstrap() {
    this.chunks = [];
    this.eof = false;
    this.eofOffset = null;
    this.error = false;
    this.errorMessage = null;
    this._successEmitted = false;
    this._prevProgress = 0;
    this._prevUploadedSize = 0;
    this._lastProgressCallback = Date.now();
    this.cancelled = false;

    var round = this.flowObj.opts.forceChunkSize ? Math.ceil : Math.floor;
    this.chunkSize = evalOpts(this.flowObj.opts.chunkSize, this);
    var chunks = Math.max(round(this.size / this.chunkSize), 1);
    for (var offset = 0; offset < chunks; offset++) {
      this.chunks.push(new FlowChunk(this.flowObj, this, offset));
    }
  }

  progress() {
    if (this.error) {
      return 1;
    }
    if (this.chunks.length === 0) {
      return 0;
    }
    if (this.chunks.length === 1) {
      this._prevProgress = Math.max(this._prevProgress, this.chunks[0].progress());
      return this._prevProgress;
    }
    if (this.size === 0 || (this.streaming && this.size <= 0)) {
      return this.isComplete() ? 1 : 0;
    }
    var bytesLoaded = 0;
    each(this.chunks, function(chunk) {
      bytesLoaded += chunk.progress() * (chunk.endByte - chunk.startByte);
    });
    var percent = bytesLoaded / this.size;
    if (this.streaming) {
      if (this.eof && this.isComplete()) {
        return 1;
      }
      percent = Math.min(percent, 0.9999);
    }
    this._prevProgress = Math.max(this._prevProgress, percent > 0.9999 ? 1 : percent);
    return this._prevProgress;
  }

  isUploading() {
    return this.chunks.some(chunk => chunk.state === 'uploading');
  }

  isReading() {
    return this.chunks.some(chunk => chunk.state === 'reading');
  }

  /**
   * All work has reached a terminal state. A file with a permanent error is
   * complete but not successful.
   */
  isComplete() {
    return (this.error || !this.streaming || this.eof) &&
      this.chunks.every(chunk =>
        ['success', 'error', 'cancelled'].includes(chunk.state)
      );
  }

  isSuccessful() {
    return !this.error &&
      (!this.streaming || this.eof) &&
      this.chunks.length > 0 &&
      this.chunks.every(chunk => chunk.state === 'success');
  }

  sizeUploaded() {
    return this.chunks.reduce((total, chunk) => total + chunk.sizeUploaded(), 0);
  }

  timeRemaining() {
    if (this.paused || this.error) {
      return 0;
    }
    var delta = this.size - this.sizeUploaded();
    if (delta && !this.averageSpeed) {
      return Number.POSITIVE_INFINITY;
    }
    if (!delta && !this.averageSpeed) {
      return 0;
    }
    return Math.floor(delta / this.averageSpeed);
  }

  getType() {
    return this.file.type && this.file.type.split('/')[1];
  }

  getExtension() {
    return this.name.substr((~-this.name.lastIndexOf('.') >>> 0) + 2).toLowerCase();
  }
}

/**
 * Exclusively for test purposes
 * (Until Grunt+Karma+Jasmine can allow tests to use ES imports).
 */
var g$1 = typeof window !== 'undefined' ? window
    : typeof global !== 'undefined' ? global
    : typeof self !== 'undefined' ? self : {};
g$1.FlowFile = FlowFile;

/**
 * One upload session per Flow instance.
 *
 * A session runs one or more cycles. Each cycle reads chunks in order through
 * an async generator and uploads them with a bounded worker pool. There is no
 * recursive scheduling from XHR or event handlers.
 */
class UploadSession {
  constructor(flow) {
    this.flow = flow;
    this.finished = false;
    this.cancelled = false;
    this.started = false;
    this._deferred = new Deferred();
    this.promise = this._deferred.promise;
    this._controller = null;
    this._cycle = null;
    this._wake = null;
  }

  start() {
    if (!this.started) {
      this.started = true;
      this.flow._emit('upload-start', {files: this.flow.files});
      this._run().catch(error => this._finishWithError(error));
    }
    return this.promise;
  }

  resume() {
    if (this.finished) {
      return this.flow.upload();
    }
    this.flow._emit('upload-resume', {files: this.flow.files});
    this.wake();
    return this.promise;
  }

  cancel() {
    if (this.finished) {
      return;
    }
    this.cancelled = true;
    this._abort();
    this.wake();
  }

  wake() {
    if (this._wake) {
      const wake = this._wake;
      this._wake = null;
      wake.resolve();
    }
  }

  _abort() {
    if (this._controller) {
      this._controller.abort();
    }
  }

  async _run() {
    while (!this.finished) {
      if (this.cancelled) {
        return this._finish('cancelled');
      }
      if (this._hasRunnablePending()) {
        await this._runCycle();
        continue;
      }
      if (!this._hasPending()) {
        if (this._createNextStreamChunk()) {
          continue;
        }
        if (this._hasPausedStreaming()) {
          await this._waitForWork();
          continue;
        }
        return this._finish('complete');
      }
      // All remaining chunks belong to paused files. Wait for resume/addFiles.
      await this._waitForWork();
    }
  }

  _hasPending() {
    for (const file of this.flow.files) {
      for (const chunk of file.chunks) {
        if (chunk.state === 'pending') {
          return true;
        }
      }
    }
    return false;
  }

  _hasRunnablePending() {
    for (const file of this.flow.files) {
      if (file.paused || file.error || file.cancelled) {
        continue;
      }
      for (const chunk of file.chunks) {
        if (chunk.state === 'pending') {
          return true;
        }
      }
    }
    return false;
  }

  _createNextStreamChunk() {
    let created = false;
    for (const file of this.flow.files) {
      if (!file.streaming || file.eof || file.paused ||
          file.error || file.cancelled) {
        continue;
      }
      if (file.chunks.every(chunk =>
        ['success', 'error', 'cancelled'].includes(chunk.state))) {
        file.chunks.push(new FlowChunk(file.flowObj, file, file.chunks.length));
        created = true;
      }
    }
    return created;
  }

  _hasPausedStreaming() {
    return this.flow.files.some(file =>
      file.streaming && !file.eof && file.paused &&
      !file.error && !file.cancelled
    );
  }

  _waitForWork() {
    if (!this._wake) {
      this._wake = new Deferred();
    }
    return this._wake.promise;
  }

  _runCycle() {
    const controller = new AbortController();
    this._controller = controller;
    const signal = controller.signal;
    const iterator = this._readQueue(signal);
    const concurrency = Math.max(1, this.flow.opts.simultaneousUploads || 1);
    const workers = [];
    for (let i = 0; i < concurrency; i++) {
      workers.push(this._worker(iterator, signal));
    }
    this._cycle = Promise.all(workers).finally(() => {
      if (this._controller === controller) {
        this._controller = null;
      }
      this._cycle = null;
    });
    return this._cycle;
  }

  async _worker(iterator, signal) {
    for await (const item of iterator) {
      if (signal.aborted || this.cancelled) {
        return;
      }
      try {
        await item.chunk.upload(item.payload, signal);
      } catch (error) {
        if (signal.aborted || this.cancelled) {
          return;
        }
        item.chunk.state = 'error';
        item.chunk._responseText = String(error && error.message || error);
        item.chunk.uploadState.resolve({status: 'error', message: item.chunk._responseText});
        item.chunk.event('error', item.chunk._responseText);
      }
    }
  }

  async *_readQueue(signal) {
    for (const chunk of this._nextChunks()) {
      if (signal.aborted || this.cancelled) {
        return;
      }
      const file = chunk.fileObj;
      if (file.paused || file.error || file.cancelled) {
        continue;
      }

      chunk.state = 'reading';
      let payload;
      try {
        payload = await chunk.read(signal);
      } catch (error) {
        if (this.cancelled || signal.aborted) {
          chunk.state = this.cancelled ? 'cancelled' : 'pending';
          return;
        }
        if (file.cancelled) {
          chunk.state = 'cancelled';
          continue;
        }
        if (file.error) {
          chunk.state = 'error';
          continue;
        }
        if (file.paused) {
          chunk.state = 'pending';
          continue;
        }
        chunk.state = 'error';
        chunk._responseText = String(error && error.message || error);
        chunk.uploadState.resolve({status: 'error', message: chunk._responseText});
        chunk.event('error', chunk._responseText);
        continue;
      }

      if (this.cancelled || signal.aborted) {
        chunk.state = this.cancelled ? 'cancelled' : 'pending';
        return;
      }
      if (file.cancelled) {
        chunk.state = 'cancelled';
        continue;
      }
      if (file.error) {
        chunk.state = 'error';
        continue;
      }
      if (file.paused) {
        chunk.state = 'pending';
        continue;
      }

      yield {chunk, payload};
    }
  }

  *_nextChunks() {
    const seen = new Set();

    if (this.flow.opts.prioritizeFirstAndLastChunk) {
      for (const file of this.flow.files) {
        if (file.streaming || file.paused || file.error || file.cancelled) {
          continue;
        }
        const first = file.chunks[0];
        const last = file.chunks[file.chunks.length - 1];
        if (first && first.state === 'pending' && !seen.has(first)) {
          seen.add(first);
          yield first;
        }
        if (last && last !== first && last.state === 'pending' && !seen.has(last)) {
          seen.add(last);
          yield last;
        }
      }
    }

    for (const file of this.flow.files) {
      if (file.paused || file.error || file.cancelled) {
        continue;
      }
      for (const chunk of file.chunks) {
        if (chunk.state === 'pending' && !seen.has(chunk)) {
          seen.add(chunk);
          yield chunk;
        }
      }
    }
  }

  _summary(status) {
    return {
      status,
      files: this.flow.files.map(file => ({
        file,
        status: file.error ? 'error' : (file.isComplete() ? 'complete' : 'pending'),
        error: file.errorMessage || null,
        uploadedBytes: file.sizeUploaded()
      })),
      uploadedBytes: this.flow.sizeUploaded(),
      totalBytes: this.flow.getSize()
    };
  }

  _finish(status) {
    if (this.finished) {
      return;
    }
    this.finished = true;
    this._abort();
    this.wake();
    const summary = this._summary(status);
    if (status === 'complete') {
      this.flow._emit('complete', {summary, files: this.flow.files});
    }
    this._deferred.resolve(summary);
  }

  _finishWithError(error) {
    if (this.finished) {
      return;
    }
    this.finished = true;
    this._abort();
    this.wake();
    this.flow._emit('error', {
      message: error && error.message || String(error),
      error
    });
    this._deferred.resolve(Object.assign(this._summary('complete'), {
      status: 'error',
      error
    }));
  }
}

/**
 * Exclusively for test purposes.
 */
var g = typeof window !== 'undefined' ? window
    : typeof global !== 'undefined' ? global
    : typeof self !== 'undefined' ? self : {};
g.FlowUploadSession = UploadSession;

/**
 * @license MIT
 */

/**
 * Flow.js is a library providing multiple simultaneous, stable and
 * resumable uploads via the HTML5 File API.
 *
 * @param [opts]
 * @param {number|Function} [opts.chunkSize]
 * @param {bool} [opts.forceChunkSize]
 * @param {number} [opts.simultaneousUploads]
 * @param {bool} [opts.singleFile]
 * @param {string} [opts.fileParameterName]
 * @param {number} [opts.progressCallbacksInterval]
 * @param {number} [opts.speedSmoothingFactor]
 * @param {Object|Function} [opts.query]
 * @param {bool} [opts.sendFlowParams]
 * @param {Object|Function} [opts.headers]
 * @param {bool} [opts.withCredentials]
 * @param {Function} [opts.preprocess]
 * @param {string} [opts.method]
 * @param {string|Function} [opts.testMethod]
 * @param {string|Function} [opts.uploadMethod]
 * @param {bool} [opts.prioritizeFirstAndLastChunk]
 * @param {bool} [opts.allowDuplicateUploads]
 * @param {string|Function} [opts.target] May return a promise: resolved per
 *   chunk, after its payload and checksum are known.
 * @param {number} [opts.maxChunkRetries]
 * @param {number} [opts.chunkRetryInterval]
 * @param {number} [opts.xhrTimeout]
 * @param {Array.<number>} [opts.permanentErrors]
 * @param {Array.<number>} [opts.testNotFoundStatuses]
 * @param {Array.<number>} [opts.successStatuses]
 * @param {Function} [opts.initFileFn]
 * @param {Function} [opts.readFileFn]
 * @param {Function} [opts.generateUniqueIdentifier]
 * @constructor
 */
class Flow extends EventTarget {
  constructor(opts) {
    super();

    this.supportDirectory = (() => {
      if (typeof document === 'undefined') {
        return false;
      }
      const input = document.createElement('input');
      return 'webkitdirectory' in input ||
        'mozdirectory' in input ||
        'odirectory' in input ||
        'msdirectory' in input ||
        'directory' in input;
    })();

    this.files = [];

    this.defaults = {
      chunkSize: 1024 * 1024,
      forceChunkSize: false,
      simultaneousUploads: 3,
      singleFile: false,
      fileParameterName: 'file',
      progressCallbacksInterval: 500,
      speedSmoothingFactor: 0.1,
      query: {},
      sendFlowParams: true,
      headers: {},
      withCredentials: false,
      preprocess: null,
      changeRawDataBeforeSend: null,
      method: 'multipart',
      testMethod: 'GET',
      uploadMethod: 'POST',
      prioritizeFirstAndLastChunk: false,
      allowDuplicateUploads: false,
      target: '/',
      testChunks: true,
      generateUniqueIdentifier: null,
      maxChunkRetries: 0,
      chunkRetryInterval: null,
      chunkChecksum: null,
      allowShortStream: false,
      streaming: false,
      xhrTimeout: 0,
      permanentErrors: [404, 413, 415, 500, 501],
      testNotFoundStatuses: [404],
      successStatuses: [200, 201, 202],
      onDropStopPropagation: false,
      hooks: {},
      initFileFn: null,
      readFileFn: (fileObj, startByte, endByte, fileType) =>
        fileObj.file.slice(startByte, endByte, fileType)
    };

    this.opts = Object.assign({}, this.defaults, opts || {});

    this._onDropBound = null;
    this._session = null;
  }

  /**
   * Dispatch a native CustomEvent and then the catch-all event.
   * The detail always contains the event type and the flow instance.
   */
  _emit(type, detail = {}) {
    const payload = Object.assign({type, flow: this}, detail);
    this.dispatchEvent(new CustomEvent(type, {detail: payload}));
    this._emitCatchAll(type, payload, false);
    return payload;
  }

  _emitCatchAll(type, detail, hook) {
    this.dispatchEvent(new CustomEvent('catch-all', {
      detail: {type, hook, detail}
    }));
  }

  /**
   * Run all callbacks for a named hook. Filters are AND-ed; actions run in
   * order and may mutate their arguments. Hook errors are reported through
   * the `error` event and do not break the add pipeline.
   */
  async _runHook(name, ...args) {
    const configured = (this.opts.hooks || {})[name];
    const callbacks = configured === undefined
      ? []
      : (Array.isArray(configured) ? configured : [configured]);
    let result = true;
    for (const callback of callbacks) {
      if (typeof callback !== 'function') {
        continue;
      }
      try {
        const value = await callback(...args);
        if (name === 'filterFile' && value === false) {
          result = false;
        }
      } catch (error) {
        this._emit('error', {
          message: error && error.message || String(error),
          error,
          hook: name
        });
        if (name === 'filterFile') {
          result = false;
        }
      }
    }
    this._emitCatchAll(name, {name, args}, true);
    return result;
  }

  async onDrop(event) {
    if (this.opts.onDropStopPropagation) {
      event.stopPropagation();
    }
    event.preventDefault();
    var dataTransfer = event.dataTransfer;
    if (dataTransfer.items && dataTransfer.items[0] &&
        dataTransfer.items[0].webkitGetAsEntry) {
      this.webkitReadDataTransfer(event);
    } else {
      await this.addFiles(dataTransfer.files, {event});
    }
  }

  preventEvent(event) {
    event.preventDefault();
  }

  webkitReadDataTransfer(event) {
    var queue = event.dataTransfer.items.length;
    var decrement = () => {
      if (--queue === 0) {
        this.addFiles(files, {event});
      }
    };

    var files = [];
    for (let item of event.dataTransfer.items) {
      var entry = item.webkitGetAsEntry();
      if (!entry) {
        decrement();
        return;
      }
      if (entry.isFile) {
        // due to a bug in Chrome's File System API impl - #149735
        fileReadSuccess(item.getAsFile(), entry.fullPath);
      } else {
        readDirectory(entry.createReader());
      }
    }

    function readDirectory(reader) {
      reader.readEntries((entries) => {
        if (entries.length) {
          queue += entries.length;
          var fullPaths = {};
          for (let entry of entries) {
            if (entry.isFile) {
              fullPaths[entry.name] = entry.fullPath;
              entry.file((file) => fileReadSuccess(file, fullPaths[file.name]), readError);
            } else if (entry.isDirectory) {
              readDirectory(entry.createReader());
            }
          }
          readDirectory(reader);
        } else {
          decrement();
        }
      }, readError);
    }
    function fileReadSuccess(file, fullPath) {
      file.relativePath = fullPath.substring(1);
      files.push(file);
      decrement();
    }
    function readError(fileError) {
      decrement();
      throw fileError;
    }
  }

  generateUniqueIdentifier(file) {
    var custom = this.opts.generateUniqueIdentifier;
    if (typeof custom === 'function') {
      return custom(file);
    }
    var relativePath = file.relativePath || file.webkitRelativePath || file.fileName || file.name;
    return file.size + '-' + relativePath.replace(/[^0-9a-zA-Z_-]/img, '');
  }

  assignBrowse(domNodes, isDirectory, singleFile, attributes) {
    if (domNodes instanceof Element) {
      domNodes = [domNodes];
    }

    each(domNodes, function(domNode) {
      var input;
      if (domNode.tagName === 'INPUT' && domNode.type === 'file') {
        input = domNode;
      } else {
        input = document.createElement('input');
        input.setAttribute('type', 'file');
        Object.assign(input.style, {
          visibility: 'hidden',
          position: 'absolute',
          width: '1px',
          height: '1px'
        });
        domNode.appendChild(input);
        domNode.addEventListener('click', function() {
          input.click();
        }, false);
      }
      if (!this.opts.singleFile && !singleFile) {
        input.setAttribute('multiple', 'multiple');
      }
      if (isDirectory) {
        input.setAttribute('webkitdirectory', 'webkitdirectory');
      }
      each(attributes, function(value, key) {
        input.setAttribute(key, value);
      });
      input.addEventListener('change', async e => {
        // Capture the node before awaiting: event.target may be cleared once
        // the synchronous dispatch ends.
        const target = e.target || input;
        if (target.value) {
          input.setAttribute('readonly', 'readonly');
          await this.addFiles(target.files, {event: e});
          target.value = '';
          input.removeAttribute('readonly');
        }
      }, false);
    }, this);
  }

  assignDrop(domNodes) {
    if (typeof domNodes.length === 'undefined') {
      domNodes = [domNodes];
    }

    this._onDropBound = this.onDrop.bind(this);
    for (let domNode of domNodes) {
      domNode.addEventListener('dragover', this.preventEvent, false);
      domNode.addEventListener('dragenter', this.preventEvent, false);
      domNode.addEventListener('drop', this._onDropBound, false);
    }
  }

  unAssignDrop(domNodes) {
    if (typeof domNodes.length === 'undefined') {
      domNodes = [domNodes];
    }

    for (let domNode of domNodes) {
      domNode.removeEventListener('dragover', this.preventEvent, false);
      domNode.removeEventListener('dragenter', this.preventEvent, false);
      domNode.removeEventListener('drop', this._onDropBound, false);
    }
  }

  isUploading() {
    var uploading = false;
    each(this.files, function(file) {
      if (file.isUploading()) {
        uploading = true;
        return false;
      }
    });
    return uploading;
  }

  /**
   * Start an upload session. While a session is active this returns the same
   * promise. The promise resolves with an upload summary when the session is
   * settled (complete or cancelled).
   */
  upload() {
    if (!this._session || this._session.finished) {
      this._session = new UploadSession(this);
    }
    return this._session.start();
  }

  /**
   * Resume the current session, or start one if none is active.
   */
  resume() {
    for (const file of this.files) {
      if (!file.isComplete()) {
        file.paused = false;
      }
    }
    if (this._session && !this._session.finished) {
      return this._session.resume();
    }
    return this.upload();
  }

  _resumeFiles(files) {
    for (const file of files) {
      file.paused = false;
    }
    if (this._session && !this._session.finished) {
      this._session.wake();
      return this._session.promise;
    }
    return this.upload();
  }

  /**
   * Pause every file. Active reads/requests are aborted; the session remains
   * alive and continues when resume() is called.
   */
  pause() {
    return Promise.all(this.files.map(file => file.pause()));
  }

  /**
   * Cancel the session and remove every file.
   */
  async cancel() {
    const files = this.files.slice();
    const session = this._session;
    this.files = [];
    if (session) {
      session.cancel();
    }
    await Promise.all(files.map(file => file.abort('cancelled')));
    for (const file of files) {
      this._emit('file-removed', {file});
    }
    if (session) {
      await session.promise.catch(() => {});
    }
  }

  progress() {
    var totalDone = 0;
    var totalSize = 0;
    each(this.files, function(file) {
      totalDone += file.progress() * file.size;
      totalSize += file.size;
    });
    if (totalSize > 0) {
      return totalDone / totalSize;
    }
    return this.files.length > 0 &&
      this.files.every(function(file) { return file.isComplete(); }) ? 1 : 0;
  }

  /**
   * Yield files and factor the synchronous part of addFiles filtering.
   */
  *filterFileList(fileList, event) {
    var ie10plus = window.navigator.msPointerEnabled;
    const batchIdentifiers = new Set();

    for (let file of fileList) {
      // https://github.com/flowjs/flow.js/issues/55
      if ((ie10plus && file.size === 0) ||
          (file.size % 4096 === 0 && (file.name === '.' || file.fileName === '.'))) {
        continue;
      }

      var uniqueIdentifier = this.generateUniqueIdentifier(file);
      if (!this.opts.allowDuplicateUploads &&
          (batchIdentifiers.has(uniqueIdentifier) ||
           this.getFromUniqueIdentifier(uniqueIdentifier))) {
        continue;
      }
      batchIdentifiers.add(uniqueIdentifier);

      yield [file, uniqueIdentifier];
    }
  }

  async addFile(file, options = {}) {
    return (await this.addFiles([file], options))[0];
  }

  /**
   * Add files.
   * @param {FileList|Array} fileList
   * @param {Object} [options] {event, initFileFn}
   * @returns {Promise<FlowFile[]>}
   */
  async addFiles(fileList, options = {}) {
    options = options || {};
    const event = options.event || null;
    const initFileFn = Object.prototype.hasOwnProperty.call(options, 'initFileFn')
      ? options.initFileFn
      : this.opts.initFileFn;
    const context = {event, flow: this};
    let item, file, uniqueIdentifier, states = [];
    const iterator = this.filterFileList(fileList, event);

    while ((item = iterator.next()) && !item.done) {
      [file, uniqueIdentifier] = item.value;
      if (!await this._runHook('filterFile', file, context)) {
        continue;
      }

      var flowFile = new FlowFile(this, file, uniqueIdentifier);
      states.push(flowFile.bootstrap(context, initFileFn));
    }

    var flowfiles = await Promise.all(states);
    for (let flowfile of flowfiles) {
      await this._runHook('fileAdded', flowfile, context);
    }

    await this._runHook('filesAdded', flowfiles, context);

    flowfiles = flowfiles.filter(entry => entry && entry.file);
    for (let flowfile of flowfiles) {
      if (this.opts.singleFile && this.files.length > 0) {
        await this.removeFile(this.files[0]);
      }
      this.files.push(flowfile);
    }
    await this._runHook('filesSubmitted', this.files, context);

    if (this._session && !this._session.finished) {
      this._session.wake();
    }

    return flowfiles;
  }

  /**
   * Remove a file, aborting its active work.
   */
  async removeFile(file) {
    const index = this.files.indexOf(file);
    if (index === -1) {
      return;
    }
    this.files.splice(index, 1);
    await file.abort('cancelled');
    this._emit('file-removed', {file});
    if (this._session && !this._session.finished) {
      this._session.wake();
    }
  }

  getFromUniqueIdentifier(uniqueIdentifier) {
    var ret = false;
    each(this.files, function(file) {
      if (file.uniqueIdentifier === uniqueIdentifier) {
        ret = file;
      }
    });
    return ret;
  }

  getSize() {
    var totalSize = 0;
    each(this.files, function(file) {
      totalSize += file.size;
    });
    return totalSize;
  }

  sizeUploaded() {
    var size = 0;
    each(this.files, function(file) {
      size += file.sizeUploaded();
    });
    return size;
  }

  timeRemaining() {
    var sizeDelta = 0;
    var averageSpeed = 0;
    each(this.files, function(file) {
      if (!file.paused && !file.error) {
        sizeDelta += file.size - file.sizeUploaded();
        averageSpeed += file.averageSpeed;
      }
    });
    if (sizeDelta && !averageSpeed) {
      return Number.POSITIVE_INFINITY;
    }
    if (!sizeDelta && !averageSpeed) {
      return 0;
    }
    return Math.floor(sizeDelta / averageSpeed);
  }
}

Flow.version = typeof __FLOW_VERSION__ === 'string' ? __FLOW_VERSION__ : 'dev';

module.exports = Flow;
