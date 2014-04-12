/**
 *  @param {object} config Object describing the request to be made and how it should be
 *    processed. The object has following properties:
 *
 *    - **method** – `{string}` – HTTP method (e.g. 'GET', 'POST', etc)
 *    - **url** – `{string}` – Absolute or relative URL of the resource that is being requested.
 *    - **params** – `{Object.<string|Object>}` – Map of strings or objects which will be turned
 *      to `?key1=value1&key2=value2` after the url.
 *    - **data** – `{string|Object}` – Data to be sent as the request message data.
 *    - **headers** – `{Object}` – Map of strings representing HTTP headers to send to the server.
 *    - **timeout** – `{number}` – timeout in milliseconds
 *    - **withCredentials** - `{boolean}` - whether to to set the `withCredentials` flag on the
 *      XHR object. See [requests with credentials]https://developer.mozilla.org/en/http_access_control#section_5 for more information.
 *    - **responseType** - `{string}` - see
 *      [requestType](https://developer.mozilla.org/en-US/docs/DOM/XMLHttpRequest#responseType).
 *
 *    - **responseType** - `{string}` - see
 */
function http(config) {
  config = extend({
    method: 'GET',
    data: null,
    onProgress: noop,
    onComplete: noop
  }, config);
  config.headers = extend({'Accept': 'application/json, text/plain, */*'}, config.headers);

  var url = buildUrl(config.url, config.params);

  var method = config.method.toUpperCase();

  var xhr = new XMLHttpRequest();
  xhr.open(method, url);

  each(config.headers, function (value, key) {
    xhr.setRequestHeader(key, value);
  });

  if (config.withCredentials) {
    xhr.withCredentials = true;
  }

  xhr.onreadystatechange = function () {
    // onreadystatechange might get called multiple times with readyState === 4 on mobile webkit caused by
    // xhrs that are resolved while the app is in the background (see #5426).
    if (xhr && xhr.readyState == 4) {
      var response = xhr.response;
      var status = xhr.status;
      // fix status code when it is 0 (0 status is undocumented).
      // Occurs when accessing file resources.
      // On Android 4.1 stock browser it occurs while retrieving files from application cache.
      if (status === 0 && response) {
        status = 200;
      }
      config.onComplete({
        status: status,
        response: response,
        xhr: xhr
      });
      xhr = null;
    }
  };

  xhr.upload.addEventListener('progress', function (event) {
    if (event.lengthComputable) {
      config.onProgress(event.loaded, event.total, event, xhr);
    }
  }, false);
  xhr.send(config.data);

  return {
    xhr: xhr
  };
}

function buildUrl(url, query) {
  if (!query) {
    return url;
  }
  var params = [];
  each(query, function (v, k) {
    params.push([encodeUriQuery(k), encodeUriQuery(v)].join('='));
  });
  if(url.indexOf('?') < 0) {
    url += '?';
  } else {
    url += '&';
  }
  return url + params.join('&');
}

function encodeUriQuery(val) {
  return encodeURIComponent(val).
    replace(/%40/gi, '@').
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']').
    replace(/%20/g, '+');
}