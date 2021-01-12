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
      this._reader = null;
      this.chunk_size = chunk_size;

      // See the comment in read() for why we implement a custom reader here.
      this.buffer = null;
      this.index = 0;
    };

    init(flowObj) {
      this._reader = flowObj.file.stream().getReader();
    };

    async read(flowObj, startByte, endByte, fileType, chunk) {
      // chunk._log(`Start reading from ${this.buffer !== null ? 'existing' : 'the'} buffer`);
      if (this.buffer === null) {
        // console.log(`[asyncRead ${chunk.offset}] no preexisting buffer => reader.read()`);
        /*
          Here we would expect a partial read of 64kb (by implementation) but it seems that
          *all* the buffer is returned making difficult to make a test based on ReadableStreamDefaultReader() behavior.
          As such we simulate it.
        */
        const {value: buffer, done} = await this._reader.read();
        this.buffer = buffer;

        if (buffer) {
          // console.log(`[asyncRead ${chunk.offset}] got a buffer of ${buffer.length} bytes...`);
        } else {
          // console.log(`[asyncRead ${chunk.offset}] no buffer[bail]`);
          return null;
        }
      }

      if (this.buffer.length === 0) {
        // console.log(`[asyncRead ${chunk.offset}] this.buffer is null[bail]`);
        return null;
      }

      // console.log(`[asyncRead ${chunk.offset}] Read slice[${this.index}:${this.index + this.chunk_size}] a buffer of ${this.buffer.length} bytes`);
      var buffer_chunk = this.buffer.slice(this.index, this.index + this.chunk_size);

      if (!buffer_chunk) {
        // console.log(`[asyncRead ${chunk.offset}] null slice`);
        // console.log(buffer_chunk);
      } else {
        // chunk._log(`Read slice of ${buffer_chunk.length} bytes`);
        this.index += this.chunk_size;
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

  it('synchronous initFileFn and asyncReadFileFn', async function (done) {
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
        orig_hash = hex(await hash(content)),
        sample_file = new File([content], 'foobar.bin');

    console.info(`Test File is ${chunk_num} bytes long (sha256: ${orig_hash}).`);
    console.info(`Now uploads ${simultaneousUploads} simultaneous chunks of at most ${upload_chunk_size} bytes`);

    flow.on('fileError', jasmine.createSpy('error'));
    flow.on('fileSuccess', jasmine.createSpy('success'));
    flow.on('complete', () => {
      validatePayload(done, content, {orig_hash, flow, requests: xhr_server.requests});
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
});
