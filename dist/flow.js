(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Flow = factory());
}(this, (function () { 'use strict';

  /**
   * A base-class (or a mixin) adding support for event-listener and dispatchers.
   */

  /**
   * Hooks exist to allow users to alter flow.js file processing. This is intended for users relying on a dropzone and other higher-level components
   * when the flow between `addFiles()` and `upload()` is hardly configurable.
   * Users calling `await flow.addFiles()` have more room for customization before calling `upload();` without having to rely upon hooks.
   *
   * Hooks can *alter* the parameters they receive (javascript pass-by-reference rules will apply).
   * For example, the `file-added` hook receives a `flowfile` parameter. `delete flowfile` or `flowfile = {}` have no effect
   *  because parent function still hold reference. But `delete flowfile.file` would remove the File() and is supported as a way to
   *  dequeue a file from a list after its initialization.
   */

  const HOOKS = [
    'file-added',
    'files-added',
    'files-submitted',
  ];

  /**
   * Additionally, some hooks are said filtering-hooks.
   * Code will consider the combined (OR-ed) return value of the callbacks to
   * decide whether or not keep processing this path/item.
   */
  const FILTERING_HOOKS = [
    'filter-file'
  ];


  /**
   * Events are recognized (case-sensitive) CustomEvent processed using dispatchEvent.
   * This is a list of those fire by Flow.js, but any name can be attached too.
   */
  const EVENTS = [
    'complete',
    'error',
    'file-error',
    'file-progress',
    'file-removed',
    'file-retry',
    'file-success',
    'progress',
    'upload-start',
  ];

  /**
   * This class:
   * - add EventListener support to an object.
   * - wrap EventListener attachment in order to ease their removal
   * - add the concept of processing hooks similar to native events (explained below)
   *
   * The file is organized in three parts:
   * 1. isHook, isFilter, isEvent, on, off
   *    wrap the above concept and offer a unified interface. Whether a callback
   *    apply to a hook or an event is determined by its name.
   *
   * 2. Events: addEventListener, removeEventListener and *emit()*
   *    apply to addition/removal/dispatching of *events*.
   *
   * 3. Hooks: addHook, hasHook, removeHook apply to addition/removal of *hooks*.
   *    - *hook()* trigger the hook execution.
   */

  EventTarget.prototype._addEventListener = EventTarget.prototype.addEventListener;
  EventTarget.prototype._removeEventListener = EventTarget.prototype.removeEventListener;

  class Eventizer extends EventTarget {

    /**
     * List of hooks or events:
     *  key stands for hook or event name
     *  value array list of callbacks
     *
     * Each key is check against an hardcoded to list to defined whether:
     * - it's a "native" CustomEvent (dispatched asynchronously dirsregarding its value)
     * - it's a known event (whether a "filter" or an "action")
     * @type {}
     */
    constructor(hooks_events = {}) {
      super();

      this._events = {};
      this._hooks = {};

      /**
       * Hooks and events are distinguished based on the name.
       * Anything not being a know hook is assumed an event
       */
      for (let [name, callbacks] of Object.entries(hooks_events)) {
        for (let callback of callbacks) {
          this.on(name, callback);
        }
      }
    }

    isHook(name) {
      return HOOKS.includes(name) || this.isFilter(name);
    }

    isFilter(name) {
      return FILTERING_HOOKS.includes(name);
    }

    isEvent(name) {
      return !this.isHook(name);
    }

    _camelToDashCase(str) {
        return str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
    }

    /**
     * A wrapper for addEventListener to alternatively add hooks or events.
     */
    on(event, callback, options) {
      var revent = this._camelToDashCase(event);
      if (revent != event) {
        console.warn(`Flow.js v3: Do not rely on camel-case (${event}) event names.`);
        if (HOOKS.concat(FILTERING_HOOKS, EVENTS).includes(revent)) {
          event = revent;
          console.info(`Using "${revent}" instead.`);
        }
      }
      return this.isEvent(event)
        ? this.addEventListener(event, callback, options)
        : this.addHook(event, callback, options);
    }

    /**
     * A wrapper for addEventListener to alternatively add hooks or events.
     */
    once(event, callback, options) {
      return this.isEvent(event)
        ? this.addEventListener(event, callback, {...options, once: true})
        : console.warn('once() is not implemented for hooks.');
    }

    /**
     * A wrapper for removeEventListener to alternatively remove hooks or events.
     */
    off(event, callback, options) {
      if (this.isEvent(event) || !event) {
        // console.log(`[event] Remove event listeners...`);
        this.removeEventListener(event, callback, options);
      }
      if (! this.isEvent(event) || !event) {
        // console.log(`[event] Remove hooks...`);
        this.removeHook(event, callback, options);
      }
    }


    /**
     * A wrapper around native Target event listeners taken from:
     * https://github.com/alex2844/js-events
     *
     * Return an unbinder() callback, like https://github.com/ai/nanoevents
     *
     * @doc: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget
     */
    addEventListener(event, callback, options = false) {
      let _callback = callback,
          runUnbinder = () => {
            this.removeEventListener(event, callback, options);
            _callback.apply(this, arguments);
          },
          unbinder = () => {
            this.removeEventListener(event, callback, options);
          };

      if (options && options.once) {
        callback = runUnbinder;
      }

      this._addEventListener(event, callback, options);
      if (!this._events) {
        this._events = {};
        Object.defineProperty(this, '_events', { enumerable: false });
      }
      if (!this._events[event]) {
        this._events[event] = [];
      }

      this._events[event].push({
        listener: callback,
        useCapture: (((options === true) || (options.capture)) || false),
        passive: ((options && options.passive) || false),
        once: ((options && options.once) || false),
        type: event
      });

      return unbinder;
    }

    removeEventListener(event, callback = null, options = false) {
      // var callback = e => callback.call(this, ...e.detail);
      if (callback) {
        this._removeEventListener(event, callback, options);
      }

      if (! this._events || (event && !this._events[event])) {
        return;
      }

      if (! event || event === '*') {
        for (let name of Object.keys(this._events)) {
          // console.log('[event] Removing all event listeners');
          this.removeEventListener(name);
        }
        return;
      }

      for (const [i, v] of this._events[event].entries()) {
        if ((!callback || v.listener == callback) && v.useCapture == options) {
          // console.log(`[event] Removed one callback from "${event}"`);
          this._events[event].splice(i, 1);
          if (! callback) {
            this._removeEventListener(event, v.listener, v);
          } else {
            break;
          }
        }
      }

      if (this._events[event].length == 0) {
        delete this._events[event];
      }
    }

    /**
     * A wrapper for dispatchEvent handling "catch-all"
     */
    async emit(name, ...args) {
      // console.log(`[event] Fire native event "${name}"${args.length ? ' with ' + args.length + ' arguments' : ''}`);
      this.dispatchEvent(new CustomEvent(name, {detail: args}));
      if (name != 'catch-all') {
        this.emitCatchAll(name, ...args);
      }
    }

    async emitCatchAll(name, ...args) {
      this.dispatchEvent(new CustomEvent('catch-all', {detail: [name, ...args]}));
    }

    /**
     * ### HOOKS ###
     */
    addHook(event, callback, options) {
      var target = this._hooks;
      if (!target.hasOwnProperty(event)) {
        target[event] = [];
      }
      target[event].push(callback);
    }

    hasHook(async, events) {
      events = typeof events === 'string' ? [events] : events || [];
      var target = this._hooks;
      for (let [k, v] of Object.entries(target)) {
        if (events.length > 0 && ! events.includes(k)) {
          continue;
        }
        if (v.length > 0) {
          return true;
        }
      }

      return false;
    }

    /**
     * Remove one of more hooks' callbacks.
     */
    removeHook(event, callback, options) {
      const arrayRemove = (array, value) => {
        var index = array.indexOf(value);
        if (index > -1) {
          array.splice(index, 1);
        }
      };

      if (event && event != '*') {
        if (callback) {
          var target = this._hooks;
          if (target.hasOwnProperty(event)) {
            arrayRemove(target[event], callback);
          }
        } else {
          delete this._hooks[event];
        }
      } else {
        this._hooks = {};
      }
    }

    /**
     * Run an asynchronous hook (action or filter).
     *
     * @param {string} event event name
     * @param {...} args arguments of a callback
     *
     * @return {bool} In the case of *filters*, indicates whether processing must continue.
     * @return {mixed} In the case of *actions*: The first argument (possibly modified by hooks).
     */
    async hook(name, ...args) {
      let calls = this._hooks[name] || [],
          isFilter = this.isFilter(name),
          returns;

      if (calls.length) {
        // console.log(`[event] Fire ${calls.length} async hook for "${name}"${args.length ? ' with ' + args.length + ' arguments' : ''}`);
        returns = await Promise.all(calls.map(e => e.apply(this, args)));

        if (isFilter) {
          returns = returns.includes(true);
        } else if (name === 'file-added' && returns.includes(false)) {
          console.warn('In Flow.js 3.x, file-added event is an action rather than a filter. Return value is ignored but removing the `file` property allows to skip an enqueued file.');
        }
      } else {
        returns = isFilter ? true : args[0];
      }

      this.emitCatchAll(name, ...args);

      return returns;
    }
  }

  /**
   * Default read function using the webAPI
   *
   * @function webAPIFileRead(fileObj, startByte, endByte, fileType, chunk)
   *
   */
  function webAPIFileRead(fileObj, startByte, endByte, fileType, chunk) {
    var function_name = 'slice';

    if (fileObj.file.slice)
      function_name =  'slice';
    else if (fileObj.file.mozSlice)
      function_name = 'mozSlice';
    else if (fileObj.file.webkitSlice)
      function_name = 'webkitSlice';

    chunk.readFinished(fileObj.file[function_name](startByte, endByte, fileType));
  }

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
  var g$1 = typeof window !== 'undefined' ? window
      : typeof global !== 'undefined' ? global
      : typeof self !== 'undefined' ? self : {};
  g$1.evalOpts = evalOpts;

  class DeferredPromise {
    // https://stackoverflow.com/a/47112177
    constructor() {
      this.resolved = false;
      this._promise = new Promise((resolve, reject) => {
        // assign the resolve and reject functions to `this`
        // making them usable on the class instance
        this.resolve = () => {
          this.resolved = true;
          return resolve();
        };
        this.reject = reject;
      });
      // bind `then` and `catch` to implement the same interface as Promise
      this.then = this._promise.then.bind(this._promise);
      this.catch = this._promise.catch.bind(this._promise);
      this[Symbol.toStringTag] = 'Promise';
    }
  }

  /**
   * Class for storing a single chunk
   * @name FlowChunk
   * @param {Flow} flowObj
   * @param {FlowFile} fileObj
   * @param {number} offset
   * @constructor
   */
  class FlowChunk {

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
        // Requiring to read the same chunk twice is unlikely but may happen (in case of retry a failed upload)
        // If the bytes are still here (this.payload), then retry the upload...
        if (this.payload && this.pendingRetry) {
          console.info(`Retrying chunk ${this.offset} upload`);
          return this.uploadStreamChunk(this.payload);
        }

        console.warn(`Chunk ${this.offset} already read. xhr initialized = ${this.xhr ? 1 : 0}. payload size = ${this.payload ? this.payload.size : null}. readState = ${this.readState}. retry = ${this.pendingRetry}`);
        // ... but never try to read that same chunk from the (non-rewindable) stream again or we'd risk
        // not only misordered chunks but a corrupted file.
        return null;
      }

      this.readState = 1;
      await this.readStreamGuard();
      var data, asyncRead = this.flowObj.opts.asyncReadFileFn;

      data = await asyncRead(this.fileObj, this.startByte, this.endByte, this.fileObj.file.type, this);
      this.readStreamState.resolve();

      // Equivalent to readFinished()
      this.readState = 2;

      if (data) {
        this.readBytes = data.size || data.size === 0 ? data.size : -1;
      }

      return this.uploadStreamChunk(data);
    }

    async uploadStreamChunk(data) {
      if (data && data.size > 0) {
        if (this.fileObj.chunkSize && data.size > this.fileObj.chunkSize) {
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
          this.xhr = {readyState: 4, status: 200, abort: e => null };
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
      if (this.xhr) {
        this.xhr.abort();
      }
      this.xhr = null;
    }

    /**
     * Retrieve current chunk upload status
     * @function
     * @returns {string} 'pending', 'uploading', 'success', 'error'
     */
    status(isTest) {
      if (this.readState === 1) {
        return 'reading';
      } else if (this.preprocessState === 1) {
        // if pending retry then that's effectively the same as actively uploading,
        // there might just be a slight delay before the retry starts
        return 'uploading';
      } else if (!this.xhr || this.pendingRetry) {
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

  /**
   * FlowFile class
   * @name FlowFile
   * @param {Flow} flowObj
   * @param {File} file
   * @param {string} uniqueIdentifier
   * @constructor
   */
  class FlowFile {

    constructor(flowObj, file, uniqueIdentifier) {

      /**
       * Reference to parent Flow instance
       * @type {Flow}
       */
      this.flowObj = flowObj;

      /**
       * Reference to file
       * @type {File}
       */
      this.file = file;

      /**
       * File name. Some confusion in different versions of Firefox
       * @type {string}
       */
      this.name = file.fileName || file.name;

      /**
       * File size
       * @type {number}
       */
      this.size = file.size;

      /**
       * Relative file path
       * @type {string}
       */
      this.relativePath = file.relativePath || file.webkitRelativePath || this.name;

      /**
       * File unique identifier
       * @type {string}
       */
      this.uniqueIdentifier = (uniqueIdentifier === undefined ? flowObj.generateUniqueIdentifier(file) : uniqueIdentifier);

      /**
       * Size of Each Chunk
       * @type {number}
       */
      this.chunkSize = 0;

      /**
       * List of chunks
       * @type {Array.<FlowChunk>}
       */
      this.chunks = [];

      /**
       * Indicated if file is paused
       * @type {boolean}
       */
      this.paused = false;

      /**
       * Indicated if file has encountered an error
       * @type {boolean}
       */
      this.error = false;

      /**
       * Average upload speed
       * @type {number}
       */
      this.averageSpeed = 0;

      /**
       * Current upload speed
       * @type {number}
       */
      this.currentSpeed = 0;

      /**
       * Date then progress was called last time
       * @type {number}
       * @private
       */
      this._lastProgressCallback = Date.now();

      /**
       * Previously uploaded file size
       * @type {number}
       * @private
       */
      this._prevUploadedSize = 0;

      /**
       * Holds previous progress
       * @type {number}
       * @private
       */
      this._prevProgress = 0;
    }

    /**
     * Update speed parameters
     * @link http://stackoverflow.com/questions/2779600/how-to-estimate-download-time-remaining-accurately
     * @function
     */
    measureSpeed() {
      var timeSpan = Date.now() - this._lastProgressCallback;
      if (!timeSpan) {
        return ;
      }
      var smoothingFactor = this.flowObj.opts.speedSmoothingFactor;
      var uploaded = this.sizeUploaded();
      // Prevent negative upload speed after file upload resume
      this.currentSpeed = Math.max((uploaded - this._prevUploadedSize) / timeSpan * 1000, 0);
      this.averageSpeed = smoothingFactor * this.currentSpeed + (1 - smoothingFactor) * this.averageSpeed;
      this._prevUploadedSize = uploaded;
    }

    /**
     * For internal usage only.
     * Callback when something happens within the chunk.
     * @function
     * @param {FlowChunk} chunk
     * @param {string} event can be 'progress', 'success', 'error' or 'retry'
     * @param {string} [message]
     */
    chunkEvent(chunk, event, message) {
      switch (event) {
        case 'progress':
          if (Date.now() - this._lastProgressCallback <
              this.flowObj.opts.progressCallbacksInterval) {
            break;
          }
          this.measureSpeed();
          this.flowObj.emit('file-progress', this, chunk);
          this.flowObj.emit('progress');
          this._lastProgressCallback = Date.now();
          break;
        case 'error':
          this.error = true;
          this.abort(true);
          this.flowObj.emit('file-error', this, message, chunk);
          this.flowObj.emit('error', message, this, chunk);
          break;
        case 'success':
          if (this.error) {
            return;
          }
          this.measureSpeed();
          this.flowObj.emit('file-progress', this, chunk);
          this.flowObj.emit('progress');
          this._lastProgressCallback = Date.now();
          if (this.isComplete()) {
            this.currentSpeed = 0;
            this.averageSpeed = 0;
            this.flowObj.emit('file-success', this, message, chunk);
          }
          break;
        case 'retry':
          this.flowObj.emit('file-retry', this, chunk);
          break;
      }
    }

    /**
     * Pause file upload
     * @function
     */
    pause() {
      this.paused = true;
      this.abort();
    }

    /**
     * Resume file upload
     * @function
     */
    resume() {
      this.paused = false;
      this.flowObj.upload();
    }

    /**
     * Abort current upload
     * @function
     */
    abort(reset) {
      this.currentSpeed = 0;
      this.averageSpeed = 0;
      if (reset) {
        this.chunks = [];
      }
      for (let c of this.chunks) {
        if (c.status() === 'uploading') {
          c.abort();
          c.pendingRetry = true;
          this.flowObj.uploadNextChunk();
        }
      }
    }

    /**
     * Cancel current upload and remove from a list
     * @function
     */
    cancel() {
      this.flowObj.removeFile(this);
    }

    /**
     * Retry aborted file upload
     * @function
     */
    retry() {
      this.bootstrap('retry');
      this.flowObj.upload();
    }

    /**
     * Clear current chunks and slice file again
     * @function
     */
    bootstrap(event = null, initFileFn = this.flowObj.opts.initFileFn) {
      if (typeof initFileFn === "function") {
        initFileFn(this);
      }

      this._bootstrap();
    }

    _bootstrap() {
      this.abort(true);
      this.error = false;
      // Rebuild stack of chunks from file
      this._prevProgress = 0;
      var round = this.flowObj.opts.forceChunkSize ? Math.ceil : Math.floor;
      this.chunkSize = evalOpts(this.flowObj.opts.chunkSize, this);
      var chunks = Math.max(
        round(this.size / this.chunkSize), 1
      );
      for (var offset = 0; offset < chunks; offset++) {
        this.chunks.push(
          new FlowChunk(this.flowObj, this, offset)
        );
      }
    }

    /**
     * Get current upload progress status
     * @function
     * @returns {number} from 0 to 1
     */
    progress() {
      if (this.error) {
        return 1;
      }
      if (this.chunks.length === 1) {
        this._prevProgress = Math.max(this._prevProgress, this.chunks[0].progress());
        return this._prevProgress;
      }
      // Sum up progress across everything
      var bytesLoaded = 0;
      each(this.chunks, function (c) {
        // get chunk progress relative to entire file
        bytesLoaded += c.progress() * (c.endByte - c.startByte);
      });
      var percent = bytesLoaded / this.size;
      // We don't want to lose percentages when an upload is paused
      this._prevProgress = Math.max(this._prevProgress, percent > 0.9999 ? 1 : percent);
      return this._prevProgress;
    }

    /**
     * Indicates if file is being uploaded at the moment
     * @function
     * @returns {boolean}
     */
    isUploading() {
      var uploading = false;
      each(this.chunks, function (chunk) {
        if (chunk.status() === 'uploading') {
          uploading = true;
          return false;
        }
      });
      return uploading;
    }

    /**
     * Indicates if file is has finished uploading and received a response
     * @function
     * @returns {boolean}
     */
    isComplete() {
      var outstanding = false;
      each(this.chunks, function (chunk) {
        var status = chunk.status();
        if (status === 'pending' || status === 'uploading' || status === 'reading' || chunk.preprocessState === 1 || chunk.readState === 1) {
          outstanding = true;
          return false;
        }
      });
      return !outstanding;
    }

    /**
     * Count total size uploaded
     * @function
     * @returns {number}
     */
    sizeUploaded() {
      var size = 0;
      each(this.chunks, function (chunk) {
        size += chunk.sizeUploaded();
      });
      return size;
    }

    /**
     * Returns remaining time to finish upload file in seconds. Accuracy is based on average speed.
     * If speed is zero, time remaining will be equal to positive infinity `Number.POSITIVE_INFINITY`
     * @function
     * @returns {number}
     */
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

    /**
     * Get file type
     * @function
     * @returns {string}
     */
    getType() {
      return this.file.type && this.file.type.split('/')[1];
    }

    /**
     * Get file extension
     * @function
     * @returns {string}
     */
    getExtension() {
      return this.name.substr((~-this.name.lastIndexOf(".") >>> 0) + 2).toLowerCase();
    }
  }

  /**
   * Exclusively for test purposes
   * (Until Grunt+Karma+Jasmine can allow test to use (ES) `import` of tools.js)
   */
  var g = typeof window !== 'undefined' ? window
      : typeof global !== 'undefined' ? global
      : typeof self !== 'undefined' ? self : {};
  g.FlowFile = FlowFile;

  /**
   * AsyncFlowFile class
   * @name AsyncFlowFile
   */
  class AsyncFlowFile extends FlowFile {

    /**
     * Retry aborted file upload
     * @function
     */
    async retry() {
      await this.bootstrap('retry');
      return await this.flowObj.upload();
    }

    async bootstrap(event = null, initFileFn = this.flowObj.opts.initFileFn) {
      /**
       * Asynchronous initialization function, if defined, is run
       * Then _bootstrap follow-up occurs
       * And, optionally (in case of initial FlowFile creation), the `file-added` event is fired.
       */
      if (typeof initFileFn === 'function') {
        await initFileFn(this, event);
      }

      this._bootstrap();

      // console.log("Flowfile returns [async]", this._bootstrapped);
      return this;
    }

    /**
     * Indicates if string is being read at the moment
     * @function
     * @returns {boolean}
     */
    isReading() {
      for (let chunk of this.chunks) {
        if (chunk.status() === 'reading') {
          return true;
        }
      }
      return false;
    }
  }

  /**
   * @license MIT
   */

  /**
   * Flow.js is a library providing multiple simultaneous, stable and
   * resumable uploads via the HTML5 File API.
   * @param [opts]
   * @param {number|Function} [opts.chunkSize]
   * @param {bool} [opts.forceChunkSize]
   * @param {number} [opts.simultaneousUploads]
   * @param {bool} [opts.singleFile]
   * @param {string} [opts.fileParameterName]
   * @param {number} [opts.progressCallbacksInterval]
   * @param {number} [opts.speedSmoothingFactor]
   * @param {Object|Function} [opts.query]
   * @param {Object|Function} [opts.headers]
   * @param {bool} [opts.withCredentials]
   * @param {Function} [opts.preprocess]
   * @param {string} [opts.method]
   * @param {string|Function} [opts.testMethod]
   * @param {string|Function} [opts.uploadMethod]
   * @param {bool} [opts.prioritizeFirstAndLastChunk]
   * @param {bool} [opts.allowDuplicateUploads]
   * @param {string|Function} [opts.target]
   * @param {number} [opts.maxChunkRetries]
   * @param {number} [opts.chunkRetryInterval]
   * @param {Array.<number>} [opts.permanentErrors]
   * @param {Array.<number>} [opts.successStatuses]
   * @param {Function} [opts.initFileFn]
   * @param {Function} [opts.readFileFn]
   * @param {Function} [opts.asyncReadFileFn]
   * @param {Function} [opts.generateUniqueIdentifier]
   * @constructor
   */
  class Flow extends Eventizer {

    /**
     * For the events object:
     *  - keys: stands for event name
     *  - values: array list of callbacks
     * All keys are lowercased as on() would do.
     */
    constructor(opts, events) {
      super(events);

      /**
       * Library version
       * @type {string}
       */
      Flow.version = '3.0.0-alpha.0';

      /**
       * Check if directory upload is supported
       * @type {boolean}
       */
      this.supportDirectory = (
        /Chrome/.test(window.navigator.userAgent) ||
        /Firefox/.test(window.navigator.userAgent) ||
        /Edge/.test(window.navigator.userAgent)
      );

      /**
       * List of FlowFile objects
       * @type {Array.<FlowFile>}
       */
      this.files = [];

      /**
       * Default options for flow.js
       * @type {Object}
       */
      this.defaults = {
        chunkSize: 1024 * 1024,
        forceChunkSize: false,
        simultaneousUploads: 3,
        singleFile: false,
        fileParameterName: 'file',
        progressCallbacksInterval: 500,
        speedSmoothingFactor: 0.1,
        query: {},
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
        permanentErrors: [404, 413, 415, 500, 501],
        successStatuses: [200, 201, 202],
        onDropStopPropagation: false,
        initFileFn: null,
        readFileFn: webAPIFileRead,
        asyncReadFileFn: null
      };

      /**
       * Current options
       * @type {Object}
       */
      this.opts = {};

      /**
       * Current options
       * @type {Object}
       */
      this.opts = Object.assign({}, this.defaults, opts || {});

      // A workaround for using this.method.bind(this) as a (removable) event handler.
      // https://stackoverflow.com/questions/11565471
      this._onDropBound = null;
    }

    /**
     * On drop event
     * @function
     * @param {MouseEvent} event
     */
    onDrop(event) {
      if (this.opts.onDropStopPropagation) {
        event.stopPropagation();
      }
      event.preventDefault();
      var dataTransfer = event.dataTransfer;
      if (dataTransfer.items && dataTransfer.items[0] &&
          dataTransfer.items[0].webkitGetAsEntry) {
        this.webkitReadDataTransfer(event);
      } else {
        this.addFiles(dataTransfer.files, event);
      }
    }

    /**
     * Prevent default
     * @function
     * @param {MouseEvent} event
     */
    preventEvent(event) {
      event.preventDefault();
    }

    /**
     * Read webkit dataTransfer object
     * @param event
     */
    webkitReadDataTransfer(event) {
      var queue = event.dataTransfer.items.length;
      var decrement = () => {
        if (--queue == 0) {
          this.addFiles(files, event);
        }
      };

      var files = [];
      for (let item of event.dataTransfer.items) {
        var entry = item.webkitGetAsEntry();
        if (!entry) {
          decrement();
          return ;
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
        // relative path should not start with "/"
        file.relativePath = fullPath.substring(1);
        files.push(file);
        decrement();
      }
      function readError(fileError) {
        decrement();
        throw fileError;
      }
    }

    /**
     * Generate unique identifier for a file
     * @function
     * @param {FlowFile} file
     * @returns {string}
     */
    async generateUniqueIdentifier(file) {
      var custom = this.opts.generateUniqueIdentifier;
      if (typeof custom === 'function') {
        return await custom(file);
      }
      // Some confusion in different versions of Firefox
      var relativePath = file.relativePath || file.webkitRelativePath || file.fileName || file.name;
      return file.size + '-' + relativePath.replace(/[^0-9a-zA-Z_-]/img, '');
    }

    /**
     * Upload next chunk from the queue
     * @function
     * @returns {boolean}
     * @private
     */
    async uploadNextChunk(preventEvents) {
      // In some cases (such as videos) it's really handy to upload the first
      // and last chunk of a file quickly; this let's the server check the file's
      // metadata and determine if there's even a point in continuing.
      var found = false;
      if (this.opts.prioritizeFirstAndLastChunk) {
        for (let file of this.files) {
          if (!file.paused && file.chunks.length &&
              file.chunks[0].status() === 'pending') {
            await file.chunks[0].send();
            found = true;
            break;
          }
          if (!file.paused && file.chunks.length > 1 &&
              file.chunks[file.chunks.length - 1].status() === 'pending') {
            await file.chunks[file.chunks.length - 1].send();
            found = true;
            break;
          }
        }
        if (found) {
          return found;
        }
      }

      // Now, simply look for the next, best thing to upload
      outer_loop:
      for (let file of this.files) {
        if (file.paused) {
          continue;
        }
        for (let chunk of file.chunks) {
          if (chunk.status() === 'pending') {
            await chunk.send();
            found = true;
            break outer_loop;
          }
        }
      }
      if (found) {
        return true;
      }

      // The are no more outstanding chunks to upload, check if everything is done
      var outstanding = false;
      for (let file of this.files) {
        if (!file.isComplete()) {
          outstanding = true;
          break;
        }
      }

      if (!outstanding && !preventEvents) {
        // All chunks have been uploaded, complete
        this.emit('complete');
      }
      return false;
    }


    /**
     * Assign a browse action to one or more DOM nodes.
     * @function
     * @param {Element|Array.<Element>} domNodes
     * @param {boolean} isDirectory Pass in true to allow directories to
     * @param {boolean} singleFile prevent multi file upload
     * @param {Object} attributes set custom attributes:
     *  http://www.w3.org/TR/html-markup/input.file.html#input.file-attributes
     *  eg: accept: 'image/*'
     * be selected (Chrome only).
     */
    async assignBrowse(domNodes, isDirectory, singleFile, attributes) {
      if (domNodes instanceof Element) {
        domNodes = [domNodes];
      }

      each(domNodes, function (domNode) {
        var input;
        if (domNode.tagName === 'INPUT' && domNode.type === 'file') {
          input = domNode;
        } else {
          input = document.createElement('input');
          input.setAttribute('type', 'file');
          // display:none - not working in opera 12
          Object.assign(input.style, {
            visibility: 'hidden',
            position: 'absolute',
            width: '1px',
            height: '1px'
          });
          // for opera 12 browser, input must be assigned to a document
          domNode.appendChild(input);
          // https://developer.mozilla.org/en/using_files_from_web_applications)
          // event listener is executed two times
          // first one - original mouse click event
          // second - input.click(), input is inside domNode
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
        each(attributes, function (value, key) {
          input.setAttribute(key, value);
        });
        // When new files are added, simply append them to the overall list
        input.addEventListener('change', async e => {
          if (e.target.value) {
            await this.addFiles(e.target.files, e);
            e.target.value = '';
          }
        }, false);
      }, this);
    }

    /**
     * Assign one or more DOM nodes as a drop target.
     * @function
     * @param {Element|Array.<Element>} domNodes
     */
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

    /**
     * Un-assign drop event from DOM nodes
     * @function
     * @param domNodes
     */
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

    /**
     * Returns a boolean indicating whether or not the instance is currently
     * uploading anything.
     * @function
     * @returns {boolean}
     */
    isUploading() {
      var uploading = false;
      each(this.files, function (file) {
        if (file.isUploading()) {
          uploading = true;
          return false;
        }
      });
      return uploading;
    }

    /**
     * should upload next chunk
     * @function
     * @returns {boolean|number}
     */
    _shouldUploadNext() {
      var num = 0;
      var should = true;
      var simultaneousUploads = this.opts.simultaneousUploads;
      each(this.files, function (file) {
        each(file.chunks, function(chunk) {
          if (chunk.status() === 'uploading') {
            num++;
            if (num >= simultaneousUploads) {
              should = false;
              return false;
            }
          }
        });
      });
      // if should is true then return uploading chunks's length
      return should && num;
    }

    /**
     * Start or resume uploading.
     * @function
     */
    async upload() {
      // Make sure we don't start too many uploads at once
      var ret = this._shouldUploadNext();
      if (ret === false) {
        return;
      }
      // Kick off the queue
      this.emit('upload-start');
      var started = false;
      for (var num = 1; num <= this.opts.simultaneousUploads - ret; num++) {
        started = await this.uploadNextChunk(true) || started;
      }
      if (!started) {
        this.emit('complete');
      }
    }

    /**
     * Resume uploading.
     * @function
     */
    resume() {
      each(this.files, function (file) {
        if (!file.isComplete()) {
          file.resume();
        }
      });
    }

    /**
     * Pause uploading.
     * @function
     */
    pause() {
      each(this.files, function (file) {
        file.pause();
      });
    }

    /**
     * Cancel upload of all FlowFile objects and remove them from the list.
     * @function
     */
    cancel() {
      for (var i = this.files.length - 1; i >= 0; i--) {
        this.files[i].cancel();
      }
    }

    /**
     * Returns a number between 0 and 1 indicating the current upload progress
     * of all files.
     * @function
     * @returns {number}
     */
    progress() {
      var totalDone = 0;
      var totalSize = 0;
      // Resume all chunks currently being uploaded
      each(this.files, function (file) {
        totalDone += file.progress() * file.size;
        totalSize += file.size;
      });
      return totalSize > 0 ? totalDone / totalSize : 0;
    }

    /**
     * Add a HTML5 File object to the list of files.
     * @function
     * @param {File} file
     * @param Any other parameters supported by addFiles.
     *
     * @return (async) An initialized <AsyncFlowFile>.
     */
    async addFile(file, ...args) {
      return (await this.addFiles([file], ...args))[0];
    }

    /**
     * Add a HTML5 File object to the list of files.
     * @function
     * @param {FileList|Array} fileList
     * @param {Event} [event] event is optional
     *
     * @return Promise{[<AsyncFlowFile>,...]} The promise of getting an array of AsyncFlowFile.
     */
    async addFiles(fileList, event = null, initFileFn = this.opts.initFileFn) {
      let states = [];

      const ie10plus = window.navigator.msPointerEnabled;

      for (let file of fileList) {
        // https://github.com/flowjs/flow.js/issues/55
        if ((ie10plus && file.size === 0) || (file.size % 4096 === 0 && (file.name === '.' || file.fileName === '.'))) {
          // console.log(`file ${file.name} empty. skipping`);
          continue;
        }

        var uniqueIdentifier = await this.generateUniqueIdentifier(file);
        if (!this.opts.allowDuplicateUploads && this.getFromUniqueIdentifier(uniqueIdentifier)) {
          // console.log(`file ${file.name} non-unique. skipping`);
          continue;
        }

        if (! await this.hook('filter-file', file, event)) {
          // console.log(`file ${file.name} filtered-out. skipping`);
          continue;
        }

        let flowFile = new AsyncFlowFile(this, file, uniqueIdentifier);

        let state = flowFile.bootstrap(event, initFileFn);
        states.push(state);
      }

      let flowFiles = await Promise.all(states);
      for (let ff of flowFiles) {
        await this.hook('file-added', ff, event);
      }

      // TODO: It's kinda ugly to have the same filter run once after both hooks,
      // but it matches the old v2 and v3's synchronous behaviour where `files-added`
      // received the list filtered by individual `file-added`s
      flowFiles = flowFiles.filter(f => f && f.file);

      await this.hook('files-added', flowFiles, event);

      // TODO: see above
      flowFiles = flowFiles.filter(f => f && f.file);

      for (let file of flowFiles) {
        if (this.opts.singleFile && this.files.length > 0) {
          this.removeFile(this.files[0]);
        }
        this.files.push(file);
      }

      await this.hook('files-submitted', this.files, event);

      return flowFiles;
    }

    /**
     * Cancel upload of a specific FlowFile object from the list.
     * @function
     * @param {FlowFile} file
     */
    removeFile(file) {
      for (var i = this.files.length - 1; i >= 0; i--) {
        if (this.files[i] === file) {
          this.files.splice(i, 1);
          file.abort();
          this.emit('file-removed', file);
          break;
        }
      }
    }

    /**
     * Look up a FlowFile object by its unique identifier.
     * @function
     * @param {string} uniqueIdentifier
     * @returns {boolean|FlowFile} false if file was not found
     */
    getFromUniqueIdentifier(uniqueIdentifier) {
      var ret = false;
      each(this.files, function (file) {
        if (file.uniqueIdentifier === uniqueIdentifier) {
          ret = file;
        }
      });
      return ret;
    }

    /**
     * Returns the total size of all files in bytes.
     * @function
     * @returns {number}
     */
    getSize() {
      var totalSize = 0;
      each(this.files, function (file) {
        totalSize += file.size;
      });
      return totalSize;
    }

    /**
     * Returns the total size uploaded of all files in bytes.
     * @function
     * @returns {number}
     */
    sizeUploaded() {
      var size = 0;
      each(this.files, function (file) {
        size += file.sizeUploaded();
      });
      return size;
    }

    /**
     * Returns remaining time to upload all files in seconds. Accuracy is based on average speed.
     * If speed is zero, time remaining will be equal to positive infinity `Number.POSITIVE_INFINITY`
     * @function
     * @returns {number}
     */
    timeRemaining() {
      var sizeDelta = 0;
      var averageSpeed = 0;
      each(this.files, function (file) {
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

  return Flow;

})));
//# sourceMappingURL=flow.js.map
