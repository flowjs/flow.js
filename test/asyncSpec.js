describe('upload stream', function() {
  var flow;
  var xhr_server;

  var random_sizes = true;

  class Streamer {
    constructor(chunk_size) {
      this._reader = {};
      this.chunk_size = chunk_size;
      this.buffer = {};
      this.index = {};
    }

    init(flowObj) {
      this._reader[flowObj.name] = flowObj.file.stream().getReader();
      this.buffer[flowObj.name] = null;
    }

    async read(flowObj, startByte, endByte, fileType, chunk) {
      if (this.buffer[flowObj.name] === null) {
        const {value: buffer} = await this._reader[flowObj.name].read();
        this.buffer[flowObj.name] = buffer.slice(0);
        if (!buffer) {
          return null;
        }
      }

      if (this.buffer[flowObj.name].length === 0) {
        return null;
      }

      if (!this.index[flowObj.name]) {
        this.index[flowObj.name] = 0;
      }

      var bufferChunk = this.buffer[flowObj.name].slice(
        this.index[flowObj.name],
        this.index[flowObj.name] + this.chunk_size
      );
      if (!bufferChunk) {
        return null;
      }
      this.index[flowObj.name] += this.chunk_size;
      return new Blob([bufferChunk], {type: 'application/octet-stream'});
    }
  }

  async function respondPendingUntil(condition, timeout = 5000) {
    var start = Date.now();
    while (!condition()) {
      if (Date.now() - start > timeout) {
        throw new Error('respondPendingUntil timeout');
      }
      xhr_server.respond();
      await sleep(5);
    }
  }

  beforeAll(function() {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000;
  });

  beforeEach(function() {
    flow = new Flow({
      progressCallbacksInterval: 0,
      forceChunkSize: true,
      testChunks: false,
      generateUniqueIdentifier: function(file) {
        return (file.name || 'blob') + '-' + file.size;
      }
    });

    xhr_server = sinon.createFakeServer({
      respondImmediately: true
    });
    xhr_server.respondWith('ok');
  });

  afterEach(function() {
    xhr_server.restore();
  });

  it('synchronous initFileFn and async readFileFn', async function() {
    if (typeof Blob === 'undefined' || Blob.prototype.stream !== 'function') {
      return;
    }

    var chunk_size, chunk_num, simultaneousUploads, upload_chunk_size;
    if (random_sizes) {
      chunk_size = Math.ceil(Math.random() * 30);
      chunk_num = Math.ceil(Math.random() * 100);
      simultaneousUploads = Math.ceil(Math.random() * 20);
      upload_chunk_size = Math.max(1, Math.ceil(Math.random() * chunk_size));
    } else {
      chunk_size = 23;
      chunk_num = 93;
      simultaneousUploads = 17;
      upload_chunk_size = Math.max(1, Math.ceil(Math.random() * chunk_size));
    }

    var content = gen_file(chunk_num, chunk_size);
    var sampleFile = new File([content], 'stream-random.bin');
    var streamer = new Streamer(upload_chunk_size);
    flow.opts.chunkSize = upload_chunk_size;
    flow.opts.simultaneousUploads = simultaneousUploads;
    flow.opts.initFileFn = streamer.init.bind(streamer);
    flow.opts.readFileFn = streamer.read.bind(streamer);

    await flow.addFile(sampleFile);
    await flow.upload();

    validateStatus({
      flow: flow,
      content_length: content.length,
      requests: xhr_server.requests
    }, flow.files[0]);
    await validatePayload(content, {requests: xhr_server.requests});
  });

  it('An asyncInitFile function', async function() {
    var flowfiles;
    var content = gen_file(4, 512);
    var sampleFile = new File([content], 'stream-async-init.bin');
    var customFunction = jasmine.createSpy('fn');
    var initFileFunction = async function() {
      await sleep(250);
      customFunction();
    };

    flowfiles = await flow.addFiles([sampleFile], {initFileFn: initFileFunction});
    expect(customFunction).toHaveBeenCalledTimes(1);

    await flow.addFiles([sampleFile], {initFileFn: initFileFunction});
    expect(customFunction).toHaveBeenCalledTimes(1);

    await flow.removeFile(flowfiles[0]);
    flowfiles = await flow.addFiles([sampleFile], {initFileFn: initFileFunction});
    expect(customFunction).toHaveBeenCalledTimes(2);

    await flow.removeFile(flowfiles[0]);
    flowfiles = await flow.addFile(sampleFile, {initFileFn: initFileFunction});
    expect(customFunction).toHaveBeenCalledTimes(3);
  });

  it('An asyncInitFile function can still be passed as a Flow constructor', async function() {
    var content = gen_file(2, 256);
    var sampleFile = new File([content], 'stream-constructor-init.bin');
    var customFunction = jasmine.createSpy('fn');
    var initFileFunction = function() {
      customFunction();
    };
    flow.opts.initFileFn = initFileFunction;
    await flow.addFile(sampleFile);
    expect(customFunction).toHaveBeenCalledTimes(1);
  });

  it('addFile can also be called with no initFileFunction', async function() {
    var content = gen_file(2, 256);
    var sampleFile = new File([content], 'stream-no-init.bin');
    await flow.addFile(sampleFile);
    expect(flow.files.length).toEqual(1);
  });

  it('async stream support request temporary failure', async function() {
    xhr_server.configure({autoRespond: false, respondImmediately: false});

    var streamer = new Streamer(1);
    flow.opts.initFileFn = streamer.init.bind(streamer);
    flow.opts.readFileFn = streamer.read.bind(streamer);
    flow.opts.chunkSize = 1;
    flow.opts.maxChunkRetries = 3;
    flow.opts.simultaneousUploads = 1;

    await flow.addFile(new File(['12'], 'stream-failure.bin'));
    var files = flow.files;
    expect(files[0].chunks.length).toBe(2);

    var done = flow.upload();
    await waitFor(function() {
      return xhr_server.requests.length >= 1;
    }, 2000, 5);
    xhr_server.requests[0].respond(400, {}, 'Error');
    await waitFor(function() {
      return xhr_server.requests.length >= 2;
    }, 2000, 5);
    xhr_server.requests[1].respond(200);
    await waitFor(function() {
      return xhr_server.requests.length >= 3;
    }, 2000, 5);
    xhr_server.requests[2].respond(200);
    await done;

    validateStatus({flow: flow, request_number: 3, requests: xhr_server.requests});
    await validatePayload(null, {
      orig_hash: '6b51d431df5d7f141cbececcf79edf3dd861c3b4069f0b11661a3eefacbba918',
      requests: xhr_server.requests
    });
  });

  it('Do not corrupt multiple streams', async function() {
    xhr_server.configure({autoRespond: true, respondImmediately: true});
    xhr_server.respondWith([200, {'Content-Type': 'text/plain'}, 'ok']);

    var streamer = new Streamer(1);
    flow.opts.initFileFn = streamer.init.bind(streamer);
    flow.opts.readFileFn = streamer.read.bind(streamer);
    flow.opts.chunkSize = 1;
    flow.opts.maxChunkRetries = 3;
    flow.opts.simultaneousUploads = 2;

    await flow.addFiles([
      new File(['1234'], 'multi1.bin'),
      new File(['56789'], 'multi2.bin')
    ]);

    await flow.upload();

    for (var file of flow.files) {
      expect(file.isUploading()).toBeFalsy();
      expect(file.isComplete()).toBeTruthy();
      expect(file.progress()).toBe(1);
    }
    expect(flow.progress()).toBe(1);
    validateStatus({flow: flow, request_number: 9, requests: xhr_server.requests});
    await validatePayload(null, {
      orig_hash: '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4',
      requests: xhr_server.requests,
      filter: function(request) {
        return request.requestBody.get('file').name === 'multi1.bin';
      }
    });
    await validatePayload(null, {
      orig_hash: 'f76043a74ec33b6aefbb289050faf7aa8d482095477397e3e63345125d49f527',
      requests: xhr_server.requests,
      filter: function(request) {
        return request.requestBody.get('file').name === 'multi2.bin';
      }
    });
  });

  it('should pause and resume stream', async function() {
    xhr_server.configure({autoRespond: false, respondImmediately: false});

    var streamer = new Streamer(1);
    flow.opts.initFileFn = streamer.init.bind(streamer);
    flow.opts.readFileFn = streamer.read.bind(streamer);
    flow.opts.chunkSize = 1;
    flow.opts.maxChunkRetries = 3;
    flow.opts.simultaneousUploads = 2;

    await flow.addFiles([
      new File(['123456'], 'stream-pause1.bin'),
      new File(['789'], 'stream-pause2.bin')
    ]);
    var files = flow.files;

    var done = flow.upload();
    await waitFor(function() {
      return xhr_server.requests.length >= 2;
    }, 2000, 5);
    expect(files[0].isUploading() || files[0].isReading()).toBeTruthy();

    xhr_server.respond();
    await waitFor(function() {
      return xhr_server.requests.length >= 4;
    }, 2000, 5);

    await files[0].pause();
    await waitFor(function() {
      return !files[0].isUploading();
    }, 2000, 5);

    var resumed = files[0].resume();
    await respondPendingUntil(function() {
      return files[0].isComplete() && files[1].isComplete();
    });
    await resumed;
    await done;

    expect(files[0].isComplete()).toBeTruthy();
    expect(files[0].progress()).toBe(1);
    expect(files[1].isComplete()).toBeTruthy();
    expect(files[1].progress()).toBe(1);
    expect(flow.progress()).toBe(1);

    await validatePayload(null, {
      orig_hash: '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
      requests: xhr_server.requests,
      filter: function(request) {
        return request.requestBody.get('file').name === 'stream-pause1.bin';
      }
    });
    await validatePayload(null, {
      orig_hash: '35a9e381b1a27567549b5f8a6f783c167ebf809f1c4d6a9e367240484d8ce281',
      requests: xhr_server.requests,
      filter: function(request) {
        return request.requestBody.get('file').name === 'stream-pause2.bin';
      }
    });
  });
});
