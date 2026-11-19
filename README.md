# Flow.js

Flow.js provides multiple simultaneous, stable, fault-tolerant and resumable
chunked uploads using the HTML5 File API.

Each file is split into chunks. A failed chunk can be retried without losing
the rest of the upload; an upload can be paused, resumed or cancelled while
preserving the chunks that already succeeded.

This is the v3 line. It is async-first, has **zero runtime dependencies**, and
requires a modern browser with native `async/await`, `EventTarget`,
`CustomEvent`, `Blob`, `File`, `FormData` and `XMLHttpRequest`.

The v2 line remains available for legacy applications. See
[MIGRATION.md](MIGRATION.md) when upgrading.

## Install

```console
npm install @flowjs/flow.js
```

The npm package exposes:

- `src/Flow.js` for bundlers (ESM, tree-shakeable),
- `dist/flow.esm.js` (ESM bundle),
- `dist/flow.js` (UMD browser bundle),
- `dist/flow.min.js` (minified UMD),
- `dist/flow.cjs` (CommonJS).

You can also clone the repository and serve `dist/flow.js` directly.

## Quick start

```html
<script src="dist/flow.js"></script>
<script>
  const flow = new Flow({
    target: '/upload',
    chunkSize: 1024 * 1024,
    testChunks: true,
    hooks: {
      filterFile(file) {
        return file.size <= 5 * 1024 * 1024 * 1024;
      },
      filesSubmitted(files) {
        // Files are now in flow.files; start the session when ready.
        flow.upload();
      }
    }
  });

  flow.assignBrowse(document.getElementById('browse'));
  flow.assignDrop(document.getElementById('drop'));

  flow.addEventListener('file-progress', ({detail: {file, progress}}) => {
    console.log(file.name, progress);
  });

  flow.addEventListener('file-success', ({detail: {file, message}}) => {
    console.log('uploaded', file.name, message);
  });

  flow.addEventListener('file-error', ({detail: {file, message}}) => {
    console.error('failed', file.name, message);
  });
</script>
```

### Upload lifecycle

`upload()` is **completion-oriented**:

```js
await flow.addFiles(fileList);
const summary = await flow.upload();
console.log(summary.status, summary.uploadedBytes, summary.totalBytes);
```

- `upload()` starts the session immediately and returns a promise.
- The promise resolves when the session is settled (complete or cancelled).
- While a session is active, calling `upload()` again returns the same promise.
- If you only want fire-and-forget behaviour, do not await it.
- `pause()` aborts active reads/requests and returns when they are stopped.
- `resume()` continues the same session and returns its promise.
- `cancel()` aborts the session and removes all files.

There is exactly one upload session per `Flow` instance. `FlowFile.resume()`
never creates a second scheduler.

## Server setup

Chunks are sent with these parameters:

- `flowChunkNumber`: index of the chunk, starting at 1.
- `flowTotalChunks`: total number of chunks.
- `flowChunkSize`: configured chunk size.
- `flowCurrentChunkSize`: size of this chunk.
- `flowTotalSize`: total file size.
- `flowIdentifier`: unique file identifier.
- `flowFilename`: original file name.
- `flowRelativePath`: relative path when selecting a directory.

With `method: 'multipart'` (the default) these are form fields and the payload
is the multipart file field named by `fileParameterName`. With
`method: 'octet'` the payload is the raw request body and the parameters are in
the query string.

With `streaming: true` the client does not know the final size up front:

- `flowTotalSize` is `-1`.
- `flowIsStreaming` is `true`.
- `flowChunkIsLast` is `false` on data chunks and `true` on a final zero-byte
  marker chunk.
- `flowTotalChunks` grows as chunks are appended.

A streaming-aware server must reassemble by `flowChunkNumber` and treat the
zero-byte `flowChunkIsLast` chunk as EOF. It must not require the first
request's total size/chunk count to be final.

Servers must tolerate the same chunk being uploaded more than once (for example
after a retry).

Status handling:

- `successStatuses` (default `[200, 201, 202]`): chunk accepted.
- `permanentErrors` (default `[404, 413, 415, 500, 501]`): stop the file.
- Any other status: temporary; retry according to `maxChunkRetries`.

### Chunk testing

When `testChunks` is enabled, a `GET` request with the same parameters is sent
before uploading a chunk:

- success status: the chunk already exists; skip the upload,
- `testNotFoundStatuses` (default `[404]`): the chunk is missing; upload it,
- permanent error: fail the file,
- anything else: temporary failure, retry.

## Configuration

```js
new Flow({
  target: '/upload',
  chunkSize: 1024 * 1024,
  forceChunkSize: false,
  simultaneousUploads: 3,
  singleFile: false,
  fileParameterName: 'file',
  method: 'multipart',           // 'multipart' or 'octet'
  testMethod: 'GET',
  uploadMethod: 'POST',
  testChunks: true,
  testNotFoundStatuses: [404],
  successStatuses: [200, 201, 202],
  permanentErrors: [404, 413, 415, 500, 501],
  maxChunkRetries: 0,
  chunkRetryInterval: null,      // milliseconds; null = immediate
  chunkChecksum: null,           // async (chunk, payload) => string
  allowShortStream: false,       // opt-in for overestimated stream sizes
  streaming: false,              // dynamic chunks for unknown/estimated sizes
  xhrTimeout: 0,                 // milliseconds; 0 = no timeout
  withCredentials: false,
  query: {},
  headers: {},
  prioritizeFirstAndLastChunk: false,
  allowDuplicateUploads: false,
  progressCallbacksInterval: 500,
  speedSmoothingFactor: 0.1,
  onDropStopPropagation: false,
  generateUniqueIdentifier(file) { /* optional, synchronous */ },
  initFileFn(file, context) { /* optional, may be async */ },
  readFileFn(file, startByte, endByte, fileType, chunk, {signal}) {
    return file.slice(startByte, endByte, fileType);
  },
  preprocess(chunk) { /* optional, awaited before reading */ },
  changeRawDataBeforeSend(chunk, data) { /* optional, may be async */ },
  hooks: {
    filterFile(file, context) {},
    fileAdded(file, context) {},
    filesAdded(files, context) {},
    filesSubmitted(files, context) {}
  }
});
```

### Async readers and streams

`readFileFn` may return a `Blob`, `ArrayBuffer`, string, or `null` (EOF), and
may return a promise. It receives an `AbortSignal` as the last argument. Reads
are issued sequentially in chunk order, so stream-based readers do not need
their own locking. Uploads run concurrently.

`prioritizeFirstAndLastChunk` is intended for readers that can seek to an
arbitrary chunk (for example `Blob.slice`). A purely sequential stream reader
cannot honor a request for the last chunk before the middle chunks.

```js
const reader = file.stream().getReader();
const flow = new Flow({
  target: '/upload',
  readFileFn: async (flowFile, start, end, type, chunk, {signal}) => {
    const {value} = await reader.read();
    return value ? new Blob([value]) : null;
  }
});
```

A zero-length `Blob` is a valid payload. `null` means “no data / EOF”. This is
what allows empty files to be uploaded correctly (#375).

For a non-empty file, a `null`/`undefined` result before the final chunk is
treated as a truncation error by default. Set `allowShortStream: true` only if
the declared size is an intentional upper bound. This prevents silently short
uploads.

If a non-rewindable stream fails on read and there is no cached payload,
`file.retry()` re-runs `initFileFn` and rebuilds the chunk list instead of
reading a partially consumed stream. `initFileFn` must provide a fresh source
in that case. Cached payloads are reused for upload retries.

For truly unknown or estimated sizes, set `streaming: true`. `flowObj.size`
may be `0` (unknown) or an estimate used only for pre-created chunks/progress;
chunks are appended dynamically until the reader returns `null`/undefined or
an empty slice after the first chunk. Only active chunks are buffered: initial
chunks use `simultaneousUploads`; after an estimate is exhausted, probe chunks
are created one at a time. A GB-scale encrypted stream therefore keeps only a
few chunks' payloads in memory, never the whole input.

`streaming` disables `prioritizeFirstAndLastChunk` (a sequential stream cannot
seek). `testChunks` is usually not useful for one-shot streams; use `false`.
Progress with `size === 0` is `0` until completion, then `1`; with an estimate,
the estimate is the denominator until EOF.

A read that completes while pause/cancel/error is racing is cached, not
discarded, because a stateful reader (GPG packetizer, stream cipher, ...) has
already consumed those bytes. If a stateful reader honors the abort signal and
aborts after consuming bytes, those bytes cannot be recovered; either ignore
the signal on pause (the completed buffer is cached) or provide a replayable
source via `initFileFn`.

### Integrity checks

`chunkChecksum(chunk, payload)` may return a string or promise. It is computed
once per payload and sent as `flowChunkHash`; the value is cached and reused on
retries, so a stateful reader/encryptor is never re-run for the same chunk.
The server should verify the hash against the exact received chunk body.

```js
new Flow({
  target: '/upload',
  chunkChecksum: async (chunk, payload) => {
    const buffer = payload instanceof Blob
      ? await payload.arrayBuffer()
      : payload;
    const digest = await crypto.subtle.digest('SHA-256', buffer);
    return 'sha256-' + Array.from(new Uint8Array(digest))
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
  }
});
```

For a whole-file checksum, compute it in `initFileFn` (which may be async) and
add it to the request via `query` or `headers`; the server verifies it after
reassembly. This is the recommended pattern for on-the-fly encryption: hash the
ciphertext exactly as uploaded, or hash the plaintext in `initFileFn` and
verify after decryption.

## Events

Events are native `CustomEvent`s. Register with `addEventListener` and read the
object in `event.detail`.

| Event | Detail |
| --- | --- |
| `upload-start` | `{flow, files}` |
| `upload-resume` | `{flow, files}` |
| `file-progress` | `{flow, file, chunk, progress}` |
| `progress` | `{flow, file, chunk, progress}` |
| `file-success` | `{flow, file, message, chunk}` |
| `file-error` | `{flow, file, message, chunk}` |
| `error` | `{flow, message, file?, chunk?}` |
| `file-retry` | `{flow, file, chunk}` |
| `file-removed` | `{flow, file}` |
| `complete` | `{flow, files, summary}` |
| `catch-all` | `{type, hook, detail}` |

```js
flow.addEventListener('complete', ({detail: {summary}}) => {
  console.log(summary.status, summary.files);
});

flow.addEventListener('catch-all', ({detail: {type, hook, detail}}) => {
  console.log(hook ? 'hook' : 'event', type, detail);
});
```

Event names are case-sensitive. `catch-all` is dispatched after each event and
after each hook.

## Hooks

Hooks are explicit options, not event names. Each hook accepts a function or an
array of functions. They may be async and are awaited in order.

| Hook | Arguments | Purpose |
| --- | --- | --- |
| `filterFile` | `(file, {event, flow})` | Return `false` to skip the file. All filters are AND-ed. |
| `fileAdded` | `(flowFile, {event, flow})` | Runs after bootstrap, before the file is queued. Delete `flowFile.file` to reject it. |
| `filesAdded` | `(flowFiles, {event, flow})` | May reorder or mutate the array before queuing. |
| `filesSubmitted` | `(flow.files, {event, flow})` | Runs after the files are queued. A good place to call `flow.upload()`. |

Hook errors are reported through the `error` event and do not corrupt the add
pipeline.

## Methods

- `assignBrowse(domNodes, isDirectory, singleFile, attributes)`
- `assignDrop(domNodes)`
- `unAssignDrop(domNodes)`
- `addFile(file, {event, initFileFn})` → `Promise<FlowFile>`
- `addFiles(files, {event, initFileFn})` → `Promise<FlowFile[]>`
- `upload()` → `Promise<UploadSummary>`
- `pause()` → `Promise<void>`
- `resume()` → `Promise<UploadSummary>`
- `cancel()` → `Promise<void>`
- `removeFile(file)` → `Promise<void>`
- `getFromUniqueIdentifier(identifier)`
- `getSize()`
- `sizeUploaded()`
- `timeRemaining()`
- `progress()`
- `isUploading()`

## FlowFile

Properties:

- `flowObj`, `file`, `name`, `relativePath`, `size`, `uniqueIdentifier`
- `chunks`, `paused`, `cancelled`, `error`, `errorMessage`
- `averageSpeed`, `currentSpeed`

Methods:

- `pause()`, `resume()`, `cancel()`, `retry()`
- `progress()`, `sizeUploaded()`, `timeRemaining()`
- `isUploading()`, `isReading()`, `isComplete()`, `isSuccessful()`
- `getExtension()`, `getType()`

`isComplete()` means every chunk reached a terminal state. A file with a
permanent error is complete but not successful; use `isSuccessful()` to
distinguish the two.

## Development

Requirements: Node.js >= 18 and Playwright's browser binaries.

```console
npm install
npx playwright install --with-deps chromium firefox webkit
npm run build          # dist/flow.esm.js, flow.js, flow.min.js, flow.cjs
npm run build:test     # dist/flow.test.js
```

The browser suite is driven by [Playwright](https://playwright.dev/), so it
runs in Chromium, Firefox and WebKit rather than only the local Chromium:

```console
npm test                    # build + run Chromium, Firefox and WebKit
npm run test:local          # build + attach to an existing Chromium CDP
npm run test:coverage       # build instrumented + run all browsers + report
npm run test:coverage:local # same, attached to an existing Chromium
```

`test:local` and `test:coverage:local` expect Chromium to already be running
with remote debugging enabled:

```console
chromium --headless=new --no-sandbox \
  --remote-debugging-address=127.0.0.1 \
  --remote-debugging-port=9223 about:blank &
```

That mode uses Playwright's `connectOverCDP`; it creates and closes only its own
tab/context and never closes your browser. The default `npm test` mode launches
Playwright-managed Chromium, Firefox and WebKit and is what CI uses.

Useful runner options:

```console
node scripts/run-browser-tests.mjs --browser chromium-cdp --cdp http://127.0.0.1:9223
node scripts/run-browser-tests.mjs --browser firefox
node scripts/run-browser-tests.mjs --spec "scheduler stress"
node scripts/run-browser-tests.mjs --exclude "real HTTP upload"
```

Coverage is collected with Istanbul instrumentation and merged across browsers:

```console
FLOW_COVERAGE=1 npm run build:test
node scripts/run-browser-tests.mjs --browser all --coverage
node scripts/coverage-report.mjs
```

Current Chromium coverage: **97.4% statements, 86.7% branches, 98.0%
functions, 97.6% lines** over 145 specs. The suite covers the adapted v3 tests,
targeted #368/#375 regressions, transport error/timeout/abort paths, test-request
success/404/retry paths, empty/EOF/ArrayBuffer/string readers, retries, pause,
cancel, priority scheduling, hooks, seeded randomized stress/invariants, and
real-network upload/retry tests. The remaining uncovered branches are mostly
abort races during an in-flight read and one unreachable multi-chunk zero-byte
progress branch.

## License

MIT
