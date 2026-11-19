describe('upload file', function() {
  var flow;
  var xhr;

  function asCustomEvent(file, message, chunk) {
    return jasmine.objectContaining({file, message, chunk});
  }

  function listen(name, spy) {
    flow.addEventListener(name, function(event) {
      spy(event.detail);
    });
  }

  function pendingRequests() {
    return xhr.requests.filter(request => !request.aborted && request.readyState !== 4);
  }

  async function waitForRequests(count, timeout = 3000) {
    await waitFor(function() {
      return xhr.requests.length >= count;
    }, timeout, 5);
    expect(xhr.requests.length).toBeGreaterThanOrEqual(count);
  }

  async function nextRequest(timeout = 3000) {
    await waitFor(function() {
      return pendingRequests().length > 0;
    }, timeout, 5);
    var request = pendingRequests()[0];
    expect(request).toBeDefined();
    return request;
  }

  async function respondOne(status = 200, body = '') {
    var request = await nextRequest();
    request.respond(status, {}, body);
    await flush();
  }

  async function respondUntil(condition, status = 200, timeout = 5000) {
    var start = Date.now();
    while (!condition()) {
      if (Date.now() - start > timeout) {
        throw new Error('respondUntil timeout');
      }
      var request = await nextRequest(1000);
      request.respond(status, {}, '');
      await flush();
    }
  }

  function flush(count = 8) {
    var promise = Promise.resolve();
    while (count--) {
      promise = promise.then(function() {});
    }
    return promise;
  }

  beforeAll(function() {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000;
  });

  beforeEach(function() {
    flow = new Flow({
      progressCallbacksInterval: 0,
      generateUniqueIdentifier: function(file) {
        return (file.name || 'blob') + '-' + file.size;
      }
    });
    xhr = sinon.createFakeServer({
      respondImmediately: false,
      autoRespond: false
    });
  });

  afterEach(function() {
    xhr.restore();
  });

  describe('asynchronous per-chunk options', function() {

    it('awaits a target resolved from the chunk checksum', async function() {
      // What an endpoint with per-chunk integrity checks needs: the
      // destination is negotiated using the digest of the exact bytes about to
      // be sent, so it cannot be known before the chunk exists.
      const seen = [];
      flow.opts.testChunks = false;
      flow.opts.method = 'octet';
      flow.opts.chunkChecksum = async (chunk, payload) => 'sum-' + chunk.offset;
      flow.opts.target = async (file, chunk) => {
        await Promise.resolve();
        seen.push(chunk.checksum);
        return '/signed/' + chunk.checksum;
      };

      await flow.addFile(new Blob(['123']));
      const done = flow.upload();
      await waitForRequests(1);

      expect(xhr.requests[0].url).toContain('/signed/sum-0');
      expect(seen).toEqual(['sum-0']);
      xhr.requests[0].respond(200);
      await done;
    });

    it('awaits asynchronous headers', async function() {
      flow.opts.testChunks = false;
      flow.opts.method = 'octet';
      flow.opts.target = 'file';
      flow.opts.chunkChecksum = async () => 'abc';
      flow.opts.headers = async (file, chunk) => ({'x-digest': chunk.checksum});

      await flow.addFile(new Blob(['123']));
      const done = flow.upload();
      await waitForRequests(1);

      expect(xhr.requests[0].requestHeaders['x-digest']).toBe('abc');
      xhr.requests[0].respond(200);
      await done;
    });

    it('still accepts plain values', async function() {
      flow.opts.testChunks = false;
      flow.opts.method = 'octet';
      flow.opts.target = 'plain-target';

      await flow.addFile(new Blob(['123']));
      const done = flow.upload();
      await waitForRequests(1);

      expect(xhr.requests[0].url).toContain('plain-target');
      xhr.requests[0].respond(200);
      await done;
    });

    it('fails the chunk when the target cannot be resolved', async function() {
      flow.opts.testChunks = false;
      flow.opts.method = 'octet';
      flow.opts.maxChunkRetries = 0;
      flow.opts.target = async () => { throw new Error('negotiation failed'); };

      await flow.addFile(new Blob(['123']));
      const summary = await flow.upload();

      // summary.status is the session's; per-file outcomes are in files[].
      expect(summary.files[0].status).toBe('error');
      expect(summary.files[0].error).toContain('negotiation failed');
      expect(flow.files[0].error).toBe(true);
    });
  });

  describe('sendFlowParams: false', function() {

    it('leaves a signed octet URL byte-exact', async function() {
      // An S3 pre-signed UploadPart URL: any extra query parameter makes the
      // computed signature differ from X-Amz-Signature and S3 answers 403.
      var signed = 'https://bucket.s3.amazonaws.com/key?partNumber=1&uploadId=abc' +
                   '&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Signature=deadbeef';
      flow.opts.testChunks = false;
      flow.opts.method = 'octet';
      flow.opts.uploadMethod = 'PUT';
      flow.opts.sendFlowParams = false;
      flow.opts.target = signed;

      await flow.addFile(new Blob(['123']));
      var done = flow.upload();
      await waitForRequests(1);

      expect(xhr.requests[0].url).toBe(signed);
      expect(xhr.requests[0].method).toBe('PUT');
      xhr.requests[0].respond(200);
      await done;
    });

    it('still honours an explicit query option', async function() {
      flow.opts.testChunks = false;
      flow.opts.method = 'octet';
      flow.opts.sendFlowParams = false;
      flow.opts.target = 'file';
      flow.opts.query = {a: 1};

      await flow.addFile(new Blob(['123']));
      var done = flow.upload();
      await waitForRequests(1);

      expect(xhr.requests[0].url).toContain('a=1');
      expect(xhr.requests[0].url).not.toContain('flowChunkNumber');
      xhr.requests[0].respond(200);
      await done;
    });

    it('omits the parameters from a multipart body too', async function() {
      flow.opts.testChunks = false;
      flow.opts.method = 'multipart';
      flow.opts.sendFlowParams = false;
      flow.opts.target = 'file';

      await flow.addFile(new Blob(['123']));
      var done = flow.upload();
      await waitForRequests(1);

      var body = xhr.requests[0].requestBody;
      expect(body.get('flowChunkNumber')).toBeNull();
      expect(body.get('flowFilename')).toBeNull();
      expect(body.get(flow.opts.fileParameterName)).not.toBeNull();
      xhr.requests[0].respond(200);
      await done;
    });

    it('sends the parameters by default', async function() {
      flow.opts.testChunks = false;
      flow.opts.method = 'octet';
      flow.opts.target = 'file';

      await flow.addFile(new Blob(['123']));
      var done = flow.upload();
      await waitForRequests(1);

      expect(xhr.requests[0].url).toContain('flowChunkNumber=1');
      xhr.requests[0].respond(200);
      await done;
    });
  });

  it('should pass query params', async function() {
    flow.opts.testChunks = false;
    flow.opts.method = 'octet';
    flow.opts.target = 'file';
    await flow.addFile(new Blob(['123']));
    var done = flow.upload();
    await waitForRequests(1);
    expect(xhr.requests[0].url).toContain('file');
    xhr.requests[0].respond(200);
    await done;

    flow.opts.query = {a: 1};
    done = flow.files[0].retry();
    await waitForRequests(2);
    expect(xhr.requests[1].url).toContain('file');
    expect(xhr.requests[1].url).toContain('a=1');
    xhr.requests[1].respond(200);
    await done;

    flow.opts.query = function(file, chunk) {
      expect(file).toBe(flow.files[0]);
      expect(chunk).toBe(flow.files[0].chunks[0]);
      return {b: 2};
    };
    done = flow.files[0].retry();
    await waitForRequests(3);
    expect(xhr.requests[2].url).toContain('file');
    expect(xhr.requests[2].url).toContain('b=2');
    expect(xhr.requests[2].url).not.toContain('a=1');
    xhr.requests[2].respond(200);
    await done;

    flow.opts.target = 'file?w=w';
    flow.opts.query = {};
    done = flow.files[0].retry();
    await waitForRequests(4);
    expect(xhr.requests[3].url).toContain('file?w=w&');
    expect(xhr.requests[3].url).not.toContain('a=1');
    expect(xhr.requests[3].url).not.toContain('b=2');
    xhr.requests[3].respond(200);
    await done;
  });

  it('should track file upload status with lots of chunks', async function() {
    flow.opts.chunkSize = 1;
    flow.opts.testChunks = false;

    await flow.addFile(new Blob(['IIIIIIIIII']));
    var file = flow.files[0];
    expect(file.chunks.length).toBe(10);
    expect(file.progress()).toBe(0);

    var done = flow.upload();
    for (var i = 0; i < 10; i++) {
      await waitForRequests(i + 1);
      expect(file.isComplete()).toBeFalsy();
      xhr.requests[i].respond(200);
      await waitFor(function() {
        return file.progress() >= (i + 1) / 10;
      }, 2000, 5);
      if (i < 9) {
        expect(file.isUploading()).toBeTruthy();
      }
    }
    await done;

    expect(file.isComplete()).toBeTruthy();
    expect(file.isUploading()).toBeFalsy();
    expect(file.progress()).toBe(1);
    expect(flow.progress()).toBe(1);
  });

  it('should throw expected events', async function() {
    var events = [];
    flow.addEventListener('catch-all', function(event) {
      events.push(event.detail.type);
    });
    flow.opts.chunkSize = 1;
    flow.opts.testChunks = false;

    await flow.addFile(new Blob(['12']));
    var file = flow.files[0];
    expect(file.chunks.length).toBe(2);

    var done = flow.upload();
    await waitFor(function() {
      return events.indexOf('upload-start') !== -1;
    }, 2000, 5);
    expect(events.slice(0, 5)).toEqual([
      'filterFile', 'fileAdded', 'filesAdded', 'filesSubmitted', 'upload-start'
    ]);

    await waitForRequests(2);
    xhr.requests[0].respond(200);
    await waitFor(function() {
      return events.indexOf('file-progress') !== -1;
    }, 2000, 5);
    xhr.requests[1].respond(200);
    await done;

    expect(events.slice(-4)).toEqual([
      'file-progress', 'progress', 'file-success', 'complete'
    ]);
  });

  it('should pause and resume file', async function() {
    flow.opts.chunkSize = 1;
    flow.opts.simultaneousUploads = 2;
    flow.opts.testChunks = false;
    await flow.addFile(new File(['1234'], 'first.bin'));
    await flow.addFile(new File(['56'], 'second.bin'));
    var files = flow.files;
    expect(files[0].chunks.length).toBe(4);
    expect(files[1].chunks.length).toBe(2);

    var done = flow.upload();
    await waitForRequests(2);
    expect(files[0].isUploading()).toBeTruthy();

    await files[0].pause();
    await waitFor(function() {
      return !files[0].isUploading();
    }, 2000, 5);

    await respondUntil(function() {
      return files[1].isComplete();
    });

    var resumed = files[0].resume();
    await respondUntil(function() {
      return files[0].isComplete();
    });
    await resumed;
    await done;

    expect(files[0].isComplete()).toBeTruthy();
    expect(files[0].progress()).toBe(1);
    expect(files[1].isComplete()).toBeTruthy();
    expect(files[1].progress()).toBe(1);
    expect(flow.progress()).toBe(1);
  });

  it('should retry file', async function() {
    flow.opts.testChunks = false;
    flow.opts.chunkSize = 1;
    flow.opts.simultaneousUploads = 1;
    flow.opts.maxChunkRetries = 1;
    flow.opts.permanentErrors = [500];

    var error = jasmine.createSpy('error');
    var progress = jasmine.createSpy('progress');
    var success = jasmine.createSpy('success');
    var retry = jasmine.createSpy('retry');
    listen('file-error', error);
    listen('file-progress', progress);
    listen('file-success', success);
    listen('file-retry', retry);

    await flow.addFile(new Blob(['12']));
    var file = flow.files[0];
    expect(file.chunks.length).toBe(2);
    var firstChunk = file.chunks[0];
    var secondChunk = file.chunks[1];

    var done = flow.upload();
    await waitForRequests(1);
    expect(firstChunk.status()).toBe('uploading');

    xhr.requests[0].respond(400);
    await waitForRequests(2);
    expect(retry).toHaveBeenCalledTimes(1);
    xhr.requests[1].respond(200);
    await waitForRequests(3);
    expect(firstChunk.status()).toBe('success');

    xhr.requests[2].respond(400);
    await waitForRequests(4);
    expect(retry).toHaveBeenCalledTimes(2);
    xhr.requests[3].respond(400);
    await done;

    expect(error).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledWith(asCustomEvent(file, '', secondChunk));
    expect(success).not.toHaveBeenCalled();
    expect(file.error).toBeTruthy();
    expect(file.isComplete()).toBeTruthy();
    expect(file.isUploading()).toBeFalsy();
    expect(file.progress()).toBe(1);
    expect(file.chunks.map(chunk => chunk.status())).toEqual(['success', 'error']);
  });

  it('should retry file with timeout', async function() {
    flow.opts.testChunks = false;
    flow.opts.maxChunkRetries = 1;
    flow.opts.chunkRetryInterval = 100;

    var error = jasmine.createSpy('error');
    var success = jasmine.createSpy('success');
    var retry = jasmine.createSpy('retry');
    listen('file-error', error);
    listen('file-success', success);
    listen('file-retry', retry);

    await flow.addFile(new File(['12'], 'retry-timeout.bin'));
    var file = flow.files[0];
    var done = flow.upload();
    await waitForRequests(1);
    expect(xhr.requests.length).toBe(1);

    xhr.requests[0].respond(400);
    await waitFor(function() {
      return retry.calls.count() === 1;
    }, 2000, 5);
    expect(file.chunks[0].status()).toBe('pending');

    await waitForRequests(2, 3000);
    xhr.requests[1].respond(200);
    await done;

    expect(error).not.toHaveBeenCalled();
    expect(success).toHaveBeenCalled();
    expect(retry).toHaveBeenCalled();
  });

  it('should fail on permanent error', async function() {
    flow.opts.testChunks = false;
    flow.opts.chunkSize = 1;
    flow.opts.simultaneousUploads = 2;
    flow.opts.maxChunkRetries = 1;
    flow.opts.permanentErrors = [500];

    var error = jasmine.createSpy('error');
    var success = jasmine.createSpy('success');
    var retry = jasmine.createSpy('retry');
    listen('file-error', error);
    listen('file-success', success);
    listen('file-retry', retry);

    await flow.addFile(new File(['abc'], 'permanent.bin'));
    var file = flow.files[0];
    expect(file.chunks.length).toBe(3);
    var done = flow.upload();
    await waitForRequests(2);
    xhr.requests[0].respond(500);
    await done;

    expect(error).toHaveBeenCalled();
    expect(retry).not.toHaveBeenCalled();
    expect(success).not.toHaveBeenCalled();
    expect(file.error).toBeTruthy();
    expect(file.isComplete()).toBeTruthy();
  });

  it('should fail on permanent test error', async function() {
    flow.opts.testChunks = true;
    flow.opts.chunkSize = 1;
    flow.opts.simultaneousUploads = 2;
    flow.opts.maxChunkRetries = 1;
    flow.opts.permanentErrors = [500];

    var error = jasmine.createSpy('error');
    var success = jasmine.createSpy('success');
    var retry = jasmine.createSpy('retry');
    listen('file-error', error);
    listen('file-success', success);
    listen('file-retry', retry);

    await flow.addFile(new File(['abc'], 'permanent-test.bin'));
    var done = flow.upload();
    await waitForRequests(2);
    xhr.requests[0].respond(500);
    await done;

    expect(error).toHaveBeenCalled();
    expect(retry).not.toHaveBeenCalled();
    expect(success).not.toHaveBeenCalled();
  });

  it('should upload empty file', async function() {
    flow.opts.testChunks = false;
    var error = jasmine.createSpy('error');
    var success = jasmine.createSpy('success');
    listen('file-error', error);
    listen('file-success', success);

    await flow.addFile(new File([], 'empty.bin'));
    expect(flow.files.length).toBe(1);
    var file = flow.files[0];
    var done = flow.upload();
    await waitForRequests(1);
    expect(xhr.requests.length).toBe(1);
    expect(xhr.requests[0].requestBody.get('file').size).toBe(0);
    expect(file.progress()).toBe(0);
    xhr.requests[0].respond(200);
    await done;

    expect(error).not.toHaveBeenCalled();
    expect(success).toHaveBeenCalled();
    expect(file.progress()).toBe(1);
    expect(file.isUploading()).toBe(false);
    expect(file.isComplete()).toBe(true);
  });

  it('should not upload folder', async function() {
    await flow.addFile({name: '.', size: 0});
    expect(flow.files.length).toBe(0);
    await flow.addFile({name: '.', size: 4096});
    expect(flow.files.length).toBe(0);
    await flow.addFile({name: '.', size: 4096 * 2});
    expect(flow.files.length).toBe(0);
  });

  it('should preprocess chunks', async function() {
    flow.opts.testChunks = false;
    var preprocess = jasmine.createSpy('preprocess');
    var error = jasmine.createSpy('error');
    var success = jasmine.createSpy('success');
    listen('file-error', error);
    listen('file-success', success);
    flow.opts.preprocess = preprocess;

    await flow.addFile(new File(['abc'], 'preprocess.bin'));
    var file = flow.files[0];
    var done = flow.upload();
    await waitForRequests(1);

    expect(preprocess).toHaveBeenCalledWith(file.chunks[0]);
    expect(file.chunks[0].preprocessState).toBe(2);
    xhr.requests[0].respond(200, [], 'response');
    await done;

    expect(success).toHaveBeenCalledWith(asCustomEvent(file, 'response', file.chunks[0]));
    expect(error).not.toHaveBeenCalled();
  });

  it('should preprocess chunks and wait for preprocess to finish', async function() {
    flow.opts.testChunks = false;
    flow.opts.simultaneousUploads = 1;
    var preprocess = jasmine.createSpy('preprocess');
    flow.opts.preprocess = preprocess;

    await flow.addFile(new File(['abc'], 'preprocess-first.bin'));
    await flow.addFile(new File(['abca'], 'preprocess-second.bin'));
    var file = flow.files[0];
    var secondFile = flow.files[1];

    var done = flow.upload();
    await waitForRequests(1);
    expect(preprocess).toHaveBeenCalledWith(file.chunks[0]);
    expect(preprocess).not.toHaveBeenCalledWith(secondFile.chunks[0]);

    xhr.requests[0].respond(200);
    await respondUntil(function() {
      return secondFile.isComplete();
    });
    await done;

    expect(preprocess).toHaveBeenCalledWith(secondFile.chunks[0]);
  });

  it('should resume preprocess chunks after pause', async function() {
    flow.opts.testChunks = false;
    flow.opts.chunkSize = 1;
    flow.opts.simultaneousUploads = 1;
    var preprocess = jasmine.createSpy('preprocess');
    var success = jasmine.createSpy('success');
    listen('file-success', success);
    flow.opts.preprocess = preprocess;

    await flow.addFile(new File(['abc'], 'preprocess-pause.bin'));
    var file = flow.files[0];
    var done = flow.upload();
    await waitForRequests(1);

    await file.pause();
    await waitFor(function() {
      return !file.isUploading();
    }, 2000, 5);
    var resumed = file.resume();

    await respondUntil(function() {
      return file.isComplete();
    });
    await resumed;
    await done;

    expect(success).toHaveBeenCalled();
    expect(preprocess.calls.count()).toBeGreaterThanOrEqual(file.chunks.length);
  });

  it('should set chunk as a third event parameter', async function() {
    flow.opts.testChunks = false;
    var success = jasmine.createSpy('success');
    listen('file-success', success);

    await flow.addFile(new File(['abc'], 'response-param.bin'));
    var file = flow.files[0];
    var done = flow.upload();
    await waitForRequests(1);
    xhr.requests[0].respond(200, [], 'response');
    await done;

    expect(success).toHaveBeenCalledWith(asCustomEvent(file, 'response', file.chunks[0]));
  });

  it('should have upload speed', async function() {
    var clock = sinon.useFakeTimers();
    flow.opts.testChunks = false;
    flow.opts.speedSmoothingFactor = 0.5;
    flow.opts.simultaneousUploads = 1;
    var fileProgress = jasmine.createSpy('file-progress');
    listen('file-progress', fileProgress);

    await flow.addFile(new File(['0123456789'], 'speed-first.bin'));
    await flow.addFile(new File(['12345'], 'speed-second.bin'));
    var fileFirst = flow.files[0];
    var fileSecond = flow.files[1];
    expect(fileFirst.currentSpeed).toBe(0);
    expect(fileFirst.averageSpeed).toBe(0);
    expect(fileFirst.sizeUploaded()).toBe(0);
    expect(fileFirst.timeRemaining()).toBe(Number.POSITIVE_INFINITY);
    expect(flow.sizeUploaded()).toBe(0);
    expect(flow.timeRemaining()).toBe(Number.POSITIVE_INFINITY);

    var done = flow.upload();
    await flush();
    expect(xhr.requests.length).toBe(1);

    clock.tick(1000);
    xhr.requests[0].uploadProgress({loaded: 50, total: 100});
    expect(fileProgress).toHaveBeenCalled();
    expect(fileFirst.currentSpeed).toBe(5);
    expect(fileFirst.averageSpeed).toBe(2.5);
    expect(fileFirst.sizeUploaded()).toBe(5);
    expect(fileFirst.timeRemaining()).toBe(2);
    expect(flow.sizeUploaded()).toBe(5);
    expect(flow.timeRemaining()).toBe(4);

    clock.tick(1000);
    xhr.requests[0].uploadProgress({loaded: 10, total: 10});
    expect(fileFirst.currentSpeed).toBe(5);
    expect(fileFirst.averageSpeed).toBe(3.75);

    xhr.requests[0].respond(200, [], 'response');
    await flush();
    expect(fileFirst.currentSpeed).toBe(0);
    expect(fileFirst.averageSpeed).toBe(0);

    await flush();
    expect(xhr.requests.length).toBe(2);
    xhr.requests[1].respond(200, [], 'response');
    await done;
    expect(fileFirst.sizeUploaded()).toBe(10);
    expect(fileFirst.timeRemaining()).toBe(0);
    expect(fileSecond.sizeUploaded()).toBe(5);
    expect(fileSecond.timeRemaining()).toBe(0);
    expect(flow.sizeUploaded()).toBe(15);
    expect(flow.timeRemaining()).toBe(0);

    await flow.addFile(new File(['012345678901234'], 'speed-third.bin'));
    var fileThird = flow.files[2];
    expect(fileThird.timeRemaining()).toBe(Number.POSITIVE_INFINITY);
    var done2 = flow.upload();
    await flush();
    expect(xhr.requests.length).toBe(3);
    clock.tick(1000);
    xhr.requests[2].uploadProgress({loaded: 10, total: 15});
    expect(fileThird.timeRemaining()).toBe(1);
    expect(flow.timeRemaining()).toBe(1);
    await fileThird.pause();
    expect(fileThird.timeRemaining()).toBe(0);
    expect(flow.timeRemaining()).toBe(0);
    var resumedThird = fileThird.resume();
    await flush(20);
    expect(fileThird.timeRemaining()).toBe(Number.POSITIVE_INFINITY);
    expect(flow.timeRemaining()).toBe(Number.POSITIVE_INFINITY);
    clock.tick(1000);
    xhr.requests[3].uploadProgress({loaded: 11, total: 15});
    expect(fileThird.timeRemaining()).toBe(8);
    expect(flow.timeRemaining()).toBe(8);
    clock.tick(1000);
    xhr.requests[3].uploadProgress({loaded: 12, total: 15});
    expect(fileThird.timeRemaining()).toBe(4);
    expect(flow.timeRemaining()).toBe(4);

    xhr.requests[3].respond(500);
    await resumedThird;
    await done2;
    expect(fileThird.currentSpeed).toBe(0);
    expect(fileThird.averageSpeed).toBe(0);
    expect(fileThird.timeRemaining()).toBe(0);
    expect(flow.timeRemaining()).toBe(0);
    clock.restore();
  });

  it('should allow to hook initFileFn and readFileFn', async function() {
    flow.opts.testChunks = false;
    flow.opts.chunkSize = 1;
    flow.opts.simultaneousUploads = 10;
    flow.opts.initFileFn = function(flowObj) {
      flowObj.file = {size: 6, name: 'compressed.bin'};
      flowObj.size = flowObj.file.size;
    };
    flow.opts.readFileFn = function() {
      return 'X';
    };
    xhr.respondWith('ok');
    xhr.respondImmediately = xhr.autoRespond = true;

    await flow.addFile(new File(['0123456789'], 'init-read.bin'));
    await flow.upload();

    var file = flow.files[0];
    expect(xhr.requests.length).toBe(6);
    expect(file.progress()).toBe(1);
    expect(file.isUploading()).toBe(false);
    expect(file.isComplete()).toBe(true);
  });

  it('should allow to hook initFileFn function', async function() {
    var content = gen_file(6, 128);
    var sampleFile = new File([content], 'init-file-fn.bin');
    var customFunction = jasmine.createSpy('fn');
    flow.opts.testChunks = false;
    flow.opts.initFileFn = function() {
      customFunction();
    };
    flow.opts.chunkSize = 64;
    await flow.addFile(sampleFile);
    expect(customFunction).toHaveBeenCalledTimes(1);

    xhr.respondWith('ok');
    xhr.respondImmediately = xhr.autoRespond = true;
    flow.opts.simultaneousUploads = 3;
    await flow.upload();

    validateStatus({flow: flow, content_length: content.length, requests: xhr.requests}, flow.files[0]);
    await validatePayload(content, {requests: xhr.requests});
  });
});
