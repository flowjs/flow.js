/**
 * @license MIT
 */

import FlowFile from './FlowFile.js';
import UploadSession from './UploadSession.js';
import {each} from './tools.js';

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
export default class Flow extends EventTarget {
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
