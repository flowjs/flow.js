/**
 * A base-class (or a mixin) adding support for event-listener and dispatchers.
 */

/**
 * Hooks exist to allow users to alter flow.js file processing. This is intended for users relying on a dropzone and other higher-level components
 * when the flow between `addFiles()` and `upload()` is hardly configurable.
 * Users calling `await flow.asyncAddFiles()` have more room for customization before calling `upload();` without having to rely upon hooks.
 *
 * Hooks can *alter* the parameters they receive (javascript pass-by-reference rules will apply).
 * For example, `fileAdded` hook receive a `flowfile` parameter. `delete flowfile` or `flowfile = {}` has no effect
 *  becase parent function still hold reference. But `delete file.file` would remove the File() and is supported as a way to
 *  dequeue a file from a list after its initialization.
 */

const HOOKS = [
  'file-added',
  'files-added',
  'files-submitted',
];

/**
 * Additionally, some hooks are said filtering-hooks.
 * Code will consider the combined (OR-ed) return value of the callbacks to
 * decide whether or not keep processing this path/item.
 */
const FILTERING_HOOKS = [
  'filter-file'
];


/**
 * Events are recognized (case-sensitive) CustomEvent processed using dispatchEvent.
 * This is a list of those fire by Flow.js, but any name can be attached too.
 */
const EVENTS = [
  'complete',
  'error',
  'file-error',
  'file-progress',
  'file-removed',
  'file-retry',
  'file-success',
  'progress',
  'upload-start',
];

/**
 * This class:
 * - add EventListener support to an object.
 * - wrap EventListener attachment in order to ease their removal
 * - add the concept of processing hooks similar to native events (explained below) 
 *
 * The file is organized in three parts:
 * 1. isHook, isFilter, isEvent, on, off
 *    wrap the above concept and offer an unified interface. Whether a callback
 *    apply to a hook or an event is determined by its name (and the "async" nature of
 *    the callback).
 *
 * 2. Events: addEventListener, removeEventListener and *emit()*
 *    apply to addition/removal/dispatching of *events*.
 *
 * 3. Hooks: addHook, hasHook, removeHook apply to addition/removal of *hooks*.
 *    - *hook()* trigger the hook execution.
 *    - *aHook()* is the async counterpart.
 */

EventTarget.prototype._addEventListener = EventTarget.prototype.addEventListener;
EventTarget.prototype._removeEventListener = EventTarget.prototype.removeEventListener;

export default class extends EventTarget {

  /**
   * List of hooks or events:
   *  key stands for hook or event name
   *  value array list of callbacks
   *
   * Each key is check against an hardcoded to list to defined whether:
   * - it's a "native" CustomEvent (dispatched asynchronously dirsregarding its value)
   * - it's a known event (whether a "filter" or an "action", and in this case, whether
   *   each callback is asynchronous or not.
   * @type {}
   */
  constructor(hooks_events = {}) {
    super();

    this._events = {};
    this._hooks = {};
    this._asyncHooks = {};

    /**
     * Hooks and events are distinguished based on the name.
     * Anything not being a know hook is assumed an event
     */
    for (let [name, callbacks] of Object.entries(hooks_events)) {
      for (let callback of callbacks) {
        this.on(name, callback);
      }
    }
  }

  isHook(name) {
    return HOOKS.includes(name) || this.isFilter(name);
  }

  isFilter(name) {
    return FILTERING_HOOKS.includes(name);
  }

  isEvent(name) {
    return !this.isHook(name);
  }

  _camelToDashCase(str) {
      return str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
  }

  /**
   * A wrapper for addEventListener to alternatively add hooks or events.
   */
  on(event, callback, options) {
    var revent = this._camelToDashCase(event);
    if (revent != event) {
      console.warn('Flow.js v3: Do not rely on camel-case event semantic.');
      if (HOOKS.concat(FILTERING_HOOKS, EVENTS).includes(revent)) {
        event = revent;
        console.info(`Using "${revent}" instead.`);
      }
    }
    return this.isEvent(event)
      ? this.addEventListener(event, callback, options)
      : this.addHook(event, callback, options);
  }

  /**
   * A wrapper for addEventListener to alternatively add hooks or events.
   */
  once(event, callback, options) {
    return this.isEvent(event)
      ? this.addEventListener(event, callback, {...options, once: true})
      : console.warn('once() is not implemented for hooks.');
  }

  /**
   * A wrapper for removeEventListener to alternatively remove hooks or events.
   */
  off(event, callback, options) {
    if (this.isEvent(event) || !event) {
      console.log(`[event] Remove event listeners...`);
      this.removeEventListener(event, callback, options);
    }
    if (! this.isEvent(event) || !event) {
      console.log(`[event] Remove hooks...`);
      this.removeHook(event, callback, options);
    }
  }


  /**
   * A wrapper around native Target event listeners taken from:
   * https://github.com/alex2844/js-events
   *
   * Return an unbinder() callback, like https://github.com/ai/nanoevents
   *
   * @doc: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget
   */
  addEventListener(event, callback, options = false) {
    let _callback = callback,
        runUnbinder = () => {
          this.removeEventListener(event, callback, options);
          _callback.apply(this, arguments);
        },
        unbinder = () => {
          this.removeEventListener(event, callback, options);
        };

    if (options && options.once) {
      callback = runUnbinder;
    }

    this._addEventListener(event, callback, options);
    if (!this._events) {
      this._events = {};
      Object.defineProperty(this, '_events', { enumerable: false });
    }
    if (!this._events[event]) {
      this._events[event] = [];
    }

    this._events[event].push({
      listener: callback,
      useCapture: (((options === true) || (options.capture)) || false),
      passive: ((options && options.passive) || false),
      once: ((options && options.once) || false),
      type: event
    });

    return unbinder;
  }

  removeEventListener(event, callback = null, options = false) {
    // var callback = e => callback.call(this, ...e.detail);
    if (callback) {
      this._removeEventListener(event, callback, options);
    }

    if (! this._events || (event && !this._events[event])) {
      return;
    }

    if (! event || event === '*') {
      for (let name of Object.keys(this._events)) {
        console.log('[event] Removing all event listeners');
        this.removeEventListener(name);
      }
      return;
    }

    for (const [i, v] of this._events[event].entries()) {
      if ((!callback || v.listener == callback) && v.useCapture == options) {
        console.log(`[event] Removed one callback from "${event}"`);
	this._events[event].splice(i, 1);
        if (! callback) {
          this._removeEventListener(event, v.listener, v);
        } else {
	  break;
        }
      }
    }

    if (this._events[event].length == 0) {
      delete this._events[event];
    }
  }

  /**
   * A wrapper for dispatchEvent handling "catch-all"
   */
  async emit(name, ...args) {
    console.log(`[event] Fire native event "${name}"${args.length ? ' with ' + args.length + ' arguments' : ''}`);
    this.dispatchEvent(new CustomEvent(name, {detail: args}));
    if (name != 'catch-all') {
      this.emitCatchAll(name, ...args);
    }
  }

  async emitCatchAll(name, ...args) {
    this.dispatchEvent(new CustomEvent('catch-all', {detail: [name, ...args]}));
  }

  /**
   * ### HOOKS ###
   */
  addHook(event, callback, options) {
    var isAsync = callback.constructor.name === 'AsyncFunction',
        target = isAsync ? this._asyncHooks : this._hooks;
    if (!target.hasOwnProperty(event)) {
      target[event] = [];
    }
    target[event].push(callback);
  }

  hasHook(async, events) {
    events = typeof events === 'string' ? [events] : events || [];
    var target = async ? this._asyncHooks : this._hooks;
    for (let [k, v] of Object.entries(target)) {
      if (events.length > 0 && ! events.includes(k)) {
        continue;
      }
      if (v.length > 0) {
        return true;
      }
    }

    return false;
  }

  /**
   * Remove one of more hooks' callbacks.
   */
  removeHook(event, callback, options) {
    const arrayRemove = (array, value) => {
      var index = array.indexOf(value);
      if (index > -1) {
        array.splice(index, 1);
      }
    };

    if (event && event != '*') {
      if (callback) {
        var isAsync = callback.constructor.name === 'AsyncFunction',
            target = isAsync ? this._asyncHooks : this._hooks;
        if (target.hasOwnProperty(event)) {
          arrayRemove(target[event], callback);
        }
      } else {
        delete this._hooks[event];
        delete this._asyncHooks[event];
      }
    } else {
      this._hooks = {};
      this._asyncHooks = {};
    }
  }

  /**
   * Run a synchronous hook (action or filter).
   *
   * @param {string} event event name
   * @param {...} args arguments of a callback
   *
   * @return {bool} In the case of *filters*, indicates whether processing must continue.
   * @return null   In the case of *actions*.
   */
  hook(name, ...args) {
    let value,
        preventDefault = false,
        isFilter = this.isFilter(name),
        callbacks = this._hooks[name] || [];

    for (let callback of callbacks) {
      console.log(`[event] Fire hook "${name}"${args.length ? ' with ' + args.length + ' arguments' : ''}`);
      value = callback.apply(this, args);
      if (name === 'file-added' && value === false) {
        console.warn('In Flow.js 3.x, file-added event is an action rather than a fitler. return value is ignored but removing the `file` property allows to skip an enqueued file.');
      }

      if (isFilter) {
        // console.log(`[filter-event] ${event} returned:`, item.value);
        preventDefault |= (value === false);
      } else {
        // Changes happen by reference. We ignore iterator.next().value.
      }
    }

    this.emitCatchAll(name, ...args);
    return isFilter ? !preventDefault : null;
  }

  /**
   * Run an asynchronous hook (action or filter).
   *
   * @param {string} event event name
   * @param {...} args arguments of a callback
   *
   * @return {bool} In the case of *filters*, indicates whether processing must continue.
   * @return {mixed} In the case of *actions*: The first argument (possibly modified by hooks).
   */
  async aHook(name, ...args) {
    let calls = this._asyncHooks[name] || [],
        isFilter = this.isFilter(name);

    if (! calls.length) {
      return isFilter ? true : args[0];
    }

    console.log(`[event] Fire ${calls.length} async hook for "${name}"${args.length ? ' with ' + args.length + ' arguments' : ''}`);
    var returns = await Promise.all(calls.map(e => e.apply(this, args)));

    this.emitCatchAll(name, ...args);
    return isFilter ? returns.include(false) : returns;
  }
}
