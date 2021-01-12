import FlowChunk from './FlowChunk';
import {evalOpts, each} from './tools';

/**
 * FlowFile class
 * @name FlowFile
 * @param {Flow} flowObj
 * @param {File} file
 * @param {string} uniqueIdentifier
 * @constructor
 */
export default class FlowFile {

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
        this.flowObj.fire('fileProgress', this, chunk);
        this.flowObj.fire('progress');
        this._lastProgressCallback = Date.now();
        break;
      case 'error':
        this.error = true;
        this.abort(true);
        this.flowObj.fire('fileError', this, message, chunk);
        this.flowObj.fire('error', message, this, chunk);
        break;
      case 'success':
        if (this.error) {
          return;
        }
        this.measureSpeed();
        this.flowObj.fire('fileProgress', this, chunk);
        this.flowObj.fire('progress');
        this._lastProgressCallback = Date.now();
        if (this.isComplete()) {
          this.currentSpeed = 0;
          this.averageSpeed = 0;
          this.flowObj.fire('fileSuccess', this, message, chunk);
        }
        break;
      case 'retry':
        this.flowObj.fire('fileRetry', this, chunk);
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
    var chunks = this.chunks;
    if (reset) {
      this.chunks = [];
    }
    each(chunks, function (c) {
      if (c.status() === 'uploading') {
        c.abort();
        this.flowObj.uploadNextChunk();
      }
    }, this);
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
