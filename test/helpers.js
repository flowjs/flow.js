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

function sleep(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

function uploadProgress(file) {
  var readStates = file.chunks.map(e => e.readState),
      uploaded = readStates.filter(e => e),
      chunkCount = readStates.length,
      completion = uploaded.filter(e => e == 2).length + uploaded.filter(e => e == 1).length * 0.5;
  // completion account to 2 for completed chunks, 1 for in-progress ones, and 0 for the leftovers.
  return {readStates, chunkCount, completion};
}

/**
 * Validate whether a generated file is successfully reconstructed from Flow XHR.
 *
 * @param done      The Jasmine async test callback.
 * @param content   File original content.
 * @param orig_hash (Optional) File original hash. if not provided, it will be computed from content.
 */
async function validatePayload(done, content, args) {
  let {
    orig_hash = null,
    requests: _requests = (typeof xhr_server !== 'undefined' ? xhr_server.requests : null),
    flow: _flow = (typeof flow !== 'undefined' ? flow : null)
  } = args;

  if (!_flow || !_requests) {
    console.warn("Called validatePayload with no array requests");
    done();
  }

  var predicted_request_number = Math.ceil(content.length / _flow.opts.chunkSize);
  expect(_requests.length).toBe(predicted_request_number);
  var file = _flow.files[0];
  expect(file.progress()).toBe(1);
  expect(file.isUploading()).toBe(false);
  expect(file.isComplete()).toBe(true);

  // An array of promises of obtaining the corresponding request's body (= payload)
  var payload_contents = _requests.map(x => x.requestBody.get('file').text());
  orig_hash = orig_hash || hex(await hash(content));
  Promise.all(payload_contents)
    .then(values => hash(values.join('')))
    .then(hash => hex(hash))
    .then(hexhash => {
      // console.log(orig_hash, hexhash);
      expect(hexhash).toBe(orig_hash);
      done();
    });
}
