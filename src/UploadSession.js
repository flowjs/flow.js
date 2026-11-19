import Deferred from './Deferred.js';
import FlowChunk from './FlowChunk.js';

/**
 * One upload session per Flow instance.
 *
 * A session runs one or more cycles. Each cycle reads chunks in order through
 * an async generator and uploads them with a bounded worker pool. There is no
 * recursive scheduling from XHR or event handlers.
 */
export default class UploadSession {
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
