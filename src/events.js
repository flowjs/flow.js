var events = {};
/**
 * Set a callback for an event
 * @function
 * @param {string} event
 * @param {Function} callback
 */
function on(event, callback) {
  if (!events.hasOwnProperty(event)) {
    events[event] = [];
  }
  events[event].push(callback);
}

/**
 * Fire an event
 * @function
 * @param {string} event event name
 * @param {...} [args] arguments of a callback
 * @return {bool} value is false if at least one of the event handlers returned false.
 * Otherwise returned value will be true.
 */
function fire(event, args) {
  // in firefox `arguments` is an object, not array
  args = Array.prototype.slice.call(arguments, 1);
  var preventDefault = false;
  if (events.hasOwnProperty(event)) {
    each(events[event], function (callback) {
      preventDefault = callback.apply(null, args) === false || preventDefault;
    });
  }
  return !preventDefault;
}

/**
 * Remove event callback
 * @function
 * @param {string} [event] removes all events if not specified
 * @param {Function} [fn] removes all callbacks of event if not specified
 */
function off(event, fn) {
  if (event !== undefined) {
    if (fn !== undefined) {
      if (events.hasOwnProperty(event)) {
        arrayRemove(events[event], fn);
      }
    } else {
      delete events[event];
    }
  } else {
    events = {};
  }
}