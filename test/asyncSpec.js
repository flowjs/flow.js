describe('upload stream', function() {
  /**
   * @type {Flow}
   */
  var flow;
  /**
   * @type {FakeXMLHttpRequest}
   */
  var xhr_server;

  var random_sizes = false;

  /**
   * Generate an ASCII file composed of <num> parts of <segment_size> characters long.
   * The char for each part is randomly choosen from the below alphabet
   */
  function gen_file(num, segment_size = 64) {
    var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789()_-?!./|';
    return alphabet
      .repeat(Math.ceil(num / alphabet.length))
      .split('')
      .sort(() => Math.random()-0.5)
      .map((v, i) => i < num ? v.repeat(segment_size) : null)
      .filter(e => e)
      .join('');
  }

  function hash(content) {
    return window.crypto.subtle.digest('SHA-256', new TextEncoder('utf-8').encode(content));
  }

  function hex(buff) {
    return [].map.call(new Uint8Array(buff), b => ('00' + b.toString(16)).slice(-2)).join('');
  }

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
      validate(done, content, orig_hash);
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

  function validate(done, content, orig_hash) {
    var predicted_request_number = Math.ceil(content.length / flow.opts.chunkSize);
    expect(xhr_server.requests.length).toBe(predicted_request_number);

    var file = flow.files[0];
    expect(file.progress()).toBe(1);
    expect(file.isUploading()).toBe(false);
    expect(file.isComplete()).toBe(true);

    // An array of promises of obtaining the corresponding request's body (= payload)
    var payload_contents = xhr_server.requests.map(x => x.requestBody.get('file').text());
    Promise.all(payload_contents)
      .then(values => hash(values.join('')))
      .then(hash => hex(hash))
      .then(hexhash => {
        // console.log(orig_hash, hexhash);
        expect(hexhash).toBe(orig_hash);
        done();
      });
  }
});
