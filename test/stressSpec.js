describe('scheduler stress and invariants', function() {
  beforeAll(function() {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;
  });

  function rng(seed) {
    var value = seed >>> 0;
    return function() {
      value += 0x6D2B79F5;
      var t = value;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function contentOfSize(size, random) {
    var alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
    var content = '';
    for (var i = 0; i < size; i++) {
      content += alphabet[Math.floor(random() * alphabet.length)];
    }
    return content;
  }

  function pending(server) {
    return server.requests.filter(function(request) {
      return !request.aborted && request.readyState !== 4;
    });
  }

  async function payloadFor(server, name) {
    var parts = server.requests
      .filter(function(request) {
        return [200, 201].includes(request.status) &&
          request.requestBody && request.requestBody.get;
      })
      .map(function(request) {
        return {
          number: Number(request.requestBody.get('flowChunkNumber')),
          name: request.requestBody.get('flowFilename'),
          body: request.requestBody.get('file')
        };
      })
      .filter(function(part) {
        return part.name === name;
      })
      .sort(function(a, b) {
        return a.number - b.number;
      })
      .map(function(part) {
        return part.body;
      });
    return new Blob(parts).text();
  }

  async function runSeed(seed) {

    var random = rng(seed);
    var chunkSize = 1 + Math.floor(random() * 16);
    var concurrency = 1 + Math.floor(random() * 4);
    var forceChunkSize = random() < 0.5;
    var size1 = Math.floor(random() * (chunkSize * 4 + 3));
    var size2 = Math.floor(random() * (chunkSize * 4 + 3));
    var content1 = contentOfSize(size1, random);
    var content2 = contentOfSize(size2, random);

    var server = sinon.createFakeServer({
      respondImmediately: false,
      autoRespond: false
    });
    var flow = new Flow({
      testChunks: false,
      chunkSize: chunkSize,
      forceChunkSize: forceChunkSize,
      simultaneousUploads: concurrency,
      maxChunkRetries: 5,
      permanentErrors: [500],
      generateUniqueIdentifier: function(file) {
        return 'stress-' + seed + '-' + file.name;
      }
    });

    var activeReads = 0;
    var maxReads = 0;
    var lastEnd = new Map();
    var readErrors = [];

    flow.opts.readFileFn = async function(fileObj, startByte, endByte, fileType) {
      activeReads++;
      maxReads = Math.max(maxReads, activeReads);
      var previousEnd = lastEnd.get(fileObj.uniqueIdentifier) || 0;
      if (startByte !== previousEnd) {
        readErrors.push(
          fileObj.name + ': expected read at ' + previousEnd + ', got ' + startByte
        );
      }
      try {
        await sleep(Math.floor(random() * 4));
        lastEnd.set(fileObj.uniqueIdentifier, endByte);
        return fileObj.file.slice(startByte, endByte, fileType);
      } finally {
        activeReads--;
      }
    };

    await flow.addFiles([
      new File([content1], 'stress-1-' + seed + '.bin'),
      new File([content2], 'stress-2-' + seed + '.bin')
    ]);

    var maxActive = 0;
    var lastSignature = '';
    var lastProgress = Date.now();
    var done = flow.upload();
    while (true) {
      if (flow.files.every(function(file) { return file.isComplete(); })) {
        break;
      }
      await waitFor(function() {
        return pending(server).length > 0 ||
          flow.files.every(function(file) { return file.isComplete(); });
      }, 1000, 5);
      var requests = pending(server);
      if (requests.length === 0) {
        if (flow.files.every(function(file) { return file.isComplete(); })) {
          break;
        }
        throw new Error('stress stalled for seed ' + seed + ': no pending requests');
      }
      var signature = requests.length + ':' + flow.files.map(function(file) {
        return file.chunks.map(function(chunk) { return chunk.state; }).join(',');
      }).join('|');
      if (signature !== lastSignature) {
        lastSignature = signature;
        lastProgress = Date.now();
      } else if (Date.now() - lastProgress > 5000) {
        throw new Error('stress stalled for seed ' + seed + ': ' + signature);
      }
      maxActive = Math.max(maxActive, requests.length);
      var request = requests[Math.floor(random() * requests.length)];
      var status = random() < 0.15 ? 503 : 200;
      request.respond(status, {}, status === 200 ? 'ok' : 'busy');
      await sleep(0);
    }
    await done;

    expect(maxReads).toBeLessThanOrEqual(1);
    expect(maxActive).toBeLessThanOrEqual(concurrency);
    expect(readErrors).toEqual([]);

    if (!flow.files.some(function(file) { return file.error; })) {
      expect(await payloadFor(server, 'stress-1-' + seed + '.bin')).toBe(content1);
      expect(await payloadFor(server, 'stress-2-' + seed + '.bin')).toBe(content2);
    }

    server.restore();

  }

  for (let seed = 1; seed <= 8; seed++) {
    it('preserves payloads, read order and concurrency across seed ' + seed, async function() {
      await runSeed(seed);
    });
  }
});
