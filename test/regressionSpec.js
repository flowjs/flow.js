/**
 * Regression proofs for the v3 rewrite.
 *
 * These specs describe the target API:
 * - one awaited readFileFn (no asyncReadFileFn split),
 * - upload() resolves when the session is settled,
 * - pause/cancel during an async read prevents a later upload,
 * - empty files are valid zero-byte payloads,
 * - the scheduler fills and bounds its concurrency window.
 *
 * They intentionally fail on the pre-rewrite v3 baseline.
 */
describe('v3 rewrite regressions', function() {
  function makeFlow(overrides) {
    return new Flow(Object.assign({
      testChunks: false,
      generateUniqueIdentifier: function(file) {
        return (file.name || 'blob') + '-' + file.size;
      }
    }, overrides || {}));
  }

  it('sends one zero-byte request for an empty file with an async reader (#375)', async function() {
    var server = sinon.createFakeServer({respondImmediately: true});
    server.respondWith('ok');
    var flow = makeFlow({
      chunkSize: 1,
      readFileFn: async function(fileObj, startByte, endByte, fileType) {
        return fileObj.file.slice(startByte, endByte, fileType);
      }
    });

    await flow.addFile(new File([], 'empty.bin'));
    await flow.upload();

    expect(server.requests.length).toBe(1);
    var body = server.requests[0].requestBody;
    expect(body.get('file').size).toBe(0);
    expect(flow.files[0].isComplete()).toBe(true);
    server.restore();
  });

  it('does not upload after pause during an async read (#368)', async function() {
    var server = sinon.createFakeServer({respondImmediately: false, autoRespond: false});
    var flow = makeFlow({
      chunkSize: 1,
      simultaneousUploads: 1,
      readFileFn: async function(fileObj, startByte, endByte, fileType) {
        await sleep(100);
        return fileObj.file.slice(startByte, endByte, fileType);
      }
    });

    await flow.addFile(new File(['abc'], 'pause-read.bin'));
    var done = flow.upload();
    await sleep(10);
    await flow.files[0].pause();
    await sleep(250);

    expect(server.requests.length).toBe(0);

    await flow.cancel();
    await done.catch(function() {});
    server.restore();
  });

  it('does not upload after cancel during an async read (#368)', async function() {
    var server = sinon.createFakeServer({respondImmediately: false, autoRespond: false});
    var flow = makeFlow({
      chunkSize: 1,
      simultaneousUploads: 1,
      readFileFn: async function(fileObj, startByte, endByte, fileType) {
        await sleep(100);
        return fileObj.file.slice(startByte, endByte, fileType);
      }
    });

    await flow.addFile(new File(['abc'], 'cancel-read.bin'));
    var done = flow.upload();
    await sleep(10);
    await flow.files[0].cancel();
    await sleep(250);

    expect(server.requests.length).toBe(0);

    await done.catch(function() {});
    server.restore();
  });

  it('fills the configured upload concurrency window', async function() {
    var server = sinon.createFakeServer({respondImmediately: false, autoRespond: false});
    var flow = makeFlow({chunkSize: 1, simultaneousUploads: 3});

    await flow.addFile(new File(['0123456789'], 'ten.bin'));
    var done = flow.upload();
    await waitFor(function() { return server.requests.length >= 3; }, 1000, 1);

    expect(server.requests.length).toBe(3);

    await flow.cancel();
    await done.catch(function() {});
    server.restore();
  });

  it('resolves upload() only when the session is settled', async function() {
    var server = sinon.createFakeServer({respondImmediately: false, autoRespond: false});
    var flow = makeFlow({chunkSize: 1, simultaneousUploads: 1});
    await flow.addFile(new File(['ab'], 'two-chunks.bin'));

    var settled = false;
    var done = flow.upload().then(function() { settled = true; });
    await sleep(25);
    expect(settled).toBe(false);

    await waitFor(function() { return server.requests.length === 1; }, 1000, 1);
    server.requests[0].respond(200);
    await waitFor(function() { return server.requests.length === 2; }, 1000, 1);
    server.requests[1].respond(200);
    await done;

    expect(settled).toBe(true);
    expect(flow.files[0].isComplete()).toBe(true);
    expect(flow.progress()).toBe(1);
    server.restore();
  });

  it('reassembles a file read through an async reader without corruption', async function() {
    var content = gen_file(5, 32);
    var server = sinon.createFakeServer({respondImmediately: true});
    server.respondWith('ok');
    var flow = makeFlow({
      chunkSize: 64,
      forceChunkSize: true,
      readFileFn: async function(fileObj, startByte, endByte, fileType) {
        await sleep(1);
        return fileObj.file.slice(startByte, endByte, fileType);
      }
    });

    await flow.addFile(new File([content], 'async-read.bin'));
    await flow.upload();

    expect(flow.files[0].progress()).toBe(1);
    await validatePayload(content, {requests: server.requests});
    server.restore();
  });
});
