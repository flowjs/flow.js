describe('upload file', function() {
  /**
   * @type {Flow}
   */
  var flow;
  /**
   * @type {FakeXMLHttpRequest}
   */
  var xhr;
  /**
   * @type {FakeXMLHttpRequest[]}
   */
  var requests = [];

  beforeEach(function () {
    flow = new Flow({
      progressCallbacksInterval: 0,
      generateUniqueIdentifier: function (file) {
        return file.size;
      }
    });
    requests = [];

    xhr = sinon.useFakeXMLHttpRequest();
    xhr.onCreate = function (xhr) {
      requests.push(xhr);
    };
  });

  afterEach(function () {
    xhr.restore();
  });

  it('should pass query params', function() {
    flow.opts.query = {};
    flow.opts.target = 'file';
    flow.addFile(new Blob(['123']));
    flow.upload();
    expect(requests.length).toBe(1);
    expect(requests[0].url).toContain('file');

    flow.opts.query = {a:1};
    flow.files[0].retry();
    expect(requests.length).toBe(2);
    expect(requests[1].url).toContain('file');
    expect(requests[1].url).toContain('a=1');

    flow.opts.query = function (file, chunk) {
      expect(file).toBe(flow.files[0]);
      expect(chunk).toBe(flow.files[0].chunks[0]);
      return {b:2};
    };
    flow.files[0].retry();
    expect(requests.length).toBe(3);
    expect(requests[2].url).toContain('file');
    expect(requests[2].url).toContain('b=2');
    expect(requests[2].url).not.toContain('a=1');

    flow.opts.target = 'file?w=w';
    flow.opts.query = undefined;
    flow.files[0].retry();
    expect(requests.length).toBe(4);
    expect(requests[3].url).toContain('file?w=w&');
    expect(requests[3].url).not.toContain('a=1');
    expect(requests[3].url).not.toContain('b=2');
  });

  it('should track file upload status with lots of chunks', function() {
    flow.opts.chunkSize = 1;
    flow.addFile(new Blob(['IIIIIIIIII']));
    var file = flow.files[0];
    expect(file.chunks.length).toBe(10);
    flow.upload();
    expect(file.progress()).toBe(0);
    for (var i = 0; i < 9; i++) {
      expect(requests[i]).toBeDefined();
      expect(file.isComplete()).toBeFalsy();
      expect(file.isUploading()).toBeTruthy();
      requests[i].respond(200);
      expect(file.progress()).toBe((i+1) / 10);
      expect(file.isComplete()).toBeFalsy();
      expect(file.isUploading()).toBeTruthy();
    }
    expect(requests[9]).toBeDefined();
    expect(file.isComplete()).toBeFalsy();
    expect(file.isUploading()).toBeTruthy();
    expect(file.progress()).toBe(0.9);
    requests[i].respond(200);
    expect(file.isComplete()).toBeTruthy();
    expect(file.isUploading()).toBeFalsy();
    expect(file.progress()).toBe(1);
    expect(flow.progress()).toBe(1);
  });

  it('should throw expected events', function () {
    jasmine.Clock.useMock();
    var events = [];
    flow.on('catchAll', function (event) {
      events.push(event);
    });
    flow.opts.chunkSize = 1;
    flow.addFile(new Blob(['12']));
    var file = flow.files[0];
    expect(file.chunks.length).toBe(2);
    flow.upload();
    // Sync events
    expect(events.length).toBe(4);
    expect(events[0]).toBe('fileAdded');
    expect(events[1]).toBe('filesAdded');
    expect(events[2]).toBe('filesSubmitted');
    expect(events[3]).toBe('uploadStart');
    // Async
    requests[0].respond(200);
    expect(events.length).toBe(6);
    expect(events[4]).toBe('fileProgress');
    expect(events[5]).toBe('progress');
    requests[1].respond(400);
    expect(events.length).toBe(6);
    requests[2].progress(5, 10, true);
    expect(events.length).toBe(8);
    expect(events[6]).toBe('fileProgress');
    expect(events[7]).toBe('progress');
    requests[2].respond(200);
    expect(events.length).toBe(11);
    expect(events[8]).toBe('fileProgress');
    expect(events[9]).toBe('progress');
    expect(events[10]).toBe('fileSuccess');

    jasmine.Clock.tick(1);
    expect(events.length).toBe(12);
    expect(events[11]).toBe('complete');

    flow.upload();
    expect(events.length).toBe(13);
    expect(events[12]).toBe('uploadStart');

    // complete event is always asynchronous
    jasmine.Clock.tick(1);
    expect(events.length).toBe(14);
    expect(events[13]).toBe('complete');
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
    expect(requests.length).toBe(2);
    expect(requests[0].aborted).toBeUndefined();
    expect(requests[1].aborted).toBeUndefined();
    // should start upload second file
    files[0].pause();
    expect(files[0].isUploading()).toBeFalsy();
    expect(files[1].isUploading()).toBeTruthy();
    expect(requests.length).toBe(4);
    expect(requests[0].aborted).toBeTruthy();
    expect(requests[1].aborted).toBeTruthy();
    expect(requests[2].aborted).toBeUndefined();
    expect(requests[3].aborted).toBeUndefined();
    // Should resume file after second file chunks is uploaded
    files[0].resume();
    expect(files[0].isUploading()).toBeFalsy();
    expect(requests.length).toBe(4);
    requests[2].respond(200);// second file chunk
    expect(files[0].isUploading()).toBeTruthy();
    expect(files[1].isUploading()).toBeTruthy();
    expect(requests.length).toBe(5);
    requests[3].respond(200); // second file chunk
    expect(requests.length).toBe(6);
    expect(files[0].isUploading()).toBeTruthy();
    expect(files[1].isUploading()).toBeFalsy();
    expect(files[1].isComplete()).toBeTruthy();
    requests[4].respond(200);
    expect(requests.length).toBe(7);
    requests[5].respond(200);
    expect(requests.length).toBe(8);
    requests[6].respond(200);
    expect(requests.length).toBe(8);
    requests[7].respond(200);
    expect(requests.length).toBe(8);
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
    flow.on('fileError', error);
    flow.on('fileProgress', progress);
    flow.on('fileSuccess', success);
    flow.on('fileRetry', retry);

    flow.addFile(new Blob(['12']));
    var file = flow.files[0];
    expect(file.chunks.length).toBe(2);
    expect(file.chunks[0].status()).toBe('pending');
    expect(file.chunks[1].status()).toBe('pending');

    flow.upload();
    expect(requests.length).toBe(1);
    expect(file.chunks[0].status()).toBe('uploading');
    expect(file.chunks[1].status()).toBe('pending');

    expect(error).not.toHaveBeenCalled();
    expect(progress).not.toHaveBeenCalled();
    expect(success).not.toHaveBeenCalled();
    expect(retry).not.toHaveBeenCalled();

    requests[0].respond(400);
    expect(requests.length).toBe(2);
    expect(file.chunks[0].status()).toBe('uploading');
    expect(file.chunks[1].status()).toBe('pending');

    expect(error).not.toHaveBeenCalled();
    expect(progress).not.toHaveBeenCalled();
    expect(success).not.toHaveBeenCalled();
    expect(retry).toHaveBeenCalled();

    requests[1].respond(200);
    expect(requests.length).toBe(3);
    expect(file.chunks[0].status()).toBe('success');
    expect(file.chunks[1].status()).toBe('uploading');

    expect(error).not.toHaveBeenCalled();
    expect(progress.callCount).toBe(1);
    expect(success).not.toHaveBeenCalled();
    expect(retry.callCount).toBe(1);

    requests[2].respond(400);
    expect(requests.length).toBe(4);
    expect(file.chunks[0].status()).toBe('success');
    expect(file.chunks[1].status()).toBe('uploading');

    expect(error).not.toHaveBeenCalled();
    expect(progress.callCount).toBe(1);
    expect(success).not.toHaveBeenCalled();
    expect(retry.callCount).toBe(2);

    requests[3].respond(400, {}, 'Err');
    expect(requests.length).toBe(4);
    expect(file.chunks.length).toBe(0);

    expect(error.callCount).toBe(1);
    expect(error).toHaveBeenCalledWith(file, 'Err');
    expect(progress.callCount).toBe(1);
    expect(success).not.toHaveBeenCalled();
    expect(retry.callCount).toBe(2);

    expect(file.error).toBeTruthy();
    expect(file.isComplete()).toBeTruthy();
    expect(file.isUploading()).toBeFalsy();
    expect(file.progress()).toBe(1);
  });

  it('should retry file with timeout', function () {
    jasmine.Clock.useMock();
    flow.opts.testChunks = false;
    flow.opts.maxChunkRetries = 1;
    flow.opts.chunkRetryInterval = 100;

    var error = jasmine.createSpy('error');
    var success = jasmine.createSpy('success');
    var retry = jasmine.createSpy('retry');
    flow.on('fileError', error);
    flow.on('fileSuccess', success);
    flow.on('fileRetry', retry);

    flow.addFile(new Blob(['12']));
    var file = flow.files[0];
    flow.upload();
    expect(requests.length).toBe(1);

    requests[0].respond(400);
    expect(requests.length).toBe(1);
    expect(error).not.toHaveBeenCalled();
    expect(success).not.toHaveBeenCalled();
    expect(retry).toHaveBeenCalled();
    expect(file.chunks[0].status()).toBe('uploading');

    jasmine.Clock.tick(100);
    expect(requests.length).toBe(2);
    requests[1].respond(200);
    expect(error).not.toHaveBeenCalled();
    expect(success).toHaveBeenCalled();
    expect(retry).toHaveBeenCalled();
  });

  it('should fail on permanent error', function () {
    flow.opts.testChunks = false;
    flow.opts.chunkSize = 1;
    flow.opts.simultaneousUploads = 2;
    flow.opts.maxChunkRetries = 1;
    flow.opts.permanentErrors = [500];

    var error = jasmine.createSpy('error');
    var success = jasmine.createSpy('success');
    var retry = jasmine.createSpy('retry');
    flow.on('fileError', error);
    flow.on('fileSuccess', success);
    flow.on('fileRetry', retry);

    flow.addFile(new Blob(['abc']));
    var file = flow.files[0];
    expect(file.chunks.length).toBe(3);
    flow.upload();
    expect(requests.length).toBe(2);
    requests[0].respond(500);
    expect(requests.length).toBe(2);
    expect(error).toHaveBeenCalled();
    expect(retry).not.toHaveBeenCalled();
    expect(success).not.toHaveBeenCalled();
  });

  it('should upload empty file', function () {
    var error = jasmine.createSpy('error');
    var success = jasmine.createSpy('success');
    flow.on('fileError', error);
    flow.on('fileSuccess', success);

    flow.addFile(new Blob([]));
    var file = flow.files[0];
    flow.upload();
    expect(requests.length).toBe(1);
    expect(file.progress()).toBe(0);
    requests[0].respond(200);
    expect(requests.length).toBe(1);
    expect(error).not.toHaveBeenCalled();
    expect(success).toHaveBeenCalled();
    expect(file.progress()).toBe(1);
    expect(file.isUploading()).toBe(false);
    expect(file.isComplete()).toBe(true);
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
    flow.on('fileError', error);
    flow.on('fileSuccess', success);
    flow.opts.preprocess = preprocess;
    flow.addFile(new Blob(['abc']));
    var file = flow.files[0];
    flow.upload();
    expect(requests.length).toBe(0);
    expect(preprocess).wasCalledWith(file.chunks[0]);
    expect(file.chunks[0].preprocessState).toBe(1);
    file.chunks[0].preprocessFinished();
    expect(requests.length).toBe(1);
    requests[0].respond(200, [], "response");
    expect(success).wasCalledWith(file, "response");
    expect(error).not.toHaveBeenCalled();
  });

  it('should have upload speed', function() {
    var clock = sinon.useFakeTimers();
    flow.opts.testChunks = false;
    flow.opts.speedSmoothingFactor = 0.5;
    flow.opts.simultaneousUploads = 1;
    var fileProgress = jasmine.createSpy('fileProgress');
    flow.on('fileProgress', fileProgress);
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
    requests[0].progress(50, 100, true);
    expect(fileProgress).toHaveBeenCalled();
    expect(fileFirst.currentSpeed).toBe(5);
    expect(fileFirst.averageSpeed).toBe(2.5);
    expect(fileFirst.sizeUploaded()).toBe(5);
    expect(fileFirst.timeRemaining()).toBe(2);

    expect(flow.sizeUploaded()).toBe(5);
    expect(flow.timeRemaining()).toBe(4);

    clock.tick(1000);
    requests[0].progress(10, 10, true);
    expect(fileFirst.currentSpeed).toBe(5);
    expect(fileFirst.averageSpeed).toBe(3.75);

    requests[0].respond(200, [], "response");
    expect(fileFirst.currentSpeed).toBe(0);
    expect(fileFirst.averageSpeed).toBe(0);

    requests[1].respond(200, [], "response");
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
    requests[2].progress(10, 15, true);
    expect(fileThird.timeRemaining()).toBe(1);
    expect(flow.timeRemaining()).toBe(1);
    fileThird.pause();
    expect(fileThird.timeRemaining()).toBe(0);
    expect(flow.timeRemaining()).toBe(0);
    fileThird.resume();
    expect(fileThird.timeRemaining()).toBe(Number.POSITIVE_INFINITY);
    expect(flow.timeRemaining()).toBe(Number.POSITIVE_INFINITY);
    clock.tick(1000);
    requests[3].progress(11, 15, true);
    expect(fileThird.timeRemaining()).toBe(8);
    expect(flow.timeRemaining()).toBe(8);
    clock.tick(1000);
    requests[3].progress(12, 15, true);
    expect(fileThird.timeRemaining()).toBe(4);
    expect(flow.timeRemaining()).toBe(4);

    requests[3].respond(500);
    expect(fileThird.currentSpeed).toBe(0);
    expect(fileThird.averageSpeed).toBe(0);
    expect(fileThird.timeRemaining()).toBe(0);
    expect(flow.timeRemaining()).toBe(0);
  });
});