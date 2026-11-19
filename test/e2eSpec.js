describe('real HTTP upload', function() {
  beforeAll(function() {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;
  });

  function uniqueId(prefix) {
    return prefix + '-' + Date.now() + '-' + Math.floor(Math.random() * 1e9);
  }

  async function resultFor(identifier) {
    var response = await fetch(
      '/_upload/result?flowIdentifier=' + encodeURIComponent(identifier)
    );
    return response.json();
  }

  it('uploads and reassembles a file through real XHR', async function() {
    var content = 'abcdefghijklmnopqrstuvwxyz0123456789';
    var identifier = uniqueId('e2e-basic');
    var flow = new Flow({
      target: '/_upload',
      method: 'octet',
      testChunks: false,
      chunkSize: 5,
      forceChunkSize: true,
      simultaneousUploads: 2,
      generateUniqueIdentifier: function() { return identifier; }
    });

    await flow.addFile(new File([content], 'e2e-basic.bin'));
    await flow.upload();

    var result = await resultFor(identifier);
    expect(result.chunkNumbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(result.requests).toBe(8);
    expect(atob(result.data)).toBe(content);
    expect(flow.files[0].isComplete()).toBe(true);
    expect(flow.files[0].progress()).toBe(1);
  });

  it('retries a real transient server failure and keeps the payload intact', async function() {
    var content = '0123456789';
    var identifier = uniqueId('e2e-retry');
    var flow = new Flow({
      target: '/_upload',
      method: 'octet',
      testChunks: false,
      chunkSize: 3,
      forceChunkSize: true,
      simultaneousUploads: 2,
      maxChunkRetries: 2,
      query: {failChunk: 2, failTimes: 1},
      generateUniqueIdentifier: function() { return identifier; }
    });

    await flow.addFile(new File([content], 'e2e-retry.bin'));
    await flow.upload();

    var result = await resultFor(identifier);
    expect(result.chunkNumbers).toEqual([1, 2, 3, 4]);
    expect(result.requests).toBe(5);
    expect(atob(result.data)).toBe(content);
    expect(flow.files[0].isComplete()).toBe(true);
    expect(flow.files[0].progress()).toBe(1);
  });

  it('uploads an empty file as one zero-byte request', async function() {
    var identifier = uniqueId('e2e-empty');
    var flow = new Flow({
      target: '/_upload',
      method: 'octet',
      testChunks: false,
      chunkSize: 5,
      forceChunkSize: true,
      generateUniqueIdentifier: function() { return identifier; }
    });

    await flow.addFile(new File([], 'e2e-empty.bin'));
    await flow.upload();

    var result = await resultFor(identifier);
    expect(result.chunkNumbers).toEqual([1]);
    expect(result.requests).toBe(1);
    expect(atob(result.data)).toBe('');
    expect(flow.files[0].isComplete()).toBe(true);
    expect(flow.progress()).toBe(1);
  });
});
