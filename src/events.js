function events() {
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
   * @param {string} name event name
   * @param {...*} [args] arguments of a callback
   * @return {Object} value is false if at least one of the event handlers returned false.
   * Otherwise returned value will be true.
   */
  function fire(name, args) {
    var event = {
      name: name,
      preventDefault: function() {
        event.defaultPrevented = true;
      },
      defaultPrevented: false
    };
    if (events.hasOwnProperty(name)) {
      var callArgs = [event].concat(Array.prototype.slice.call(arguments, 1));
      each(events[name], function (callback) {
        callback.apply(null, callArgs);
      });
    }
    return event;
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
  return {
    on: on,
    off: off,
    fire: fire
  }
}