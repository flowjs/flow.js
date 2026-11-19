/**
 * If option is a function, evaluate it with given params
 * @param {*} data
 * @param {...} args arguments of a callback
 * @returns {*}
 */
function evalOpts(data, args) {
  if (typeof data === "function") {
    // `arguments` is an object, not array, in FF, so:
    args = Array.prototype.slice.call(arguments);
    data = data.apply(null, args.slice(1));
  }
  return data;
}

/**
 * Iterate each element of an object
 * @function
 * @param {Array|Object} obj object or an array to iterate
 * @param {Function} callback first argument is a value and second is a key.
 * @param {Object=} context Object to become context (`this`) for the iterator function.
 */
function each(obj, callback, context) {
  if (!obj) {
    return ;
  }
  var key;
  // Is Array?
  // Array.isArray won't work, not only arrays can be iterated by index https://github.com/flowjs/ng-flow/issues/236#
  if (typeof(obj.length) !== 'undefined') {
    for (key = 0; key < obj.length; key++) {
      if (callback.call(context, obj[key], key) === false) {
        return ;
      }
    }
  } else {
    for (key in obj) {
      if (obj.hasOwnProperty(key) && callback.call(context, obj[key], key) === false) {
        return ;
      }
    }
  }
}

/**
 * Exclusively for test purposes
 * (Until Grunt+Karma+Jasmine can allow test to use (ES) `import` of tools.js)
 */
var g = typeof window !== 'undefined' ? window
    : typeof global !== 'undefined' ? global
    : typeof self !== 'undefined' ? self : {};
g.evalOpts = evalOpts;
g.FlowTools = {abortableSleep, each, evalOpts, sleep};


/**
 * Resolve after `milliseconds`, or as soon as `signal` aborts.
 * @param {number} milliseconds
 * @param {AbortSignal} [signal]
 * @returns {Promise<void>}
 */
function abortableSleep(milliseconds, signal) {
  if (!milliseconds || milliseconds <= 0) {
    return Promise.resolve();
  }
  return new Promise(resolve => {
    let timer = setTimeout(finish, milliseconds);
    function finish() {
      clearTimeout(timer);
      if (signal) {
        signal.removeEventListener('abort', finish);
      }
      resolve();
    }
    if (signal) {
      if (signal.aborted) {
        finish();
        return;
      }
      signal.addEventListener('abort', finish, {once: true});
    }
  });
}

/**
 * Plain delay, mostly useful for tests and custom readers.
 * @param {number} milliseconds
 * @returns {Promise<void>}
 */
function sleep(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

export {
  abortableSleep,
  each,
  evalOpts,
  sleep
};
