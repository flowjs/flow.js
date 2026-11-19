import FlowChunk from './FlowChunk.js';
import {each, evalOpts} from './tools.js';

/**
 * A file being uploaded by Flow.
 */
export default class FlowFile {
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
var g = typeof window !== 'undefined' ? window
    : typeof global !== 'undefined' ? global
    : typeof self !== 'undefined' ? self : {};
g.FlowFile = FlowFile;
