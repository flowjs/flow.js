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

    xhr_server = sinon.createFakeServer({
      // autoRespondAfter: 50
      respondImmediately: true,
    });
  });


  afterAll(function() {
    xhr_server.restore();
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
});
