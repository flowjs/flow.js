
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