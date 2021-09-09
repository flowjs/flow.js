describe('upload stream', function() {
  /**
   * @type {Flow}
   */
  var flow;
  /**
   * @type {FakeXMLHttpRequest}
   */
  var xhr_server;

  var random_sizes = true;

  class Streamer {
    constructor(chunk_size) {
      this._reader = {};
      this.chunk_size = chunk_size;

      // See the comment in read() for why we implement a custom reader here.
      this.buffer = {};
      this.index = {};
    };

    init(flowObj) {
      // ToDo: Use flowObj.uniqueIdentifier ?
      this._reader[flowObj.name] = flowObj.file.stream().getReader();
      this.buffer[flowObj.name] = null;
    };

    async read(flowObj, startByte, endByte, fileType, chunk) {
      // console.log(`[asyncRead ${flowObj.name}#${chunk.offset}] start reading from ${this.buffer[flowObj.name] !== null ? 'existing' : 'the'} buffer`);
      if (this.buffer[flowObj.name] === null) {
        // console.log(`[asyncRead ${chunk.offset}] no preexisting buffer => reader.read()`);
        /*
          Here we would expect a partial read of 64kb (by implementation) but it seems that
          *all* the buffer is returned making difficult to make a test based on ReadableStreamDefaultReader() behavior.
          As such we simulate it.
        */
        const {value: buffer, done} = await this._reader[flowObj.name].read();
        this.buffer[flowObj.name] = buffer.slice(0);

        if (buffer) {
          // console.log(`[asyncRead ${flowObj.name}#${chunk.offset}] Read ${buffer.length} bytes`, buffer);
        } else {
          // console.log(`[asyncRead ${chunk.offset}] no buffer[bail]`);
          return null;
        }
      }

      if (this.buffer[flowObj.name].length === 0) {
        // console.log(`[asyncRead ${chunk.offset}] this.buffer[${flowObj.name}] is null[bail]`);
        return null;
      }

      if (! this.index[flowObj.name]) {
          this.index[flowObj.name] = 0;
      }

      // console.log(`[asyncRead ${chunk.offset}] Read slice[${this.index[flowObj.name]}:${this.index[flowObj.name] + this.chunk_size}] a buffer of ${this.buffer[flowObj.name].length} bytes`);
      var buffer_chunk = this.buffer[flowObj.name].slice(this.index[flowObj.name], this.index[flowObj.name] + this.chunk_size);
      // console.log(`[asyncRead] Read slice of ${buffer_chunk.length} bytes`);

      if (!buffer_chunk) {
        // console.log(`[asyncRead ${chunk.offset}] null slice`);
        // console.log(buffer_chunk);
      } else {
        this.index[flowObj.name] += this.chunk_size;
        // console.log(`[asyncRead] ${buffer_chunk}. index is now ${this.index[flowObj.name]}`);
        return new Blob([buffer_chunk], {type: 'application/octet-stream'});
      }

      return null;
    };
  }

  beforeAll(function() {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000;
    jasmine.getEnv().addReporter({
      specStarted: result => (jasmine.currentTest = result),
      specDone: result => (jasmine.currentTest = result),
    });
  });

  beforeEach(function () {
    // jasmine.clock().install();

    flow = new Flow({
      progressCallbacksInterval: 0,
      forceChunkSize: true,
      testChunks: false,
      generateUniqueIdentifier: function (file) {
        return file.size;
      }
    });

    xhr_server = sinon.createFakeServer({
      // autoRespondAfter: 50
      respondImmediately: true,
    });
    xhr_server.respondWith('ok');
  });

  afterEach(function () {
    // jasmine.clock().uninstall();
    xhr_server.restore();
  });

  it('synchronous initFileFn and asyncReadFileFn', function (done) {
    // No File.stream() support : No test
    // No support for skipping() test from Jasmine (https://github.com/jasmine/jasmine/issues/1709)
    if (typeof Blob === 'undefined' || Blob.prototype.stream !== 'function') {
      done();
      return;
    }

    var chunk_size, chunk_num, simultaneousUploads, upload_chunk_size;

    if (random_sizes) {
      chunk_size = Math.ceil(Math.random() * 30),
      chunk_num = Math.ceil(Math.random() * 100),
      simultaneousUploads = Math.ceil(Math.random() * 20),
      upload_chunk_size = Math.max(1, Math.ceil(Math.random() * chunk_size));
    } else {
      chunk_size = 23,
      chunk_num = 93,
      simultaneousUploads = 17,
      upload_chunk_size = Math.max(1, Math.ceil(Math.random() * chunk_size));
    }

    var content = gen_file(chunk_num, chunk_size),
        sample_file = new File([content], 'foobar.bin');

    console.info(`Test File is ${chunk_num} bytes long.`);
    console.info(`Now uploads ${simultaneousUploads} simultaneous chunks of at most ${upload_chunk_size} bytes`);

    flow.on('file-error', jasmine.createSpy('error'));
    flow.on('file-success', jasmine.createSpy('success'));
    flow.on('complete', async () => {
      validateStatus({flow, content_length: content.length, requests: xhr_server.requests}, flow.files[0]);
      await validatePayload(content, {flow, requests: xhr_server.requests});
      done();
    });

    var streamer = new Streamer(upload_chunk_size); // chunk_size);
    flow.opts.chunkSize = upload_chunk_size;
    flow.opts.simultaneousUploads = simultaneousUploads;
    flow.opts.initFileFn = streamer.init.bind(streamer);
    flow.opts.readFileFn = streamer.read.bind(streamer);
    flow.opts.asyncReadFileFn = streamer.read.bind(streamer);
    flow.addFile(sample_file);
    flow.upload();
  });

  it('An asyncInitFile function', async function() {
    var flowfiles,
        content = gen_file(4, 512),
        sample_file = new File([content], `foobar-asyncInitFileFn-${jasmine.currentTest.id}.bin`),
        customFunction = jasmine.createSpy('fn'),
        initFileFunction = async (flowObj) => {
          await sleep(250);
          customFunction();
        };
    flowfiles = await flow.asyncAddFiles([sample_file], null, initFileFunction);
    expect(customFunction).toHaveBeenCalledTimes(1);

    // If re-adding the same file, it's ignored, not incrementing the number of
    // calls to the initFileFn
    await flow.asyncAddFiles([sample_file], null, initFileFunction);
    expect(customFunction).toHaveBeenCalledTimes(1);

    // But if removed, then the function is run again
    flow.removeFile(flowfiles[0]);
    flowfiles = await flow.asyncAddFiles([sample_file], null, initFileFunction);
    expect(customFunction).toHaveBeenCalledTimes(2);

    // It should work with addFile() too.
    flow.removeFile(flowfiles[0]);
    flowfiles = await flow.asyncAddFile(sample_file, null, initFileFunction);
    expect(customFunction).toHaveBeenCalledTimes(3);
  });

  it('An asyncInitFile function can still be passed as a Flow constructor', async function() {
    var content = gen_file(2, 256),
        sample_file = new File([content], `foobar-asyncInitFileFn-${jasmine.currentTest.id}.bin`),
        customFunction = jasmine.createSpy('fn'),
        // Also test non-async functions
        initFileFunction = (flowObj) => {
          customFunction();
        };
    flow.opts.initFileFn = initFileFunction;
    await flow.asyncAddFile(sample_file);
    expect(customFunction).toHaveBeenCalledTimes(1);
  });

  it('asyncAddFile can also be called with no initFileFunction', async function() {
    var content = gen_file(2, 256),
        sample_file = new File([content], `foobar-asyncInitFileFn-${jasmine.currentTest.id}.bin`),
        customFunction = jasmine.createSpy('fn');
    await flow.asyncAddFile(sample_file);
    expect(flow.files.length).toEqual(1);
  });

  it('adding async hook but calling addFiles() should trigger a warning', async function () {
    var content = gen_file(2, 256),
        sample_file = new File([content], `async+addFiles-${jasmine.currentTest.id}.bin`),
        customFunction = jasmine.createSpy('fn');
    flow.on('files-added', async (file) => await file);

    spyOn(console, 'warn');
    flow.addFile(sample_file);
    expect(console.warn).toHaveBeenCalled();
  });

  it('async stream support request temporary failure', async function () {
    // ToDo: This test use low-level files[0].chunks[x].send(); to do atomic
    // uploads and avoid the unstoppable (recursive) loop.
    xhr_server.configure({autoRespond: false, respondImmediately: false});

    var streamer = new Streamer(1);
    flow.opts.initFileFn = streamer.init.bind(streamer);
    flow.opts.asyncReadFileFn = streamer.read.bind(streamer);

    flow.opts.chunkSize = 1;
    flow.opts.maxChunkRetries = 3;
    flow.opts.simultaneousUploads = 2;
    await flow.asyncAddFile(new File(['12'], `stream-failure-${jasmine.currentTest.id}.bin`));
    var files = flow.files;
    expect(files[0].chunks.length).toBe(2);

    await files[0].chunks[0].send();
    // xhr.error() is unusable. See https://github.com/sinonjs/nise/issues/148
    // xhr_server.respond(xhr => xhr.error());
    xhr_server.respond([400, {}, 'Error']);

    xhr_server.respondWith([200, { "Content-Type": "text/plain" }, 'ok']);
    await files[0].chunks[0].send();
    await files[0].chunks[1].send();
    xhr_server.respond();

    validateStatus({flow, request_number: 3, requests: xhr_server.requests});
    // See the above comment about why the (inconsistent state can't be tested)
    // expect(flow.files[0].isUploading()).toBe(false);
    // expect(flow.files[0].isComplete()).toBe(true);
    await validatePayload(null, {
      orig_hash: "6b51d431df5d7f141cbececcf79edf3dd861c3b4069f0b11661a3eefacbba918", // "12"
      requests: xhr_server.requests,
    });
  });

  it('Do not corrupt multiple streams', async function () {
    xhr_server.configure({autoRespond: true, respondImmediately: true});
    xhr_server.respondWith([200, { "Content-Type": "text/plain" }, 'ok']);
    var streamer = new Streamer(1);
    flow.opts.initFileFn = streamer.init.bind(streamer);
    flow.opts.asyncReadFileFn = streamer.read.bind(streamer);

    flow.opts.chunkSize = 1;
    flow.opts.maxChunkRetries = 3;
    flow.opts.simultaneousUploads = 2;
    await flow.asyncAddFiles([
      new File(['1234'], `multi1-${jasmine.currentTest.id}.bin`),
      new File(['56789'], `multi2-${jasmine.currentTest.id}.bin`)
    ]);

    await flow.files[0].chunks[0].send();
    await flow.files[1].chunks[0].send();
    for (let i = 0; i < (9 - 2); i++) {
      flow.uploadNextChunk(true);
      await sleep(1);
    }

    for (let file of flow.files) {
      expect(file.isUploading()).toBeFalsy();
      expect(file.isComplete()).toBeTruthy();
      expect(file.progress()).toBe(1);
    }

    expect(flow.progress()).toBe(1);
    validateStatus({flow, request_number: 9, requests: xhr_server.requests});
    await validatePayload(null, {
      orig_hash: '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', // "1234"
      requests: xhr_server.requests,
      filter: x => x.requestBody.get('file').name === `multi1-${jasmine.currentTest.id}.bin`
    });
    await validatePayload(null, {
      orig_hash: 'f76043a74ec33b6aefbb289050faf7aa8d482095477397e3e63345125d49f527', // "56789"
      requests: xhr_server.requests,
      filter: x => x.requestBody.get('file').name === `multi2-${jasmine.currentTest.id}.bin`
    });
  });

  it('should pause and resume stream', async function () {
    xhr_server.configure({autoRespond: false, respondImmediately: false});
    var streamer = new Streamer(1);
    flow.opts.initFileFn = streamer.init.bind(streamer);
    flow.opts.asyncReadFileFn = streamer.read.bind(streamer);

    flow.opts.chunkSize = 1;
    flow.opts.maxChunkRetries = 3;
    flow.opts.simultaneousUploads = 2;
    await flow.asyncAddFiles([
      new File(['123456'], `foobar1-${jasmine.currentTest.id}.bin`),
      new File(['789'], `foobar2-${jasmine.currentTest.id}.bin`)
    ]);

    let files = flow.files;
    let counter = {};

    /*
      [      ]
      [   ]
    */
    expect(files[0].chunks.length).toBe(6);
    expect(files[1].chunks.length).toBe(3);
    flow.upload();
    expect(files[0].isReading()).toBeTruthy();
    await sleep(1);

    /*
      [^^    ]
      [   ]
    */
    expect(xhr_server.requests.length).toBe(2);
    expect(xhr_server.requests[0].aborted).toBeUndefined();
    expect(xhr_server.requests[1].aborted).toBeUndefined();

    // Reply to XHR n°1 and 2
    xhr_server.respond();
    /*
      [oo    ]
      [   ]
    */
    expect(xhr_server.requests[0].status).toBe(200);
    expect(xhr_server.requests[1].status).toBe(200);
    await sleep(1);
    /*
      [oo^^__]
      [   ]
    */
    expect(xhr_server.requests.length).toBe(4);
    expect(files[0].isUploading()).toBeTruthy();
    expect(files[0].isReading()).toBeFalsy();

    // Next two chunks from file[0] were read but we abort() their
    // corresponding `xhr`. They will get back to pending.
    // Flow should start uploading second file now
    files[0].pause();
    await sleep(1);

    /*
      [oo____]
      [^^ ]
    */
    expect(xhr_server.requests[2].aborted).toBeTruthy();
    expect(xhr_server.requests[3].aborted).toBeTruthy();
    expect(xhr_server.requests[4].aborted).toBeUndefined();
    expect(files[0].isUploading()).toBeFalsy();

    flow.upload();
    await sleep(1);
    expect(files[0].isUploading()).toBeFalsy();
    expect(files[1].isUploading()).toBeTruthy();

    // Reply to XHR n°4 and 5
    xhr_server.respond();

    expect(xhr_server.requests.length).toBe(6);
    expect(xhr_server.requests[4].aborted).toBeFalsy();
    expect(xhr_server.requests[5].aborted).toBeFalsy();

    /*
      [oo____]
      [ooR]
    */
    // Should resume file after second file chunks is uploaded
    files[0].resume();
    await sleep(1);

    /*
      [oo^^__]
      [oo^]
    */
    // Finish file 1
    expect(files[0].isUploading()).toBeTruthy();
    expect(files[1].isUploading()).toBeTruthy();
    expect(xhr_server.requests.length).toBe(9); // Above 7 + 2 failed when pause()
    xhr_server.respond();

    /*
      [oooo__]
      [ooo]
    */
    // Upload finished
    expect(files[1].isUploading()).toBeFalsy();
    expect(files[1].isComplete()).toBeTruthy();
    expect(files[1].progress()).toBe(1);

    /*
      [oooo__]
      [ooo]
    */
    // Finish file 0
    await sleep(1);
    expect(xhr_server.requests.length).toBe(11);
    xhr_server.respond();

    /*
      [oooooo]
      [ooo]
    */
    expect(files[0].isUploading()).toBeFalsy();
    expect(files[0].isComplete()).toBeTruthy();
    expect(files[0].progress()).toBe(1);
    expect(flow.progress()).toBe(1);

    validateStatus({flow, request_number: 11, requests: xhr_server.requests});
    await validatePayload(null, {
      orig_hash: '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', // "123456"
      requests: xhr_server.requests,
      filter: x => x.requestBody.get('file').name === `foobar1-${jasmine.currentTest.id}.bin`
    });
    await validatePayload(null, {
      orig_hash: '35a9e381b1a27567549b5f8a6f783c167ebf809f1c4d6a9e367240484d8ce281', // "789"
      requests: xhr_server.requests,
      filter: x => x.requestBody.get('file').name === `foobar2-${jasmine.currentTest.id}.bin`
    });
  });
});
