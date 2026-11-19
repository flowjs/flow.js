describe('streaming uploads', function() {
  var flow;
  var xhr;

  function makeFlow(overrides) {
    return new Flow(Object.assign({
      streaming: true,
      testChunks: false,
      chunkSize: 3,
      simultaneousUploads: 2,
      generateUniqueIdentifier: function(file) {
        return file.name;
      }
    }, overrides || {}));
  }

  function statefulReader(content, delay, failAfter) {
    var position = 0;
    var calls = 0;
    return {
      get position() { return position; },
      get calls() { return calls; },
      read: async function(fileObj, startByte, endByte, fileType, chunk) {
        calls++;
        if (delay) {
          await sleep(delay);
        }
        if (typeof failAfter === 'number' && calls > failAfter) {
          throw new Error('simulated read failure');
        }
        if (position >= content.length) {
          return null;
        }
        var part = content.slice(position, position + fileObj.chunkSize);
        position += fileObj.chunkSize;
        return new Blob([part], {type: 'application/octet-stream'});
      }
    };
  }

  function pending() {
    return xhr.requests.filter(request => !request.aborted && request.readyState !== 4);
  }

  async function waitRequests(count) {
    await waitFor(function() {
      return xhr.requests.length >= count;
    }, 3000, 5);
  }

  async function payloadFor() {
    var parts = xhr.requests
      .filter(request => [200, 201].includes(request.status))
      .map(function(request) {
        return {
          number: Number(request.requestBody.get('flowChunkNumber')),
          body: request.requestBody.get('file'),
          last: request.requestBody.get('flowChunkIsLast'),
          totalSize: request.requestBody.get('flowTotalSize'),
          streaming: request.requestBody.get('flowIsStreaming')
        };
      })
      .sort(function(a, b) {
        return a.number - b.number;
      });
    var content = '';
    for (var part of parts) {
      content += await part.body.text();
    }
    return {content, parts};
  }

  beforeEach(function() {
    xhr = sinon.createFakeServer({
      respondImmediately: true,
      autoRespond: true
    });
    xhr.respondWith('ok');
  });

  afterEach(function() {
    xhr.restore();
  });

  it('uploads an unknown-size stream through a final marker chunk', async function() {
    var content = 'abcdefgh';
    var reader = statefulReader(content, 0);
    flow = makeFlow({
      initFileFn: function(file) { file.size = 0; },
      readFileFn: reader.read
    });
    await flow.addFile(new File([content], 'unknown-size.bin'));
    await flow.upload();

    var result = await payloadFor();
    expect(result.content).toBe(content);
    expect(result.parts.filter(function(part) { return part.body.size === 0; }).length).toBe(1);
    expect(result.parts[result.parts.length - 1].last).toBe('true');
    expect(result.parts.every(function(part) {
      return part.totalSize === '-1' && part.streaming === 'true';
    })).toBe(true);
    expect(flow.files[0].isSuccessful()).toBe(true);
    expect(flow.files[0].progress()).toBe(1);
  });

  it('extends an underestimated stream dynamically', async function() {
    var content = 'abcdefgh';
    var reader = statefulReader(content, 0);
    flow = makeFlow({
      initFileFn: function(file) { file.size = 3; },
      readFileFn: reader.read
    });
    await flow.addFile(new File([content], 'underestimated.bin'));
    await flow.upload();

    var result = await payloadFor();
    expect(result.content).toBe(content);
    expect(flow.files[0].isSuccessful()).toBe(true);
    expect(flow.files[0].chunks.length).toBeGreaterThan(1);
  });

  it('stops at EOF for an overestimated stream and marks it complete', async function() {
    var content = 'abcdefgh';
    var reader = statefulReader(content, 0);
    flow = makeFlow({
      initFileFn: function(file) { file.size = 15; },
      readFileFn: reader.read
    });
    await flow.addFile(new File([content], 'overestimated.bin'));
    await flow.upload();

    var result = await payloadFor();
    expect(result.content).toBe(content);
    expect(result.parts[result.parts.length - 1].last).toBe('true');
    expect(flow.files[0].isSuccessful()).toBe(true);
    expect(flow.files[0].progress()).toBe(1);
  });

  it('retries a streaming chunk without advancing the reader', async function() {
    xhr.configure({respondImmediately: false, autoRespond: false});
    var content = 'abcdefgh';
    var reader = statefulReader(content, 0);
    flow = makeFlow({
      maxChunkRetries: 2,
      initFileFn: function(file) { file.size = 0; },
      readFileFn: reader.read
    });
    await flow.addFile(new File([content], 'stream-retry.bin'));
    var done = flow.upload();
    await waitRequests(1);
    var callsBeforeRetry = reader.calls;
    xhr.requests[0].respond(503);

    while (!flow.files[0].isComplete()) {
      await waitFor(function() {
        return pending().length > 0 || flow.files[0].isComplete();
      }, 3000, 5);
      var request = pending()[0];
      if (!request) {
        break;
      }
      request.respond(200);
    }
    await done;

    expect(reader.calls).toBe(callsBeforeRetry + 3); // 3 data chunks, no re-read
    var result = await payloadFor();
    expect(result.content).toBe(content);
    expect(flow.files[0].isSuccessful()).toBe(true);
  });

  it('reports a streaming read failure instead of completing silently', async function() {
    var content = 'abcdefgh';
    var reader = statefulReader(content, 0, 1);
    flow = makeFlow({
      initFileFn: function(file) { file.size = 0; },
      readFileFn: reader.read
    });
    await flow.addFile(new File([content], 'stream-read-error.bin'));
    await flow.upload();
    expect(flow.files[0].error).toBe(true);
    expect(flow.files[0].errorMessage).toContain('simulated read failure');
    expect(flow.files[0].isSuccessful()).toBe(false);
  });

  it('pauses and resumes an unknown-size stream without losing bytes', async function() {
    xhr.configure({respondImmediately: false, autoRespond: false});
    var content = 'abcdefgh';
    var reader = statefulReader(content, 20);
    flow = makeFlow({
      simultaneousUploads: 1,
      initFileFn: function(file) { file.size = 0; },
      readFileFn: reader.read
    });
    await flow.addFile(new File([content], 'stream-pause.bin'));
    var done = flow.upload();
    await waitRequests(1);
    await flow.files[0].pause();
    var resumed = flow.files[0].resume();

    while (!flow.files[0].isComplete()) {
      await waitFor(function() {
        return pending().length > 0 || flow.files[0].isComplete();
      }, 3000, 5);
      var request = pending()[0];
      if (!request) {
        break;
      }
      request.respond(200);
    }
    await resumed;
    await done;

    var result = await payloadFor();
    expect(result.content).toBe(content);
    expect(flow.files[0].isSuccessful()).toBe(true);
  });

  it('keeps buffered payload memory bounded to the active chunks', async function() {
    xhr.configure({respondImmediately: false, autoRespond: false});
    var content = 'abcdefghijklmnopqrstuvwxyz0123456789';
    var reader = statefulReader(content, 0);
    flow = makeFlow({
      simultaneousUploads: 2,
      chunkSize: 3,
      initFileFn: function(file) { file.size = 0; },
      readFileFn: reader.read
    });
    await flow.addFile(new File([content], 'stream-memory.bin'));
    var maxBuffered = 0;
    var done = flow.upload();
    while (!flow.files[0].isComplete()) {
      await waitFor(function() {
        return pending().length > 0 || flow.files[0].isComplete();
      }, 3000, 5);
      maxBuffered = Math.max(maxBuffered, flow.files[0].chunks.reduce(function(total, chunk) {
        return total + (chunk.payload && chunk.payload.size ? chunk.payload.size : 0);
      }, 0));
      var request = pending()[0];
      if (!request) {
        break;
      }
      request.respond(200);
    }
    await done;
    expect(maxBuffered).toBeLessThanOrEqual(3 * 3);
    expect(flow.files[0].isSuccessful()).toBe(true);
  });

  it('treats empty Blob slices as EOF for Blob-backed streaming sources', async function() {
    var content = 'abcdefgh';
    flow = makeFlow({
      initFileFn: function(file) { file.size = 0; }
    });
    await flow.addFile(new File([content], 'blob-stream.bin'));
    await flow.upload();

    var result = await payloadFor();
    expect(result.content).toBe(content);
    expect(result.parts[result.parts.length - 1].last).toBe('true');
    expect(flow.files[0].isSuccessful()).toBe(true);
  });

  it('retries the final streaming marker', async function() {
    xhr.configure({respondImmediately: false, autoRespond: false});
    var content = 'abcdefgh';
    var reader = statefulReader(content, 0);
    flow = makeFlow({
      maxChunkRetries: 2,
      initFileFn: function(file) { file.size = 0; },
      readFileFn: reader.read
    });
    await flow.addFile(new File([content], 'stream-marker-retry.bin'));
    var done = flow.upload();
    var markerFailed = false;

    while (!flow.files[0].isComplete()) {
      await waitFor(function() {
        return pending().length > 0 || flow.files[0].isComplete();
      }, 3000, 5);
      var request = pending()[0];
      if (!request) {
        break;
      }
      var isMarker = request.requestBody.get('flowChunkIsLast') === 'true';
      if (isMarker && !markerFailed) {
        markerFailed = true;
        request.respond(503);
      } else {
        request.respond(200);
      }
    }
    await done;

    var result = await payloadFor();
    expect(result.content).toBe(content);
    expect(flow.files[0].isSuccessful()).toBe(true);
    expect(flow.files[0].chunks.filter(function(chunk) {
      return chunk.isLastChunk;
    }).length).toBe(1);
  });

});
