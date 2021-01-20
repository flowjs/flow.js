/**
 * Default read function using the webAPI
 *
 * @function webAPIFileRead(fileObj, startByte, endByte, fileType, chunk)
 *
 */
function webAPIFileRead(fileObj, startByte, endByte, fileType, chunk) {
  var function_name = 'slice';

  if (fileObj.file.slice)
    function_name =  'slice';
  else if (fileObj.file.mozSlice)
    function_name = 'mozSlice';
  else if (fileObj.file.webkitSlice)
    function_name = 'webkitSlice';

  chunk.readFinished(fileObj.file[function_name](startByte, endByte, fileType));
}

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

export {
  each,
  evalOpts,
  webAPIFileRead
};
