
/**
 * Extends the destination object `dst` by copying all of the properties from
 * the `src` object(s) to `dst`. You can specify multiple `src` objects.
 * @function
 * @param {Object} dst Destination object.
 * @param {...Object} src Source object(s).
 * @returns {Object} Reference to `dst`.
 */
function extend(dst, src) {
  each(arguments, function(obj) {
    if (obj !== dst) {
      each(obj, function(value, key){
        dst[key] = value;
      });
    }
  });
  return dst;
}

/**
 * Extends the destination object `dst` by copying all of the properties from
 * the `src` object(s) to `dst`. You can specify multiple `src` objects.
 * Deep extend follows `dst` object and only extends dst defined attributes.
 * @function
 * @param {Object} dst Destination object.
 * @param {...Object} src Source object(s).
 * @returns {Object} Reference to `dst`.
 */
function deepExtend(dst, src) {
  each(arguments, function(obj) {
    if (obj !== dst) {
      each(obj, function(value, key){
        if (dst[key] !== null && typeof dst[key] === 'object') {
          deepExtend(dst[key], value);
        } else {
          dst[key] = value;
        }
      });
    }
  });
  return dst;
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
 * Remove value from array
 * @param array
 * @param value
 */
function arrayRemove(array, value) {
  var index = array.indexOf(value);
  if (index > -1) {
    array.splice(index, 1);
  }
}

/**
 * A function that performs no operations.
 */
function noop() {}


/**
 * A function that returns first argument.
 */
function identity(i) {return i;}