/**
 * Promise wrapper for one XMLHttpRequest.
 *
 * This is the only place that listens to XHR events. Listeners resolve the
 * request promise; they never schedule work or call back into Flow.
 *
 * @param {Object} request
 * @param {string} request.method
 * @param {string} request.url
 * @param {Object} [request.headers]
 * @param {*} [request.body]
 * @param {boolean} [request.withCredentials]
 * @param {number} [request.timeout] milliseconds, 0 = no timeout
 * @param {Function} [request.onProgress]
 * @param {AbortSignal} [request.signal]
 * @returns {Promise<Object>} request result
 */
export function sendRequest({
  method,
  url,
  headers = {},
  body = null,
  withCredentials = false,
  timeout = 0,
  onProgress = null,
  signal = null
}) {
  return new Promise(resolve => {
    const xhr = new XMLHttpRequest();
    let settled = false;

    function cleanup() {
      xhr.removeEventListener('load', onLoad);
      xhr.removeEventListener('error', onError);
      xhr.removeEventListener('abort', onAbort);
      xhr.removeEventListener('timeout', onTimeout);
      if (onProgress && xhr.upload) {
        xhr.upload.removeEventListener('progress', onProgress);
      }
      if (signal) {
        signal.removeEventListener('abort', onSignalAbort);
      }
    }

    function done(result) {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      resolve(Object.assign({xhr}, result));
    }

    function onLoad() {
      done({ok: true, status: xhr.status, responseText: xhr.responseText});
    }

    function onError() {
      done({ok: false, status: 0, networkError: true, responseText: ''});
    }

    function onAbort() {
      done({ok: false, status: 0, aborted: true, responseText: ''});
    }

    function onTimeout() {
      done({ok: false, status: 0, timedOut: true, responseText: ''});
    }

    function onSignalAbort() {
      try { xhr.abort(); } catch (error) { onAbort(); }
    }

    xhr.addEventListener('load', onLoad);
    xhr.addEventListener('error', onError);
    xhr.addEventListener('abort', onAbort);
    xhr.addEventListener('timeout', onTimeout);
    if (onProgress && xhr.upload) {
      xhr.upload.addEventListener('progress', onProgress);
    }
    if (signal) {
      if (signal.aborted) {
        onAbort();
        return;
      }
      signal.addEventListener('abort', onSignalAbort, {once: true});
    }

    try {
      if (timeout) {
        xhr.timeout = timeout;
      }
      xhr.open(method, url, true);
      xhr.withCredentials = withCredentials;
      for (const name of Object.keys(headers || {})) {
        xhr.setRequestHeader(name, headers[name]);
      }
      xhr.send(body);
    } catch (error) {
      done({ok: false, status: 0, error});
    }
  });
}

/**
 * Exclusively for test purposes.
 */
var g = typeof window !== 'undefined' ? window
    : typeof global !== 'undefined' ? global
    : typeof self !== 'undefined' ? self : {};
g.FlowTransport = {sendRequest};
