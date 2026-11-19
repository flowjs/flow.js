# 3.0.0-alpha.1

This release replaces the recursive XHR/event-handler upload design with one
async upload session.

## Highlights

 - One `UploadSession` per Flow instance. XHR listeners only resolve request
   promises; they never schedule another chunk.
 - Async-generator read queue plus a bounded worker pool. Reads stay in chunk
   order; uploads run concurrently up to `simultaneousUploads`.
 - `upload()` is completion-oriented and idempotent while a session is active.
   `pause()`, `resume()`, `cancel()` and `removeFile()` settle deterministically.
 - Explicit chunk state machine: `pending`, `reading`, `uploading`, `success`,
   `error`, `cancelled`.
 - One awaited `readFileFn` replaces the `readFileFn` / `asyncReadFileFn` split.
   It receives an `AbortSignal`; pause/cancel during a read no longer uploads
   the stale result (#368).
 - Empty files send exactly one zero-byte request (#375).
 - Optional per-chunk checksums (`chunkChecksum`), sent as `flowChunkHash` and
   cached across retries; server verification is documented.
 - Premature EOF on a non-empty file is a truncation error by default
   (`allowShortStream` is the explicit opt-in).
 - Duplicate identifiers within one `addFiles` batch are filtered.
 - A retry after an uncached read failure reinitializes via `initFileFn` and
   rebuilds chunks instead of reading a partially consumed stream.
 - A completed read is cached even when pause/cancel/error races with it, so a
   stateful reader/encryptor does not lose consumed stream bytes.
 - Add `streaming: true` for unknown/estimated-size inputs: dynamic chunk
   creation until EOF, a zero-byte `flowChunkIsLast` marker, bounded buffering,
   and pause/resume/retry/read-error handling. This removes the need for a
   fragile ciphertext-size estimate.
 - Retries are loops with abortable delays, not recursive `send()` calls.
 - Native `EventTarget` + `CustomEvent`; no global `EventTarget.prototype`
   patching.
 - Explicit `hooks` option (`filterFile`, `fileAdded`, `filesAdded`,
   `filesSubmitted`); no name-based hook/event dispatch.
 - Zero runtime dependencies. No Babel/core-js/regenerator in the distributed
   build.
 - Browser test suite expanded to 145 specs: adapted v3 tests, targeted
   regressions, transport/error edge cases, streaming/dynamic-size tests,
   seeded randomized stress/invariant checks, and real-network upload/retry
   tests. Chromium coverage: 97.4% statements / 86.7% branches; CI runs
   Chromium, Firefox and WebKit.

## Breaking changes

 - `flow.on/off/once` are removed. Use `addEventListener`,
   `removeEventListener` and `{once: true}`.
 - Event details are objects (`event.detail.file`, `event.detail.message`, ...)
   instead of arrays.
 - Hooks are configured through `hooks: { ... }` instead of `on('file-added')`.
 - `asyncReadFileFn` is removed. `readFileFn` is always awaited.
 - `FlowChunk.readFinished()` and `preprocessFinished()` are removed.
 - `Flow.uploadNextChunk()` is removed.
 - `addFile(s)` take `{event, initFileFn}` options instead of positional
   arguments.
 - `await flow.upload()` now waits for the session to settle.
 - A permanently failed file keeps its chunks instead of clearing them.

See [MIGRATION.md](MIGRATION.md) for the full mapping and examples.

# 2.0.0

## Features

 - All code follows Google javascript style guide
 - Target url can be provided with query string
 - Events **fileAdded** and **filesAdded** can prevent file from being added to $.files list by
 returning false. Custom validators can be ran here.
 - **ResumableFile.getType()** and **ResumableFile.getExtension()** helper methods added. Can be
 used for custom validation.
 - **fileProgress** and **progress** events are always asynchronous.
 - **ResumableFile.pause()** and **ResumableFile.resume()** methods for single file pausing and
 resuming.
 - **filesSubmitted** event added. Can be used to start file upload. Event is thrown then files are
 added to queue.
 - **progressCallbacksInterval** parameter added. Minimum interval between callbacks execution in
  milliseconds.
 - **averageSpeed** and **currentSpeed** parameters added for `ResumableFile`. These params
 accuracy can be adjusted with `speedSmoothingFactor` and `progressCallbacksInterval` parameters.
 - **timeRemaining** method added for `ResumableFile`. Returns remaining time to upload in seconds. Accuracy is based on average speed.
 - **sizeUploaded** method added for `ResumableFile`. Returns size uploaded in bytes.
 - **singleFile** parameter added. Then enabled, uploaded file will replace current one.

## Breaking Changes
 - **Resumable** was renamed to **Flow**
 - **ResumableFile.fileName** parameter renamed to **ResumableFile.name**
 - **Resumable.getOpt** method dropped, use Resumable.opts parameter instead if needed.
 - **Resumable.maxFiles**, **Resumable.minFileSize**, **Resumable.maxFileSize**,
 **Resumable.fileType** validators dropped. Use **fileAdded** and **filesAdded** events for
 custom validation.
 - **fileProgress** and **progress** events are not thrown on ResumableFile.abort() and ResumableFile.cancel() methods execution.
 - **cancel** event was removed. Event was always called after **Resumable.cancel()** function.
 - **fileAdded**, **filesAdded** events are thrown before file is added to upload queue. This means
 that calling **Resumable.upload()** method in these events will not start uploading current
 files. To start upload use **filesSubmitted** event instead.
 - **throttleProgressCallbacks** parameter was replaced with **progressCallbacksInterval** and it
  is now measured in milliseconds.
