describe('upload edge cases', function() {
  var flow;
  var xhr;

  function makeFlow(overrides) {
    return new Flow(Object.assign({
      testChunks: false,
      generateUniqueIdentifier: function(file) {
        return (file.name || 'blob') + '-' + file.size;
      }
    }, overrides || {}));
  }

  function pending() {
    return xhr.requests.filter(request => !request.aborted && request.readyState !== 4);
  }

  async function waitRequests(count) {
    await waitFor(function() {
      return xhr.requests.length >= count;
    }, 3000, 5);
  }

  async function nextRequest() {
    await waitFor(function() {
      return pending().length > 0;
    }, 3000, 5);
    return pending()[0];
  }

  async function respondOne(status, body) {
    var request = await nextRequest();
    request.respond(status || 200, {}, body || '');
    await flush();
  }

  async function respondUntil(condition, status) {
    var start = Date.now();
    while (!condition()) {
      if (Date.now() - start > 5000) {
        throw new Error('respondUntil timeout');
      }
      await respondOne(status || 200);
    }
  }

  function flush(count = 8) {
    var promise = Promise.resolve();
    while (count--) {
      promise = promise.then(function() {});
    }
    return promise;
  }

  beforeEach(function() {
    xhr = sinon.createFakeServer({
      respondImmediately: false,
      autoRespond: false
    });
  });

  afterEach(function() {
    xhr.restore();
  });

  it('skips a chunk when the test request reports it already exists', async function() {
    flow = makeFlow({testChunks: true, chunkSize: 10});
    await flow.addFile(new File(['abc'], 'exists.bin'));
    var done = flow.upload();
    await waitRequests(1);
    expect(xhr.requests[0].method).toBe('GET');
    xhr.requests[0].respond(200);
    await done;
    expect(xhr.requests.length).toBe(1);
    expect(flow.files[0].isSuccessful()).toBe(true);
  });

  it('uploads a chunk when the test request returns 404', async function() {
    flow = makeFlow({testChunks: true, chunkSize: 10});
    await flow.addFile(new File(['abc'], 'missing.bin'));
    var done = flow.upload();
    await waitRequests(1);
    xhr.requests[0].respond(404);
    await waitRequests(2);
    expect(xhr.requests[1].method).toBe('POST');
    xhr.requests[1].respond(200);
    await done;
    expect(xhr.requests.length).toBe(2);
    expect(flow.files[0].isSuccessful()).toBe(true);
  });

  it('retries a temporary test failure', async function() {
    flow = makeFlow({testChunks: true, maxChunkRetries: 1, chunkSize: 10});
    await flow.addFile(new File(['abc'], 'test-retry.bin'));
    var done = flow.upload();
    await waitRequests(1);
    xhr.requests[0].respond(503);
    await waitRequests(2);
    expect(xhr.requests[1].method).toBe('GET');
    xhr.requests[1].respond(200);
    await done;
    expect(flow.files[0].isSuccessful()).toBe(true);
    expect(flow.files[0].chunks[0].retries).toBe(1);
  });

  it('fails after exhausting test retries', async function() {
    flow = makeFlow({testChunks: true, maxChunkRetries: 0, chunkSize: 10});
    await flow.addFile(new File(['abc'], 'test-fail.bin'));
    var done = flow.upload();
    await waitRequests(1);
    xhr.requests[0].respond(503);
    await done;
    expect(flow.files[0].error).toBe(true);
    expect(xhr.requests.length).toBe(1);
  });

  it('turns a null reader result into a zero-byte request for an empty file', async function() {
    flow = makeFlow({
      chunkSize: 5,
      readFileFn: async function() { return null; }
    });
    await flow.addFile(new File([], 'null-empty.bin'));
    var done = flow.upload();
    await waitRequests(1);
    expect(xhr.requests[0].requestBody.get('file').size).toBe(0);
    xhr.requests[0].respond(200);
    await done;
    expect(flow.files[0].isSuccessful()).toBe(true);
  });

  it('rejects premature EOF by default', async function() {
    flow = makeFlow({
      chunkSize: 1,
      readFileFn: async function(fileObj, startByte, endByte, fileType) {
        return startByte === 1 ? null : fileObj.file.slice(startByte, endByte, fileType);
      }
    });
    await flow.addFile(new File(['abc'], 'eof-premature.bin'));
    await flow.upload();
    var file = flow.files[0];
    expect(file.error).toBe(true);
    expect(file.errorMessage).toContain('Unexpected EOF');
  });

  it('allows premature EOF only when allowShortStream is enabled', async function() {
    flow = makeFlow({
      chunkSize: 1,
      allowShortStream: true,
      readFileFn: async function(fileObj, startByte, endByte, fileType) {
        return startByte === 2 ? null : fileObj.file.slice(startByte, endByte, fileType);
      }
    });
    await flow.addFile(new File(['abc'], 'eof-short.bin'));
    var done = flow.upload();
    await waitRequests(2);
    xhr.requests[0].respond(200);
    xhr.requests[1].respond(200);
    await done;
    expect(xhr.requests.length).toBe(2);
    expect(flow.files[0].isSuccessful()).toBe(true);
  });

  it('accepts an ArrayBuffer reader result', async function() {
    flow = makeFlow({
      method: 'octet',
      chunkSize: 3,
      readFileFn: async function() {
        return new TextEncoder().encode('abc').buffer;
      }
    });
    await flow.addFile(new File(['abc'], 'arraybuffer.bin'));
    var done = flow.upload();
    await waitRequests(1);
    expect(new TextDecoder().decode(xhr.requests[0].requestBody)).toBe('abc');
    xhr.requests[0].respond(200);
    await done;
    expect(flow.files[0].isSuccessful()).toBe(true);
  });

  it('wraps a string reader result in a Blob', async function() {
    flow = makeFlow({
      method: 'octet',
      chunkSize: 3,
      readFileFn: async function() { return 'xyz'; }
    });
    await flow.addFile(new File(['xyz'], 'string.bin'));
    var done = flow.upload();
    await waitRequests(1);
    expect(await xhr.requests[0].requestBody.text()).toBe('xyz');
    xhr.requests[0].respond(200);
    await done;
  });

  it('reports a reader exception as a file error', async function() {
    flow = makeFlow({
      readFileFn: async function() { throw new Error('read boom'); }
    });
    var errors = [];
    flow.addEventListener('error', function(event) { errors.push(event.detail); });
    await flow.addFile(new File(['abc'], 'read-error.bin'));
    await flow.upload();
    expect(xhr.requests.length).toBe(0);
    expect(flow.files[0].error).toBe(true);
    expect(flow.files[0].errorMessage).toBe('read boom');
    expect(errors[0].message).toBe('read boom');
  });

  it('awaits changeRawDataBeforeSend', async function() {
    flow = makeFlow({
      method: 'octet',
      chunkSize: 3,
      readFileFn: async function() { return new Blob(['abc']); },
      changeRawDataBeforeSend: async function() { return new Blob(['changed']); }
    });
    await flow.addFile(new File(['abc'], 'raw-data.bin'));
    var done = flow.upload();
    await waitRequests(1);
    expect(await xhr.requests[0].requestBody.text()).toBe('changed');
    xhr.requests[0].respond(200);
    await done;
  });

  it('catches unexpected chunk upload exceptions', async function() {
    flow = makeFlow({chunkSize: 3});
    await flow.addFile(new File(['abc'], 'worker-error.bin'));
    var errors = [];
    flow.addEventListener('error', function(event) { errors.push(event.detail); });
    flow.files[0].chunks[0].upload = async function() {
      throw new Error('worker boom');
    };
    await flow.upload();
    expect(flow.files[0].error).toBe(true);
    expect(errors[0].message).toBe('worker boom');
  });

  it('prioritizes the first and last chunks', async function() {
    flow = makeFlow({
      chunkSize: 1,
      simultaneousUploads: 1,
      prioritizeFirstAndLastChunk: true
    });
    await flow.addFile(new File(['abcde'], 'priority.bin'));
    var done = flow.upload();
    var expected = [1, 5, 2, 3, 4];
    for (var i = 0; i < expected.length; i++) {
      await waitRequests(i + 1);
      var request = xhr.requests[i];
      expect(Number(request.requestBody.get('flowChunkNumber'))).toBe(expected[i]);
      request.respond(200);
      await flush();
    }
    await done;
    expect(flow.files[0].isSuccessful()).toBe(true);
  });

  it('pauses and resumes the whole flow, and ignores unknown removals', async function() {
    flow = makeFlow({chunkSize: 1, simultaneousUploads: 2});
    await flow.addFile(new File(['abcd'], 'flow-pause.bin'));
    var done = flow.upload();
    await waitRequests(2);
    await flow.pause();
    expect(flow.files[0].paused).toBe(true);
    expect(flow.isUploading()).toBe(false);

    var resumed = flow.resume();
    await respondUntil(function() {
      return flow.files[0].isComplete();
    });
    await resumed;
    await done;
    expect(flow.files[0].progress()).toBe(1);
    await flow.removeFile({});
    expect(flow.files.length).toBe(1);
  });

  it('picks up files added during an active session', async function() {
    flow = makeFlow({chunkSize: 1, simultaneousUploads: 1});
    await flow.addFile(new File(['ab'], 'first-active.bin'));
    var done = flow.upload();
    await waitRequests(1);
    await flow.addFile(new File(['cd'], 'second-active.bin'));
    xhr.requests[0].respond(200);
    await respondUntil(function() {
      return flow.files.every(function(file) { return file.isComplete(); });
    });
    await done;
    expect(flow.files.length).toBe(2);
    expect(flow.files.every(function(file) { return file.isSuccessful(); })).toBe(true);
  });

  it('reports a throwing filter hook and skips the file', async function() {
    flow = makeFlow({
      hooks: {
        filterFile: function() { throw new Error('filter boom'); }
      }
    });
    var errors = [];
    flow.addEventListener('error', function(event) { errors.push(event.detail); });
    await flow.addFile(new File(['abc'], 'filter-error.bin'));
    expect(flow.files.length).toBe(0);
    expect(errors[0].hook).toBe('filterFile');
    expect(errors[0].message).toBe('filter boom');
  });

  it('handles drop propagation and the webkit/non-webkit paths', async function() {
    flow = makeFlow({onDropStopPropagation: true});
    var event = {
      preventDefault: jasmine.createSpy('preventDefault'),
      stopPropagation: jasmine.createSpy('stopPropagation'),
      dataTransfer: {
        items: [{webkitGetAsEntry: function() { return false; }}],
        files: []
      }
    };
    spyOn(flow, 'webkitReadDataTransfer');
    await flow.onDrop(event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(flow.webkitReadDataTransfer).toHaveBeenCalledWith(event);

    var plainEvent = {
      preventDefault: jasmine.createSpy('preventDefault'),
      stopPropagation: jasmine.createSpy('stopPropagation'),
      dataTransfer: {files: []}
    };
    spyOn(flow, 'addFiles').and.returnValue(Promise.resolve([]));
    await flow.onDrop(plainEvent);
    expect(flow.addFiles).toHaveBeenCalledWith([], {event: plainEvent});
  });

  it('wires browse click and attributes', function() {
    flow = makeFlow();
    var div = document.createElement('div');
    flow.assignBrowse(div, false, false, {accept: 'image/*'});
    var input = div.querySelector('input');
    expect(input.getAttribute('accept')).toBe('image/*');
    var click = spyOn(input, 'click');
    div.dispatchEvent(new MouseEvent('click', {bubbles: true}));
    expect(click).toHaveBeenCalled();
  });

  it('reports file state helpers and ignores repeated terminal events', function() {
    flow = makeFlow();
    var file = new FlowFile(flow, {name: 'state.bin', size: 2, type: 'text/plain'});
    file.bootstrap();
    expect(file.isReading()).toBe(false);
    file.chunks[0].state = 'reading';
    expect(file.isReading()).toBe(true);
    file.chunks[0].state = 'success';
    expect(file.isSuccessful()).toBe(true);

    var errors = [];
    flow.addEventListener('error', function(event) { errors.push(event.detail); });
    file.chunkEvent(file.chunks[0], 'error', 'first');
    file.chunkEvent(file.chunks[0], 'error', 'second');
    file.chunkEvent(file.chunks[0], 'success', 'ignored');
    expect(errors.length).toBe(1);
    expect(file.errorMessage).toBe('first');

    file.error = false;
    file.abort('pending', true);
    expect(file.chunks.length).toBe(0);
    expect(file.progress()).toBe(0);

    var second = new FlowFile(flow, {name: 'state2.bin', size: 1});
    second.bootstrap();
    second.chunks[0].state = 'pending';
    second.abort('error');
    expect(second.chunks[0].state).toBe('error');
  });

  it('supports direct chunk send, pause, cancel, and abort-signal paths', async function() {
    flow = makeFlow({chunkSize: 3});
    var file = new FlowFile(flow, new File(['abc'], 'direct.bin'));
    file.bootstrap();
    var chunk = file.chunks[0];
    expect(chunk.getTarget('/x', [])).toBe('/x');
    expect(chunk.message()).toBe('');
    expect(chunk.getState()).toContain('state:pending');

    var sent = chunk.send();
    await waitRequests(1);
    xhr.requests[0].respond(200);
    await sent;
    expect(chunk.status()).toBe('success');
    expect(await chunk.send()).toBe('success');

    var pausedFile = new FlowFile(flow, new File(['abc'], 'paused.bin'));
    pausedFile.bootstrap();
    pausedFile.paused = true;
    expect(await pausedFile.chunks[0].send()).toBe('pending');

    var cancelledFile = new FlowFile(flow, new File(['abc'], 'cancelled.bin'));
    cancelledFile.bootstrap();
    cancelledFile.cancelled = true;
    expect(await cancelledFile.chunks[0].send()).toBe('cancelled');

    var abortedFile = new FlowFile(flow, new File(['abc'], 'aborted.bin'));
    abortedFile.bootstrap();
    var controller = new AbortController();
    controller.abort();
    expect(await abortedFile.chunks[0].upload(new Blob(['x']), controller.signal))
      .toBe('pending');
  });

  it('covers deferred, tools and session terminal helpers', async function() {
    var deferred = new FlowDeferred();
    deferred.resolve(1);
    deferred.resolve(2);
    expect(await deferred.promise).toBe(1);

    var rejected = new FlowDeferred();
    var error = new Error('deferred');
    rejected.reject(error);
    rejected.reject(new Error('ignored'));
    await expectAsync(rejected.promise).toBeRejectedWith(error);

    var seen = [];
    FlowTools.each([1, 2, 3], function(value) {
      seen.push(value);
      return value === 2 ? false : undefined;
    });
    expect(seen).toEqual([1, 2]);
    var keys = [];
    FlowTools.each({a: 1, b: 2}, function(value, key) { keys.push(key); });
    expect(keys).toEqual(['a', 'b']);

    var controller = new AbortController();
    controller.abort();
    await FlowTools.abortableSleep(1000, controller.signal);
    await FlowTools.sleep(1);

    flow = makeFlow();
    xhr.respondWith('ok');
    xhr.respondImmediately = xhr.autoRespond = true;
    await flow.addFile(new File(['a'], 'session.bin'));
    await flow.upload();
    var session = flow._session;
    await session.resume();
    session.cancel();

    var fatal = new FlowUploadSession(flow);
    var errors = [];
    flow.addEventListener('error', function(event) { errors.push(event.detail); });
    fatal._finishWithError(new Error('fatal'));
    var summary = await fatal.promise;
    expect(summary.status).toBe('error');
    expect(errors[0].message).toBe('fatal');
    fatal._finish('complete');
  });

  it('emits a complete summary', async function() {
    flow = makeFlow();
    xhr.respondWith('ok');
    xhr.respondImmediately = xhr.autoRespond = true;
    var complete = null;
    flow.addEventListener('complete', function(event) { complete = event.detail; });
    await flow.addFile(new File(['ab'], 'summary.bin'));
    await flow.upload();
    expect(complete.summary.status).toBe('complete');
    expect(complete.summary.totalBytes).toBe(2);
    expect(complete.files.length).toBe(1);
  });

  it('covers flow helpers, active upload state and browse change', async function() {
    flow = makeFlow({chunkSize: 1, simultaneousUploads: 1});
    var prevented = jasmine.createSpy('preventDefault');
    flow.preventEvent({preventDefault: prevented});
    expect(prevented).toHaveBeenCalled();

    await flow.addFile(new File(['ab'], 'active.bin'));
    var done = flow.upload();
    await waitRequests(1);
    expect(flow.isUploading()).toBe(true);
    xhr.requests[0].respond(200);
    await respondUntil(function() { return flow.files[0].isComplete(); });
    await done;

    flow = makeFlow({chunkSize: 1});
    await flow.addFile(new File(['a'], 'resume-no-session.bin'));
    var offset = xhr.requests.length;
    var resumed = flow.resume();
    await waitFor(function() { return xhr.requests.length > offset; }, 3000, 5);
    xhr.requests[offset].respond(200);
    await resumed;
    expect(flow.files[0].isSuccessful()).toBe(true);

    var input = document.createElement('input');
    input.type = 'file';
    var added = [];
    spyOn(flow, 'addFiles').and.callFake(async function(files, options) {
      added.push({files, options});
      return [];
    });
    flow.assignBrowse(input);
    Object.defineProperty(input, 'value', {
      value: 'C:\\fakepath\\a.bin',
      writable: true,
      configurable: true
    });
    Object.defineProperty(input, 'files', {
      value: [new File(['a'], 'a.bin')],
      configurable: true
    });
    input.dispatchEvent(new Event('change'));
    await flush(20);
    expect(added.length).toBe(1);
    expect(added[0].options.event.type).toBe('change');
    await waitFor(function() { return !input.hasAttribute('readonly'); }, 2000, 5);
  });

  it('covers read byte-length fallbacks and terminal chunk uploads', async function() {
    flow = makeFlow();
    var file = new FlowFile(flow, new File(['abc'], 'fallback.bin'));
    file.bootstrap();
    var chunk = file.chunks[0];

    flow.opts.readFileFn = async function() { return [1, 2, 3]; };
    await chunk.read();
    expect(chunk.readBytes).toBe(3);

    chunk.payload = undefined;
    flow.opts.readFileFn = async function() { return {}; };
    await chunk.read();
    expect(chunk.readBytes).toBe(-1);

    chunk.state = 'success';
    expect(await chunk.upload(new Blob(['x']))).toBe('success');
  });

  it('re-sends a chunk after a paused attempt settled its upload state', async function() {
    flow = makeFlow({chunkSize: 3});
    var file = new FlowFile(flow, new File(['abc'], 'resend.bin'));
    file.bootstrap();
    file.paused = true;
    expect(await file.chunks[0].send()).toBe('pending');

    file.paused = false;
    flow.opts.readFileFn = function(fileObj, startByte, endByte, fileType) {
      return fileObj.file.slice(startByte, endByte, fileType);
    };
    var sent = file.chunks[0].send();
    await waitRequests(1);
    xhr.requests[0].respond(200);
    await sent;
    expect(file.chunks[0].status()).toBe('success');
  });

  it('retries a file with no chunks and skips successful chunks on partial retry', async function() {
    flow = makeFlow({chunkSize: 1});
    xhr.respondWith('ok');
    xhr.respondImmediately = xhr.autoRespond = true;

    var empty = new FlowFile(flow, new File(['ab'], 'retry-empty.bin'));
    empty.bootstrap();
    empty.abort('pending', true);
    flow.files.push(empty);
    await empty.retry();
    expect(empty.chunks.length).toBe(2);
    expect(empty.isSuccessful()).toBe(true);

    var partial = new FlowFile(flow, new File(['ab'], 'retry-partial.bin'));
    partial.bootstrap();
    partial.chunks[0].state = 'success';
    partial.chunks[1].state = 'error';
    partial.error = true;
    flow.files.push(partial);
    await partial.retry();
    expect(partial.chunks[0].status()).toBe('success');
    expect(partial.chunks[1].status()).toBe('success');
  });

  it('adds terminal guards for tools and sessions', async function() {
    var seen = {};
    FlowTools.each({a: 1, b: 2}, function(value, key) {
      seen[key] = value;
      return key === 'a' ? false : undefined;
    });
    expect(seen).toEqual({a: 1});

    flow = makeFlow();
    var fatal = new FlowUploadSession(flow);
    fatal._finishWithError(new Error('first'));
    fatal._finishWithError(new Error('ignored'));
    var summary = await fatal.promise;
    expect(summary.status).toBe('error');
  });


  it('skips paused files while prioritizing first and last chunks', async function() {
    flow = makeFlow({
      chunkSize: 1,
      prioritizeFirstAndLastChunk: true,
      simultaneousUploads: 1
    });
    await flow.addFiles([
      new File(['ab'], 'priority-paused.bin'),
      new File(['cd'], 'priority-active.bin')
    ]);
    flow.files[0].paused = true;

    var done = flow.upload();
    await respondUntil(function() {
      return flow.files[1].isComplete();
    });
    var resumed = flow.files[0].resume();
    await respondUntil(function() {
      return flow.files[0].isComplete();
    });
    await resumed;
    await done;
    expect(flow.files[0].isSuccessful()).toBe(true);
    expect(flow.files[1].isSuccessful()).toBe(true);
  });


  it('aborts a reader through the pause signal without marking a file error', async function() {
    var aborted = false;
    flow = makeFlow({
      chunkSize: 3,
      readFileFn: function(fileObj, startByte, endByte, fileType, chunk, context) {
        return new Promise(function(resolve, reject) {
          var timer = setTimeout(function() {
            resolve(fileObj.file.slice(startByte, endByte, fileType));
          }, 100);
          context.signal.addEventListener('abort', function() {
            clearTimeout(timer);
            aborted = true;
            reject(new DOMException('Aborted', 'AbortError'));
          }, {once: true});
        });
      }
    });
    await flow.addFile(new File(['abc'], 'read-signal.bin'));
    var done = flow.upload();
    await sleep(10);
    await flow.files[0].pause();
    await waitFor(function() { return aborted; }, 2000, 5);
    await sleep(50);

    expect(xhr.requests.length).toBe(0);
    expect(flow.files[0].error).toBe(false);

    var resumed = flow.files[0].resume();
    await waitRequests(1);
    xhr.requests[0].respond(200);
    await resumed;
    await done;
    expect(flow.files[0].isSuccessful()).toBe(true);
  });

  it('settles when a permanent error occurs while another chunk is reading', async function() {
    flow = makeFlow({
      chunkSize: 1,
      simultaneousUploads: 2,
      readFileFn: function(fileObj, startByte, endByte, fileType, chunk, context) {
        if (startByte === 0) {
          return fileObj.file.slice(startByte, endByte, fileType);
        }
        return new Promise(function(resolve, reject) {
          var timer = setTimeout(function() {
            resolve(fileObj.file.slice(startByte, endByte, fileType));
          }, 200);
          context.signal.addEventListener('abort', function() {
            clearTimeout(timer);
            reject(new DOMException('Aborted', 'AbortError'));
          }, {once: true});
        });
      }
    });
    await flow.addFile(new File(['abc'], 'error-during-read.bin'));
    var file = flow.files[0];
    var done = flow.upload();
    await waitRequests(1);
    xhr.requests[0].respond(500);
    await done;

    expect(file.error).toBe(true);
    expect(file.isComplete()).toBe(true);
    expect(file.chunks.every(function(chunk) { return chunk.status() === 'error'; }))
      .toBe(true);
  });


  it('covers direct test/upload abort branches and aborted reads', async function() {
    flow = makeFlow({testChunks: true, maxChunkRetries: 1, chunkSize: 3});
    var file = new FlowFile(flow, new File(['abc'], 'test-branch.bin'));
    file.bootstrap();
    var chunk = file.chunks[0];
    chunk._test = async function() {
      return {ok: false, networkError: true, responseText: ''};
    };
    expect(await chunk.upload(new Blob(['abc']))).toBe('error');
    expect(chunk.retries).toBe(1);

    var abortedTestFile = new FlowFile(flow, new File(['abc'], 'test-aborted.bin'));
    abortedTestFile.bootstrap();
    abortedTestFile.chunks[0]._test = async function() {
      return {ok: false, aborted: true};
    };
    expect(await abortedTestFile.chunks[0].upload(new Blob(['abc']))).toBe('pending');

    flow.opts.testChunks = false;
    var abortedUploadFile = new FlowFile(flow, new File(['abc'], 'upload-aborted.bin'));
    abortedUploadFile.bootstrap();
    abortedUploadFile.chunks[0]._xhrSend = async function() {
      return {ok: false, aborted: true};
    };
    expect(await abortedUploadFile.chunks[0].upload(new Blob(['abc']))).toBe('pending');

    var errorFile = new FlowFile(flow, new File(['abc'], 'send-error.bin'));
    errorFile.bootstrap();
    errorFile.error = true;
    errorFile.errorMessage = 'already failed';
    expect(await errorFile.chunks[0].send()).toBe('error');

    var controller = new AbortController();
    controller.abort();
    var abortedReadFile = new FlowFile(flow, new File(['abc'], 'read-aborted.bin'));
    abortedReadFile.bootstrap();
    expect(await abortedReadFile.chunks[0].read(controller.signal)).toBeNull();
  });

  it('cancels a session while a reader is in flight', async function() {
    var aborted = false;
    flow = makeFlow({
      chunkSize: 3,
      readFileFn: function(fileObj, startByte, endByte, fileType, chunk, context) {
        return new Promise(function(resolve, reject) {
          var timer = setTimeout(function() {
            resolve(fileObj.file.slice(startByte, endByte, fileType));
          }, 100);
          context.signal.addEventListener('abort', function() {
            clearTimeout(timer);
            aborted = true;
            reject(new DOMException('Aborted', 'AbortError'));
          }, {once: true});
        });
      }
    });
    await flow.addFile(new File(['abc'], 'cancel-read-session.bin'));
    var done = flow.upload();
    await sleep(10);
    await flow.cancel();
    await done;
    expect(aborted).toBe(true);
    expect(xhr.requests.length).toBe(0);
    expect(flow.files.length).toBe(0);
  });


  it('computes a chunk checksum once and reuses it on retry', async function() {
    var checksumCalls = 0;
    flow = makeFlow({
      chunkSize: 3,
      maxChunkRetries: 1,
      chunkChecksum: async function(chunk, payload) {
        checksumCalls++;
        return 'hash-' + chunk.offset + '-' + payload.size;
      }
    });
    await flow.addFile(new File(['abc'], 'checksum.bin'));
    var done = flow.upload();
    await waitRequests(1);
    expect(xhr.requests[0].requestBody.get('flowChunkHash')).toBe('hash-0-3');
    xhr.requests[0].respond(503);
    await waitRequests(2);
    expect(xhr.requests[1].requestBody.get('flowChunkHash')).toBe('hash-0-3');
    expect(checksumCalls).toBe(1);
    xhr.requests[1].respond(200);
    await done;
    expect(flow.files[0].isSuccessful()).toBe(true);
  });

  it('filters duplicate identifiers within one addFiles batch', async function() {
    flow = makeFlow();
    var first = new File(['abc'], 'duplicate.bin');
    var second = new File(['abc'], 'duplicate.bin');
    await flow.addFiles([first, second]);
    expect(flow.files.length).toBe(1);

    flow.opts.allowDuplicateUploads = true;
    await flow.addFiles([first, second]);
    expect(flow.files.length).toBe(3);
  });

  it('resets the source on retry after an uncached read failure', async function() {
    var initCalls = 0;
    var readCalls = 0;
    flow = makeFlow({
      chunkSize: 3,
      initFileFn: async function() {
        initCalls++;
      },
      readFileFn: async function(fileObj, startByte, endByte, fileType) {
        readCalls++;
        if (readCalls === 1) {
          throw new Error('read failed');
        }
        return fileObj.file.slice(startByte, endByte, fileType);
      }
    });
    await flow.addFile(new File(['abc'], 'retry-reset.bin'));
    var file = flow.files[0];
    await flow.upload();
    expect(file.error).toBe(true);
    expect(initCalls).toBe(1);

    var retried = file.retry();
    await waitRequests(1);
    xhr.requests[0].respond(200);
    await retried;
    expect(initCalls).toBe(2);
    expect(readCalls).toBe(2);
    expect(file.isSuccessful()).toBe(true);
  });


  it('caches a stateful read that completes during a pause', async function() {
    var position = 0;
    var readCalls = 0;
    flow = makeFlow({
      chunkSize: 3,
      simultaneousUploads: 1,
      readFileFn: function(fileObj) {
        readCalls++;
        return new Promise(function(resolve) {
          setTimeout(function() {
            var data = fileObj.file.slice(position, position + 3);
            position += 3;
            resolve(data.size ? data : null);
          }, 100);
        });
      }
    });
    await flow.addFile(new File(['abcdef'], 'stateful-pause.bin'));
    var file = flow.files[0];
    var done = flow.upload();
    await sleep(10);
    await file.pause();
    await sleep(150);

    expect(readCalls).toBe(1);
    expect(file.chunks[0].payload).toBeDefined();
    expect(await file.chunks[0].payload.text()).toBe('abc');

    var resumed = file.resume();
    await waitRequests(1);
    xhr.requests[0].respond(200);
    await waitRequests(2);
    xhr.requests[1].respond(200);
    await resumed;
    await done;

    expect(readCalls).toBe(2);
    expect(file.isSuccessful()).toBe(true);
    await validatePayload('abcdef', {requests: xhr.requests});
  });

});
