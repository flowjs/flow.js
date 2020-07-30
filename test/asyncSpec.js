describe('upload stream', function() {
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

  var xhr_server;

  var chunk_size = 64;
  var sample_file = new File([
    'A'.repeat(chunk_size)
      + 'B'.repeat(chunk_size)
      + 'C'.repeat(chunk_size)
      + 'D'.repeat(chunk_size)
      + 'E'.repeat(chunk_size)
  ], 'foobar.bin');

  function hash(content) {
    return window.crypto.subtle.digest('SHA-256', new TextEncoder('utf-8').encode(content));
  }

  function hex(buff) {
    return [].map.call(new Uint8Array(buff), b => ('00' + b.toString(16)).slice(-2)).join('');
  }

  function sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
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

    async chunk_guard(flowObj, startByte, endByte, fileType, chunk) {
      var prev_chunk = chunk.offset > 0 ? flowObj.chunks[chunk.offset - 1] : null;
      while(prev_chunk && prev_chunk.readState != 2) {
        // console.log(`[asyncRead ${chunk.offset}] Waiting on prev chunk to be read (= ${prev_chunk.readState}) -- `, flowObj.chunks.map(e => e.readState).join(''));
        await sleep(200);
      }
    }
    async read(flowObj, startByte, endByte, fileType, chunk) {
      await this.chunk_guard(...arguments);

      flowObj.readState = 1;
      // console.log(`[asyncRead ${chunk.offset}] start`);
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
        // console.log(`[asyncRead ${chunk.offset}] slice is ${buffer_chunk.length} bytes`);
        this.index += this.chunk_size;
        var blob = new Blob([buffer_chunk], {type: 'application/octet-stream'});
        // console.log(`[asyncRead ${chunk.offset}] readFinished`, blob.size);
        chunk.readFinished(blob);
      }

      return null;
    };
  }

  beforeAll(function() {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 7000;
    xhr_server = sinon.fakeServer.create({
      autoRespondAfter: 50
    });
  });


  afterAll(function() {
    xhr_server.restore();
  });

  beforeEach(function () {
    // jasmine.clock().install();

    flow = new Flow({
      progressCallbacksInterval: 0,
      simultaneousUploads: 3,
      chunkSize: chunk_size,
      forceChunkSize: true,
      testChunks: false,
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
    // jasmine.clock().uninstall();

    xhr.restore();
  });

  it('synchronous initFileFn and asyncReadFileFn', async function (done) {
    var orig_hash = hex(await hash(await sample_file.text()));
    // console.log(`File sha256: ${orig_hash}`);

    var error = jasmine.createSpy('error');
    var success = jasmine.createSpy('success');
    flow.on('fileError', error);
    flow.on('fileSuccess', success);

    var streamer = new Streamer(flow.opts.chunkSize);
    flow.opts.initFileFn = streamer.init.bind(streamer);
    flow.opts.readFileFn = streamer.read.bind(streamer);
    flow.opts.asyncReadFileFn = streamer.read.bind(streamer);
    flow.addFile(sample_file);

    // console.log("Upload!");
    flow.upload();

    // Respond all possible requests.
    // ToDo: Update the 7 years-old version of Sinon.js in order to use the fakeXhrServer
    requests.map(x => x.respond(200));
    await sleep(250);
    requests.map(x => x.respond(200));
    await sleep(250);
    requests.map(x => x.respond(200));
    await sleep(250);
    requests.map(x => x.respond(200));
    await sleep(250);

    expect(requests.length).toBe(5);

    var file = flow.files[0];
    expect(file.progress()).toBe(1);
    expect(file.isUploading()).toBe(false);
    expect(file.isComplete()).toBe(true);

    // An array of promises of obtaining the corresponding request's body (= payload)
    var payload_contents = requests.map(x => x.requestBody.get('file').text());
    Promise.all(payload_contents)
      .then(values => hash(values.join('')))
      .then(hash => hex(hash))
      .then(hexhash => {
        // console.log(orig_hash, hexhash);
        expect(hexhash).toBe(orig_hash);
        done();
      });
  });
});
