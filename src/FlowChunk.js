import {evalOpts, each} from './tools';
import DeferredPromise from './DeferredPromise';

/**
 * Class for storing a single chunk
 * @name FlowChunk
 * @param {Flow} flowObj
 * @param {FlowFile} fileObj
 * @param {number} offset
 * @constructor
 */
export default class FlowChunk {

  constructor(flowObj, fileObj, offset) {

    /**
     * Reference to parent flow object
     * @type {Flow}
     */
    this.flowObj = flowObj;

    /**
     * Reference to parent FlowFile object
     * @type {FlowFile}
     */
    this.fileObj = fileObj;

    /**
     * File offset
     * @type {number}
     */
    this.offset = offset;

    /**
     * Indicates if chunk existence was checked on the server
     * @type {boolean}
     */
    this.tested = false;

    /**
     * Number of retries performed
     * @type {number}
     */
    this.retries = 0;

    /**
     * Pending retry
     * @type {boolean}
     */
    this.pendingRetry = false;

    /**
     * Preprocess state
     * @type {number} 0 = unprocessed, 1 = processing, 2 = finished
     */
    this.preprocessState = 0;

    /**
     * Read state
     * @type {number} 0 = not read, 1 = reading, 2 = finished
     */
    this.readState = 0;

    /**
     * The payload.
     * @type {Blob|string}
     */
    this.payload = null;

    /**
     * Mostly for streams: how many bytes were actually read
     * @type {number} -1 = not read
     */
    this.readBytes = -1;

    /**
     * File-level read state.
     * When reading from a stream we can't slice a known-size buffer in chunks.
     * These are constructed sequentially from blocking read. This list stores the
     * respective Promise status of each chunk.
     * @type {Promise}
     */
    this.readStreamState = new DeferredPromise();

    /**
     * Bytes transferred from total request size
     * @type {number}
     */
    this.loaded = 0;

    /**
     * Total request size
     * @type {number}
     */
    this.total = 0;

    /**
     * Size of a chunk
     * @type {number}
     */
    this.chunkSize = this.fileObj.chunkSize;

    /**
     * Chunk start byte in a file
     * @type {number}
     */
    this.startByte = this.offset * this.chunkSize;

    /**
     * A specific filename for this chunk which otherwise default to the main name
     * @type {string}
     */
    this.filename = null;

    /**
     * Chunk end byte in a file
     * @type {number}
     */
    this.endByte = this.computeEndByte();

    /**
     * XMLHttpRequest
     * @type {XMLHttpRequest}
     */
    this.xhr = null;
  }

  /**
   * Compute the endbyte in a file
   *
   */
  computeEndByte() {
    var endByte = Math.min(this.fileObj.size, (this.offset + 1) * this.chunkSize);
    if (this.fileObj.size - endByte < this.chunkSize && !this.flowObj.opts.forceChunkSize) {
      // The last chunk will be bigger than the chunk size,
      // but less than 2 * this.chunkSize
      endByte = this.fileObj.size;
    }
    return endByte;
  }

  /**
   * Send chunk event
   * @param event
   * @param {...} args arguments of a callback
   */
  event(event, args) {
    args = Array.prototype.slice.call(arguments);
    args.unshift(this);
    this.fileObj.chunkEvent.apply(this.fileObj, args);
  }

  /**
   * Catch progress event
   * @param {ProgressEvent} event
   */
  progressHandler(event) {
    // console.log(event);
    if (event.lengthComputable) {
      this.loaded = event.loaded ;
      this.total = event.total;
    }
    this.event('progress', event);
  }

  /**
   * Catch test event
   * @param {Event} event
   */
  testHandler(event) {
    var status = this.status(true);
    if (status === 'error') {
      this.event(status, this.message());
      this.flowObj.uploadNextChunk();
    } else if (status === 'success') {
      this.tested = true;
      this.event(status, this.message());
      this.flowObj.uploadNextChunk();
    } else if (!this.fileObj.paused) {
      // Error might be caused by file pause method
      // Chunks does not exist on the server side
      this.tested = true;
      this.send();
    }
  }

  /**
   * Upload has stopped
   * @param {Event} event
   */
  doneHandler(event) {
    var status = this.status();
    if (status === 'success' || status === 'error') {
      delete this.data;
      this.event(status, this.message());
      this.flowObj.uploadNextChunk();
    } else if (!this.fileObj.paused) {
      this.event('retry', this.message());
      this.pendingRetry = true;
      this.abort();
      this.retries++;
      var retryInterval = this.flowObj.opts.chunkRetryInterval;
      if (retryInterval !== null) {
        setTimeout(() => this.send(), retryInterval);
      } else {
        this.send();
      }
    }
  }

  /**
   * Get params for a request
   * @function
   */
  getParams () {
    return {
      flowChunkNumber: this.offset + 1,
      flowChunkSize: this.chunkSize,
      flowCurrentChunkSize: this.endByte - this.startByte,
      flowTotalSize: this.fileObj.size,
      flowIdentifier: this.fileObj.uniqueIdentifier,
      flowFilename: this.fileObj.name,
      flowRelativePath: this.fileObj.relativePath,
      flowTotalChunks: this.fileObj.chunks.length
    };
  }

  /**
   * Get target option with query params
   * @function
   * @param params
   * @returns {string}
   */
  getTarget(target, params){
    if (params.length == 0) {
      return target;
    }

    if(target.indexOf('?') < 0) {
      target += '?';
    } else {
      target += '&';
    }
    return target + params.join('&');
  }

  /**
   * Makes a GET request without any data to see if the chunk has already
   * been uploaded in a previous session
   * @function
   */
  test() {
    // Set up request and listen for event
    this.xhr = new XMLHttpRequest();
    this.xhr.addEventListener("load", this.testHandler.bind(this), false);
    this.xhr.addEventListener("error", this.testHandler.bind(this), false);
    var testMethod = evalOpts(this.flowObj.opts.testMethod, this.fileObj, this);
    var data = this.prepareXhrRequest(testMethod, true);
    this.xhr.send(data);
  }

  /**
   * Finish preprocess state
   * @function
   */
  async preprocessFinished() {
    // Re-compute the endByte after the preprocess function to allow an
    // implementer of preprocess to set the fileObj size
    this.endByte = this.computeEndByte();

    this.preprocessState = 2;
    await this.send();
  }

  /**
   * Finish read state
   * @function
   */
  readFinished(payload) {
    this.readState = 2;
    this.payload = payload;
    this.send();
  }

  /**
   * asyncReadFileFn() helper provides the ability of asynchronous read()
   * Eg: When reading from a ReadableStream.getReader().
   *
   * But:
   * - FlowChunk.send() can be called up to {simultaneousUploads} times.
   * - Concurrent or misordered read() would result in a corrupted payload.
   *
   * This function guards from this: As soon a previous chunk exists and as long as
   *  this previous chunk is not fully read(), we assume corresponding reader is unavailable
   *  and wait for it.
   * @function
   */
  async readStreamGuard() {
    var map = this.fileObj.chunks.map(e => e.readStreamState).slice(0, this.offset);
    try {
      await Promise.all(map);
    } catch(err) {
      console.error(`Chunk ${this.offset}: Error while waiting for ${map.length} previous chunks being read.`);
      throw(err);
    }
  }

  async readStreamChunk() {
    if (this.readStreamState.resolved) {
      // This is normally impossible to reach. Has it been uploaded?
      console.warn(`Chunk ${this.offset} already read. xhr initialized = ${this.xhr ? 1 : 0}`);
      // We may want to retry (or not) to upload (but never try to read from the stream again or risk misordered chunks
      return;
    }

    await this.readStreamGuard();
    var data, asyncRead = this.flowObj.opts.asyncReadFileFn;

    data = await asyncRead(this.fileObj, this.startByte, this.endByte, this.fileObj.file.type, this);
    this.readStreamState.resolve();

    // Equivalent to readFinished()
    this.readState = 2;

    if (data) {
      this.readBytes = data.size || data.size === 0 ? data.size : -1;
    }

    if (data && data.size > 0) {
      if (this.flowObj.chunkSize) {
        // This may imply a miscalculation of the total chunk numbers.
        console.warn(`Chunk ${this.offset}: returned too much data. Got ${data.size}. Expected not more than ${this.flowObj.chunkSize}.`);
      }
      this.payload = data;
      this.xhrSend(data);
      return;
    }

    if (this.offset > 0) {
      // last size of the buffer read for the previous chunk
      var lastReadBytes = this.fileObj.chunks[this.offset - 1].readBytes;
      if (lastReadBytes < parseInt(this.chunkSize)) {
        console.warn(`Chunk ${this.offset} seems superfluous. No byte read() meanwhile previous chunk was only ${lastReadBytes} bytes instead of ${this.chunkSize}`);
        // The last chunk's buffer wasn't even full. That means the number of chunk may
        // have been miscomputed and this chunk is superfluous.
        // We make a fake request so that overall status is "complete" and we can move on
        // on this FlowFile.
        this.pendingRetry = false;
        this.xhr = {readyState: 5, status: 1 };
        this.doneHandler(null);
        return;
      }
    }

    console.warn(`Chunk ${this.offset}: no byte to read()`);
    this.pendingRetry = false;
  }

  /**
   * Prepare data (preprocess/read) data then call xhrSend()
   * @function
   */
  async send() {
    var preprocess = this.flowObj.opts.preprocess;
    var read = this.flowObj.opts.readFileFn;
    var asyncRead = this.flowObj.opts.asyncReadFileFn;

    if (typeof preprocess === 'function') {
      switch (this.preprocessState) {
        case 0:
          this.preprocessState = 1;
          preprocess(this);
          return;
        case 1:
          return;
      }
    }

    if (asyncRead) {
      this.readState = 1;
      await this.readStreamChunk();
      return;
    }

    switch (this.readState) {
      case 0:
        this.readState = 1;
        read(this.fileObj, this.startByte, this.endByte, this.fileObj.file.type, this);
        return;
      case 1:
        return;
    }

    this.xhrSend(this.payload);
  }

  /**
   * Actually uploads data in a POST call
   * @function
   */
  xhrSend(payload) {
    if (this.flowObj.opts.testChunks && !this.tested) {
      this.test();
      return;
    }

    this.loaded = 0;
    this.total = 0;
    this.pendingRetry = false;

    // Set up request and listen for event
    this.xhr = new XMLHttpRequest();
    this.xhr.upload.addEventListener('progress', this.progressHandler.bind(this), false);
    this.xhr.addEventListener('load', this.doneHandler.bind(this), false);
    this.xhr.addEventListener('error', this.doneHandler.bind(this), false);

    var uploadMethod = evalOpts(this.flowObj.opts.uploadMethod, this.fileObj, this);
    var xhrPayload = this.prepareXhrRequest(uploadMethod, false, this.flowObj.opts.method, payload);
    var changeRawDataBeforeSend = this.flowObj.opts.changeRawDataBeforeSend;
    if (typeof changeRawDataBeforeSend === 'function') {
      xhrPayload = changeRawDataBeforeSend(this, xhrPayload);
    }
    this.xhr.send(xhrPayload);
  }

  /**
   * Abort current xhr request
   * @function
   */
  abort() {
    // Abort and reset
    var xhr = this.xhr;
    this.xhr = null;
    if (xhr) {
      xhr.abort();
    }
  }

  /**
   * Retrieve current chunk upload status
   * @function
   * @returns {string} 'pending', 'uploading', 'success', 'error'
   */
  status(isTest) {
    if (this.readState === 1) {
      return 'reading';
    } else if (this.pendingRetry || this.preprocessState === 1) {
      // if pending retry then that's effectively the same as actively uploading,
      // there might just be a slight delay before the retry starts
      return 'uploading';
    } else if (!this.xhr) {
      return 'pending';
    } else if (this.xhr.readyState < 4) {
      // Status is really 'OPENED', 'HEADERS_RECEIVED'
      // or 'LOADING' - meaning that stuff is happening
      return 'uploading';
    } else {
      if (this.flowObj.opts.successStatuses.indexOf(this.xhr.status) > -1) {
        // HTTP 200, perfect
	// HTTP 202 Accepted - The request has been accepted for processing, but the processing has not been completed.
        return 'success';
      } else if (this.flowObj.opts.permanentErrors.indexOf(this.xhr.status) > -1 ||
                 !isTest && this.retries >= this.flowObj.opts.maxChunkRetries) {
        // HTTP 413/415/500/501, permanent error
        return 'error';
      } else {
        // this should never happen, but we'll reset and queue a retry
        // a likely case for this would be 503 service unavailable
        this.abort();
        return 'pending';
      }
    }
  }

  /**
   * Get response from xhr request
   * @function
   * @returns {String}
   */
  message() {
    return this.xhr ? this.xhr.responseText : '';
  }

  /**
   * Get upload progress
   * @function
   * @returns {number}
   */
  progress() {
    if (this.pendingRetry) {
      return 0;
    }
    var s = this.status();
    if (s === 'success' || s === 'error') {
      return 1;
    } else if (s === 'pending') {
      return 0;
    } else {
      return this.total > 0 ? this.loaded / this.total : 0;
    }
  }

  /**
   * Count total size uploaded
   * @function
   * @returns {number}
   */
  sizeUploaded() {
    var size = this.endByte - this.startByte;
    // can't return only chunk.loaded value, because it is bigger than chunk size
    if (this.status() !== 'success') {
      size = this.progress() * size;
    }
    return size;
  }

  /**
   * Prepare Xhr request. Set query, headers and data
   * @param {string} method GET or POST
   * @param {bool} isTest is this a test request
   * @param {string} [paramsMethod] octet or form
   * @param {Blob} [blob] to send
   * @returns {FormData|Blob|Null} data to send
   */
  prepareXhrRequest(method, isTest, paramsMethod, blob) {
    // Add data from the query options
    var query = evalOpts(this.flowObj.opts.query, this.fileObj, this, isTest);
    query = Object.assign({}, query || {}, this.getParams());

    var target = evalOpts(this.flowObj.opts.target, this.fileObj, this, isTest);
    var data = null;
    if (method === 'GET' || paramsMethod === 'octet') {
      // Add data from the query options
      var params = [];
      each(query, function (v, k) {
        params.push([encodeURIComponent(k), encodeURIComponent(v)].join('='));
      });
      target = this.getTarget(target, params);
      data = blob || null;
    } else {
      // Add data from the query options
      data = new FormData();
      each(query, function (v, k) {
        data.append(k, v);
      });
      if (typeof blob !== "undefined") {
        data.append(this.flowObj.opts.fileParameterName, blob, this.filename || this.fileObj.file.name);
      }
    }

    this.xhr.open(method, target, true);
    this.xhr.withCredentials = this.flowObj.opts.withCredentials;

    // Add data from header options
    each(evalOpts(this.flowObj.opts.headers, this.fileObj, this, isTest), function (v, k) {
      this.xhr.setRequestHeader(k, v);
    }, this);

    return data;
  }
}
