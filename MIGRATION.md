# Migrating to Flow.js v3

v3 is intentionally a breaking release. The goal is one clear async upload
pipeline instead of the v2/v3 recursive event-handler design.

## Runtime requirements

v3 targets modern browsers with native `async/await`, `EventTarget`,
`CustomEvent`, `Blob`, `File`, `FormData` and `XMLHttpRequest`. There are no
runtime dependencies and no Babel/`regenerator` transform. Internet Explorer is
not supported.

## API changes at a glance

| v2 / old v3 | v3 |
| --- | --- |
| `flow.on(name, cb)` | `flow.addEventListener(name, cb)` |
| `flow.off(name, cb)` | `flow.removeEventListener(name, cb)` |
| `flow.once(name, cb)` | `flow.addEventListener(name, cb, {once: true})` |
| event `detail: [a, b, c]` | event `detail: {named: fields}` |
| `flow.on('file-added', cb)` hook | `hooks.fileAdded` |
| `flow.on('filter-file', cb)` | `hooks.filterFile` |
| `asyncReadFileFn` | `readFileFn` (always awaited, may be async) |
| `chunk.readFinished(data)` | return data from `readFileFn` |
| `chunk.preprocessFinished()` | `preprocess(chunk)` is awaited automatically |
| `flow.uploadNextChunk()` | removed/private |
| `addFiles(files, event, initFileFn)` | `addFiles(files, {event, initFileFn})` |
| `addFile(file, event, initFileFn)` | `addFile(file, {event, initFileFn})` |
| `await flow.upload()` = “started” | resolves when the session is settled |
| `FlowFile.resume()` called `flow.upload()` | resumes the single upload session |
| `file.chunks` cleared on error | chunks keep terminal states for inspection/retry |
| `file.error` boolean | `file.error` + `file.errorMessage` |
| `Flow` second constructor arg for events | removed; use `addEventListener` |

## Events

### Before

```js
flow.on('file-success', (file, message, chunk) => {
  console.log(file.name, message);
});

flow.on('catch-all', (name, ...args) => {
  console.log(name, args);
});
```

### After

```js
flow.addEventListener('file-success', ({detail: {file, message, chunk}}) => {
  console.log(file.name, message);
});

flow.addEventListener('catch-all', ({detail: {type, hook, detail}}) => {
  console.log(hook ? 'hook' : 'event', type, detail);
});
```

The full event table is in [README.md](README.md#events). Names are
case-sensitive.

## Hooks

### Before

```js
flow.on('filter-file', (file) => file.size < 10 * 1024 * 1024);
flow.on('file-added', (file) => {
  if (!allowed(file)) {
    delete file.file;
  }
});
flow.on('files-submitted', () => flow.upload());
```

### After

```js
const flow = new Flow({
  hooks: {
    filterFile: (file) => file.size < 10 * 1024 * 1024,
    fileAdded: (file) => {
      if (!allowed(file)) {
        delete file.file;
      }
    },
    filesSubmitted: () => flow.upload()
  }
});
```

Each hook may be a function or an array of functions. Filters are AND-ed.
Hooks may be async. Hook errors are reported through the `error` event and do
not break the add pipeline.

## `upload()` now means “settled”

This is the most important semantic change.

### Before

```js
await flow.upload();       // returns after starting
const request = server.nextRequest();
request.respond(200);
```

### After

```js
const done = flow.upload(); // starts immediately
const request = await server.nextRequest();
request.respond(200);
await done;                 // resolves when the session is settled
```

Fire-and-forget callers can keep calling `flow.upload()` without awaiting it.
Programmatic callers get a useful completion promise:

```js
const summary = await flow.upload();
console.log(summary.status); // 'complete' or 'cancelled'
```

`upload()` is idempotent while a session is active. `resume()` continues the
same session; it does not create a second scheduler. `pause()` aborts active
reads/requests. `cancel()` aborts everything and removes the files.

## Async readers and streams

`asyncReadFileFn` is gone. Use one `readFileFn`; it is always awaited and may
return a plain value or a promise.

### Before

```js
flow.opts.readFileFn = syncRead;
flow.opts.asyncReadFileFn = asyncRead;
```

### After

```js
flow.opts.readFileFn = async (
  flowFile, startByte, endByte, fileType, chunk, {signal}
) => {
  const buffer = await readSomeBytes(flowFile.file, startByte, endByte, signal);
  return buffer === null ? null : new Blob([buffer]);
};
```

- `null`/`undefined` means EOF/no data.
- A zero-length `Blob` is valid data (empty file support, #375).
- Reads are sequential in chunk order; uploads are concurrent.
- The `AbortSignal` lets custom readers stop on pause/cancel. Even if a reader
  ignores it, the scheduler discards the result after a pause/cancel (#368).

## `preprocess`

`preprocess(chunk)` is awaited automatically. Do not call
`preprocessFinished()`.

```js
new Flow({
  preprocess: async (chunk) => {
    await prepare(chunk);
  }
});
```

## Retry

`file.retry()` retries failed chunks. If the file previously completed
successfully, it re-uploads the whole file (useful when changing query
parameters).

For a non-rewindable stream, a read failure cannot be recovered by reading the
same stream again. When an error chunk has no cached payload, `file.retry()`
re-runs `initFileFn` and rebuilds the chunks; provide a fresh stream there.
Error chunks with a cached payload are retried without re-reading, so a
stateful encryptor is not re-run for already-produced ciphertext. A read that
completes while pause/cancel/error is racing is cached for the same reason; a
stateful reader that aborts after consuming bytes must provide a replayable
source instead.

## Chunk states

`FlowChunk.status()` is now a pure state read:

`pending`, `reading`, `uploading`, `success`, `error`, `cancelled`.

`FlowFile.isComplete()` means “no outstanding chunks”. A permanently failed
file is complete but not successful; use `isSuccessful()`.

## New options

- `testNotFoundStatuses` (default `[404]`): a test response that means “chunk
  does not exist, upload it”.
- `xhrTimeout` (default `0`): per-request timeout in milliseconds.
- `chunkChecksum` (default `null`): optional async `(chunk, payload) => string`
  digest of the exact payload; sent as `flowChunkHash` and cached across
  retries.
- `allowShortStream` (default `false`): opt-in compatibility for a declared
  size that is only an upper bound. By default a `null` reader result before
  the final chunk is a truncation error, not a silent success.
- `streaming` (default `false`): create chunks dynamically until the reader
  reaches EOF. `flowTotalSize` is `-1`, `flowTotalChunks` grows, and a
  zero-byte `flowChunkIsLast` marker ends the upload. This is the mode for
  unknown/estimated-size encrypted streams.
- `hooks`: explicit hook configuration.

`method: 'octet'` puts upload parameters in the query string and sends the raw
chunk as the request body; `method: 'multipart'` keeps the v2 behaviour.

## Compatibility notes

- `ng-flow` stays on v2.
- `ngx-flow` is out of scope for this change and will need a v3 adapter.
- The `samples/` directory and `README.md` have been updated to the v3 API.
