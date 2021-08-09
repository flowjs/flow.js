describe('upload file', function() {
  /**
   * @type {Flow}
   */
  var flow;
  /**
   * @type {FakeXMLHttpRequest}
   */
  var xhr;

  function asCustomEvent(...args) {
    return jasmine.objectContaining({detail: [...args]});
  }

  beforeEach(function () {
    jasmine.clock().install();
    flow = new Flow({
      progressCallbacksInterval: 0,
      generateUniqueIdentifier: function (file) {
        return file.size;
      }
    });
    xhr = sinon.createFakeServer({
      respondImmediately: false,
      autoRespond: false
    });

  });

  afterEach(function () {
    jasmine.clock().uninstall();
    xhr.restore();
  });

  it('should pass query params', function() {
    flow.opts.query = {};
    flow.opts.target = 'file';
    flow.addFile(new Blob(['123']));
    flow.upload();
    expect(xhr.requests.length).toBe(1);
    expect(xhr.requests[0].url).toContain('file');

    flow.opts.query = {a:1};
    flow.files[0].retry();
    expect(xhr.requests.length).toBe(2);
    expect(xhr.requests[1].url).toContain('file');
    expect(xhr.requests[1].url).toContain('a=1');

    flow.opts.query = function (file, chunk) {
      expect(file).toBe(flow.files[0]);
      expect(chunk).toBe(flow.files[0].chunks[0]);
      return {b:2};
    };
    flow.files[0].retry();
    expect(xhr.requests.length).toBe(3);
    expect(xhr.requests[2].url).toContain('file');
    expect(xhr.requests[2].url).toContain('b=2');
    expect(xhr.requests[2].url).not.toContain('a=1');

    flow.opts.target = 'file?w=w';
    flow.opts.query = {};
    flow.files[0].retry();
    expect(xhr.requests.length).toBe(4);
    expect(xhr.requests[3].url).toContain('file?w=w&');
    expect(xhr.requests[3].url).not.toContain('a=1');
    expect(xhr.requests[3].url).not.toContain('b=2');
  });

  it('should track file upload status with lots of chunks', function() {
    flow.opts.chunkSize = 1;
    flow.addFile(new Blob(['IIIIIIIIII']));
    var file = flow.files[0];
    expect(file.chunks.length).toBe(10);
    flow.upload();
    expect(file.progress()).toBe(0);
    for (var i = 0; i < 9; i++) {
      expect(xhr.requests[i]).toBeDefined();
      expect(file.isComplete()).toBeFalsy();
      expect(file.isUploading()).toBeTruthy();
      xhr.requests[i].respond(200);
      expect(file.progress()).toBe((i+1) / 10);
      expect(file.isComplete()).toBeFalsy();
      expect(file.isUploading()).toBeTruthy();
    }
    expect(xhr.requests[9]).toBeDefined();
    expect(file.isComplete()).toBeFalsy();
    expect(file.isUploading()).toBeTruthy();
    expect(file.progress()).toBe(0.9);
    xhr.requests[i].respond(200);
    expect(file.isComplete()).toBeTruthy();
    expect(file.isUploading()).toBeFalsy();
    expect(file.progress()).toBe(1);
    expect(flow.progress()).toBe(1);
  });

  it('should throw expected events', function () {
    var events = [],
        evl = 0;
    flow.on('catch-all', ({detail: [event_name]}) => {
      events.push(event_name);
    });
    flow.opts.chunkSize = 1;
    flow.addFile(new Blob(['12']));
    var file = flow.files[0];
    expect(file.chunks.length).toBe(2);
    flow.upload();
    // Sync events
    expect(events).toEqual(['filter-file', 'file-added', 'files-added', 'files-submitted', 'upload-start']);
    // Async
    xhr.requests[0].respond(200);
    expect(events.length).toBe(evl = 7);
    expect(events.slice(-2)).toEqual(['file-progress', 'progress']);
    xhr.requests[1].respond(400);
    expect(events.length).toBe(evl);
    xhr.requests[2].uploadProgress({loaded: 5, total: 10});
    expect(events.length).toBe(evl+=2); // 9
    expect(events.slice(-2)).toEqual(['file-progress', 'progress']);
    xhr.requests[2].respond(200);
    expect(events.length).toBe(15);
    expect(events.slice(-4)).toEqual(['file-progress', 'progress', 'file-success', 'complete']);

    flow.upload();
    expect(events.length).toBe(17);
    expect(events.slice(-2)).toEqual(['upload-start', 'complete']);
  });

  it('should pause and resume file', function () {
    flow.opts.chunkSize = 1;
    flow.opts.simultaneousUploads = 2;
    flow.addFile(new Blob(['1234']));
    flow.addFile(new Blob(['56']));
    var files = flow.files;
    expect(files[0].chunks.length).toBe(4);
    expect(files[1].chunks.length).toBe(2);
    flow.upload();
    expect(files[0].isUploading()).toBeTruthy();
    expect(xhr.requests.length).toBe(2);
    expect(xhr.requests[0].aborted).toBeUndefined();
    expect(xhr.requests[1].aborted).toBeUndefined();
    // should start upload second file
    files[0].pause();
    expect(files[0].isUploading()).toBeFalsy();
    expect(files[1].isUploading()).toBeTruthy();
    expect(xhr.requests.length).toBe(4);
    expect(xhr.requests[0].aborted).toBeTruthy();
    expect(xhr.requests[1].aborted).toBeTruthy();
    expect(xhr.requests[2].aborted).toBeUndefined();
    expect(xhr.requests[3].aborted).toBeUndefined();
    // Should resume file after second file chunks is uploaded
    files[0].resume();
    expect(files[0].isUploading()).toBeFalsy();
    expect(xhr.requests.length).toBe(4);
    xhr.requests[2].respond(200);// second file chunk
    expect(files[0].isUploading()).toBeTruthy();
    expect(files[1].isUploading()).toBeTruthy();
    expect(xhr.requests.length).toBe(5);
    xhr.requests[3].respond(200); // second file chunk
    expect(xhr.requests.length).toBe(6);
    expect(files[0].isUploading()).toBeTruthy();
    expect(files[1].isUploading()).toBeFalsy();
    expect(files[1].isComplete()).toBeTruthy();
    xhr.requests[4].respond(200);
    expect(xhr.requests.length).toBe(7);
    xhr.requests[5].respond(200);
    expect(xhr.requests.length).toBe(8);
    xhr.requests[6].respond(200);
    expect(xhr.requests.length).toBe(8);
    xhr.requests[7].respond(200);
    expect(xhr.requests.length).toBe(8);
    // Upload finished
    expect(files[0].isUploading()).toBeFalsy();
    expect(files[0].isComplete()).toBeTruthy();
    expect(files[0].progress()).toBe(1);
    expect(files[1].isUploading()).toBeFalsy();
    expect(files[1].isComplete()).toBeTruthy();
    expect(files[1].progress()).toBe(1);
    expect(flow.progress()).toBe(1);
  });

  it('should retry file', function () {
    flow.opts.testChunks = false;
    flow.opts.chunkSize = 1;
    flow.opts.simultaneousUploads = 1;
    flow.opts.maxChunkRetries = 1;
    flow.opts.permanentErrors = [500];
    var error = jasmine.createSpy('error');
    var progress = jasmine.createSpy('progress');
    var success = jasmine.createSpy('success');
    var retry = jasmine.createSpy('retry');
    flow.on('file-error', error);
    flow.on('file-progress', progress);
    flow.on('file-success', success);
    flow.on('file-retry', retry);

    flow.addFile(new Blob(['12']));
    var file = flow.files[0];
    expect(file.chunks.length).toBe(2);
    var firstChunk = file.chunks[0];
    var secondChunk = file.chunks[1];
    expect(firstChunk.status()).toBe('pending');
    expect(secondChunk.status()).toBe('pending');

    flow.upload();
    expect(xhr.requests.length).toBe(1);
    expect(firstChunk.status()).toBe('uploading');
    expect(secondChunk.status()).toBe('pending');

    expect(error).not.toHaveBeenCalled();
    expect(progress).not.toHaveBeenCalled();
    expect(success).not.toHaveBeenCalled();
    expect(retry).not.toHaveBeenCalled();

    xhr.requests[0].respond(400);
    expect(xhr.requests.length).toBe(2);
    expect(firstChunk.status()).toBe('uploading');
    expect(secondChunk.status()).toBe('pending');

    expect(error).not.toHaveBeenCalled();
    expect(progress).toHaveBeenCalled();
    expect(success).not.toHaveBeenCalled();
    expect(retry).toHaveBeenCalled();

    xhr.requests[1].respond(200);
    expect(xhr.requests.length).toBe(3);
    expect(firstChunk.status()).toBe('success');
    expect(secondChunk.status()).toBe('uploading');

    expect(error).not.toHaveBeenCalled();
    expect(progress.calls.count()).toBe(3);
    expect(success).not.toHaveBeenCalled();
    expect(retry.calls.count()).toBe(1);

    xhr.requests[2].respond(400);
    expect(xhr.requests.length).toBe(4);
    expect(firstChunk.status()).toBe('success');
    expect(secondChunk.status()).toBe('uploading');

    expect(error).not.toHaveBeenCalled();
    expect(progress.calls.count()).toBe(4);
    expect(success).not.toHaveBeenCalled();
    expect(retry.calls.count()).toBe(2);

    xhr.requests[3].respond(400, {}, 'Err');
    expect(xhr.requests.length).toBe(4);
    expect(file.chunks.length).toBe(0);

    expect(error.calls.count()).toBe(1);
    expect(error).toHaveBeenCalledWith(asCustomEvent(file, 'Err', secondChunk));
    expect(progress.calls.count()).toBe(5);
    expect(success).not.toHaveBeenCalled();
    expect(retry.calls.count()).toBe(2);

    expect(file.error).toBeTruthy();
    expect(file.isComplete()).toBeTruthy();
    expect(file.isUploading()).toBeFalsy();
    expect(file.progress()).toBe(1);
  });

  it('should retry file with timeout', function () {
    flow.opts.testChunks = false;
    flow.opts.maxChunkRetries = 1;
    flow.opts.chunkRetryInterval = 100;

    var error = jasmine.createSpy('error');
    var success = jasmine.createSpy('success');
    var retry = jasmine.createSpy('retry');
    flow.on('file-error', error);
    flow.on('file-success', success);
    flow.on('file-retry', retry);

    flow.addFile(new Blob(['12']));
    var file = flow.files[0];
    flow.upload();
    expect(xhr.requests.length).toBe(1);

    xhr.requests[0].respond(400);
    expect(xhr.requests.length).toBe(1);
    expect(error).not.toHaveBeenCalled();
    expect(success).not.toHaveBeenCalled();
    expect(retry).toHaveBeenCalled();
    expect(file.chunks[0].status()).toBe('uploading');

    jasmine.clock().tick(100);
    expect(xhr.requests.length).toBe(2);
    xhr.requests[1].respond(200);
    expect(error).not.toHaveBeenCalled();
    expect(success).toHaveBeenCalled();
    expect(retry).toHaveBeenCalled();
  });

  it('should fail on permanent error', function () {
    xhr.autoRespond = false;
    flow.opts.testChunks = false;
    flow.opts.chunkSize = 1;
    flow.opts.simultaneousUploads = 2;
    flow.opts.maxChunkRetries = 1;
    flow.opts.permanentErrors = [500];

    var error = jasmine.createSpy('error');
    var success = jasmine.createSpy('success');
    var retry = jasmine.createSpy('retry');
    flow.on('file-error', error);
    flow.on('file-success', success);
    flow.on('file-retry', retry);

    flow.addFile(new Blob(['abc']));
    var file = flow.files[0];
    expect(file.chunks.length).toBe(3);
    flow.upload();
    expect(xhr.requests.length).toBe(2);
    xhr.requests[0].respond(500);
    expect(xhr.requests.length).toBe(2);
    expect(error).toHaveBeenCalled();
    expect(retry).not.toHaveBeenCalled();
    expect(success).not.toHaveBeenCalled();
  });

  it('should fail on permanent test error', function () {
    flow.opts.testChunks = true;
    flow.opts.chunkSize = 1;
    flow.opts.simultaneousUploads = 2;
    flow.opts.maxChunkRetries = 1;
    flow.opts.permanentErrors = [500];

    var error = jasmine.createSpy('error');
    var success = jasmine.createSpy('success');
    var retry = jasmine.createSpy('retry');
    flow.on('file-error', error);
    flow.on('file-success', success);
    flow.on('file-retry', retry);

    flow.addFile(new Blob(['abc']));
    flow.upload();
    expect(xhr.requests.length).toBe(2);
    xhr.requests[0].respond(500);
    expect(xhr.requests.length).toBe(2);
    expect(error).toHaveBeenCalled();
    expect(retry).not.toHaveBeenCalled();
    expect(success).not.toHaveBeenCalled();
  });

  it('should upload empty file', function () {
    var error = jasmine.createSpy('error');
    var success = jasmine.createSpy('success');
    flow.on('file-error', error);
    flow.on('file-success', success);

    flow.addFile(new Blob([]));

    // https://github.com/flowjs/flow.js/issues/55
    if (window.navigator.msPointerEnabled) {
      expect(flow.files.length, 0);
    } else {
      expect(flow.files.length, 1);
      var file = flow.files[0];
      flow.upload();
      expect(xhr.requests.length).toBe(1);
      expect(file.progress()).toBe(0);
      xhr.requests[0].respond(200);
      expect(xhr.requests.length).toBe(1);
      expect(error).not.toHaveBeenCalled();
      expect(success).toHaveBeenCalled();
      expect(file.progress()).toBe(1);
      expect(file.isUploading()).toBe(false);
      expect(file.isComplete()).toBe(true);
    }
  });

  it('should not upload folder', function () {
    // http://stackoverflow.com/questions/8856628/detecting-folders-directories-in-javascript-filelist-objects
    flow.addFile({
      name: '.',
      size: 0
    });
    expect(flow.files.length).toBe(0);
    flow.addFile({
      name: '.',
      size: 4096
    });
    expect(flow.files.length).toBe(0);
    flow.addFile({
      name: '.',
      size: 4096 * 2
    });
    expect(flow.files.length).toBe(0);
  });

  it('should preprocess chunks', function () {
    var preprocess = jasmine.createSpy('preprocess');
    var error = jasmine.createSpy('error');
    var success = jasmine.createSpy('success');
    flow.on('file-error', error);
    flow.on('file-success', success);
    flow.opts.preprocess = preprocess;
    flow.addFile(new Blob(['abc']));
    var file = flow.files[0];
    flow.upload();
    expect(xhr.requests.length).toBe(0);
    expect(preprocess).toHaveBeenCalledWith(file.chunks[0]);
    expect(file.chunks[0].preprocessState).toBe(1);
    file.chunks[0].preprocessFinished();
    expect(xhr.requests.length).toBe(1);
    xhr.requests[0].respond(200, [], "response");
    expect(success).toHaveBeenCalledWith(asCustomEvent(file, "response", file.chunks[0]));
    expect(error).not.toHaveBeenCalled();
  });

  it('should preprocess chunks and wait for preprocess to finish', function () {
    flow.opts.simultaneousUploads = 1;
    var preprocess = jasmine.createSpy('preprocess');
    flow.opts.preprocess = preprocess;
    flow.addFile(new Blob(['abc']));
    flow.addFile(new Blob(['abca']));
    var file = flow.files[0];
    var secondFile = flow.files[1];
    flow.upload();
    expect(xhr.requests.length).toBe(0);
    expect(preprocess).toHaveBeenCalledWith(file.chunks[0]);
    expect(preprocess).not.toHaveBeenCalledWith(secondFile.chunks[0]);

    flow.upload();
    expect(preprocess).not.toHaveBeenCalledWith(secondFile.chunks[0]);
  });

  it('should resume preprocess chunks after pause', function () {
    flow.opts.chunkSize = 1;
    flow.opts.simultaneousUploads = 1;
    flow.opts.testChunks = false;
    var preprocess = jasmine.createSpy('preprocess');
    var error = jasmine.createSpy('error');
    var success = jasmine.createSpy('success');
    flow.on('file-error', error);
    flow.on('file-success', success);
    flow.opts.preprocess = preprocess;
    flow.addFile(new Blob(['abc']));
    var file = flow.files[0];
    flow.upload();
    for(var i=0; i<file.chunks.length; i++) {
      expect(preprocess).toHaveBeenCalledWith(file.chunks[i]);
      file.chunks[i].preprocessFinished();
      file.pause();
      file.resume();
      xhr.requests[xhr.requests.length-1].respond(200, [], "response");
    }
    expect(success).toHaveBeenCalledWith(asCustomEvent(file, "response", file.chunks[file.chunks.length-1]));
    expect(error).not.toHaveBeenCalled();
  });

  it('should set chunk as a third event parameter', function () {
    var success = jasmine.createSpy('success');
    flow.on('file-success', success);
    flow.addFile(new Blob(['abc']));
    var file = flow.files[0];
    flow.upload();
    xhr.requests[0].respond(200, [], "response");

    expect(success).toHaveBeenCalledWith(asCustomEvent(file, "response", file.chunks[0]));
  });

  it('should have upload speed', function() {
    var clock = sinon.useFakeTimers();
    flow.opts.testChunks = false;
    flow.opts.speedSmoothingFactor = 0.5;
    flow.opts.simultaneousUploads = 1;
    var fileProgress = jasmine.createSpy('file-progress');
    flow.on('file-progress', fileProgress);
    flow.addFile(new Blob(['0123456789']));
    flow.addFile(new Blob(['12345']));
    var fileFirst = flow.files[0];
    var fileSecond = flow.files[1];
    expect(fileFirst.currentSpeed).toBe(0);
    expect(fileFirst.averageSpeed).toBe(0);
    expect(fileFirst.sizeUploaded()).toBe(0);
    expect(fileFirst.timeRemaining()).toBe(Number.POSITIVE_INFINITY);
    expect(flow.sizeUploaded()).toBe(0);
    expect(flow.timeRemaining()).toBe(Number.POSITIVE_INFINITY);
    flow.upload();

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

    xhr.requests[0].respond(200, [], "response");
    expect(fileFirst.currentSpeed).toBe(0);
    expect(fileFirst.averageSpeed).toBe(0);

    xhr.requests[1].respond(200, [], "response");
    expect(fileFirst.sizeUploaded()).toBe(10);
    expect(fileFirst.timeRemaining()).toBe(0);
    expect(fileSecond.sizeUploaded()).toBe(5);
    expect(fileSecond.timeRemaining()).toBe(0);
    expect(flow.sizeUploaded()).toBe(15);
    expect(flow.timeRemaining()).toBe(0);

    // paused and resumed
    flow.addFile(new Blob(['012345678901234']));
    var fileThird = flow.files[2];
    expect(fileThird.timeRemaining()).toBe(Number.POSITIVE_INFINITY);
    flow.upload();
    clock.tick(1000);
    xhr.requests[2].uploadProgress({loaded: 10, total: 15});
    expect(fileThird.timeRemaining()).toBe(1);
    expect(flow.timeRemaining()).toBe(1);
    fileThird.pause();
    expect(fileThird.timeRemaining()).toBe(0);
    expect(flow.timeRemaining()).toBe(0);
    fileThird.resume();
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
    expect(fileThird.currentSpeed).toBe(0);
    expect(fileThird.averageSpeed).toBe(0);
    expect(fileThird.timeRemaining()).toBe(0);
    expect(flow.timeRemaining()).toBe(0);
  });

  it('should allow to hook initFileFn and readFileFn', function () {
    var error = jasmine.createSpy('error');
    var success = jasmine.createSpy('success');
    flow.on('file-error', error);
    flow.on('file-success', success);

    flow.opts.chunkSize = 1;

    flow.opts.simultaneousUploads = 10;

    flow.opts.initFileFn = function(flowObj) {
      // emulate a compressor that starting from a payload of 10 characters
      // will output 6 characters.
      var fakeFile = {
        size: 6
      }

      flowObj.file = fakeFile;
      flowObj.size = flowObj.file.size;
    }

    flow.opts.readFileFn = function(fileObj, startByte, endByte, fileType, chunk) {
      chunk.readFinished('X');
    }

    flow.addFile(new Blob(['0123456789']));

    flow.upload();

    expect(xhr.requests.length).toBe(6);

    for (var i = 0; i < xhr.requests.length; i++) {
      xhr.requests[i].respond(200);
    }

    var file = flow.files[0];
    expect(file.progress()).toBe(1);
    expect(file.isUploading()).toBe(false);
    expect(file.isComplete()).toBe(true);

    expect(xhr.requests.length).toBe(6);
  });

  it('should allow to hook initFileFn function', function(done) {
    var content = gen_file(6, 128),
        sample_file = new File([content], `foobar-initFileFn.bin`),
        customFunction = jasmine.createSpy('fn'),
        initFileFunction = (flowObj) => {
          customFunction();
        };

    flow.opts.testChunks = false;
    flow.opts.initFileFn = initFileFunction;
    flow.opts.chunkSize = 64;
    flow.addFile(sample_file);
    expect(customFunction).toHaveBeenCalledTimes(1);

    flow.on('complete', async () => {
      await validatePayload(done, content, {requests: xhr.requests, flow});
    });

    xhr.respondWith('ok');
    xhr.respondImmediately = xhr.autoRespond = true;

    flow.opts.simultaneousUploads = 3;
    flow.upload();
    jasmine.clock().tick(1);
  });
});
