(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Flow = factory());
}(this, (function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
      var info = gen[key](arg);
      var value = info.value;
    } catch (error) {
      reject(error);
      return;
    }

    if (info.done) {
      resolve(value);
    } else {
      Promise.resolve(value).then(_next, _throw);
    }
  }

  function _asyncToGenerator(fn) {
    return function () {
      var self = this,
          args = arguments;
      return new Promise(function (resolve, reject) {
        var gen = fn.apply(self, args);

        function _next(value) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
        }

        function _throw(err) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
        }

        _next(undefined);
      });
    };
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      if (enumerableOnly) symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
      keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};

      if (i % 2) {
        ownKeys(Object(source), true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(Object(source)).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }

    return target;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function _isNativeReflectConstruct() {
    if (typeof Reflect === "undefined" || !Reflect.construct) return false;
    if (Reflect.construct.sham) return false;
    if (typeof Proxy === "function") return true;

    try {
      Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
      return true;
    } catch (e) {
      return false;
    }
  }

  function _construct(Parent, args, Class) {
    if (_isNativeReflectConstruct()) {
      _construct = Reflect.construct;
    } else {
      _construct = function _construct(Parent, args, Class) {
        var a = [null];
        a.push.apply(a, args);
        var Constructor = Function.bind.apply(Parent, a);
        var instance = new Constructor();
        if (Class) _setPrototypeOf(instance, Class.prototype);
        return instance;
      };
    }

    return _construct.apply(null, arguments);
  }

  function _isNativeFunction(fn) {
    return Function.toString.call(fn).indexOf("[native code]") !== -1;
  }

  function _wrapNativeSuper(Class) {
    var _cache = typeof Map === "function" ? new Map() : undefined;

    _wrapNativeSuper = function _wrapNativeSuper(Class) {
      if (Class === null || !_isNativeFunction(Class)) return Class;

      if (typeof Class !== "function") {
        throw new TypeError("Super expression must either be null or a function");
      }

      if (typeof _cache !== "undefined") {
        if (_cache.has(Class)) return _cache.get(Class);

        _cache.set(Class, Wrapper);
      }

      function Wrapper() {
        return _construct(Class, arguments, _getPrototypeOf(this).constructor);
      }

      Wrapper.prototype = Object.create(Class.prototype, {
        constructor: {
          value: Wrapper,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
      return _setPrototypeOf(Wrapper, Class);
    };

    return _wrapNativeSuper(Class);
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _possibleConstructorReturn(self, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    }

    return _assertThisInitialized(self);
  }

  function _createSuper(Derived) {
    var hasNativeReflectConstruct = _isNativeReflectConstruct();

    return function _createSuperInternal() {
      var Super = _getPrototypeOf(Derived),
          result;

      if (hasNativeReflectConstruct) {
        var NewTarget = _getPrototypeOf(this).constructor;

        result = Reflect.construct(Super, arguments, NewTarget);
      } else {
        result = Super.apply(this, arguments);
      }

      return _possibleConstructorReturn(this, result);
    };
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArrayLimit(arr, i) {
    if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  function _createForOfIteratorHelper(o, allowArrayLike) {
    var it;

    if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) {
      if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
        if (it) o = it;
        var i = 0;

        var F = function () {};

        return {
          s: F,
          n: function () {
            if (i >= o.length) return {
              done: true
            };
            return {
              done: false,
              value: o[i++]
            };
          },
          e: function (e) {
            throw e;
          },
          f: F
        };
      }

      throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }

    var normalCompletion = true,
        didErr = false,
        err;
    return {
      s: function () {
        it = o[Symbol.iterator]();
      },
      n: function () {
        var step = it.next();
        normalCompletion = step.done;
        return step;
      },
      e: function (e) {
        didErr = true;
        err = e;
      },
      f: function () {
        try {
          if (!normalCompletion && it.return != null) it.return();
        } finally {
          if (didErr) throw err;
        }
      }
    };
  }

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function createCommonjsModule(fn) {
    var module = { exports: {} };
  	return fn(module, module.exports), module.exports;
  }

  var check = function check(it) {
    return it && it.Math == Math && it;
  }; // https://github.com/zloirock/core-js/issues/86#issuecomment-115759028


  var global$1 = // eslint-disable-next-line no-undef
  check((typeof globalThis === "undefined" ? "undefined" : _typeof(globalThis)) == 'object' && globalThis) || check((typeof window === "undefined" ? "undefined" : _typeof(window)) == 'object' && window) || check((typeof self === "undefined" ? "undefined" : _typeof(self)) == 'object' && self) || check(_typeof(commonjsGlobal) == 'object' && commonjsGlobal) || // eslint-disable-next-line no-new-func
  function () {
    return this;
  }() || Function('return this')();

  var fails = function fails(exec) {
    try {
      return !!exec();
    } catch (error) {
      return true;
    }
  };

  var descriptors = !fails(function () {
    return Object.defineProperty({}, 1, {
      get: function get() {
        return 7;
      }
    })[1] != 7;
  });

  var nativePropertyIsEnumerable = {}.propertyIsEnumerable;
  var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor; // Nashorn ~ JDK8 bug

  var NASHORN_BUG = getOwnPropertyDescriptor && !nativePropertyIsEnumerable.call({
    1: 2
  }, 1); // `Object.prototype.propertyIsEnumerable` method implementation
  // https://tc39.es/ecma262/#sec-object.prototype.propertyisenumerable

  var f = NASHORN_BUG ? function propertyIsEnumerable(V) {
    var descriptor = getOwnPropertyDescriptor(this, V);
    return !!descriptor && descriptor.enumerable;
  } : nativePropertyIsEnumerable;
  var objectPropertyIsEnumerable = {
    f: f
  };

  var createPropertyDescriptor = function createPropertyDescriptor(bitmap, value) {
    return {
      enumerable: !(bitmap & 1),
      configurable: !(bitmap & 2),
      writable: !(bitmap & 4),
      value: value
    };
  };

  var toString = {}.toString;

  var classofRaw = function classofRaw(it) {
    return toString.call(it).slice(8, -1);
  };

  var split = ''.split; // fallback for non-array-like ES3 and non-enumerable old V8 strings

  var indexedObject = fails(function () {
    // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
    // eslint-disable-next-line no-prototype-builtins
    return !Object('z').propertyIsEnumerable(0);
  }) ? function (it) {
    return classofRaw(it) == 'String' ? split.call(it, '') : Object(it);
  } : Object;

  // `RequireObjectCoercible` abstract operation
  // https://tc39.es/ecma262/#sec-requireobjectcoercible
  var requireObjectCoercible = function requireObjectCoercible(it) {
    if (it == undefined) throw TypeError("Can't call method on " + it);
    return it;
  };

  var toIndexedObject = function toIndexedObject(it) {
    return indexedObject(requireObjectCoercible(it));
  };

  var isObject = function isObject(it) {
    return _typeof(it) === 'object' ? it !== null : typeof it === 'function';
  };

  // https://tc39.es/ecma262/#sec-toprimitive
  // instead of the ES6 spec version, we didn't implement @@toPrimitive case
  // and the second argument - flag - preferred type is a string

  var toPrimitive = function toPrimitive(input, PREFERRED_STRING) {
    if (!isObject(input)) return input;
    var fn, val;
    if (PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) return val;
    if (typeof (fn = input.valueOf) == 'function' && !isObject(val = fn.call(input))) return val;
    if (!PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) return val;
    throw TypeError("Can't convert object to primitive value");
  };

  var hasOwnProperty = {}.hasOwnProperty;

  var has = function has(it, key) {
    return hasOwnProperty.call(it, key);
  };

  var document$1 = global$1.document; // typeof document.createElement is 'object' in old IE

  var EXISTS = isObject(document$1) && isObject(document$1.createElement);

  var documentCreateElement = function documentCreateElement(it) {
    return EXISTS ? document$1.createElement(it) : {};
  };

  var ie8DomDefine = !descriptors && !fails(function () {
    return Object.defineProperty(documentCreateElement('div'), 'a', {
      get: function get() {
        return 7;
      }
    }).a != 7;
  });

  var nativeGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor; // `Object.getOwnPropertyDescriptor` method
  // https://tc39.es/ecma262/#sec-object.getownpropertydescriptor

  var f$1 = descriptors ? nativeGetOwnPropertyDescriptor : function getOwnPropertyDescriptor(O, P) {
    O = toIndexedObject(O);
    P = toPrimitive(P, true);
    if (ie8DomDefine) try {
      return nativeGetOwnPropertyDescriptor(O, P);
    } catch (error) {
      /* empty */
    }
    if (has(O, P)) return createPropertyDescriptor(!objectPropertyIsEnumerable.f.call(O, P), O[P]);
  };
  var objectGetOwnPropertyDescriptor = {
    f: f$1
  };

  var anObject = function anObject(it) {
    if (!isObject(it)) {
      throw TypeError(String(it) + ' is not an object');
    }

    return it;
  };

  var nativeDefineProperty = Object.defineProperty; // `Object.defineProperty` method
  // https://tc39.es/ecma262/#sec-object.defineproperty

  var f$2 = descriptors ? nativeDefineProperty : function defineProperty(O, P, Attributes) {
    anObject(O);
    P = toPrimitive(P, true);
    anObject(Attributes);
    if (ie8DomDefine) try {
      return nativeDefineProperty(O, P, Attributes);
    } catch (error) {
      /* empty */
    }
    if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported');
    if ('value' in Attributes) O[P] = Attributes.value;
    return O;
  };
  var objectDefineProperty = {
    f: f$2
  };

  var createNonEnumerableProperty = descriptors ? function (object, key, value) {
    return objectDefineProperty.f(object, key, createPropertyDescriptor(1, value));
  } : function (object, key, value) {
    object[key] = value;
    return object;
  };

  var setGlobal = function setGlobal(key, value) {
    try {
      createNonEnumerableProperty(global$1, key, value);
    } catch (error) {
      global$1[key] = value;
    }

    return value;
  };

  var SHARED = '__core-js_shared__';
  var store = global$1[SHARED] || setGlobal(SHARED, {});
  var sharedStore = store;

  var functionToString = Function.toString; // this helper broken in `3.4.1-3.4.4`, so we can't use `shared` helper

  if (typeof sharedStore.inspectSource != 'function') {
    sharedStore.inspectSource = function (it) {
      return functionToString.call(it);
    };
  }

  var inspectSource = sharedStore.inspectSource;

  var WeakMap = global$1.WeakMap;
  var nativeWeakMap = typeof WeakMap === 'function' && /native code/.test(inspectSource(WeakMap));

  var shared = createCommonjsModule(function (module) {
    (module.exports = function (key, value) {
      return sharedStore[key] || (sharedStore[key] = value !== undefined ? value : {});
    })('versions', []).push({
      version: '3.8.3',
      mode:  'global',
      copyright: '© 2021 Denis Pushkarev (zloirock.ru)'
    });
  });

  var id = 0;
  var postfix = Math.random();

  var uid = function uid(key) {
    return 'Symbol(' + String(key === undefined ? '' : key) + ')_' + (++id + postfix).toString(36);
  };

  var keys = shared('keys');

  var sharedKey = function sharedKey(key) {
    return keys[key] || (keys[key] = uid(key));
  };

  var hiddenKeys = {};

  var WeakMap$1 = global$1.WeakMap;
  var set, get, has$1;

  var enforce = function enforce(it) {
    return has$1(it) ? get(it) : set(it, {});
  };

  var getterFor = function getterFor(TYPE) {
    return function (it) {
      var state;

      if (!isObject(it) || (state = get(it)).type !== TYPE) {
        throw TypeError('Incompatible receiver, ' + TYPE + ' required');
      }

      return state;
    };
  };

  if (nativeWeakMap) {
    var store$1 = sharedStore.state || (sharedStore.state = new WeakMap$1());
    var wmget = store$1.get;
    var wmhas = store$1.has;
    var wmset = store$1.set;

    set = function set(it, metadata) {
      metadata.facade = it;
      wmset.call(store$1, it, metadata);
      return metadata;
    };

    get = function get(it) {
      return wmget.call(store$1, it) || {};
    };

    has$1 = function has(it) {
      return wmhas.call(store$1, it);
    };
  } else {
    var STATE = sharedKey('state');
    hiddenKeys[STATE] = true;

    set = function set(it, metadata) {
      metadata.facade = it;
      createNonEnumerableProperty(it, STATE, metadata);
      return metadata;
    };

    get = function get(it) {
      return has(it, STATE) ? it[STATE] : {};
    };

    has$1 = function has$1(it) {
      return has(it, STATE);
    };
  }

  var internalState = {
    set: set,
    get: get,
    has: has$1,
    enforce: enforce,
    getterFor: getterFor
  };

  var redefine = createCommonjsModule(function (module) {
    var getInternalState = internalState.get;
    var enforceInternalState = internalState.enforce;
    var TEMPLATE = String(String).split('String');
    (module.exports = function (O, key, value, options) {
      var unsafe = options ? !!options.unsafe : false;
      var simple = options ? !!options.enumerable : false;
      var noTargetGet = options ? !!options.noTargetGet : false;
      var state;

      if (typeof value == 'function') {
        if (typeof key == 'string' && !has(value, 'name')) {
          createNonEnumerableProperty(value, 'name', key);
        }

        state = enforceInternalState(value);

        if (!state.source) {
          state.source = TEMPLATE.join(typeof key == 'string' ? key : '');
        }
      }

      if (O === global$1) {
        if (simple) O[key] = value;else setGlobal(key, value);
        return;
      } else if (!unsafe) {
        delete O[key];
      } else if (!noTargetGet && O[key]) {
        simple = true;
      }

      if (simple) O[key] = value;else createNonEnumerableProperty(O, key, value); // add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
    })(Function.prototype, 'toString', function toString() {
      return typeof this == 'function' && getInternalState(this).source || inspectSource(this);
    });
  });

  var path = global$1;

  var aFunction = function aFunction(variable) {
    return typeof variable == 'function' ? variable : undefined;
  };

  var getBuiltIn = function getBuiltIn(namespace, method) {
    return arguments.length < 2 ? aFunction(path[namespace]) || aFunction(global$1[namespace]) : path[namespace] && path[namespace][method] || global$1[namespace] && global$1[namespace][method];
  };

  var ceil = Math.ceil;
  var floor = Math.floor; // `ToInteger` abstract operation
  // https://tc39.es/ecma262/#sec-tointeger

  var toInteger = function toInteger(argument) {
    return isNaN(argument = +argument) ? 0 : (argument > 0 ? floor : ceil)(argument);
  };

  var min = Math.min; // `ToLength` abstract operation
  // https://tc39.es/ecma262/#sec-tolength

  var toLength = function toLength(argument) {
    return argument > 0 ? min(toInteger(argument), 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
  };

  var max = Math.max;
  var min$1 = Math.min; // Helper for a popular repeating case of the spec:
  // Let integer be ? ToInteger(index).
  // If integer < 0, let result be max((length + integer), 0); else let result be min(integer, length).

  var toAbsoluteIndex = function toAbsoluteIndex(index, length) {
    var integer = toInteger(index);
    return integer < 0 ? max(integer + length, 0) : min$1(integer, length);
  };

  var createMethod = function createMethod(IS_INCLUDES) {
    return function ($this, el, fromIndex) {
      var O = toIndexedObject($this);
      var length = toLength(O.length);
      var index = toAbsoluteIndex(fromIndex, length);
      var value; // Array#includes uses SameValueZero equality algorithm
      // eslint-disable-next-line no-self-compare

      if (IS_INCLUDES && el != el) while (length > index) {
        value = O[index++]; // eslint-disable-next-line no-self-compare

        if (value != value) return true; // Array#indexOf ignores holes, Array#includes - not
      } else for (; length > index; index++) {
        if ((IS_INCLUDES || index in O) && O[index] === el) return IS_INCLUDES || index || 0;
      }
      return !IS_INCLUDES && -1;
    };
  };

  var arrayIncludes = {
    // `Array.prototype.includes` method
    // https://tc39.es/ecma262/#sec-array.prototype.includes
    includes: createMethod(true),
    // `Array.prototype.indexOf` method
    // https://tc39.es/ecma262/#sec-array.prototype.indexof
    indexOf: createMethod(false)
  };

  var indexOf = arrayIncludes.indexOf;

  var objectKeysInternal = function objectKeysInternal(object, names) {
    var O = toIndexedObject(object);
    var i = 0;
    var result = [];
    var key;

    for (key in O) {
      !has(hiddenKeys, key) && has(O, key) && result.push(key);
    } // Don't enum bug & hidden keys


    while (names.length > i) {
      if (has(O, key = names[i++])) {
        ~indexOf(result, key) || result.push(key);
      }
    }

    return result;
  };

  // IE8- don't enum bug keys
  var enumBugKeys = ['constructor', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString', 'toString', 'valueOf'];

  var hiddenKeys$1 = enumBugKeys.concat('length', 'prototype'); // `Object.getOwnPropertyNames` method
  // https://tc39.es/ecma262/#sec-object.getownpropertynames

  var f$3 = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
    return objectKeysInternal(O, hiddenKeys$1);
  };

  var objectGetOwnPropertyNames = {
    f: f$3
  };

  var f$4 = Object.getOwnPropertySymbols;
  var objectGetOwnPropertySymbols = {
    f: f$4
  };

  var ownKeys$1 = getBuiltIn('Reflect', 'ownKeys') || function ownKeys(it) {
    var keys = objectGetOwnPropertyNames.f(anObject(it));
    var getOwnPropertySymbols = objectGetOwnPropertySymbols.f;
    return getOwnPropertySymbols ? keys.concat(getOwnPropertySymbols(it)) : keys;
  };

  var copyConstructorProperties = function copyConstructorProperties(target, source) {
    var keys = ownKeys$1(source);
    var defineProperty = objectDefineProperty.f;
    var getOwnPropertyDescriptor = objectGetOwnPropertyDescriptor.f;

    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      if (!has(target, key)) defineProperty(target, key, getOwnPropertyDescriptor(source, key));
    }
  };

  var replacement = /#|\.prototype\./;

  var isForced = function isForced(feature, detection) {
    var value = data[normalize(feature)];
    return value == POLYFILL ? true : value == NATIVE ? false : typeof detection == 'function' ? fails(detection) : !!detection;
  };

  var normalize = isForced.normalize = function (string) {
    return String(string).replace(replacement, '.').toLowerCase();
  };

  var data = isForced.data = {};
  var NATIVE = isForced.NATIVE = 'N';
  var POLYFILL = isForced.POLYFILL = 'P';
  var isForced_1 = isForced;

  var getOwnPropertyDescriptor$1 = objectGetOwnPropertyDescriptor.f;
  /*
    options.target      - name of the target object
    options.global      - target is the global object
    options.stat        - export as static methods of target
    options.proto       - export as prototype methods of target
    options.real        - real prototype method for the `pure` version
    options.forced      - export even if the native feature is available
    options.bind        - bind methods to the target, required for the `pure` version
    options.wrap        - wrap constructors to preventing global pollution, required for the `pure` version
    options.unsafe      - use the simple assignment of property instead of delete + defineProperty
    options.sham        - add a flag to not completely full polyfills
    options.enumerable  - export as enumerable property
    options.noTargetGet - prevent calling a getter on target
  */

  var _export = function _export(options, source) {
    var TARGET = options.target;
    var GLOBAL = options.global;
    var STATIC = options.stat;
    var FORCED, target, key, targetProperty, sourceProperty, descriptor;

    if (GLOBAL) {
      target = global$1;
    } else if (STATIC) {
      target = global$1[TARGET] || setGlobal(TARGET, {});
    } else {
      target = (global$1[TARGET] || {}).prototype;
    }

    if (target) for (key in source) {
      sourceProperty = source[key];

      if (options.noTargetGet) {
        descriptor = getOwnPropertyDescriptor$1(target, key);
        targetProperty = descriptor && descriptor.value;
      } else targetProperty = target[key];

      FORCED = isForced_1(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced); // contained in target

      if (!FORCED && targetProperty !== undefined) {
        if (_typeof(sourceProperty) === _typeof(targetProperty)) continue;
        copyConstructorProperties(sourceProperty, targetProperty);
      } // add a flag to not completely full polyfills


      if (options.sham || targetProperty && targetProperty.sham) {
        createNonEnumerableProperty(sourceProperty, 'sham', true);
      } // extend global


      redefine(target, key, sourceProperty, options);
    }
  };

  // https://tc39.es/ecma262/#sec-isarray

  var isArray = Array.isArray || function isArray(arg) {
    return classofRaw(arg) == 'Array';
  };

  // https://tc39.es/ecma262/#sec-toobject

  var toObject = function toObject(argument) {
    return Object(requireObjectCoercible(argument));
  };

  var createProperty = function createProperty(object, key, value) {
    var propertyKey = toPrimitive(key);
    if (propertyKey in object) objectDefineProperty.f(object, propertyKey, createPropertyDescriptor(0, value));else object[propertyKey] = value;
  };

  var nativeSymbol = !!Object.getOwnPropertySymbols && !fails(function () {
    // Chrome 38 Symbol has incorrect toString conversion
    // eslint-disable-next-line no-undef
    return !String(Symbol());
  });

  var useSymbolAsUid = nativeSymbol // eslint-disable-next-line no-undef
  && !Symbol.sham // eslint-disable-next-line no-undef
  && _typeof(Symbol.iterator) == 'symbol';

  var WellKnownSymbolsStore = shared('wks');
  var _Symbol = global$1.Symbol;
  var createWellKnownSymbol = useSymbolAsUid ? _Symbol : _Symbol && _Symbol.withoutSetter || uid;

  var wellKnownSymbol = function wellKnownSymbol(name) {
    if (!has(WellKnownSymbolsStore, name)) {
      if (nativeSymbol && has(_Symbol, name)) WellKnownSymbolsStore[name] = _Symbol[name];else WellKnownSymbolsStore[name] = createWellKnownSymbol('Symbol.' + name);
    }

    return WellKnownSymbolsStore[name];
  };

  var SPECIES = wellKnownSymbol('species'); // `ArraySpeciesCreate` abstract operation
  // https://tc39.es/ecma262/#sec-arrayspeciescreate

  var arraySpeciesCreate = function arraySpeciesCreate(originalArray, length) {
    var C;

    if (isArray(originalArray)) {
      C = originalArray.constructor; // cross-realm fallback

      if (typeof C == 'function' && (C === Array || isArray(C.prototype))) C = undefined;else if (isObject(C)) {
        C = C[SPECIES];
        if (C === null) C = undefined;
      }
    }

    return new (C === undefined ? Array : C)(length === 0 ? 0 : length);
  };

  var engineUserAgent = getBuiltIn('navigator', 'userAgent') || '';

  var process = global$1.process;
  var versions = process && process.versions;
  var v8 = versions && versions.v8;
  var match, version;

  if (v8) {
    match = v8.split('.');
    version = match[0] + match[1];
  } else if (engineUserAgent) {
    match = engineUserAgent.match(/Edge\/(\d+)/);

    if (!match || match[1] >= 74) {
      match = engineUserAgent.match(/Chrome\/(\d+)/);
      if (match) version = match[1];
    }
  }

  var engineV8Version = version && +version;

  var SPECIES$1 = wellKnownSymbol('species');

  var arrayMethodHasSpeciesSupport = function arrayMethodHasSpeciesSupport(METHOD_NAME) {
    // We can't use this feature detection in V8 since it causes
    // deoptimization and serious performance degradation
    // https://github.com/zloirock/core-js/issues/677
    return engineV8Version >= 51 || !fails(function () {
      var array = [];
      var constructor = array.constructor = {};

      constructor[SPECIES$1] = function () {
        return {
          foo: 1
        };
      };

      return array[METHOD_NAME](Boolean).foo !== 1;
    });
  };

  var IS_CONCAT_SPREADABLE = wellKnownSymbol('isConcatSpreadable');
  var MAX_SAFE_INTEGER = 0x1FFFFFFFFFFFFF;
  var MAXIMUM_ALLOWED_INDEX_EXCEEDED = 'Maximum allowed index exceeded'; // We can't use this feature detection in V8 since it causes
  // deoptimization and serious performance degradation
  // https://github.com/zloirock/core-js/issues/679

  var IS_CONCAT_SPREADABLE_SUPPORT = engineV8Version >= 51 || !fails(function () {
    var array = [];
    array[IS_CONCAT_SPREADABLE] = false;
    return array.concat()[0] !== array;
  });
  var SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('concat');

  var isConcatSpreadable = function isConcatSpreadable(O) {
    if (!isObject(O)) return false;
    var spreadable = O[IS_CONCAT_SPREADABLE];
    return spreadable !== undefined ? !!spreadable : isArray(O);
  };

  var FORCED = !IS_CONCAT_SPREADABLE_SUPPORT || !SPECIES_SUPPORT; // `Array.prototype.concat` method
  // https://tc39.es/ecma262/#sec-array.prototype.concat
  // with adding support of @@isConcatSpreadable and @@species

  _export({
    target: 'Array',
    proto: true,
    forced: FORCED
  }, {
    concat: function concat(arg) {
      // eslint-disable-line no-unused-vars
      var O = toObject(this);
      var A = arraySpeciesCreate(O, 0);
      var n = 0;
      var i, k, length, len, E;

      for (i = -1, length = arguments.length; i < length; i++) {
        E = i === -1 ? O : arguments[i];

        if (isConcatSpreadable(E)) {
          len = toLength(E.length);
          if (n + len > MAX_SAFE_INTEGER) throw TypeError(MAXIMUM_ALLOWED_INDEX_EXCEEDED);

          for (k = 0; k < len; k++, n++) {
            if (k in E) createProperty(A, n, E[k]);
          }
        } else {
          if (n >= MAX_SAFE_INTEGER) throw TypeError(MAXIMUM_ALLOWED_INDEX_EXCEEDED);
          createProperty(A, n++, E);
        }
      }

      A.length = n;
      return A;
    }
  });

  var aFunction$1 = function aFunction(it) {
    if (typeof it != 'function') {
      throw TypeError(String(it) + ' is not a function');
    }

    return it;
  };

  var functionBindContext = function functionBindContext(fn, that, length) {
    aFunction$1(fn);
    if (that === undefined) return fn;

    switch (length) {
      case 0:
        return function () {
          return fn.call(that);
        };

      case 1:
        return function (a) {
          return fn.call(that, a);
        };

      case 2:
        return function (a, b) {
          return fn.call(that, a, b);
        };

      case 3:
        return function (a, b, c) {
          return fn.call(that, a, b, c);
        };
    }

    return function ()
    /* ...args */
    {
      return fn.apply(that, arguments);
    };
  };

  var push = [].push; // `Array.prototype.{ forEach, map, filter, some, every, find, findIndex, filterOut }` methods implementation

  var createMethod$1 = function createMethod(TYPE) {
    var IS_MAP = TYPE == 1;
    var IS_FILTER = TYPE == 2;
    var IS_SOME = TYPE == 3;
    var IS_EVERY = TYPE == 4;
    var IS_FIND_INDEX = TYPE == 6;
    var IS_FILTER_OUT = TYPE == 7;
    var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
    return function ($this, callbackfn, that, specificCreate) {
      var O = toObject($this);
      var self = indexedObject(O);
      var boundFunction = functionBindContext(callbackfn, that, 3);
      var length = toLength(self.length);
      var index = 0;
      var create = specificCreate || arraySpeciesCreate;
      var target = IS_MAP ? create($this, length) : IS_FILTER || IS_FILTER_OUT ? create($this, 0) : undefined;
      var value, result;

      for (; length > index; index++) {
        if (NO_HOLES || index in self) {
          value = self[index];
          result = boundFunction(value, index, O);

          if (TYPE) {
            if (IS_MAP) target[index] = result; // map
            else if (result) switch (TYPE) {
                case 3:
                  return true;
                // some

                case 5:
                  return value;
                // find

                case 6:
                  return index;
                // findIndex

                case 2:
                  push.call(target, value);
                // filter
              } else switch (TYPE) {
                case 4:
                  return false;
                // every

                case 7:
                  push.call(target, value);
                // filterOut
              }
          }
        }
      }

      return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : target;
    };
  };

  var arrayIteration = {
    // `Array.prototype.forEach` method
    // https://tc39.es/ecma262/#sec-array.prototype.foreach
    forEach: createMethod$1(0),
    // `Array.prototype.map` method
    // https://tc39.es/ecma262/#sec-array.prototype.map
    map: createMethod$1(1),
    // `Array.prototype.filter` method
    // https://tc39.es/ecma262/#sec-array.prototype.filter
    filter: createMethod$1(2),
    // `Array.prototype.some` method
    // https://tc39.es/ecma262/#sec-array.prototype.some
    some: createMethod$1(3),
    // `Array.prototype.every` method
    // https://tc39.es/ecma262/#sec-array.prototype.every
    every: createMethod$1(4),
    // `Array.prototype.find` method
    // https://tc39.es/ecma262/#sec-array.prototype.find
    find: createMethod$1(5),
    // `Array.prototype.findIndex` method
    // https://tc39.es/ecma262/#sec-array.prototype.findIndex
    findIndex: createMethod$1(6),
    // `Array.prototype.filterOut` method
    // https://github.com/tc39/proposal-array-filtering
    filterOut: createMethod$1(7)
  };

  var defineProperty = Object.defineProperty;
  var cache = {};

  var thrower = function thrower(it) {
    throw it;
  };

  var arrayMethodUsesToLength = function arrayMethodUsesToLength(METHOD_NAME, options) {
    if (has(cache, METHOD_NAME)) return cache[METHOD_NAME];
    if (!options) options = {};
    var method = [][METHOD_NAME];
    var ACCESSORS = has(options, 'ACCESSORS') ? options.ACCESSORS : false;
    var argument0 = has(options, 0) ? options[0] : thrower;
    var argument1 = has(options, 1) ? options[1] : undefined;
    return cache[METHOD_NAME] = !!method && !fails(function () {
      if (ACCESSORS && !descriptors) return true;
      var O = {
        length: -1
      };
      if (ACCESSORS) defineProperty(O, 1, {
        enumerable: true,
        get: thrower
      });else O[1] = 1;
      method.call(O, argument0, argument1);
    });
  };

  var $filter = arrayIteration.filter;
  var HAS_SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('filter'); // Edge 14- issue

  var USES_TO_LENGTH = arrayMethodUsesToLength('filter'); // `Array.prototype.filter` method
  // https://tc39.es/ecma262/#sec-array.prototype.filter
  // with adding support of @@species

  _export({
    target: 'Array',
    proto: true,
    forced: !HAS_SPECIES_SUPPORT || !USES_TO_LENGTH
  }, {
    filter: function filter(callbackfn
    /* , thisArg */
    ) {
      return $filter(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    }
  });

  // https://tc39.es/ecma262/#sec-object.keys

  var objectKeys = Object.keys || function keys(O) {
    return objectKeysInternal(O, enumBugKeys);
  };

  // https://tc39.es/ecma262/#sec-object.defineproperties

  var objectDefineProperties = descriptors ? Object.defineProperties : function defineProperties(O, Properties) {
    anObject(O);
    var keys = objectKeys(Properties);
    var length = keys.length;
    var index = 0;
    var key;

    while (length > index) {
      objectDefineProperty.f(O, key = keys[index++], Properties[key]);
    }

    return O;
  };

  var html = getBuiltIn('document', 'documentElement');

  var GT = '>';
  var LT = '<';
  var PROTOTYPE = 'prototype';
  var SCRIPT = 'script';
  var IE_PROTO = sharedKey('IE_PROTO');

  var EmptyConstructor = function EmptyConstructor() {
    /* empty */
  };

  var scriptTag = function scriptTag(content) {
    return LT + SCRIPT + GT + content + LT + '/' + SCRIPT + GT;
  }; // Create object with fake `null` prototype: use ActiveX Object with cleared prototype


  var NullProtoObjectViaActiveX = function NullProtoObjectViaActiveX(activeXDocument) {
    activeXDocument.write(scriptTag(''));
    activeXDocument.close();
    var temp = activeXDocument.parentWindow.Object;
    activeXDocument = null; // avoid memory leak

    return temp;
  }; // Create object with fake `null` prototype: use iframe Object with cleared prototype


  var NullProtoObjectViaIFrame = function NullProtoObjectViaIFrame() {
    // Thrash, waste and sodomy: IE GC bug
    var iframe = documentCreateElement('iframe');
    var JS = 'java' + SCRIPT + ':';
    var iframeDocument;
    iframe.style.display = 'none';
    html.appendChild(iframe); // https://github.com/zloirock/core-js/issues/475

    iframe.src = String(JS);
    iframeDocument = iframe.contentWindow.document;
    iframeDocument.open();
    iframeDocument.write(scriptTag('document.F=Object'));
    iframeDocument.close();
    return iframeDocument.F;
  }; // Check for document.domain and active x support
  // No need to use active x approach when document.domain is not set
  // see https://github.com/es-shims/es5-shim/issues/150
  // variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
  // avoid IE GC bug


  var activeXDocument;

  var _NullProtoObject = function NullProtoObject() {
    try {
      /* global ActiveXObject */
      activeXDocument = document.domain && new ActiveXObject('htmlfile');
    } catch (error) {
      /* ignore */
    }

    _NullProtoObject = activeXDocument ? NullProtoObjectViaActiveX(activeXDocument) : NullProtoObjectViaIFrame();
    var length = enumBugKeys.length;

    while (length--) {
      delete _NullProtoObject[PROTOTYPE][enumBugKeys[length]];
    }

    return _NullProtoObject();
  };

  hiddenKeys[IE_PROTO] = true; // `Object.create` method
  // https://tc39.es/ecma262/#sec-object.create

  var objectCreate = Object.create || function create(O, Properties) {
    var result;

    if (O !== null) {
      EmptyConstructor[PROTOTYPE] = anObject(O);
      result = new EmptyConstructor();
      EmptyConstructor[PROTOTYPE] = null; // add "__proto__" for Object.getPrototypeOf polyfill

      result[IE_PROTO] = O;
    } else result = _NullProtoObject();

    return Properties === undefined ? result : objectDefineProperties(result, Properties);
  };

  var UNSCOPABLES = wellKnownSymbol('unscopables');
  var ArrayPrototype = Array.prototype; // Array.prototype[@@unscopables]
  // https://tc39.es/ecma262/#sec-array.prototype-@@unscopables

  if (ArrayPrototype[UNSCOPABLES] == undefined) {
    objectDefineProperty.f(ArrayPrototype, UNSCOPABLES, {
      configurable: true,
      value: objectCreate(null)
    });
  } // add a key to Array.prototype[@@unscopables]


  var addToUnscopables = function addToUnscopables(key) {
    ArrayPrototype[UNSCOPABLES][key] = true;
  };

  var iterators = {};

  var correctPrototypeGetter = !fails(function () {
    function F() {
      /* empty */
    }

    F.prototype.constructor = null;
    return Object.getPrototypeOf(new F()) !== F.prototype;
  });

  var IE_PROTO$1 = sharedKey('IE_PROTO');
  var ObjectPrototype = Object.prototype; // `Object.getPrototypeOf` method
  // https://tc39.es/ecma262/#sec-object.getprototypeof

  var objectGetPrototypeOf = correctPrototypeGetter ? Object.getPrototypeOf : function (O) {
    O = toObject(O);
    if (has(O, IE_PROTO$1)) return O[IE_PROTO$1];

    if (typeof O.constructor == 'function' && O instanceof O.constructor) {
      return O.constructor.prototype;
    }

    return O instanceof Object ? ObjectPrototype : null;
  };

  var ITERATOR = wellKnownSymbol('iterator');
  var BUGGY_SAFARI_ITERATORS = false;

  var returnThis = function returnThis() {
    return this;
  }; // `%IteratorPrototype%` object
  // https://tc39.es/ecma262/#sec-%iteratorprototype%-object


  var IteratorPrototype, PrototypeOfArrayIteratorPrototype, arrayIterator;

  if ([].keys) {
    arrayIterator = [].keys(); // Safari 8 has buggy iterators w/o `next`

    if (!('next' in arrayIterator)) BUGGY_SAFARI_ITERATORS = true;else {
      PrototypeOfArrayIteratorPrototype = objectGetPrototypeOf(objectGetPrototypeOf(arrayIterator));
      if (PrototypeOfArrayIteratorPrototype !== Object.prototype) IteratorPrototype = PrototypeOfArrayIteratorPrototype;
    }
  }

  var NEW_ITERATOR_PROTOTYPE = IteratorPrototype == undefined || fails(function () {
    var test = {}; // FF44- legacy iterators case

    return IteratorPrototype[ITERATOR].call(test) !== test;
  });
  if (NEW_ITERATOR_PROTOTYPE) IteratorPrototype = {}; // 25.1.2.1.1 %IteratorPrototype%[@@iterator]()

  if ( !has(IteratorPrototype, ITERATOR)) {
    createNonEnumerableProperty(IteratorPrototype, ITERATOR, returnThis);
  }

  var iteratorsCore = {
    IteratorPrototype: IteratorPrototype,
    BUGGY_SAFARI_ITERATORS: BUGGY_SAFARI_ITERATORS
  };

  var defineProperty$1 = objectDefineProperty.f;
  var TO_STRING_TAG = wellKnownSymbol('toStringTag');

  var setToStringTag = function setToStringTag(it, TAG, STATIC) {
    if (it && !has(it = STATIC ? it : it.prototype, TO_STRING_TAG)) {
      defineProperty$1(it, TO_STRING_TAG, {
        configurable: true,
        value: TAG
      });
    }
  };

  var IteratorPrototype$1 = iteratorsCore.IteratorPrototype;

  var returnThis$1 = function returnThis() {
    return this;
  };

  var createIteratorConstructor = function createIteratorConstructor(IteratorConstructor, NAME, next) {
    var TO_STRING_TAG = NAME + ' Iterator';
    IteratorConstructor.prototype = objectCreate(IteratorPrototype$1, {
      next: createPropertyDescriptor(1, next)
    });
    setToStringTag(IteratorConstructor, TO_STRING_TAG, false);
    iterators[TO_STRING_TAG] = returnThis$1;
    return IteratorConstructor;
  };

  var aPossiblePrototype = function aPossiblePrototype(it) {
    if (!isObject(it) && it !== null) {
      throw TypeError("Can't set " + String(it) + ' as a prototype');
    }

    return it;
  };

  // https://tc39.es/ecma262/#sec-object.setprototypeof
  // Works with __proto__ only. Old v8 can't work with null proto objects.

  /* eslint-disable no-proto */

  var objectSetPrototypeOf = Object.setPrototypeOf || ('__proto__' in {} ? function () {
    var CORRECT_SETTER = false;
    var test = {};
    var setter;

    try {
      setter = Object.getOwnPropertyDescriptor(Object.prototype, '__proto__').set;
      setter.call(test, []);
      CORRECT_SETTER = test instanceof Array;
    } catch (error) {
      /* empty */
    }

    return function setPrototypeOf(O, proto) {
      anObject(O);
      aPossiblePrototype(proto);
      if (CORRECT_SETTER) setter.call(O, proto);else O.__proto__ = proto;
      return O;
    };
  }() : undefined);

  var IteratorPrototype$2 = iteratorsCore.IteratorPrototype;
  var BUGGY_SAFARI_ITERATORS$1 = iteratorsCore.BUGGY_SAFARI_ITERATORS;
  var ITERATOR$1 = wellKnownSymbol('iterator');
  var KEYS = 'keys';
  var VALUES = 'values';
  var ENTRIES = 'entries';

  var returnThis$2 = function returnThis() {
    return this;
  };

  var defineIterator = function defineIterator(Iterable, NAME, IteratorConstructor, next, DEFAULT, IS_SET, FORCED) {
    createIteratorConstructor(IteratorConstructor, NAME, next);

    var getIterationMethod = function getIterationMethod(KIND) {
      if (KIND === DEFAULT && defaultIterator) return defaultIterator;
      if (!BUGGY_SAFARI_ITERATORS$1 && KIND in IterablePrototype) return IterablePrototype[KIND];

      switch (KIND) {
        case KEYS:
          return function keys() {
            return new IteratorConstructor(this, KIND);
          };

        case VALUES:
          return function values() {
            return new IteratorConstructor(this, KIND);
          };

        case ENTRIES:
          return function entries() {
            return new IteratorConstructor(this, KIND);
          };
      }

      return function () {
        return new IteratorConstructor(this);
      };
    };

    var TO_STRING_TAG = NAME + ' Iterator';
    var INCORRECT_VALUES_NAME = false;
    var IterablePrototype = Iterable.prototype;
    var nativeIterator = IterablePrototype[ITERATOR$1] || IterablePrototype['@@iterator'] || DEFAULT && IterablePrototype[DEFAULT];
    var defaultIterator = !BUGGY_SAFARI_ITERATORS$1 && nativeIterator || getIterationMethod(DEFAULT);
    var anyNativeIterator = NAME == 'Array' ? IterablePrototype.entries || nativeIterator : nativeIterator;
    var CurrentIteratorPrototype, methods, KEY; // fix native

    if (anyNativeIterator) {
      CurrentIteratorPrototype = objectGetPrototypeOf(anyNativeIterator.call(new Iterable()));

      if (IteratorPrototype$2 !== Object.prototype && CurrentIteratorPrototype.next) {
        if ( objectGetPrototypeOf(CurrentIteratorPrototype) !== IteratorPrototype$2) {
          if (objectSetPrototypeOf) {
            objectSetPrototypeOf(CurrentIteratorPrototype, IteratorPrototype$2);
          } else if (typeof CurrentIteratorPrototype[ITERATOR$1] != 'function') {
            createNonEnumerableProperty(CurrentIteratorPrototype, ITERATOR$1, returnThis$2);
          }
        } // Set @@toStringTag to native iterators


        setToStringTag(CurrentIteratorPrototype, TO_STRING_TAG, true);
      }
    } // fix Array#{values, @@iterator}.name in V8 / FF


    if (DEFAULT == VALUES && nativeIterator && nativeIterator.name !== VALUES) {
      INCORRECT_VALUES_NAME = true;

      defaultIterator = function values() {
        return nativeIterator.call(this);
      };
    } // define iterator


    if ( IterablePrototype[ITERATOR$1] !== defaultIterator) {
      createNonEnumerableProperty(IterablePrototype, ITERATOR$1, defaultIterator);
    }

    iterators[NAME] = defaultIterator; // export additional methods

    if (DEFAULT) {
      methods = {
        values: getIterationMethod(VALUES),
        keys: IS_SET ? defaultIterator : getIterationMethod(KEYS),
        entries: getIterationMethod(ENTRIES)
      };
      if (FORCED) for (KEY in methods) {
        if (BUGGY_SAFARI_ITERATORS$1 || INCORRECT_VALUES_NAME || !(KEY in IterablePrototype)) {
          redefine(IterablePrototype, KEY, methods[KEY]);
        }
      } else _export({
        target: NAME,
        proto: true,
        forced: BUGGY_SAFARI_ITERATORS$1 || INCORRECT_VALUES_NAME
      }, methods);
    }

    return methods;
  };

  var ARRAY_ITERATOR = 'Array Iterator';
  var setInternalState = internalState.set;
  var getInternalState = internalState.getterFor(ARRAY_ITERATOR); // `Array.prototype.entries` method
  // https://tc39.es/ecma262/#sec-array.prototype.entries
  // `Array.prototype.keys` method
  // https://tc39.es/ecma262/#sec-array.prototype.keys
  // `Array.prototype.values` method
  // https://tc39.es/ecma262/#sec-array.prototype.values
  // `Array.prototype[@@iterator]` method
  // https://tc39.es/ecma262/#sec-array.prototype-@@iterator
  // `CreateArrayIterator` internal method
  // https://tc39.es/ecma262/#sec-createarrayiterator

  var es_array_iterator = defineIterator(Array, 'Array', function (iterated, kind) {
    setInternalState(this, {
      type: ARRAY_ITERATOR,
      target: toIndexedObject(iterated),
      // target
      index: 0,
      // next index
      kind: kind // kind

    }); // `%ArrayIteratorPrototype%.next` method
    // https://tc39.es/ecma262/#sec-%arrayiteratorprototype%.next
  }, function () {
    var state = getInternalState(this);
    var target = state.target;
    var kind = state.kind;
    var index = state.index++;

    if (!target || index >= target.length) {
      state.target = undefined;
      return {
        value: undefined,
        done: true
      };
    }

    if (kind == 'keys') return {
      value: index,
      done: false
    };
    if (kind == 'values') return {
      value: target[index],
      done: false
    };
    return {
      value: [index, target[index]],
      done: false
    };
  }, 'values'); // argumentsList[@@iterator] is %ArrayProto_values%
  // https://tc39.es/ecma262/#sec-createunmappedargumentsobject
  // https://tc39.es/ecma262/#sec-createmappedargumentsobject

  iterators.Arguments = iterators.Array; // https://tc39.es/ecma262/#sec-array.prototype-@@unscopables

  addToUnscopables('keys');
  addToUnscopables('values');
  addToUnscopables('entries');

  var HAS_SPECIES_SUPPORT$1 = arrayMethodHasSpeciesSupport('splice');
  var USES_TO_LENGTH$1 = arrayMethodUsesToLength('splice', {
    ACCESSORS: true,
    0: 0,
    1: 2
  });
  var max$1 = Math.max;
  var min$2 = Math.min;
  var MAX_SAFE_INTEGER$1 = 0x1FFFFFFFFFFFFF;
  var MAXIMUM_ALLOWED_LENGTH_EXCEEDED = 'Maximum allowed length exceeded'; // `Array.prototype.splice` method
  // https://tc39.es/ecma262/#sec-array.prototype.splice
  // with adding support of @@species

  _export({
    target: 'Array',
    proto: true,
    forced: !HAS_SPECIES_SUPPORT$1 || !USES_TO_LENGTH$1
  }, {
    splice: function splice(start, deleteCount
    /* , ...items */
    ) {
      var O = toObject(this);
      var len = toLength(O.length);
      var actualStart = toAbsoluteIndex(start, len);
      var argumentsLength = arguments.length;
      var insertCount, actualDeleteCount, A, k, from, to;

      if (argumentsLength === 0) {
        insertCount = actualDeleteCount = 0;
      } else if (argumentsLength === 1) {
        insertCount = 0;
        actualDeleteCount = len - actualStart;
      } else {
        insertCount = argumentsLength - 2;
        actualDeleteCount = min$2(max$1(toInteger(deleteCount), 0), len - actualStart);
      }

      if (len + insertCount - actualDeleteCount > MAX_SAFE_INTEGER$1) {
        throw TypeError(MAXIMUM_ALLOWED_LENGTH_EXCEEDED);
      }

      A = arraySpeciesCreate(O, actualDeleteCount);

      for (k = 0; k < actualDeleteCount; k++) {
        from = actualStart + k;
        if (from in O) createProperty(A, k, O[from]);
      }

      A.length = actualDeleteCount;

      if (insertCount < actualDeleteCount) {
        for (k = actualStart; k < len - actualDeleteCount; k++) {
          from = k + actualDeleteCount;
          to = k + insertCount;
          if (from in O) O[to] = O[from];else delete O[to];
        }

        for (k = len; k > len - actualDeleteCount + insertCount; k--) {
          delete O[k - 1];
        }
      } else if (insertCount > actualDeleteCount) {
        for (k = len - actualDeleteCount; k > actualStart; k--) {
          from = k + actualDeleteCount - 1;
          to = k + insertCount - 1;
          if (from in O) O[to] = O[from];else delete O[to];
        }
      }

      for (k = 0; k < insertCount; k++) {
        O[k + actualStart] = arguments[k + 2];
      }

      O.length = len - actualDeleteCount + insertCount;
      return A;
    }
  });

  var defineProperty$2 = objectDefineProperty.f;
  var FunctionPrototype = Function.prototype;
  var FunctionPrototypeToString = FunctionPrototype.toString;
  var nameRE = /^\s*function ([^ (]*)/;
  var NAME = 'name'; // Function instances `.name` property
  // https://tc39.es/ecma262/#sec-function-instances-name

  if (descriptors && !(NAME in FunctionPrototype)) {
    defineProperty$2(FunctionPrototype, NAME, {
      configurable: true,
      get: function get() {
        try {
          return FunctionPrototypeToString.call(this).match(nameRE)[1];
        } catch (error) {
          return '';
        }
      }
    });
  }

  var inheritIfRequired = function inheritIfRequired($this, dummy, Wrapper) {
    var NewTarget, NewTargetPrototype;
    if ( // it can work only with native `setPrototypeOf`
    objectSetPrototypeOf && // we haven't completely correct pre-ES6 way for getting `new.target`, so use this
    typeof (NewTarget = dummy.constructor) == 'function' && NewTarget !== Wrapper && isObject(NewTargetPrototype = NewTarget.prototype) && NewTargetPrototype !== Wrapper.prototype) objectSetPrototypeOf($this, NewTargetPrototype);
    return $this;
  };

  // a string of all valid unicode whitespaces
  // eslint-disable-next-line max-len
  var whitespaces = "\t\n\x0B\f\r \xA0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF";

  var whitespace = '[' + whitespaces + ']';
  var ltrim = RegExp('^' + whitespace + whitespace + '*');
  var rtrim = RegExp(whitespace + whitespace + '*$'); // `String.prototype.{ trim, trimStart, trimEnd, trimLeft, trimRight }` methods implementation

  var createMethod$2 = function createMethod(TYPE) {
    return function ($this) {
      var string = String(requireObjectCoercible($this));
      if (TYPE & 1) string = string.replace(ltrim, '');
      if (TYPE & 2) string = string.replace(rtrim, '');
      return string;
    };
  };

  var stringTrim = {
    // `String.prototype.{ trimLeft, trimStart }` methods
    // https://tc39.es/ecma262/#sec-string.prototype.trimstart
    start: createMethod$2(1),
    // `String.prototype.{ trimRight, trimEnd }` methods
    // https://tc39.es/ecma262/#sec-string.prototype.trimend
    end: createMethod$2(2),
    // `String.prototype.trim` method
    // https://tc39.es/ecma262/#sec-string.prototype.trim
    trim: createMethod$2(3)
  };

  var getOwnPropertyNames = objectGetOwnPropertyNames.f;
  var getOwnPropertyDescriptor$2 = objectGetOwnPropertyDescriptor.f;
  var defineProperty$3 = objectDefineProperty.f;
  var trim = stringTrim.trim;
  var NUMBER = 'Number';
  var NativeNumber = global$1[NUMBER];
  var NumberPrototype = NativeNumber.prototype; // Opera ~12 has broken Object#toString

  var BROKEN_CLASSOF = classofRaw(objectCreate(NumberPrototype)) == NUMBER; // `ToNumber` abstract operation
  // https://tc39.es/ecma262/#sec-tonumber

  var toNumber = function toNumber(argument) {
    var it = toPrimitive(argument, false);
    var first, third, radix, maxCode, digits, length, index, code;

    if (typeof it == 'string' && it.length > 2) {
      it = trim(it);
      first = it.charCodeAt(0);

      if (first === 43 || first === 45) {
        third = it.charCodeAt(2);
        if (third === 88 || third === 120) return NaN; // Number('+0x1') should be NaN, old V8 fix
      } else if (first === 48) {
        switch (it.charCodeAt(1)) {
          case 66:
          case 98:
            radix = 2;
            maxCode = 49;
            break;
          // fast equal of /^0b[01]+$/i

          case 79:
          case 111:
            radix = 8;
            maxCode = 55;
            break;
          // fast equal of /^0o[0-7]+$/i

          default:
            return +it;
        }

        digits = it.slice(2);
        length = digits.length;

        for (index = 0; index < length; index++) {
          code = digits.charCodeAt(index); // parseInt parses a string to a first unavailable symbol
          // but ToNumber should return NaN if a string contains unavailable symbols

          if (code < 48 || code > maxCode) return NaN;
        }

        return parseInt(digits, radix);
      }
    }

    return +it;
  }; // `Number` constructor
  // https://tc39.es/ecma262/#sec-number-constructor


  if (isForced_1(NUMBER, !NativeNumber(' 0o1') || !NativeNumber('0b1') || NativeNumber('+0x1'))) {
    var NumberWrapper = function Number(value) {
      var it = arguments.length < 1 ? 0 : value;
      var dummy = this;
      return dummy instanceof NumberWrapper // check on 1..constructor(foo) case
      && (BROKEN_CLASSOF ? fails(function () {
        NumberPrototype.valueOf.call(dummy);
      }) : classofRaw(dummy) != NUMBER) ? inheritIfRequired(new NativeNumber(toNumber(it)), dummy, NumberWrapper) : toNumber(it);
    };

    for (var keys$1 = descriptors ? getOwnPropertyNames(NativeNumber) : ( // ES3:
    'MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY,' + // ES2015 (in case, if modules with ES2015 Number statics required before):
    'EPSILON,isFinite,isInteger,isNaN,isSafeInteger,MAX_SAFE_INTEGER,' + 'MIN_SAFE_INTEGER,parseFloat,parseInt,isInteger,' + // ESNext
    'fromString,range').split(','), j = 0, key; keys$1.length > j; j++) {
      if (has(NativeNumber, key = keys$1[j]) && !has(NumberWrapper, key)) {
        defineProperty$3(NumberWrapper, key, getOwnPropertyDescriptor$2(NativeNumber, key));
      }
    }

    NumberWrapper.prototype = NumberPrototype;
    NumberPrototype.constructor = NumberWrapper;
    redefine(global$1, NUMBER, NumberWrapper);
  }

  var nativeAssign = Object.assign;
  var defineProperty$4 = Object.defineProperty; // `Object.assign` method
  // https://tc39.es/ecma262/#sec-object.assign

  var objectAssign = !nativeAssign || fails(function () {
    // should have correct order of operations (Edge bug)
    if (descriptors && nativeAssign({
      b: 1
    }, nativeAssign(defineProperty$4({}, 'a', {
      enumerable: true,
      get: function get() {
        defineProperty$4(this, 'b', {
          value: 3,
          enumerable: false
        });
      }
    }), {
      b: 2
    })).b !== 1) return true; // should work with symbols and should have deterministic property order (V8 bug)

    var A = {};
    var B = {}; // eslint-disable-next-line no-undef

    var symbol = Symbol();
    var alphabet = 'abcdefghijklmnopqrst';
    A[symbol] = 7;
    alphabet.split('').forEach(function (chr) {
      B[chr] = chr;
    });
    return nativeAssign({}, A)[symbol] != 7 || objectKeys(nativeAssign({}, B)).join('') != alphabet;
  }) ? function assign(target, source) {
    // eslint-disable-line no-unused-vars
    var T = toObject(target);
    var argumentsLength = arguments.length;
    var index = 1;
    var getOwnPropertySymbols = objectGetOwnPropertySymbols.f;
    var propertyIsEnumerable = objectPropertyIsEnumerable.f;

    while (argumentsLength > index) {
      var S = indexedObject(arguments[index++]);
      var keys = getOwnPropertySymbols ? objectKeys(S).concat(getOwnPropertySymbols(S)) : objectKeys(S);
      var length = keys.length;
      var j = 0;
      var key;

      while (length > j) {
        key = keys[j++];
        if (!descriptors || propertyIsEnumerable.call(S, key)) T[key] = S[key];
      }
    }

    return T;
  } : nativeAssign;

  // https://tc39.es/ecma262/#sec-object.assign

  _export({
    target: 'Object',
    stat: true,
    forced: Object.assign !== objectAssign
  }, {
    assign: objectAssign
  });

  var TO_STRING_TAG$1 = wellKnownSymbol('toStringTag');
  var test = {};
  test[TO_STRING_TAG$1] = 'z';
  var toStringTagSupport = String(test) === '[object z]';

  var TO_STRING_TAG$2 = wellKnownSymbol('toStringTag'); // ES3 wrong here

  var CORRECT_ARGUMENTS = classofRaw(function () {
    return arguments;
  }()) == 'Arguments'; // fallback for IE11 Script Access Denied error

  var tryGet = function tryGet(it, key) {
    try {
      return it[key];
    } catch (error) {
      /* empty */
    }
  }; // getting tag from ES6+ `Object.prototype.toString`


  var classof = toStringTagSupport ? classofRaw : function (it) {
    var O, tag, result;
    return it === undefined ? 'Undefined' : it === null ? 'Null' // @@toStringTag case
    : typeof (tag = tryGet(O = Object(it), TO_STRING_TAG$2)) == 'string' ? tag // builtinTag case
    : CORRECT_ARGUMENTS ? classofRaw(O) // ES3 arguments fallback
    : (result = classofRaw(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : result;
  };

  // https://tc39.es/ecma262/#sec-object.prototype.tostring


  var objectToString = toStringTagSupport ? {}.toString : function toString() {
    return '[object ' + classof(this) + ']';
  };

  // https://tc39.es/ecma262/#sec-object.prototype.tostring

  if (!toStringTagSupport) {
    redefine(Object.prototype, 'toString', objectToString, {
      unsafe: true
    });
  }

  var nativePromiseConstructor = global$1.Promise;

  var redefineAll = function redefineAll(target, src, options) {
    for (var key in src) {
      redefine(target, key, src[key], options);
    }

    return target;
  };

  var SPECIES$2 = wellKnownSymbol('species');

  var setSpecies = function setSpecies(CONSTRUCTOR_NAME) {
    var Constructor = getBuiltIn(CONSTRUCTOR_NAME);
    var defineProperty = objectDefineProperty.f;

    if (descriptors && Constructor && !Constructor[SPECIES$2]) {
      defineProperty(Constructor, SPECIES$2, {
        configurable: true,
        get: function get() {
          return this;
        }
      });
    }
  };

  var anInstance = function anInstance(it, Constructor, name) {
    if (!(it instanceof Constructor)) {
      throw TypeError('Incorrect ' + (name ? name + ' ' : '') + 'invocation');
    }

    return it;
  };

  var ITERATOR$2 = wellKnownSymbol('iterator');
  var ArrayPrototype$1 = Array.prototype; // check on default Array iterator

  var isArrayIteratorMethod = function isArrayIteratorMethod(it) {
    return it !== undefined && (iterators.Array === it || ArrayPrototype$1[ITERATOR$2] === it);
  };

  var ITERATOR$3 = wellKnownSymbol('iterator');

  var getIteratorMethod = function getIteratorMethod(it) {
    if (it != undefined) return it[ITERATOR$3] || it['@@iterator'] || iterators[classof(it)];
  };

  var iteratorClose = function iteratorClose(iterator) {
    var returnMethod = iterator['return'];

    if (returnMethod !== undefined) {
      return anObject(returnMethod.call(iterator)).value;
    }
  };

  var Result = function Result(stopped, result) {
    this.stopped = stopped;
    this.result = result;
  };

  var iterate = function iterate(iterable, unboundFunction, options) {
    var that = options && options.that;
    var AS_ENTRIES = !!(options && options.AS_ENTRIES);
    var IS_ITERATOR = !!(options && options.IS_ITERATOR);
    var INTERRUPTED = !!(options && options.INTERRUPTED);
    var fn = functionBindContext(unboundFunction, that, 1 + AS_ENTRIES + INTERRUPTED);
    var iterator, iterFn, index, length, result, next, step;

    var stop = function stop(condition) {
      if (iterator) iteratorClose(iterator);
      return new Result(true, condition);
    };

    var callFn = function callFn(value) {
      if (AS_ENTRIES) {
        anObject(value);
        return INTERRUPTED ? fn(value[0], value[1], stop) : fn(value[0], value[1]);
      }

      return INTERRUPTED ? fn(value, stop) : fn(value);
    };

    if (IS_ITERATOR) {
      iterator = iterable;
    } else {
      iterFn = getIteratorMethod(iterable);
      if (typeof iterFn != 'function') throw TypeError('Target is not iterable'); // optimisation for array iterators

      if (isArrayIteratorMethod(iterFn)) {
        for (index = 0, length = toLength(iterable.length); length > index; index++) {
          result = callFn(iterable[index]);
          if (result && result instanceof Result) return result;
        }

        return new Result(false);
      }

      iterator = iterFn.call(iterable);
    }

    next = iterator.next;

    while (!(step = next.call(iterator)).done) {
      try {
        result = callFn(step.value);
      } catch (error) {
        iteratorClose(iterator);
        throw error;
      }

      if (_typeof(result) == 'object' && result && result instanceof Result) return result;
    }

    return new Result(false);
  };

  var ITERATOR$4 = wellKnownSymbol('iterator');
  var SAFE_CLOSING = false;

  try {
    var called = 0;
    var iteratorWithReturn = {
      next: function next() {
        return {
          done: !!called++
        };
      },
      'return': function _return() {
        SAFE_CLOSING = true;
      }
    };

    iteratorWithReturn[ITERATOR$4] = function () {
      return this;
    }; // eslint-disable-next-line no-throw-literal


    Array.from(iteratorWithReturn, function () {
      throw 2;
    });
  } catch (error) {
    /* empty */
  }

  var checkCorrectnessOfIteration = function checkCorrectnessOfIteration(exec, SKIP_CLOSING) {
    if (!SKIP_CLOSING && !SAFE_CLOSING) return false;
    var ITERATION_SUPPORT = false;

    try {
      var object = {};

      object[ITERATOR$4] = function () {
        return {
          next: function next() {
            return {
              done: ITERATION_SUPPORT = true
            };
          }
        };
      };

      exec(object);
    } catch (error) {
      /* empty */
    }

    return ITERATION_SUPPORT;
  };

  var SPECIES$3 = wellKnownSymbol('species'); // `SpeciesConstructor` abstract operation
  // https://tc39.es/ecma262/#sec-speciesconstructor

  var speciesConstructor = function speciesConstructor(O, defaultConstructor) {
    var C = anObject(O).constructor;
    var S;
    return C === undefined || (S = anObject(C)[SPECIES$3]) == undefined ? defaultConstructor : aFunction$1(S);
  };

  var engineIsIos = /(iphone|ipod|ipad).*applewebkit/i.test(engineUserAgent);

  var engineIsNode = classofRaw(global$1.process) == 'process';

  var location = global$1.location;
  var set$1 = global$1.setImmediate;
  var clear = global$1.clearImmediate;
  var process$1 = global$1.process;
  var MessageChannel = global$1.MessageChannel;
  var Dispatch = global$1.Dispatch;
  var counter = 0;
  var queue = {};
  var ONREADYSTATECHANGE = 'onreadystatechange';
  var defer, channel, port;

  var run = function run(id) {
    // eslint-disable-next-line no-prototype-builtins
    if (queue.hasOwnProperty(id)) {
      var fn = queue[id];
      delete queue[id];
      fn();
    }
  };

  var runner = function runner(id) {
    return function () {
      run(id);
    };
  };

  var listener = function listener(event) {
    run(event.data);
  };

  var post = function post(id) {
    // old engines have not location.origin
    global$1.postMessage(id + '', location.protocol + '//' + location.host);
  }; // Node.js 0.9+ & IE10+ has setImmediate, otherwise:


  if (!set$1 || !clear) {
    set$1 = function setImmediate(fn) {
      var args = [];
      var i = 1;

      while (arguments.length > i) {
        args.push(arguments[i++]);
      }

      queue[++counter] = function () {
        // eslint-disable-next-line no-new-func
        (typeof fn == 'function' ? fn : Function(fn)).apply(undefined, args);
      };

      defer(counter);
      return counter;
    };

    clear = function clearImmediate(id) {
      delete queue[id];
    }; // Node.js 0.8-


    if (engineIsNode) {
      defer = function defer(id) {
        process$1.nextTick(runner(id));
      }; // Sphere (JS game engine) Dispatch API

    } else if (Dispatch && Dispatch.now) {
      defer = function defer(id) {
        Dispatch.now(runner(id));
      }; // Browsers with MessageChannel, includes WebWorkers
      // except iOS - https://github.com/zloirock/core-js/issues/624

    } else if (MessageChannel && !engineIsIos) {
      channel = new MessageChannel();
      port = channel.port2;
      channel.port1.onmessage = listener;
      defer = functionBindContext(port.postMessage, port, 1); // Browsers with postMessage, skip WebWorkers
      // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
    } else if (global$1.addEventListener && typeof postMessage == 'function' && !global$1.importScripts && location && location.protocol !== 'file:' && !fails(post)) {
      defer = post;
      global$1.addEventListener('message', listener, false); // IE8-
    } else if (ONREADYSTATECHANGE in documentCreateElement('script')) {
      defer = function defer(id) {
        html.appendChild(documentCreateElement('script'))[ONREADYSTATECHANGE] = function () {
          html.removeChild(this);
          run(id);
        };
      }; // Rest old browsers

    } else {
      defer = function defer(id) {
        setTimeout(runner(id), 0);
      };
    }
  }

  var task = {
    set: set$1,
    clear: clear
  };

  var engineIsWebosWebkit = /web0s(?!.*chrome)/i.test(engineUserAgent);

  var getOwnPropertyDescriptor$3 = objectGetOwnPropertyDescriptor.f;
  var macrotask = task.set;
  var MutationObserver = global$1.MutationObserver || global$1.WebKitMutationObserver;
  var document$2 = global$1.document;
  var process$2 = global$1.process;
  var Promise$1 = global$1.Promise; // Node.js 11 shows ExperimentalWarning on getting `queueMicrotask`

  var queueMicrotaskDescriptor = getOwnPropertyDescriptor$3(global$1, 'queueMicrotask');
  var queueMicrotask = queueMicrotaskDescriptor && queueMicrotaskDescriptor.value;
  var flush, head, last, notify, toggle, node, promise, then; // modern engines have queueMicrotask method

  if (!queueMicrotask) {
    flush = function flush() {
      var parent, fn;
      if (engineIsNode && (parent = process$2.domain)) parent.exit();

      while (head) {
        fn = head.fn;
        head = head.next;

        try {
          fn();
        } catch (error) {
          if (head) notify();else last = undefined;
          throw error;
        }
      }

      last = undefined;
      if (parent) parent.enter();
    }; // browsers with MutationObserver, except iOS - https://github.com/zloirock/core-js/issues/339
    // also except WebOS Webkit https://github.com/zloirock/core-js/issues/898


    if (!engineIsIos && !engineIsNode && !engineIsWebosWebkit && MutationObserver && document$2) {
      toggle = true;
      node = document$2.createTextNode('');
      new MutationObserver(flush).observe(node, {
        characterData: true
      });

      notify = function notify() {
        node.data = toggle = !toggle;
      }; // environments with maybe non-completely correct, but existent Promise

    } else if (Promise$1 && Promise$1.resolve) {
      // Promise.resolve without an argument throws an error in LG WebOS 2
      promise = Promise$1.resolve(undefined);
      then = promise.then;

      notify = function notify() {
        then.call(promise, flush);
      }; // Node.js without promises

    } else if (engineIsNode) {
      notify = function notify() {
        process$2.nextTick(flush);
      }; // for other environments - macrotask based on:
      // - setImmediate
      // - MessageChannel
      // - window.postMessag
      // - onreadystatechange
      // - setTimeout

    } else {
      notify = function notify() {
        // strange IE + webpack dev server bug - use .call(global)
        macrotask.call(global$1, flush);
      };
    }
  }

  var microtask = queueMicrotask || function (fn) {
    var task = {
      fn: fn,
      next: undefined
    };
    if (last) last.next = task;

    if (!head) {
      head = task;
      notify();
    }

    last = task;
  };

  var PromiseCapability = function PromiseCapability(C) {
    var resolve, reject;
    this.promise = new C(function ($$resolve, $$reject) {
      if (resolve !== undefined || reject !== undefined) throw TypeError('Bad Promise constructor');
      resolve = $$resolve;
      reject = $$reject;
    });
    this.resolve = aFunction$1(resolve);
    this.reject = aFunction$1(reject);
  }; // 25.4.1.5 NewPromiseCapability(C)


  var f$5 = function f(C) {
    return new PromiseCapability(C);
  };

  var newPromiseCapability = {
    f: f$5
  };

  var promiseResolve = function promiseResolve(C, x) {
    anObject(C);
    if (isObject(x) && x.constructor === C) return x;
    var promiseCapability = newPromiseCapability.f(C);
    var resolve = promiseCapability.resolve;
    resolve(x);
    return promiseCapability.promise;
  };

  var hostReportErrors = function hostReportErrors(a, b) {
    var console = global$1.console;

    if (console && console.error) {
      arguments.length === 1 ? console.error(a) : console.error(a, b);
    }
  };

  var perform = function perform(exec) {
    try {
      return {
        error: false,
        value: exec()
      };
    } catch (error) {
      return {
        error: true,
        value: error
      };
    }
  };

  var task$1 = task.set;
  var SPECIES$4 = wellKnownSymbol('species');
  var PROMISE = 'Promise';
  var getInternalState$1 = internalState.get;
  var setInternalState$1 = internalState.set;
  var getInternalPromiseState = internalState.getterFor(PROMISE);
  var PromiseConstructor = nativePromiseConstructor;
  var TypeError$1 = global$1.TypeError;
  var document$3 = global$1.document;
  var process$3 = global$1.process;
  var $fetch = getBuiltIn('fetch');
  var newPromiseCapability$1 = newPromiseCapability.f;
  var newGenericPromiseCapability = newPromiseCapability$1;
  var DISPATCH_EVENT = !!(document$3 && document$3.createEvent && global$1.dispatchEvent);
  var NATIVE_REJECTION_EVENT = typeof PromiseRejectionEvent == 'function';
  var UNHANDLED_REJECTION = 'unhandledrejection';
  var REJECTION_HANDLED = 'rejectionhandled';
  var PENDING = 0;
  var FULFILLED = 1;
  var REJECTED = 2;
  var HANDLED = 1;
  var UNHANDLED = 2;
  var Internal, OwnPromiseCapability, PromiseWrapper, nativeThen;
  var FORCED$1 = isForced_1(PROMISE, function () {
    var GLOBAL_CORE_JS_PROMISE = inspectSource(PromiseConstructor) !== String(PromiseConstructor);

    if (!GLOBAL_CORE_JS_PROMISE) {
      // V8 6.6 (Node 10 and Chrome 66) have a bug with resolving custom thenables
      // https://bugs.chromium.org/p/chromium/issues/detail?id=830565
      // We can't detect it synchronously, so just check versions
      if (engineV8Version === 66) return true; // Unhandled rejections tracking support, NodeJS Promise without it fails @@species test

      if (!engineIsNode && !NATIVE_REJECTION_EVENT) return true;
    } // We need Promise#finally in the pure version for preventing prototype pollution
    // deoptimization and performance degradation
    // https://github.com/zloirock/core-js/issues/679

    if (engineV8Version >= 51 && /native code/.test(PromiseConstructor)) return false; // Detect correctness of subclassing with @@species support

    var promise = PromiseConstructor.resolve(1);

    var FakePromise = function FakePromise(exec) {
      exec(function () {
        /* empty */
      }, function () {
        /* empty */
      });
    };

    var constructor = promise.constructor = {};
    constructor[SPECIES$4] = FakePromise;
    return !(promise.then(function () {
      /* empty */
    }) instanceof FakePromise);
  });
  var INCORRECT_ITERATION = FORCED$1 || !checkCorrectnessOfIteration(function (iterable) {
    PromiseConstructor.all(iterable)['catch'](function () {
      /* empty */
    });
  }); // helpers

  var isThenable = function isThenable(it) {
    var then;
    return isObject(it) && typeof (then = it.then) == 'function' ? then : false;
  };

  var notify$1 = function notify(state, isReject) {
    if (state.notified) return;
    state.notified = true;
    var chain = state.reactions;
    microtask(function () {
      var value = state.value;
      var ok = state.state == FULFILLED;
      var index = 0; // variable length - can't use forEach

      while (chain.length > index) {
        var reaction = chain[index++];
        var handler = ok ? reaction.ok : reaction.fail;
        var resolve = reaction.resolve;
        var reject = reaction.reject;
        var domain = reaction.domain;
        var result, then, exited;

        try {
          if (handler) {
            if (!ok) {
              if (state.rejection === UNHANDLED) onHandleUnhandled(state);
              state.rejection = HANDLED;
            }

            if (handler === true) result = value;else {
              if (domain) domain.enter();
              result = handler(value); // can throw

              if (domain) {
                domain.exit();
                exited = true;
              }
            }

            if (result === reaction.promise) {
              reject(TypeError$1('Promise-chain cycle'));
            } else if (then = isThenable(result)) {
              then.call(result, resolve, reject);
            } else resolve(result);
          } else reject(value);
        } catch (error) {
          if (domain && !exited) domain.exit();
          reject(error);
        }
      }

      state.reactions = [];
      state.notified = false;
      if (isReject && !state.rejection) onUnhandled(state);
    });
  };

  var dispatchEvent = function dispatchEvent(name, promise, reason) {
    var event, handler;

    if (DISPATCH_EVENT) {
      event = document$3.createEvent('Event');
      event.promise = promise;
      event.reason = reason;
      event.initEvent(name, false, true);
      global$1.dispatchEvent(event);
    } else event = {
      promise: promise,
      reason: reason
    };

    if (!NATIVE_REJECTION_EVENT && (handler = global$1['on' + name])) handler(event);else if (name === UNHANDLED_REJECTION) hostReportErrors('Unhandled promise rejection', reason);
  };

  var onUnhandled = function onUnhandled(state) {
    task$1.call(global$1, function () {
      var promise = state.facade;
      var value = state.value;
      var IS_UNHANDLED = isUnhandled(state);
      var result;

      if (IS_UNHANDLED) {
        result = perform(function () {
          if (engineIsNode) {
            process$3.emit('unhandledRejection', value, promise);
          } else dispatchEvent(UNHANDLED_REJECTION, promise, value);
        }); // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should

        state.rejection = engineIsNode || isUnhandled(state) ? UNHANDLED : HANDLED;
        if (result.error) throw result.value;
      }
    });
  };

  var isUnhandled = function isUnhandled(state) {
    return state.rejection !== HANDLED && !state.parent;
  };

  var onHandleUnhandled = function onHandleUnhandled(state) {
    task$1.call(global$1, function () {
      var promise = state.facade;

      if (engineIsNode) {
        process$3.emit('rejectionHandled', promise);
      } else dispatchEvent(REJECTION_HANDLED, promise, state.value);
    });
  };

  var bind = function bind(fn, state, unwrap) {
    return function (value) {
      fn(state, value, unwrap);
    };
  };

  var internalReject = function internalReject(state, value, unwrap) {
    if (state.done) return;
    state.done = true;
    if (unwrap) state = unwrap;
    state.value = value;
    state.state = REJECTED;
    notify$1(state, true);
  };

  var internalResolve = function internalResolve(state, value, unwrap) {
    if (state.done) return;
    state.done = true;
    if (unwrap) state = unwrap;

    try {
      if (state.facade === value) throw TypeError$1("Promise can't be resolved itself");
      var then = isThenable(value);

      if (then) {
        microtask(function () {
          var wrapper = {
            done: false
          };

          try {
            then.call(value, bind(internalResolve, wrapper, state), bind(internalReject, wrapper, state));
          } catch (error) {
            internalReject(wrapper, error, state);
          }
        });
      } else {
        state.value = value;
        state.state = FULFILLED;
        notify$1(state, false);
      }
    } catch (error) {
      internalReject({
        done: false
      }, error, state);
    }
  }; // constructor polyfill


  if (FORCED$1) {
    // 25.4.3.1 Promise(executor)
    PromiseConstructor = function Promise(executor) {
      anInstance(this, PromiseConstructor, PROMISE);
      aFunction$1(executor);
      Internal.call(this);
      var state = getInternalState$1(this);

      try {
        executor(bind(internalResolve, state), bind(internalReject, state));
      } catch (error) {
        internalReject(state, error);
      }
    }; // eslint-disable-next-line no-unused-vars


    Internal = function Promise(executor) {
      setInternalState$1(this, {
        type: PROMISE,
        done: false,
        notified: false,
        parent: false,
        reactions: [],
        rejection: false,
        state: PENDING,
        value: undefined
      });
    };

    Internal.prototype = redefineAll(PromiseConstructor.prototype, {
      // `Promise.prototype.then` method
      // https://tc39.es/ecma262/#sec-promise.prototype.then
      then: function then(onFulfilled, onRejected) {
        var state = getInternalPromiseState(this);
        var reaction = newPromiseCapability$1(speciesConstructor(this, PromiseConstructor));
        reaction.ok = typeof onFulfilled == 'function' ? onFulfilled : true;
        reaction.fail = typeof onRejected == 'function' && onRejected;
        reaction.domain = engineIsNode ? process$3.domain : undefined;
        state.parent = true;
        state.reactions.push(reaction);
        if (state.state != PENDING) notify$1(state, false);
        return reaction.promise;
      },
      // `Promise.prototype.catch` method
      // https://tc39.es/ecma262/#sec-promise.prototype.catch
      'catch': function _catch(onRejected) {
        return this.then(undefined, onRejected);
      }
    });

    OwnPromiseCapability = function OwnPromiseCapability() {
      var promise = new Internal();
      var state = getInternalState$1(promise);
      this.promise = promise;
      this.resolve = bind(internalResolve, state);
      this.reject = bind(internalReject, state);
    };

    newPromiseCapability.f = newPromiseCapability$1 = function newPromiseCapability(C) {
      return C === PromiseConstructor || C === PromiseWrapper ? new OwnPromiseCapability(C) : newGenericPromiseCapability(C);
    };

    if ( typeof nativePromiseConstructor == 'function') {
      nativeThen = nativePromiseConstructor.prototype.then; // wrap native Promise#then for native async functions

      redefine(nativePromiseConstructor.prototype, 'then', function then(onFulfilled, onRejected) {
        var that = this;
        return new PromiseConstructor(function (resolve, reject) {
          nativeThen.call(that, resolve, reject);
        }).then(onFulfilled, onRejected); // https://github.com/zloirock/core-js/issues/640
      }, {
        unsafe: true
      }); // wrap fetch result

      if (typeof $fetch == 'function') _export({
        global: true,
        enumerable: true,
        forced: true
      }, {
        // eslint-disable-next-line no-unused-vars
        fetch: function fetch(input
        /* , init */
        ) {
          return promiseResolve(PromiseConstructor, $fetch.apply(global$1, arguments));
        }
      });
    }
  }

  _export({
    global: true,
    wrap: true,
    forced: FORCED$1
  }, {
    Promise: PromiseConstructor
  });
  setToStringTag(PromiseConstructor, PROMISE, false);
  setSpecies(PROMISE);
  PromiseWrapper = getBuiltIn(PROMISE); // statics

  _export({
    target: PROMISE,
    stat: true,
    forced: FORCED$1
  }, {
    // `Promise.reject` method
    // https://tc39.es/ecma262/#sec-promise.reject
    reject: function reject(r) {
      var capability = newPromiseCapability$1(this);
      capability.reject.call(undefined, r);
      return capability.promise;
    }
  });
  _export({
    target: PROMISE,
    stat: true,
    forced:  FORCED$1
  }, {
    // `Promise.resolve` method
    // https://tc39.es/ecma262/#sec-promise.resolve
    resolve: function resolve(x) {
      return promiseResolve( this, x);
    }
  });
  _export({
    target: PROMISE,
    stat: true,
    forced: INCORRECT_ITERATION
  }, {
    // `Promise.all` method
    // https://tc39.es/ecma262/#sec-promise.all
    all: function all(iterable) {
      var C = this;
      var capability = newPromiseCapability$1(C);
      var resolve = capability.resolve;
      var reject = capability.reject;
      var result = perform(function () {
        var $promiseResolve = aFunction$1(C.resolve);
        var values = [];
        var counter = 0;
        var remaining = 1;
        iterate(iterable, function (promise) {
          var index = counter++;
          var alreadyCalled = false;
          values.push(undefined);
          remaining++;
          $promiseResolve.call(C, promise).then(function (value) {
            if (alreadyCalled) return;
            alreadyCalled = true;
            values[index] = value;
            --remaining || resolve(values);
          }, reject);
        });
        --remaining || resolve(values);
      });
      if (result.error) reject(result.value);
      return capability.promise;
    },
    // `Promise.race` method
    // https://tc39.es/ecma262/#sec-promise.race
    race: function race(iterable) {
      var C = this;
      var capability = newPromiseCapability$1(C);
      var reject = capability.reject;
      var result = perform(function () {
        var $promiseResolve = aFunction$1(C.resolve);
        iterate(iterable, function (promise) {
          $promiseResolve.call(C, promise).then(capability.resolve, reject);
        });
      });
      if (result.error) reject(result.value);
      return capability.promise;
    }
  });

  // https://tc39.es/ecma262/#sec-get-regexp.prototype.flags


  var regexpFlags = function regexpFlags() {
    var that = anObject(this);
    var result = '';
    if (that.global) result += 'g';
    if (that.ignoreCase) result += 'i';
    if (that.multiline) result += 'm';
    if (that.dotAll) result += 's';
    if (that.unicode) result += 'u';
    if (that.sticky) result += 'y';
    return result;
  };

  // so we use an intermediate function.


  function RE(s, f) {
    return RegExp(s, f);
  }

  var UNSUPPORTED_Y = fails(function () {
    // babel-minify transpiles RegExp('a', 'y') -> /a/y and it causes SyntaxError
    var re = RE('a', 'y');
    re.lastIndex = 2;
    return re.exec('abcd') != null;
  });
  var BROKEN_CARET = fails(function () {
    // https://bugzilla.mozilla.org/show_bug.cgi?id=773687
    var re = RE('^r', 'gy');
    re.lastIndex = 2;
    return re.exec('str') != null;
  });
  var regexpStickyHelpers = {
    UNSUPPORTED_Y: UNSUPPORTED_Y,
    BROKEN_CARET: BROKEN_CARET
  };

  var nativeExec = RegExp.prototype.exec; // This always refers to the native implementation, because the
  // String#replace polyfill uses ./fix-regexp-well-known-symbol-logic.js,
  // which loads this file before patching the method.

  var nativeReplace = String.prototype.replace;
  var patchedExec = nativeExec;

  var UPDATES_LAST_INDEX_WRONG = function () {
    var re1 = /a/;
    var re2 = /b*/g;
    nativeExec.call(re1, 'a');
    nativeExec.call(re2, 'a');
    return re1.lastIndex !== 0 || re2.lastIndex !== 0;
  }();

  var UNSUPPORTED_Y$1 = regexpStickyHelpers.UNSUPPORTED_Y || regexpStickyHelpers.BROKEN_CARET; // nonparticipating capturing group, copied from es5-shim's String#split patch.

  var NPCG_INCLUDED = /()??/.exec('')[1] !== undefined;
  var PATCH = UPDATES_LAST_INDEX_WRONG || NPCG_INCLUDED || UNSUPPORTED_Y$1;

  if (PATCH) {
    patchedExec = function exec(str) {
      var re = this;
      var lastIndex, reCopy, match, i;
      var sticky = UNSUPPORTED_Y$1 && re.sticky;
      var flags = regexpFlags.call(re);
      var source = re.source;
      var charsAdded = 0;
      var strCopy = str;

      if (sticky) {
        flags = flags.replace('y', '');

        if (flags.indexOf('g') === -1) {
          flags += 'g';
        }

        strCopy = String(str).slice(re.lastIndex); // Support anchored sticky behavior.

        if (re.lastIndex > 0 && (!re.multiline || re.multiline && str[re.lastIndex - 1] !== '\n')) {
          source = '(?: ' + source + ')';
          strCopy = ' ' + strCopy;
          charsAdded++;
        } // ^(? + rx + ) is needed, in combination with some str slicing, to
        // simulate the 'y' flag.


        reCopy = new RegExp('^(?:' + source + ')', flags);
      }

      if (NPCG_INCLUDED) {
        reCopy = new RegExp('^' + source + '$(?!\\s)', flags);
      }

      if (UPDATES_LAST_INDEX_WRONG) lastIndex = re.lastIndex;
      match = nativeExec.call(sticky ? reCopy : re, strCopy);

      if (sticky) {
        if (match) {
          match.input = match.input.slice(charsAdded);
          match[0] = match[0].slice(charsAdded);
          match.index = re.lastIndex;
          re.lastIndex += match[0].length;
        } else re.lastIndex = 0;
      } else if (UPDATES_LAST_INDEX_WRONG && match) {
        re.lastIndex = re.global ? match.index + match[0].length : lastIndex;
      }

      if (NPCG_INCLUDED && match && match.length > 1) {
        // Fix browsers whose `exec` methods don't consistently return `undefined`
        // for NPCG, like IE8. NOTE: This doesn' work for /(.?)?/
        nativeReplace.call(match[0], reCopy, function () {
          for (i = 1; i < arguments.length - 2; i++) {
            if (arguments[i] === undefined) match[i] = undefined;
          }
        });
      }

      return match;
    };
  }

  var regexpExec = patchedExec;

  // https://tc39.es/ecma262/#sec-regexp.prototype.exec


  _export({
    target: 'RegExp',
    proto: true,
    forced: /./.exec !== regexpExec
  }, {
    exec: regexpExec
  });

  var createMethod$3 = function createMethod(CONVERT_TO_STRING) {
    return function ($this, pos) {
      var S = String(requireObjectCoercible($this));
      var position = toInteger(pos);
      var size = S.length;
      var first, second;
      if (position < 0 || position >= size) return CONVERT_TO_STRING ? '' : undefined;
      first = S.charCodeAt(position);
      return first < 0xD800 || first > 0xDBFF || position + 1 === size || (second = S.charCodeAt(position + 1)) < 0xDC00 || second > 0xDFFF ? CONVERT_TO_STRING ? S.charAt(position) : first : CONVERT_TO_STRING ? S.slice(position, position + 2) : (first - 0xD800 << 10) + (second - 0xDC00) + 0x10000;
    };
  };

  var stringMultibyte = {
    // `String.prototype.codePointAt` method
    // https://tc39.es/ecma262/#sec-string.prototype.codepointat
    codeAt: createMethod$3(false),
    // `String.prototype.at` method
    // https://github.com/mathiasbynens/String.prototype.at
    charAt: createMethod$3(true)
  };

  var charAt = stringMultibyte.charAt;
  var STRING_ITERATOR = 'String Iterator';
  var setInternalState$2 = internalState.set;
  var getInternalState$2 = internalState.getterFor(STRING_ITERATOR); // `String.prototype[@@iterator]` method
  // https://tc39.es/ecma262/#sec-string.prototype-@@iterator

  defineIterator(String, 'String', function (iterated) {
    setInternalState$2(this, {
      type: STRING_ITERATOR,
      string: String(iterated),
      index: 0
    }); // `%StringIteratorPrototype%.next` method
    // https://tc39.es/ecma262/#sec-%stringiteratorprototype%.next
  }, function next() {
    var state = getInternalState$2(this);
    var string = state.string;
    var index = state.index;
    var point;
    if (index >= string.length) return {
      value: undefined,
      done: true
    };
    point = charAt(string, index);
    state.index += point.length;
    return {
      value: point,
      done: false
    };
  });

  var SPECIES$5 = wellKnownSymbol('species');
  var REPLACE_SUPPORTS_NAMED_GROUPS = !fails(function () {
    // #replace needs built-in support for named groups.
    // #match works fine because it just return the exec results, even if it has
    // a "grops" property.
    var re = /./;

    re.exec = function () {
      var result = [];
      result.groups = {
        a: '7'
      };
      return result;
    };

    return ''.replace(re, '$<a>') !== '7';
  }); // IE <= 11 replaces $0 with the whole match, as if it was $&
  // https://stackoverflow.com/questions/6024666/getting-ie-to-replace-a-regex-with-the-literal-string-0

  var REPLACE_KEEPS_$0 = function () {
    return 'a'.replace(/./, '$0') === '$0';
  }();

  var REPLACE = wellKnownSymbol('replace'); // Safari <= 13.0.3(?) substitutes nth capture where n>m with an empty string

  var REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE = function () {
    if (/./[REPLACE]) {
      return /./[REPLACE]('a', '$0') === '';
    }

    return false;
  }(); // Chrome 51 has a buggy "split" implementation when RegExp#exec !== nativeExec
  // Weex JS has frozen built-in prototypes, so use try / catch wrapper


  var SPLIT_WORKS_WITH_OVERWRITTEN_EXEC = !fails(function () {
    var re = /(?:)/;
    var originalExec = re.exec;

    re.exec = function () {
      return originalExec.apply(this, arguments);
    };

    var result = 'ab'.split(re);
    return result.length !== 2 || result[0] !== 'a' || result[1] !== 'b';
  });

  var fixRegexpWellKnownSymbolLogic = function fixRegexpWellKnownSymbolLogic(KEY, length, exec, sham) {
    var SYMBOL = wellKnownSymbol(KEY);
    var DELEGATES_TO_SYMBOL = !fails(function () {
      // String methods call symbol-named RegEp methods
      var O = {};

      O[SYMBOL] = function () {
        return 7;
      };

      return ''[KEY](O) != 7;
    });
    var DELEGATES_TO_EXEC = DELEGATES_TO_SYMBOL && !fails(function () {
      // Symbol-named RegExp methods call .exec
      var execCalled = false;
      var re = /a/;

      if (KEY === 'split') {
        // We can't use real regex here since it causes deoptimization
        // and serious performance degradation in V8
        // https://github.com/zloirock/core-js/issues/306
        re = {}; // RegExp[@@split] doesn't call the regex's exec method, but first creates
        // a new one. We need to return the patched regex when creating the new one.

        re.constructor = {};

        re.constructor[SPECIES$5] = function () {
          return re;
        };

        re.flags = '';
        re[SYMBOL] = /./[SYMBOL];
      }

      re.exec = function () {
        execCalled = true;
        return null;
      };

      re[SYMBOL]('');
      return !execCalled;
    });

    if (!DELEGATES_TO_SYMBOL || !DELEGATES_TO_EXEC || KEY === 'replace' && !(REPLACE_SUPPORTS_NAMED_GROUPS && REPLACE_KEEPS_$0 && !REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE) || KEY === 'split' && !SPLIT_WORKS_WITH_OVERWRITTEN_EXEC) {
      var nativeRegExpMethod = /./[SYMBOL];
      var methods = exec(SYMBOL, ''[KEY], function (nativeMethod, regexp, str, arg2, forceStringMethod) {
        if (regexp.exec === regexpExec) {
          if (DELEGATES_TO_SYMBOL && !forceStringMethod) {
            // The native String method already delegates to @@method (this
            // polyfilled function), leasing to infinite recursion.
            // We avoid it by directly calling the native @@method method.
            return {
              done: true,
              value: nativeRegExpMethod.call(regexp, str, arg2)
            };
          }

          return {
            done: true,
            value: nativeMethod.call(str, regexp, arg2)
          };
        }

        return {
          done: false
        };
      }, {
        REPLACE_KEEPS_$0: REPLACE_KEEPS_$0,
        REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE: REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE
      });
      var stringMethod = methods[0];
      var regexMethod = methods[1];
      redefine(String.prototype, KEY, stringMethod);
      redefine(RegExp.prototype, SYMBOL, length == 2 // 21.2.5.8 RegExp.prototype[@@replace](string, replaceValue)
      // 21.2.5.11 RegExp.prototype[@@split](string, limit)
      ? function (string, arg) {
        return regexMethod.call(string, this, arg);
      } // 21.2.5.6 RegExp.prototype[@@match](string)
      // 21.2.5.9 RegExp.prototype[@@search](string)
      : function (string) {
        return regexMethod.call(string, this);
      });
    }

    if (sham) createNonEnumerableProperty(RegExp.prototype[SYMBOL], 'sham', true);
  };

  var charAt$1 = stringMultibyte.charAt; // `AdvanceStringIndex` abstract operation
  // https://tc39.es/ecma262/#sec-advancestringindex

  var advanceStringIndex = function advanceStringIndex(S, index, unicode) {
    return index + (unicode ? charAt$1(S, index).length : 1);
  };

  var floor$1 = Math.floor;
  var replace = ''.replace;
  var SUBSTITUTION_SYMBOLS = /\$([$&'`]|\d\d?|<[^>]*>)/g;
  var SUBSTITUTION_SYMBOLS_NO_NAMED = /\$([$&'`]|\d\d?)/g; // https://tc39.es/ecma262/#sec-getsubstitution

  var getSubstitution = function getSubstitution(matched, str, position, captures, namedCaptures, replacement) {
    var tailPos = position + matched.length;
    var m = captures.length;
    var symbols = SUBSTITUTION_SYMBOLS_NO_NAMED;

    if (namedCaptures !== undefined) {
      namedCaptures = toObject(namedCaptures);
      symbols = SUBSTITUTION_SYMBOLS;
    }

    return replace.call(replacement, symbols, function (match, ch) {
      var capture;

      switch (ch.charAt(0)) {
        case '$':
          return '$';

        case '&':
          return matched;

        case '`':
          return str.slice(0, position);

        case "'":
          return str.slice(tailPos);

        case '<':
          capture = namedCaptures[ch.slice(1, -1)];
          break;

        default:
          // \d\d?
          var n = +ch;
          if (n === 0) return match;

          if (n > m) {
            var f = floor$1(n / 10);
            if (f === 0) return match;
            if (f <= m) return captures[f - 1] === undefined ? ch.charAt(1) : captures[f - 1] + ch.charAt(1);
            return match;
          }

          capture = captures[n - 1];
      }

      return capture === undefined ? '' : capture;
    });
  };

  // https://tc39.es/ecma262/#sec-regexpexec

  var regexpExecAbstract = function regexpExecAbstract(R, S) {
    var exec = R.exec;

    if (typeof exec === 'function') {
      var result = exec.call(R, S);

      if (_typeof(result) !== 'object') {
        throw TypeError('RegExp exec method returned something other than an Object or null');
      }

      return result;
    }

    if (classofRaw(R) !== 'RegExp') {
      throw TypeError('RegExp#exec called on incompatible receiver');
    }

    return regexpExec.call(R, S);
  };

  var max$2 = Math.max;
  var min$3 = Math.min;

  var maybeToString = function maybeToString(it) {
    return it === undefined ? it : String(it);
  }; // @@replace logic


  fixRegexpWellKnownSymbolLogic('replace', 2, function (REPLACE, nativeReplace, maybeCallNative, reason) {
    var REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE = reason.REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE;
    var REPLACE_KEEPS_$0 = reason.REPLACE_KEEPS_$0;
    var UNSAFE_SUBSTITUTE = REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE ? '$' : '$0';
    return [// `String.prototype.replace` method
    // https://tc39.es/ecma262/#sec-string.prototype.replace
    function replace(searchValue, replaceValue) {
      var O = requireObjectCoercible(this);
      var replacer = searchValue == undefined ? undefined : searchValue[REPLACE];
      return replacer !== undefined ? replacer.call(searchValue, O, replaceValue) : nativeReplace.call(String(O), searchValue, replaceValue);
    }, // `RegExp.prototype[@@replace]` method
    // https://tc39.es/ecma262/#sec-regexp.prototype-@@replace
    function (regexp, replaceValue) {
      if (!REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE && REPLACE_KEEPS_$0 || typeof replaceValue === 'string' && replaceValue.indexOf(UNSAFE_SUBSTITUTE) === -1) {
        var res = maybeCallNative(nativeReplace, regexp, this, replaceValue);
        if (res.done) return res.value;
      }

      var rx = anObject(regexp);
      var S = String(this);
      var functionalReplace = typeof replaceValue === 'function';
      if (!functionalReplace) replaceValue = String(replaceValue);
      var global = rx.global;

      if (global) {
        var fullUnicode = rx.unicode;
        rx.lastIndex = 0;
      }

      var results = [];

      while (true) {
        var result = regexpExecAbstract(rx, S);
        if (result === null) break;
        results.push(result);
        if (!global) break;
        var matchStr = String(result[0]);
        if (matchStr === '') rx.lastIndex = advanceStringIndex(S, toLength(rx.lastIndex), fullUnicode);
      }

      var accumulatedResult = '';
      var nextSourcePosition = 0;

      for (var i = 0; i < results.length; i++) {
        result = results[i];
        var matched = String(result[0]);
        var position = max$2(min$3(toInteger(result.index), S.length), 0);
        var captures = []; // NOTE: This is equivalent to
        //   captures = result.slice(1).map(maybeToString)
        // but for some reason `nativeSlice.call(result, 1, result.length)` (called in
        // the slice polyfill when slicing native arrays) "doesn't work" in safari 9 and
        // causes a crash (https://pastebin.com/N21QzeQA) when trying to debug it.

        for (var j = 1; j < result.length; j++) {
          captures.push(maybeToString(result[j]));
        }

        var namedCaptures = result.groups;

        if (functionalReplace) {
          var replacerArgs = [matched].concat(captures, position, S);
          if (namedCaptures !== undefined) replacerArgs.push(namedCaptures);
          var replacement = String(replaceValue.apply(undefined, replacerArgs));
        } else {
          replacement = getSubstitution(matched, S, position, captures, namedCaptures, replaceValue);
        }

        if (position >= nextSourcePosition) {
          accumulatedResult += S.slice(nextSourcePosition, position) + replacement;
          nextSourcePosition = position + matched.length;
        }
      }

      return accumulatedResult + S.slice(nextSourcePosition);
    }];
  });

  // iterable DOM collections
  // flag - `iterable` interface - 'entries', 'keys', 'values', 'forEach' methods
  var domIterables = {
    CSSRuleList: 0,
    CSSStyleDeclaration: 0,
    CSSValueList: 0,
    ClientRectList: 0,
    DOMRectList: 0,
    DOMStringList: 0,
    DOMTokenList: 1,
    DataTransferItemList: 0,
    FileList: 0,
    HTMLAllCollection: 0,
    HTMLCollection: 0,
    HTMLFormElement: 0,
    HTMLSelectElement: 0,
    MediaList: 0,
    MimeTypeArray: 0,
    NamedNodeMap: 0,
    NodeList: 1,
    PaintRequestList: 0,
    Plugin: 0,
    PluginArray: 0,
    SVGLengthList: 0,
    SVGNumberList: 0,
    SVGPathSegList: 0,
    SVGPointList: 0,
    SVGStringList: 0,
    SVGTransformList: 0,
    SourceBufferList: 0,
    StyleSheetList: 0,
    TextTrackCueList: 0,
    TextTrackList: 0,
    TouchList: 0
  };

  var ITERATOR$5 = wellKnownSymbol('iterator');
  var TO_STRING_TAG$3 = wellKnownSymbol('toStringTag');
  var ArrayValues = es_array_iterator.values;

  for (var COLLECTION_NAME in domIterables) {
    var Collection = global$1[COLLECTION_NAME];
    var CollectionPrototype = Collection && Collection.prototype;

    if (CollectionPrototype) {
      // some Chrome versions have non-configurable methods on DOMTokenList
      if (CollectionPrototype[ITERATOR$5] !== ArrayValues) try {
        createNonEnumerableProperty(CollectionPrototype, ITERATOR$5, ArrayValues);
      } catch (error) {
        CollectionPrototype[ITERATOR$5] = ArrayValues;
      }

      if (!CollectionPrototype[TO_STRING_TAG$3]) {
        createNonEnumerableProperty(CollectionPrototype, TO_STRING_TAG$3, COLLECTION_NAME);
      }

      if (domIterables[COLLECTION_NAME]) for (var METHOD_NAME in es_array_iterator) {
        // some Chrome versions have non-configurable methods on DOMTokenList
        if (CollectionPrototype[METHOD_NAME] !== es_array_iterator[METHOD_NAME]) try {
          createNonEnumerableProperty(CollectionPrototype, METHOD_NAME, es_array_iterator[METHOD_NAME]);
        } catch (error) {
          CollectionPrototype[METHOD_NAME] = es_array_iterator[METHOD_NAME];
        }
      }
    }
  }

  var runtime_1 = createCommonjsModule(function (module) {
    var runtime = function (exports) {

      var Op = Object.prototype;
      var hasOwn = Op.hasOwnProperty;
      var undefined$1; // More compressible than void 0.

      var $Symbol = typeof Symbol === "function" ? Symbol : {};
      var iteratorSymbol = $Symbol.iterator || "@@iterator";
      var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
      var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

      function define(obj, key, value) {
        Object.defineProperty(obj, key, {
          value: value,
          enumerable: true,
          configurable: true,
          writable: true
        });
        return obj[key];
      }

      try {
        // IE 8 has a broken Object.defineProperty that only works on DOM objects.
        define({}, "");
      } catch (err) {
        define = function define(obj, key, value) {
          return obj[key] = value;
        };
      }

      function wrap(innerFn, outerFn, self, tryLocsList) {
        // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
        var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
        var generator = Object.create(protoGenerator.prototype);
        var context = new Context(tryLocsList || []); // The ._invoke method unifies the implementations of the .next,
        // .throw, and .return methods.

        generator._invoke = makeInvokeMethod(innerFn, self, context);
        return generator;
      }

      exports.wrap = wrap; // Try/catch helper to minimize deoptimizations. Returns a completion
      // record like context.tryEntries[i].completion. This interface could
      // have been (and was previously) designed to take a closure to be
      // invoked without arguments, but in all the cases we care about we
      // already have an existing method we want to call, so there's no need
      // to create a new function object. We can even get away with assuming
      // the method takes exactly one argument, since that happens to be true
      // in every case, so we don't have to touch the arguments object. The
      // only additional allocation required is the completion record, which
      // has a stable shape and so hopefully should be cheap to allocate.

      function tryCatch(fn, obj, arg) {
        try {
          return {
            type: "normal",
            arg: fn.call(obj, arg)
          };
        } catch (err) {
          return {
            type: "throw",
            arg: err
          };
        }
      }

      var GenStateSuspendedStart = "suspendedStart";
      var GenStateSuspendedYield = "suspendedYield";
      var GenStateExecuting = "executing";
      var GenStateCompleted = "completed"; // Returning this object from the innerFn has the same effect as
      // breaking out of the dispatch switch statement.

      var ContinueSentinel = {}; // Dummy constructor functions that we use as the .constructor and
      // .constructor.prototype properties for functions that return Generator
      // objects. For full spec compliance, you may wish to configure your
      // minifier not to mangle the names of these two functions.

      function Generator() {}

      function GeneratorFunction() {}

      function GeneratorFunctionPrototype() {} // This is a polyfill for %IteratorPrototype% for environments that
      // don't natively support it.


      var IteratorPrototype = {};

      IteratorPrototype[iteratorSymbol] = function () {
        return this;
      };

      var getProto = Object.getPrototypeOf;
      var NativeIteratorPrototype = getProto && getProto(getProto(values([])));

      if (NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
        // This environment has a native %IteratorPrototype%; use it instead
        // of the polyfill.
        IteratorPrototype = NativeIteratorPrototype;
      }

      var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype);
      GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
      GeneratorFunctionPrototype.constructor = GeneratorFunction;
      GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"); // Helper for defining the .next, .throw, and .return methods of the
      // Iterator interface in terms of a single ._invoke method.

      function defineIteratorMethods(prototype) {
        ["next", "throw", "return"].forEach(function (method) {
          define(prototype, method, function (arg) {
            return this._invoke(method, arg);
          });
        });
      }

      exports.isGeneratorFunction = function (genFun) {
        var ctor = typeof genFun === "function" && genFun.constructor;
        return ctor ? ctor === GeneratorFunction || // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction" : false;
      };

      exports.mark = function (genFun) {
        if (Object.setPrototypeOf) {
          Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
        } else {
          genFun.__proto__ = GeneratorFunctionPrototype;
          define(genFun, toStringTagSymbol, "GeneratorFunction");
        }

        genFun.prototype = Object.create(Gp);
        return genFun;
      }; // Within the body of any async function, `await x` is transformed to
      // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
      // `hasOwn.call(value, "__await")` to determine if the yielded value is
      // meant to be awaited.


      exports.awrap = function (arg) {
        return {
          __await: arg
        };
      };

      function AsyncIterator(generator, PromiseImpl) {
        function invoke(method, arg, resolve, reject) {
          var record = tryCatch(generator[method], generator, arg);

          if (record.type === "throw") {
            reject(record.arg);
          } else {
            var result = record.arg;
            var value = result.value;

            if (value && _typeof(value) === "object" && hasOwn.call(value, "__await")) {
              return PromiseImpl.resolve(value.__await).then(function (value) {
                invoke("next", value, resolve, reject);
              }, function (err) {
                invoke("throw", err, resolve, reject);
              });
            }

            return PromiseImpl.resolve(value).then(function (unwrapped) {
              // When a yielded Promise is resolved, its final value becomes
              // the .value of the Promise<{value,done}> result for the
              // current iteration.
              result.value = unwrapped;
              resolve(result);
            }, function (error) {
              // If a rejected Promise was yielded, throw the rejection back
              // into the async generator function so it can be handled there.
              return invoke("throw", error, resolve, reject);
            });
          }
        }

        var previousPromise;

        function enqueue(method, arg) {
          function callInvokeWithMethodAndArg() {
            return new PromiseImpl(function (resolve, reject) {
              invoke(method, arg, resolve, reject);
            });
          }

          return previousPromise = // If enqueue has been called before, then we want to wait until
          // all previous Promises have been resolved before calling invoke,
          // so that results are always delivered in the correct order. If
          // enqueue has not been called before, then it is important to
          // call invoke immediately, without waiting on a callback to fire,
          // so that the async generator function has the opportunity to do
          // any necessary setup in a predictable way. This predictability
          // is why the Promise constructor synchronously invokes its
          // executor callback, and why async functions synchronously
          // execute code before the first await. Since we implement simple
          // async functions in terms of async generators, it is especially
          // important to get this right, even though it requires care.
          previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
        } // Define the unified helper method that is used to implement .next,
        // .throw, and .return (see defineIteratorMethods).


        this._invoke = enqueue;
      }

      defineIteratorMethods(AsyncIterator.prototype);

      AsyncIterator.prototype[asyncIteratorSymbol] = function () {
        return this;
      };

      exports.AsyncIterator = AsyncIterator; // Note that simple async functions are implemented on top of
      // AsyncIterator objects; they just return a Promise for the value of
      // the final result produced by the iterator.

      exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) {
        if (PromiseImpl === void 0) PromiseImpl = Promise;
        var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl);
        return exports.isGeneratorFunction(outerFn) ? iter // If outerFn is a generator, return the full iterator.
        : iter.next().then(function (result) {
          return result.done ? result.value : iter.next();
        });
      };

      function makeInvokeMethod(innerFn, self, context) {
        var state = GenStateSuspendedStart;
        return function invoke(method, arg) {
          if (state === GenStateExecuting) {
            throw new Error("Generator is already running");
          }

          if (state === GenStateCompleted) {
            if (method === "throw") {
              throw arg;
            } // Be forgiving, per 25.3.3.3.3 of the spec:
            // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume


            return doneResult();
          }

          context.method = method;
          context.arg = arg;

          while (true) {
            var delegate = context.delegate;

            if (delegate) {
              var delegateResult = maybeInvokeDelegate(delegate, context);

              if (delegateResult) {
                if (delegateResult === ContinueSentinel) continue;
                return delegateResult;
              }
            }

            if (context.method === "next") {
              // Setting context._sent for legacy support of Babel's
              // function.sent implementation.
              context.sent = context._sent = context.arg;
            } else if (context.method === "throw") {
              if (state === GenStateSuspendedStart) {
                state = GenStateCompleted;
                throw context.arg;
              }

              context.dispatchException(context.arg);
            } else if (context.method === "return") {
              context.abrupt("return", context.arg);
            }

            state = GenStateExecuting;
            var record = tryCatch(innerFn, self, context);

            if (record.type === "normal") {
              // If an exception is thrown from innerFn, we leave state ===
              // GenStateExecuting and loop back for another invocation.
              state = context.done ? GenStateCompleted : GenStateSuspendedYield;

              if (record.arg === ContinueSentinel) {
                continue;
              }

              return {
                value: record.arg,
                done: context.done
              };
            } else if (record.type === "throw") {
              state = GenStateCompleted; // Dispatch the exception by looping back around to the
              // context.dispatchException(context.arg) call above.

              context.method = "throw";
              context.arg = record.arg;
            }
          }
        };
      } // Call delegate.iterator[context.method](context.arg) and handle the
      // result, either by returning a { value, done } result from the
      // delegate iterator, or by modifying context.method and context.arg,
      // setting context.delegate to null, and returning the ContinueSentinel.


      function maybeInvokeDelegate(delegate, context) {
        var method = delegate.iterator[context.method];

        if (method === undefined$1) {
          // A .throw or .return when the delegate iterator has no .throw
          // method always terminates the yield* loop.
          context.delegate = null;

          if (context.method === "throw") {
            // Note: ["return"] must be used for ES3 parsing compatibility.
            if (delegate.iterator["return"]) {
              // If the delegate iterator has a return method, give it a
              // chance to clean up.
              context.method = "return";
              context.arg = undefined$1;
              maybeInvokeDelegate(delegate, context);

              if (context.method === "throw") {
                // If maybeInvokeDelegate(context) changed context.method from
                // "return" to "throw", let that override the TypeError below.
                return ContinueSentinel;
              }
            }

            context.method = "throw";
            context.arg = new TypeError("The iterator does not provide a 'throw' method");
          }

          return ContinueSentinel;
        }

        var record = tryCatch(method, delegate.iterator, context.arg);

        if (record.type === "throw") {
          context.method = "throw";
          context.arg = record.arg;
          context.delegate = null;
          return ContinueSentinel;
        }

        var info = record.arg;

        if (!info) {
          context.method = "throw";
          context.arg = new TypeError("iterator result is not an object");
          context.delegate = null;
          return ContinueSentinel;
        }

        if (info.done) {
          // Assign the result of the finished delegate to the temporary
          // variable specified by delegate.resultName (see delegateYield).
          context[delegate.resultName] = info.value; // Resume execution at the desired location (see delegateYield).

          context.next = delegate.nextLoc; // If context.method was "throw" but the delegate handled the
          // exception, let the outer generator proceed normally. If
          // context.method was "next", forget context.arg since it has been
          // "consumed" by the delegate iterator. If context.method was
          // "return", allow the original .return call to continue in the
          // outer generator.

          if (context.method !== "return") {
            context.method = "next";
            context.arg = undefined$1;
          }
        } else {
          // Re-yield the result returned by the delegate method.
          return info;
        } // The delegate iterator is finished, so forget it and continue with
        // the outer generator.


        context.delegate = null;
        return ContinueSentinel;
      } // Define Generator.prototype.{next,throw,return} in terms of the
      // unified ._invoke helper method.


      defineIteratorMethods(Gp);
      define(Gp, toStringTagSymbol, "Generator"); // A Generator should always return itself as the iterator object when the
      // @@iterator function is called on it. Some browsers' implementations of the
      // iterator prototype chain incorrectly implement this, causing the Generator
      // object to not be returned from this call. This ensures that doesn't happen.
      // See https://github.com/facebook/regenerator/issues/274 for more details.

      Gp[iteratorSymbol] = function () {
        return this;
      };

      Gp.toString = function () {
        return "[object Generator]";
      };

      function pushTryEntry(locs) {
        var entry = {
          tryLoc: locs[0]
        };

        if (1 in locs) {
          entry.catchLoc = locs[1];
        }

        if (2 in locs) {
          entry.finallyLoc = locs[2];
          entry.afterLoc = locs[3];
        }

        this.tryEntries.push(entry);
      }

      function resetTryEntry(entry) {
        var record = entry.completion || {};
        record.type = "normal";
        delete record.arg;
        entry.completion = record;
      }

      function Context(tryLocsList) {
        // The root entry object (effectively a try statement without a catch
        // or a finally block) gives us a place to store values thrown from
        // locations where there is no enclosing try statement.
        this.tryEntries = [{
          tryLoc: "root"
        }];
        tryLocsList.forEach(pushTryEntry, this);
        this.reset(true);
      }

      exports.keys = function (object) {
        var keys = [];

        for (var key in object) {
          keys.push(key);
        }

        keys.reverse(); // Rather than returning an object with a next method, we keep
        // things simple and return the next function itself.

        return function next() {
          while (keys.length) {
            var key = keys.pop();

            if (key in object) {
              next.value = key;
              next.done = false;
              return next;
            }
          } // To avoid creating an additional object, we just hang the .value
          // and .done properties off the next function object itself. This
          // also ensures that the minifier will not anonymize the function.


          next.done = true;
          return next;
        };
      };

      function values(iterable) {
        if (iterable) {
          var iteratorMethod = iterable[iteratorSymbol];

          if (iteratorMethod) {
            return iteratorMethod.call(iterable);
          }

          if (typeof iterable.next === "function") {
            return iterable;
          }

          if (!isNaN(iterable.length)) {
            var i = -1,
                next = function next() {
              while (++i < iterable.length) {
                if (hasOwn.call(iterable, i)) {
                  next.value = iterable[i];
                  next.done = false;
                  return next;
                }
              }

              next.value = undefined$1;
              next.done = true;
              return next;
            };

            return next.next = next;
          }
        } // Return an iterator with no values.


        return {
          next: doneResult
        };
      }

      exports.values = values;

      function doneResult() {
        return {
          value: undefined$1,
          done: true
        };
      }

      Context.prototype = {
        constructor: Context,
        reset: function reset(skipTempReset) {
          this.prev = 0;
          this.next = 0; // Resetting context._sent for legacy support of Babel's
          // function.sent implementation.

          this.sent = this._sent = undefined$1;
          this.done = false;
          this.delegate = null;
          this.method = "next";
          this.arg = undefined$1;
          this.tryEntries.forEach(resetTryEntry);

          if (!skipTempReset) {
            for (var name in this) {
              // Not sure about the optimal order of these conditions:
              if (name.charAt(0) === "t" && hasOwn.call(this, name) && !isNaN(+name.slice(1))) {
                this[name] = undefined$1;
              }
            }
          }
        },
        stop: function stop() {
          this.done = true;
          var rootEntry = this.tryEntries[0];
          var rootRecord = rootEntry.completion;

          if (rootRecord.type === "throw") {
            throw rootRecord.arg;
          }

          return this.rval;
        },
        dispatchException: function dispatchException(exception) {
          if (this.done) {
            throw exception;
          }

          var context = this;

          function handle(loc, caught) {
            record.type = "throw";
            record.arg = exception;
            context.next = loc;

            if (caught) {
              // If the dispatched exception was caught by a catch block,
              // then let that catch block handle the exception normally.
              context.method = "next";
              context.arg = undefined$1;
            }

            return !!caught;
          }

          for (var i = this.tryEntries.length - 1; i >= 0; --i) {
            var entry = this.tryEntries[i];
            var record = entry.completion;

            if (entry.tryLoc === "root") {
              // Exception thrown outside of any try block that could handle
              // it, so set the completion value of the entire function to
              // throw the exception.
              return handle("end");
            }

            if (entry.tryLoc <= this.prev) {
              var hasCatch = hasOwn.call(entry, "catchLoc");
              var hasFinally = hasOwn.call(entry, "finallyLoc");

              if (hasCatch && hasFinally) {
                if (this.prev < entry.catchLoc) {
                  return handle(entry.catchLoc, true);
                } else if (this.prev < entry.finallyLoc) {
                  return handle(entry.finallyLoc);
                }
              } else if (hasCatch) {
                if (this.prev < entry.catchLoc) {
                  return handle(entry.catchLoc, true);
                }
              } else if (hasFinally) {
                if (this.prev < entry.finallyLoc) {
                  return handle(entry.finallyLoc);
                }
              } else {
                throw new Error("try statement without catch or finally");
              }
            }
          }
        },
        abrupt: function abrupt(type, arg) {
          for (var i = this.tryEntries.length - 1; i >= 0; --i) {
            var entry = this.tryEntries[i];

            if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
              var finallyEntry = entry;
              break;
            }
          }

          if (finallyEntry && (type === "break" || type === "continue") && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc) {
            // Ignore the finally entry if control is not jumping to a
            // location outside the try/catch block.
            finallyEntry = null;
          }

          var record = finallyEntry ? finallyEntry.completion : {};
          record.type = type;
          record.arg = arg;

          if (finallyEntry) {
            this.method = "next";
            this.next = finallyEntry.finallyLoc;
            return ContinueSentinel;
          }

          return this.complete(record);
        },
        complete: function complete(record, afterLoc) {
          if (record.type === "throw") {
            throw record.arg;
          }

          if (record.type === "break" || record.type === "continue") {
            this.next = record.arg;
          } else if (record.type === "return") {
            this.rval = this.arg = record.arg;
            this.method = "return";
            this.next = "end";
          } else if (record.type === "normal" && afterLoc) {
            this.next = afterLoc;
          }

          return ContinueSentinel;
        },
        finish: function finish(finallyLoc) {
          for (var i = this.tryEntries.length - 1; i >= 0; --i) {
            var entry = this.tryEntries[i];

            if (entry.finallyLoc === finallyLoc) {
              this.complete(entry.completion, entry.afterLoc);
              resetTryEntry(entry);
              return ContinueSentinel;
            }
          }
        },
        "catch": function _catch(tryLoc) {
          for (var i = this.tryEntries.length - 1; i >= 0; --i) {
            var entry = this.tryEntries[i];

            if (entry.tryLoc === tryLoc) {
              var record = entry.completion;

              if (record.type === "throw") {
                var thrown = record.arg;
                resetTryEntry(entry);
              }

              return thrown;
            }
          } // The context.catch method must only be called with a location
          // argument that corresponds to a known catch block.


          throw new Error("illegal catch attempt");
        },
        delegateYield: function delegateYield(iterable, resultName, nextLoc) {
          this.delegate = {
            iterator: values(iterable),
            resultName: resultName,
            nextLoc: nextLoc
          };

          if (this.method === "next") {
            // Deliberately forget the last sent value so that we don't
            // accidentally pass it on to the delegate.
            this.arg = undefined$1;
          }

          return ContinueSentinel;
        }
      }; // Regardless of whether this script is executing as a CommonJS module
      // or not, return the runtime object so that we can declare the variable
      // regeneratorRuntime in the outer scope, which allows this module to be
      // injected easily by `bin/regenerator --include-runtime script.js`.

      return exports;
    }( // If this script is executing as a CommonJS module, use module.exports
    // as the regeneratorRuntime namespace. Otherwise create a new empty
    // object. Either way, the resulting object will be used to initialize
    // the regeneratorRuntime variable at the top of this file.
     module.exports );

    try {
      regeneratorRuntime = runtime;
    } catch (accidentalStrictMode) {
      // This module should not be running in strict mode, so the above
      // assignment should always work unless something is misconfigured. Just
      // in case runtime.js accidentally runs in strict mode, we can escape
      // strict mode using a global Function call. This could conceivably fail
      // if a Content Security Policy forbids using Function, but in that case
      // the proper solution is to fix the accidental strict mode problem. If
      // you've misconfigured your bundler to force strict mode and applied a
      // CSP to forbid Function, and you're not willing to fix either of those
      // problems, please detail your unique predicament in a GitHub issue.
      Function("r", "regeneratorRuntime = r")(runtime);
    }
  });

  var $includes = arrayIncludes.includes;
  var USES_TO_LENGTH$2 = arrayMethodUsesToLength('indexOf', {
    ACCESSORS: true,
    1: 0
  }); // `Array.prototype.includes` method
  // https://tc39.es/ecma262/#sec-array.prototype.includes

  _export({
    target: 'Array',
    proto: true,
    forced: !USES_TO_LENGTH$2
  }, {
    includes: function includes(el
    /* , fromIndex = 0 */
    ) {
      return $includes(this, el, arguments.length > 1 ? arguments[1] : undefined);
    }
  }); // https://tc39.es/ecma262/#sec-array.prototype-@@unscopables

  addToUnscopables('includes');

  var arrayMethodIsStrict = function arrayMethodIsStrict(METHOD_NAME, argument) {
    var method = [][METHOD_NAME];
    return !!method && fails(function () {
      // eslint-disable-next-line no-useless-call,no-throw-literal
      method.call(null, argument || function () {
        throw 1;
      }, 1);
    });
  };

  var $indexOf = arrayIncludes.indexOf;
  var nativeIndexOf = [].indexOf;
  var NEGATIVE_ZERO = !!nativeIndexOf && 1 / [1].indexOf(1, -0) < 0;
  var STRICT_METHOD = arrayMethodIsStrict('indexOf');
  var USES_TO_LENGTH$3 = arrayMethodUsesToLength('indexOf', {
    ACCESSORS: true,
    1: 0
  }); // `Array.prototype.indexOf` method
  // https://tc39.es/ecma262/#sec-array.prototype.indexof

  _export({
    target: 'Array',
    proto: true,
    forced: NEGATIVE_ZERO || !STRICT_METHOD || !USES_TO_LENGTH$3
  }, {
    indexOf: function indexOf(searchElement
    /* , fromIndex = 0 */
    ) {
      return NEGATIVE_ZERO // convert -0 to +0
      ? nativeIndexOf.apply(this, arguments) || 0 : $indexOf(this, searchElement, arguments.length > 1 ? arguments[1] : undefined);
    }
  });

  var $map = arrayIteration.map;
  var HAS_SPECIES_SUPPORT$2 = arrayMethodHasSpeciesSupport('map'); // FF49- issue

  var USES_TO_LENGTH$4 = arrayMethodUsesToLength('map'); // `Array.prototype.map` method
  // https://tc39.es/ecma262/#sec-array.prototype.map
  // with adding support of @@species

  _export({
    target: 'Array',
    proto: true,
    forced: !HAS_SPECIES_SUPPORT$2 || !USES_TO_LENGTH$4
  }, {
    map: function map(callbackfn
    /* , thisArg */
    ) {
      return $map(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    }
  });

  var propertyIsEnumerable = objectPropertyIsEnumerable.f; // `Object.{ entries, values }` methods implementation

  var createMethod$4 = function createMethod(TO_ENTRIES) {
    return function (it) {
      var O = toIndexedObject(it);
      var keys = objectKeys(O);
      var length = keys.length;
      var i = 0;
      var result = [];
      var key;

      while (length > i) {
        key = keys[i++];

        if (!descriptors || propertyIsEnumerable.call(O, key)) {
          result.push(TO_ENTRIES ? [key, O[key]] : O[key]);
        }
      }

      return result;
    };
  };

  var objectToArray = {
    // `Object.entries` method
    // https://tc39.es/ecma262/#sec-object.entries
    entries: createMethod$4(true),
    // `Object.values` method
    // https://tc39.es/ecma262/#sec-object.values
    values: createMethod$4(false)
  };

  var $entries = objectToArray.entries; // `Object.entries` method
  // https://tc39.es/ecma262/#sec-object.entries

  _export({
    target: 'Object',
    stat: true
  }, {
    entries: function entries(O) {
      return $entries(O);
    }
  });

  var FAILS_ON_PRIMITIVES = fails(function () {
    objectKeys(1);
  }); // `Object.keys` method
  // https://tc39.es/ecma262/#sec-object.keys

  _export({
    target: 'Object',
    stat: true,
    forced: FAILS_ON_PRIMITIVES
  }, {
    keys: function keys(it) {
      return objectKeys(toObject(it));
    }
  });

  var MATCH = wellKnownSymbol('match'); // `IsRegExp` abstract operation
  // https://tc39.es/ecma262/#sec-isregexp

  var isRegexp = function isRegexp(it) {
    var isRegExp;
    return isObject(it) && ((isRegExp = it[MATCH]) !== undefined ? !!isRegExp : classofRaw(it) == 'RegExp');
  };

  var notARegexp = function notARegexp(it) {
    if (isRegexp(it)) {
      throw TypeError("The method doesn't accept regular expressions");
    }

    return it;
  };

  var MATCH$1 = wellKnownSymbol('match');

  var correctIsRegexpLogic = function correctIsRegexpLogic(METHOD_NAME) {
    var regexp = /./;

    try {
      '/./'[METHOD_NAME](regexp);
    } catch (error1) {
      try {
        regexp[MATCH$1] = false;
        return '/./'[METHOD_NAME](regexp);
      } catch (error2) {
        /* empty */
      }
    }

    return false;
  };

  // https://tc39.es/ecma262/#sec-string.prototype.includes


  _export({
    target: 'String',
    proto: true,
    forced: !correctIsRegexpLogic('includes')
  }, {
    includes: function includes(searchString
    /* , position = 0 */
    ) {
      return !!~String(requireObjectCoercible(this)).indexOf(notARegexp(searchString), arguments.length > 1 ? arguments[1] : undefined);
    }
  });

  /**
   * A base-class (or a mixin) adding support for event-listener and dispatchers.
   */

  /**
   * Hooks exist to allow users to alter flow.js file processing. This is intended for users relying on a dropzone and other higher-level components
   * when the flow between `addFiles()` and `upload()` is hardly configurable.
   * Users calling `await flow.asyncAddFiles()` have more room for customization before calling `upload();` without having to rely upon hooks.
   *
   * Hooks can *alter* the parameters they receive (javascript pass-by-reference rules will apply).
   * For example, the `file-added` hook receives a `flowfile` parameter. `delete flowfile` or `flowfile = {}` have no effect
   *  because parent function still hold reference. But `delete flowfile.file` would remove the File() and is supported as a way to
   *  dequeue a file from a list after its initialization.
   */
  var HOOKS = ['file-added', 'files-added', 'files-submitted'];
  /**
   * Additionally, some hooks are said filtering-hooks.
   * Code will consider the combined (OR-ed) return value of the callbacks to
   * decide whether or not keep processing this path/item.
   */

  var FILTERING_HOOKS = ['filter-file'];
  /**
   * Events are recognized (case-sensitive) CustomEvent processed using dispatchEvent.
   * This is a list of those fire by Flow.js, but any name can be attached too.
   */

  var EVENTS = ['complete', 'error', 'file-error', 'file-progress', 'file-removed', 'file-retry', 'file-success', 'progress', 'upload-start'];
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

  var _default = /*#__PURE__*/function (_EventTarget) {
    _inherits(_default, _EventTarget);

    var _super = _createSuper(_default);

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
    function _default() {
      var _this;

      var hooks_events = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      _classCallCheck(this, _default);

      _this = _super.call(this);
      _this._events = {};
      _this._hooks = {};
      _this._asyncHooks = {};
      /**
       * Hooks and events are distinguished based on the name.
       * Anything not being a know hook is assumed an event
       */

      for (var _i = 0, _Object$entries = Object.entries(hooks_events); _i < _Object$entries.length; _i++) {
        var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
            name = _Object$entries$_i[0],
            callbacks = _Object$entries$_i[1];

        var _iterator = _createForOfIteratorHelper(callbacks),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var callback = _step.value;

            _this.on(name, callback);
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      }

      return _this;
    }

    _createClass(_default, [{
      key: "isHook",
      value: function isHook(name) {
        return HOOKS.includes(name) || this.isFilter(name);
      }
    }, {
      key: "isFilter",
      value: function isFilter(name) {
        return FILTERING_HOOKS.includes(name);
      }
    }, {
      key: "isEvent",
      value: function isEvent(name) {
        return !this.isHook(name);
      }
    }, {
      key: "_camelToDashCase",
      value: function _camelToDashCase(str) {
        return str.replace(/[A-Z]/g, function (letter) {
          return "-".concat(letter.toLowerCase());
        });
      }
      /**
       * A wrapper for addEventListener to alternatively add hooks or events.
       */

    }, {
      key: "on",
      value: function on(event, callback, options) {
        var revent = this._camelToDashCase(event);

        if (revent != event) {
          console.warn("Flow.js v3: Do not rely on camel-case (".concat(event, ") event names."));

          if (HOOKS.concat(FILTERING_HOOKS, EVENTS).includes(revent)) {
            event = revent;
            console.info("Using \"".concat(revent, "\" instead."));
          }
        }

        return this.isEvent(event) ? this.addEventListener(event, callback, options) : this.addHook(event, callback, options);
      }
      /**
       * A wrapper for addEventListener to alternatively add hooks or events.
       */

    }, {
      key: "once",
      value: function once(event, callback, options) {
        return this.isEvent(event) ? this.addEventListener(event, callback, _objectSpread2(_objectSpread2({}, options), {}, {
          once: true
        })) : console.warn('once() is not implemented for hooks.');
      }
      /**
       * A wrapper for removeEventListener to alternatively remove hooks or events.
       */

    }, {
      key: "off",
      value: function off(event, callback, options) {
        if (this.isEvent(event) || !event) {
          // console.log(`[event] Remove event listeners...`);
          this.removeEventListener(event, callback, options);
        }

        if (!this.isEvent(event) || !event) {
          // console.log(`[event] Remove hooks...`);
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

    }, {
      key: "addEventListener",
      value: function addEventListener(event, callback) {
        var _arguments = arguments,
            _this2 = this;

        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

        var _callback = callback,
            runUnbinder = function runUnbinder() {
          _this2.removeEventListener(event, callback, options);

          _callback.apply(_this2, _arguments);
        },
            unbinder = function unbinder() {
          _this2.removeEventListener(event, callback, options);
        };

        if (options && options.once) {
          callback = runUnbinder;
        }

        this._addEventListener(event, callback, options);

        if (!this._events) {
          this._events = {};
          Object.defineProperty(this, '_events', {
            enumerable: false
          });
        }

        if (!this._events[event]) {
          this._events[event] = [];
        }

        this._events[event].push({
          listener: callback,
          useCapture: options === true || options.capture || false,
          passive: options && options.passive || false,
          once: options && options.once || false,
          type: event
        });

        return unbinder;
      }
    }, {
      key: "removeEventListener",
      value: function removeEventListener(event) {
        var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

        // var callback = e => callback.call(this, ...e.detail);
        if (callback) {
          this._removeEventListener(event, callback, options);
        }

        if (!this._events || event && !this._events[event]) {
          return;
        }

        if (!event || event === '*') {
          for (var _i2 = 0, _Object$keys = Object.keys(this._events); _i2 < _Object$keys.length; _i2++) {
            var name = _Object$keys[_i2];
            // console.log('[event] Removing all event listeners');
            this.removeEventListener(name);
          }

          return;
        }

        var _iterator2 = _createForOfIteratorHelper(this._events[event].entries()),
            _step2;

        try {
          for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
            var _step2$value = _slicedToArray(_step2.value, 2),
                i = _step2$value[0],
                v = _step2$value[1];

            if ((!callback || v.listener == callback) && v.useCapture == options) {
              // console.log(`[event] Removed one callback from "${event}"`);
              this._events[event].splice(i, 1);

              if (!callback) {
                this._removeEventListener(event, v.listener, v);
              } else {
                break;
              }
            }
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
        }

        if (this._events[event].length == 0) {
          delete this._events[event];
        }
      }
      /**
       * A wrapper for dispatchEvent handling "catch-all"
       */

    }, {
      key: "emit",
      value: function () {
        var _emit = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(name) {
          var _len,
              args,
              _key,
              _args = arguments;

          return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  for (_len = _args.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                    args[_key - 1] = _args[_key];
                  }

                  // console.log(`[event] Fire native event "${name}"${args.length ? ' with ' + args.length + ' arguments' : ''}`);
                  this.dispatchEvent(new CustomEvent(name, {
                    detail: args
                  }));

                  if (name != 'catch-all') {
                    this.emitCatchAll.apply(this, [name].concat(args));
                  }

                case 3:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee, this);
        }));

        function emit(_x) {
          return _emit.apply(this, arguments);
        }

        return emit;
      }()
    }, {
      key: "emitCatchAll",
      value: function () {
        var _emitCatchAll = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(name) {
          var _len2,
              args,
              _key2,
              _args2 = arguments;

          return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  for (_len2 = _args2.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                    args[_key2 - 1] = _args2[_key2];
                  }

                  this.dispatchEvent(new CustomEvent('catch-all', {
                    detail: [name].concat(args)
                  }));

                case 2:
                case "end":
                  return _context2.stop();
              }
            }
          }, _callee2, this);
        }));

        function emitCatchAll(_x2) {
          return _emitCatchAll.apply(this, arguments);
        }

        return emitCatchAll;
      }()
      /**
       * ### HOOKS ###
       */

    }, {
      key: "addHook",
      value: function addHook(event, callback, options) {
        var isAsync = callback.constructor.name === 'AsyncFunction',
            target = isAsync ? this._asyncHooks : this._hooks;

        if (!target.hasOwnProperty(event)) {
          target[event] = [];
        }

        target[event].push(callback);
      }
    }, {
      key: "hasHook",
      value: function hasHook(async, events) {
        events = typeof events === 'string' ? [events] : events || [];
        var target = async ? this._asyncHooks : this._hooks;

        for (var _i3 = 0, _Object$entries2 = Object.entries(target); _i3 < _Object$entries2.length; _i3++) {
          var _Object$entries2$_i = _slicedToArray(_Object$entries2[_i3], 2),
              k = _Object$entries2$_i[0],
              v = _Object$entries2$_i[1];

          if (events.length > 0 && !events.includes(k)) {
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

    }, {
      key: "removeHook",
      value: function removeHook(event, callback, options) {
        var arrayRemove = function arrayRemove(array, value) {
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

    }, {
      key: "hook",
      value: function hook(name) {
        var value,
            preventDefault = false,
            isFilter = this.isFilter(name),
            callbacks = this._hooks[name] || [];

        for (var _len3 = arguments.length, args = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
          args[_key3 - 1] = arguments[_key3];
        }

        var _iterator3 = _createForOfIteratorHelper(callbacks),
            _step3;

        try {
          for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
            var callback = _step3.value;
            // console.log(`[event] Fire hook "${name}"${args.length ? ' with ' + args.length + ' arguments' : ''}`);
            value = callback.apply(this, args);

            if (name === 'file-added' && value === false) {
              console.warn('In Flow.js 3.x, file-added event is an action rather than a fitler. return value is ignored but removing the `file` property allows to skip an enqueued file.');
            }

            if (isFilter) {
              // console.log(`[filter-event] ${event} returned:`, item.value);
              preventDefault |= value === false;
            } else {// Changes happen by reference. We ignore iterator.next().value.
            }
          }
        } catch (err) {
          _iterator3.e(err);
        } finally {
          _iterator3.f();
        }

        this.emitCatchAll.apply(this, [name].concat(args));
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

    }, {
      key: "aHook",
      value: function () {
        var _aHook = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(name) {
          var _this3 = this;

          var _len4,
              args,
              _key4,
              calls,
              isFilter,
              returns,
              _args3 = arguments;

          return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
              switch (_context3.prev = _context3.next) {
                case 0:
                  for (_len4 = _args3.length, args = new Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
                    args[_key4 - 1] = _args3[_key4];
                  }

                  calls = this._asyncHooks[name] || [], isFilter = this.isFilter(name);

                  if (calls.length) {
                    _context3.next = 4;
                    break;
                  }

                  return _context3.abrupt("return", isFilter ? true : args[0]);

                case 4:
                  _context3.next = 6;
                  return Promise.all(calls.map(function (e) {
                    return e.apply(_this3, args);
                  }));

                case 6:
                  returns = _context3.sent;
                  this.emitCatchAll.apply(this, [name].concat(args));
                  return _context3.abrupt("return", isFilter ? returns.include(false) : returns);

                case 9:
                case "end":
                  return _context3.stop();
              }
            }
          }, _callee3, this);
        }));

        function aHook(_x3) {
          return _aHook.apply(this, arguments);
        }

        return aHook;
      }()
    }]);

    return _default;
  }( /*#__PURE__*/_wrapNativeSuper(EventTarget));

  var min$4 = Math.min;
  var nativeLastIndexOf = [].lastIndexOf;
  var NEGATIVE_ZERO$1 = !!nativeLastIndexOf && 1 / [1].lastIndexOf(1, -0) < 0;
  var STRICT_METHOD$1 = arrayMethodIsStrict('lastIndexOf'); // For preventing possible almost infinite loop in non-standard implementations, test the forward version of the method

  var USES_TO_LENGTH$5 = arrayMethodUsesToLength('indexOf', {
    ACCESSORS: true,
    1: 0
  });
  var FORCED$2 = NEGATIVE_ZERO$1 || !STRICT_METHOD$1 || !USES_TO_LENGTH$5; // `Array.prototype.lastIndexOf` method implementation
  // https://tc39.es/ecma262/#sec-array.prototype.lastindexof

  var arrayLastIndexOf = FORCED$2 ? function lastIndexOf(searchElement
  /* , fromIndex = @[*-1] */
  ) {
    // convert -0 to +0
    if (NEGATIVE_ZERO$1) return nativeLastIndexOf.apply(this, arguments) || 0;
    var O = toIndexedObject(this);
    var length = toLength(O.length);
    var index = length - 1;
    if (arguments.length > 1) index = min$4(index, toInteger(arguments[1]));
    if (index < 0) index = length + index;

    for (; index >= 0; index--) {
      if (index in O && O[index] === searchElement) return index || 0;
    }

    return -1;
  } : nativeLastIndexOf;

  // https://tc39.es/ecma262/#sec-array.prototype.lastindexof

  _export({
    target: 'Array',
    proto: true,
    forced: arrayLastIndexOf !== [].lastIndexOf
  }, {
    lastIndexOf: arrayLastIndexOf
  });

  var arrayPush = [].push;
  var min$5 = Math.min;
  var MAX_UINT32 = 0xFFFFFFFF; // babel-minify transpiles RegExp('x', 'y') -> /x/y and it causes SyntaxError

  var SUPPORTS_Y = !fails(function () {
    return !RegExp(MAX_UINT32, 'y');
  }); // @@split logic

  fixRegexpWellKnownSymbolLogic('split', 2, function (SPLIT, nativeSplit, maybeCallNative) {
    var internalSplit;

    if ('abbc'.split(/(b)*/)[1] == 'c' || 'test'.split(/(?:)/, -1).length != 4 || 'ab'.split(/(?:ab)*/).length != 2 || '.'.split(/(.?)(.?)/).length != 4 || '.'.split(/()()/).length > 1 || ''.split(/.?/).length) {
      // based on es5-shim implementation, need to rework it
      internalSplit = function internalSplit(separator, limit) {
        var string = String(requireObjectCoercible(this));
        var lim = limit === undefined ? MAX_UINT32 : limit >>> 0;
        if (lim === 0) return [];
        if (separator === undefined) return [string]; // If `separator` is not a regex, use native split

        if (!isRegexp(separator)) {
          return nativeSplit.call(string, separator, lim);
        }

        var output = [];
        var flags = (separator.ignoreCase ? 'i' : '') + (separator.multiline ? 'm' : '') + (separator.unicode ? 'u' : '') + (separator.sticky ? 'y' : '');
        var lastLastIndex = 0; // Make `global` and avoid `lastIndex` issues by working with a copy

        var separatorCopy = new RegExp(separator.source, flags + 'g');
        var match, lastIndex, lastLength;

        while (match = regexpExec.call(separatorCopy, string)) {
          lastIndex = separatorCopy.lastIndex;

          if (lastIndex > lastLastIndex) {
            output.push(string.slice(lastLastIndex, match.index));
            if (match.length > 1 && match.index < string.length) arrayPush.apply(output, match.slice(1));
            lastLength = match[0].length;
            lastLastIndex = lastIndex;
            if (output.length >= lim) break;
          }

          if (separatorCopy.lastIndex === match.index) separatorCopy.lastIndex++; // Avoid an infinite loop
        }

        if (lastLastIndex === string.length) {
          if (lastLength || !separatorCopy.test('')) output.push('');
        } else output.push(string.slice(lastLastIndex));

        return output.length > lim ? output.slice(0, lim) : output;
      }; // Chakra, V8

    } else if ('0'.split(undefined, 0).length) {
      internalSplit = function internalSplit(separator, limit) {
        return separator === undefined && limit === 0 ? [] : nativeSplit.call(this, separator, limit);
      };
    } else internalSplit = nativeSplit;

    return [// `String.prototype.split` method
    // https://tc39.es/ecma262/#sec-string.prototype.split
    function split(separator, limit) {
      var O = requireObjectCoercible(this);
      var splitter = separator == undefined ? undefined : separator[SPLIT];
      return splitter !== undefined ? splitter.call(separator, O, limit) : internalSplit.call(String(O), separator, limit);
    }, // `RegExp.prototype[@@split]` method
    // https://tc39.es/ecma262/#sec-regexp.prototype-@@split
    //
    // NOTE: This cannot be properly polyfilled in engines that don't support
    // the 'y' flag.
    function (regexp, limit) {
      var res = maybeCallNative(internalSplit, regexp, this, limit, internalSplit !== nativeSplit);
      if (res.done) return res.value;
      var rx = anObject(regexp);
      var S = String(this);
      var C = speciesConstructor(rx, RegExp);
      var unicodeMatching = rx.unicode;
      var flags = (rx.ignoreCase ? 'i' : '') + (rx.multiline ? 'm' : '') + (rx.unicode ? 'u' : '') + (SUPPORTS_Y ? 'y' : 'g'); // ^(? + rx + ) is needed, in combination with some S slicing, to
      // simulate the 'y' flag.

      var splitter = new C(SUPPORTS_Y ? rx : '^(?:' + rx.source + ')', flags);
      var lim = limit === undefined ? MAX_UINT32 : limit >>> 0;
      if (lim === 0) return [];
      if (S.length === 0) return regexpExecAbstract(splitter, S) === null ? [S] : [];
      var p = 0;
      var q = 0;
      var A = [];

      while (q < S.length) {
        splitter.lastIndex = SUPPORTS_Y ? q : 0;
        var z = regexpExecAbstract(splitter, SUPPORTS_Y ? S : S.slice(q));
        var e;

        if (z === null || (e = min$5(toLength(splitter.lastIndex + (SUPPORTS_Y ? 0 : q)), S.length)) === p) {
          q = advanceStringIndex(S, q, unicodeMatching);
        } else {
          A.push(S.slice(p, q));
          if (A.length === lim) return A;

          for (var i = 1; i <= z.length - 1; i++) {
            A.push(z[i]);
            if (A.length === lim) return A;
          }

          q = p = e;
        }
      }

      A.push(S.slice(p));
      return A;
    }];
  }, !SUPPORTS_Y);

  var nativeJoin = [].join;
  var ES3_STRINGS = indexedObject != Object;
  var STRICT_METHOD$2 = arrayMethodIsStrict('join', ','); // `Array.prototype.join` method
  // https://tc39.es/ecma262/#sec-array.prototype.join

  _export({
    target: 'Array',
    proto: true,
    forced: ES3_STRINGS || !STRICT_METHOD$2
  }, {
    join: function join(separator) {
      return nativeJoin.call(toIndexedObject(this), separator === undefined ? ',' : separator);
    }
  });

  var HAS_SPECIES_SUPPORT$3 = arrayMethodHasSpeciesSupport('slice');
  var USES_TO_LENGTH$6 = arrayMethodUsesToLength('slice', {
    ACCESSORS: true,
    0: 0,
    1: 2
  });
  var SPECIES$6 = wellKnownSymbol('species');
  var nativeSlice = [].slice;
  var max$3 = Math.max; // `Array.prototype.slice` method
  // https://tc39.es/ecma262/#sec-array.prototype.slice
  // fallback for not array-like ES3 strings and DOM objects

  _export({
    target: 'Array',
    proto: true,
    forced: !HAS_SPECIES_SUPPORT$3 || !USES_TO_LENGTH$6
  }, {
    slice: function slice(start, end) {
      var O = toIndexedObject(this);
      var length = toLength(O.length);
      var k = toAbsoluteIndex(start, length);
      var fin = toAbsoluteIndex(end === undefined ? length : end, length); // inline `ArraySpeciesCreate` for usage native `Array#slice` where it's possible

      var Constructor, result, n;

      if (isArray(O)) {
        Constructor = O.constructor; // cross-realm fallback

        if (typeof Constructor == 'function' && (Constructor === Array || isArray(Constructor.prototype))) {
          Constructor = undefined;
        } else if (isObject(Constructor)) {
          Constructor = Constructor[SPECIES$6];
          if (Constructor === null) Constructor = undefined;
        }

        if (Constructor === Array || Constructor === undefined) {
          return nativeSlice.call(O, k, fin);
        }
      }

      result = new (Constructor === undefined ? Array : Constructor)(max$3(fin - k, 0));

      for (n = 0; k < fin; k++, n++) {
        if (k in O) createProperty(result, n, O[k]);
      }

      result.length = n;
      return result;
    }
  });

  /**
   * Default read function using the webAPI
   *
   * @function webAPIFileRead(fileObj, startByte, endByte, fileType, chunk)
   *
   */
  function webAPIFileRead(fileObj, startByte, endByte, fileType, chunk) {
    var function_name = 'slice';
    if (fileObj.file.slice) function_name = 'slice';else if (fileObj.file.mozSlice) function_name = 'mozSlice';else if (fileObj.file.webkitSlice) function_name = 'webkitSlice';
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
      return;
    }

    var key; // Is Array?
    // Array.isArray won't work, not only arrays can be iterated by index https://github.com/flowjs/ng-flow/issues/236#

    if (typeof obj.length !== 'undefined') {
      for (key = 0; key < obj.length; key++) {
        if (callback.call(context, obj[key], key) === false) {
          return;
        }
      }
    } else {
      for (key in obj) {
        if (obj.hasOwnProperty(key) && callback.call(context, obj[key], key) === false) {
          return;
        }
      }
    }
  }
  /**
   * Exclusively for test purposes
   * (Until Grunt+Karma+Jasmine can allow test to use (ES) `import` of tools.js)
   */


  var g = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};
  g.evalOpts = evalOpts;

  var nativeGetOwnPropertyNames = objectGetOwnPropertyNames.f;
  var toString$1 = {}.toString;
  var windowNames = (typeof window === "undefined" ? "undefined" : _typeof(window)) == 'object' && window && Object.getOwnPropertyNames ? Object.getOwnPropertyNames(window) : [];

  var getWindowNames = function getWindowNames(it) {
    try {
      return nativeGetOwnPropertyNames(it);
    } catch (error) {
      return windowNames.slice();
    }
  }; // fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window


  var f$6 = function getOwnPropertyNames(it) {
    return windowNames && toString$1.call(it) == '[object Window]' ? getWindowNames(it) : nativeGetOwnPropertyNames(toIndexedObject(it));
  };

  var objectGetOwnPropertyNamesExternal = {
    f: f$6
  };

  var f$7 = wellKnownSymbol;
  var wellKnownSymbolWrapped = {
    f: f$7
  };

  var defineProperty$5 = objectDefineProperty.f;

  var defineWellKnownSymbol = function defineWellKnownSymbol(NAME) {
    var _Symbol = path.Symbol || (path.Symbol = {});

    if (!has(_Symbol, NAME)) defineProperty$5(_Symbol, NAME, {
      value: wellKnownSymbolWrapped.f(NAME)
    });
  };

  var $forEach = arrayIteration.forEach;
  var HIDDEN = sharedKey('hidden');
  var SYMBOL = 'Symbol';
  var PROTOTYPE$1 = 'prototype';
  var TO_PRIMITIVE = wellKnownSymbol('toPrimitive');
  var setInternalState$3 = internalState.set;
  var getInternalState$3 = internalState.getterFor(SYMBOL);
  var ObjectPrototype$1 = Object[PROTOTYPE$1];
  var $Symbol = global$1.Symbol;
  var $stringify = getBuiltIn('JSON', 'stringify');
  var nativeGetOwnPropertyDescriptor$1 = objectGetOwnPropertyDescriptor.f;
  var nativeDefineProperty$1 = objectDefineProperty.f;
  var nativeGetOwnPropertyNames$1 = objectGetOwnPropertyNamesExternal.f;
  var nativePropertyIsEnumerable$1 = objectPropertyIsEnumerable.f;
  var AllSymbols = shared('symbols');
  var ObjectPrototypeSymbols = shared('op-symbols');
  var StringToSymbolRegistry = shared('string-to-symbol-registry');
  var SymbolToStringRegistry = shared('symbol-to-string-registry');
  var WellKnownSymbolsStore$1 = shared('wks');
  var QObject = global$1.QObject; // Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173

  var USE_SETTER = !QObject || !QObject[PROTOTYPE$1] || !QObject[PROTOTYPE$1].findChild; // fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687

  var setSymbolDescriptor = descriptors && fails(function () {
    return objectCreate(nativeDefineProperty$1({}, 'a', {
      get: function get() {
        return nativeDefineProperty$1(this, 'a', {
          value: 7
        }).a;
      }
    })).a != 7;
  }) ? function (O, P, Attributes) {
    var ObjectPrototypeDescriptor = nativeGetOwnPropertyDescriptor$1(ObjectPrototype$1, P);
    if (ObjectPrototypeDescriptor) delete ObjectPrototype$1[P];
    nativeDefineProperty$1(O, P, Attributes);

    if (ObjectPrototypeDescriptor && O !== ObjectPrototype$1) {
      nativeDefineProperty$1(ObjectPrototype$1, P, ObjectPrototypeDescriptor);
    }
  } : nativeDefineProperty$1;

  var wrap = function wrap(tag, description) {
    var symbol = AllSymbols[tag] = objectCreate($Symbol[PROTOTYPE$1]);
    setInternalState$3(symbol, {
      type: SYMBOL,
      tag: tag,
      description: description
    });
    if (!descriptors) symbol.description = description;
    return symbol;
  };

  var isSymbol = useSymbolAsUid ? function (it) {
    return _typeof(it) == 'symbol';
  } : function (it) {
    return Object(it) instanceof $Symbol;
  };

  var $defineProperty = function defineProperty(O, P, Attributes) {
    if (O === ObjectPrototype$1) $defineProperty(ObjectPrototypeSymbols, P, Attributes);
    anObject(O);
    var key = toPrimitive(P, true);
    anObject(Attributes);

    if (has(AllSymbols, key)) {
      if (!Attributes.enumerable) {
        if (!has(O, HIDDEN)) nativeDefineProperty$1(O, HIDDEN, createPropertyDescriptor(1, {}));
        O[HIDDEN][key] = true;
      } else {
        if (has(O, HIDDEN) && O[HIDDEN][key]) O[HIDDEN][key] = false;
        Attributes = objectCreate(Attributes, {
          enumerable: createPropertyDescriptor(0, false)
        });
      }

      return setSymbolDescriptor(O, key, Attributes);
    }

    return nativeDefineProperty$1(O, key, Attributes);
  };

  var $defineProperties = function defineProperties(O, Properties) {
    anObject(O);
    var properties = toIndexedObject(Properties);
    var keys = objectKeys(properties).concat($getOwnPropertySymbols(properties));
    $forEach(keys, function (key) {
      if (!descriptors || $propertyIsEnumerable.call(properties, key)) $defineProperty(O, key, properties[key]);
    });
    return O;
  };

  var $create = function create(O, Properties) {
    return Properties === undefined ? objectCreate(O) : $defineProperties(objectCreate(O), Properties);
  };

  var $propertyIsEnumerable = function propertyIsEnumerable(V) {
    var P = toPrimitive(V, true);
    var enumerable = nativePropertyIsEnumerable$1.call(this, P);
    if (this === ObjectPrototype$1 && has(AllSymbols, P) && !has(ObjectPrototypeSymbols, P)) return false;
    return enumerable || !has(this, P) || !has(AllSymbols, P) || has(this, HIDDEN) && this[HIDDEN][P] ? enumerable : true;
  };

  var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(O, P) {
    var it = toIndexedObject(O);
    var key = toPrimitive(P, true);
    if (it === ObjectPrototype$1 && has(AllSymbols, key) && !has(ObjectPrototypeSymbols, key)) return;
    var descriptor = nativeGetOwnPropertyDescriptor$1(it, key);

    if (descriptor && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key])) {
      descriptor.enumerable = true;
    }

    return descriptor;
  };

  var $getOwnPropertyNames = function getOwnPropertyNames(O) {
    var names = nativeGetOwnPropertyNames$1(toIndexedObject(O));
    var result = [];
    $forEach(names, function (key) {
      if (!has(AllSymbols, key) && !has(hiddenKeys, key)) result.push(key);
    });
    return result;
  };

  var $getOwnPropertySymbols = function getOwnPropertySymbols(O) {
    var IS_OBJECT_PROTOTYPE = O === ObjectPrototype$1;
    var names = nativeGetOwnPropertyNames$1(IS_OBJECT_PROTOTYPE ? ObjectPrototypeSymbols : toIndexedObject(O));
    var result = [];
    $forEach(names, function (key) {
      if (has(AllSymbols, key) && (!IS_OBJECT_PROTOTYPE || has(ObjectPrototype$1, key))) {
        result.push(AllSymbols[key]);
      }
    });
    return result;
  }; // `Symbol` constructor
  // https://tc39.es/ecma262/#sec-symbol-constructor


  if (!nativeSymbol) {
    $Symbol = function _Symbol() {
      if (this instanceof $Symbol) throw TypeError('Symbol is not a constructor');
      var description = !arguments.length || arguments[0] === undefined ? undefined : String(arguments[0]);
      var tag = uid(description);

      var setter = function setter(value) {
        if (this === ObjectPrototype$1) setter.call(ObjectPrototypeSymbols, value);
        if (has(this, HIDDEN) && has(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
        setSymbolDescriptor(this, tag, createPropertyDescriptor(1, value));
      };

      if (descriptors && USE_SETTER) setSymbolDescriptor(ObjectPrototype$1, tag, {
        configurable: true,
        set: setter
      });
      return wrap(tag, description);
    };

    redefine($Symbol[PROTOTYPE$1], 'toString', function toString() {
      return getInternalState$3(this).tag;
    });
    redefine($Symbol, 'withoutSetter', function (description) {
      return wrap(uid(description), description);
    });
    objectPropertyIsEnumerable.f = $propertyIsEnumerable;
    objectDefineProperty.f = $defineProperty;
    objectGetOwnPropertyDescriptor.f = $getOwnPropertyDescriptor;
    objectGetOwnPropertyNames.f = objectGetOwnPropertyNamesExternal.f = $getOwnPropertyNames;
    objectGetOwnPropertySymbols.f = $getOwnPropertySymbols;

    wellKnownSymbolWrapped.f = function (name) {
      return wrap(wellKnownSymbol(name), name);
    };

    if (descriptors) {
      // https://github.com/tc39/proposal-Symbol-description
      nativeDefineProperty$1($Symbol[PROTOTYPE$1], 'description', {
        configurable: true,
        get: function description() {
          return getInternalState$3(this).description;
        }
      });

      {
        redefine(ObjectPrototype$1, 'propertyIsEnumerable', $propertyIsEnumerable, {
          unsafe: true
        });
      }
    }
  }

  _export({
    global: true,
    wrap: true,
    forced: !nativeSymbol,
    sham: !nativeSymbol
  }, {
    Symbol: $Symbol
  });
  $forEach(objectKeys(WellKnownSymbolsStore$1), function (name) {
    defineWellKnownSymbol(name);
  });
  _export({
    target: SYMBOL,
    stat: true,
    forced: !nativeSymbol
  }, {
    // `Symbol.for` method
    // https://tc39.es/ecma262/#sec-symbol.for
    'for': function _for(key) {
      var string = String(key);
      if (has(StringToSymbolRegistry, string)) return StringToSymbolRegistry[string];
      var symbol = $Symbol(string);
      StringToSymbolRegistry[string] = symbol;
      SymbolToStringRegistry[symbol] = string;
      return symbol;
    },
    // `Symbol.keyFor` method
    // https://tc39.es/ecma262/#sec-symbol.keyfor
    keyFor: function keyFor(sym) {
      if (!isSymbol(sym)) throw TypeError(sym + ' is not a symbol');
      if (has(SymbolToStringRegistry, sym)) return SymbolToStringRegistry[sym];
    },
    useSetter: function useSetter() {
      USE_SETTER = true;
    },
    useSimple: function useSimple() {
      USE_SETTER = false;
    }
  });
  _export({
    target: 'Object',
    stat: true,
    forced: !nativeSymbol,
    sham: !descriptors
  }, {
    // `Object.create` method
    // https://tc39.es/ecma262/#sec-object.create
    create: $create,
    // `Object.defineProperty` method
    // https://tc39.es/ecma262/#sec-object.defineproperty
    defineProperty: $defineProperty,
    // `Object.defineProperties` method
    // https://tc39.es/ecma262/#sec-object.defineproperties
    defineProperties: $defineProperties,
    // `Object.getOwnPropertyDescriptor` method
    // https://tc39.es/ecma262/#sec-object.getownpropertydescriptors
    getOwnPropertyDescriptor: $getOwnPropertyDescriptor
  });
  _export({
    target: 'Object',
    stat: true,
    forced: !nativeSymbol
  }, {
    // `Object.getOwnPropertyNames` method
    // https://tc39.es/ecma262/#sec-object.getownpropertynames
    getOwnPropertyNames: $getOwnPropertyNames,
    // `Object.getOwnPropertySymbols` method
    // https://tc39.es/ecma262/#sec-object.getownpropertysymbols
    getOwnPropertySymbols: $getOwnPropertySymbols
  }); // Chrome 38 and 39 `Object.getOwnPropertySymbols` fails on primitives
  // https://bugs.chromium.org/p/v8/issues/detail?id=3443

  _export({
    target: 'Object',
    stat: true,
    forced: fails(function () {
      objectGetOwnPropertySymbols.f(1);
    })
  }, {
    getOwnPropertySymbols: function getOwnPropertySymbols(it) {
      return objectGetOwnPropertySymbols.f(toObject(it));
    }
  }); // `JSON.stringify` method behavior with symbols
  // https://tc39.es/ecma262/#sec-json.stringify

  if ($stringify) {
    var FORCED_JSON_STRINGIFY = !nativeSymbol || fails(function () {
      var symbol = $Symbol(); // MS Edge converts symbol values to JSON as {}

      return $stringify([symbol]) != '[null]' // WebKit converts symbol values to JSON as null
      || $stringify({
        a: symbol
      }) != '{}' // V8 throws on boxed symbols
      || $stringify(Object(symbol)) != '{}';
    });
    _export({
      target: 'JSON',
      stat: true,
      forced: FORCED_JSON_STRINGIFY
    }, {
      // eslint-disable-next-line no-unused-vars
      stringify: function stringify(it, replacer, space) {
        var args = [it];
        var index = 1;
        var $replacer;

        while (arguments.length > index) {
          args.push(arguments[index++]);
        }

        $replacer = replacer;
        if (!isObject(replacer) && it === undefined || isSymbol(it)) return; // IE8 returns string on undefined

        if (!isArray(replacer)) replacer = function replacer(key, value) {
          if (typeof $replacer == 'function') value = $replacer.call(this, key, value);
          if (!isSymbol(value)) return value;
        };
        args[1] = replacer;
        return $stringify.apply(null, args);
      }
    });
  } // `Symbol.prototype[@@toPrimitive]` method
  // https://tc39.es/ecma262/#sec-symbol.prototype-@@toprimitive


  if (!$Symbol[PROTOTYPE$1][TO_PRIMITIVE]) {
    createNonEnumerableProperty($Symbol[PROTOTYPE$1], TO_PRIMITIVE, $Symbol[PROTOTYPE$1].valueOf);
  } // `Symbol.prototype[@@toStringTag]` property
  // https://tc39.es/ecma262/#sec-symbol.prototype-@@tostringtag


  setToStringTag($Symbol, SYMBOL);
  hiddenKeys[HIDDEN] = true;

  var defineProperty$6 = objectDefineProperty.f;
  var NativeSymbol = global$1.Symbol;

  if (descriptors && typeof NativeSymbol == 'function' && (!('description' in NativeSymbol.prototype) || // Safari 12 bug
  NativeSymbol().description !== undefined)) {
    var EmptyStringDescriptionStore = {}; // wrap Symbol constructor for correct work with undefined description

    var SymbolWrapper = function _Symbol() {
      var description = arguments.length < 1 || arguments[0] === undefined ? undefined : String(arguments[0]);
      var result = this instanceof SymbolWrapper ? new NativeSymbol(description) // in Edge 13, String(Symbol(undefined)) === 'Symbol(undefined)'
      : description === undefined ? NativeSymbol() : NativeSymbol(description);
      if (description === '') EmptyStringDescriptionStore[result] = true;
      return result;
    };

    copyConstructorProperties(SymbolWrapper, NativeSymbol);
    var symbolPrototype = SymbolWrapper.prototype = NativeSymbol.prototype;
    symbolPrototype.constructor = SymbolWrapper;
    var symbolToString = symbolPrototype.toString;
    var native = String(NativeSymbol('test')) == 'Symbol(test)';
    var regexp = /^Symbol\((.*)\)[^)]+$/;
    defineProperty$6(symbolPrototype, 'description', {
      configurable: true,
      get: function description() {
        var symbol = isObject(this) ? this.valueOf() : this;
        var string = symbolToString.call(symbol);
        if (has(EmptyStringDescriptionStore, symbol)) return '';
        var desc = native ? string.slice(7, -1) : string.replace(regexp, '$1');
        return desc === '' ? undefined : desc;
      }
    });
    _export({
      global: true,
      forced: true
    }, {
      Symbol: SymbolWrapper
    });
  }

  // https://tc39.es/ecma262/#sec-symbol.tostringtag

  defineWellKnownSymbol('toStringTag');

  // https://tc39.es/ecma262/#sec-json-@@tostringtag

  setToStringTag(global$1.JSON, 'JSON', true);

  // https://tc39.es/ecma262/#sec-math-@@tostringtag

  setToStringTag(Math, 'Math', true);

  var DeferredPromise = // https://stackoverflow.com/a/47112177
  function DeferredPromise() {
    var _this = this;

    _classCallCheck(this, DeferredPromise);

    this.resolved = false;
    this._promise = new Promise(function (resolve, reject) {
      // assign the resolve and reject functions to `this`
      // making them usable on the class instance
      _this.resolve = function () {
        _this.resolved = true;
        return resolve();
      };

      _this.reject = reject;
    }); // bind `then` and `catch` to implement the same interface as Promise

    this.then = this._promise.then.bind(this._promise);
    this.catch = this._promise.catch.bind(this._promise);
    this[Symbol.toStringTag] = 'Promise';
  };

  /**
   * Class for storing a single chunk
   * @name FlowChunk
   * @param {Flow} flowObj
   * @param {FlowFile} fileObj
   * @param {number} offset
   * @constructor
   */

  var FlowChunk = /*#__PURE__*/function () {
    function FlowChunk(flowObj, fileObj, offset) {
      _classCallCheck(this, FlowChunk);

      /**
       * Reference to parent flow object
       * @type {Flow}
       */
      this.flowObj = flowObj;
      /**
       * Reference to parent FlowFile object
       * @type {FlowFile}
       */

      this.fileObj = fileObj;
      /**
       * File offset
       * @type {number}
       */

      this.offset = offset;
      /**
       * Indicates if chunk existence was checked on the server
       * @type {boolean}
       */

      this.tested = false;
      /**
       * Number of retries performed
       * @type {number}
       */

      this.retries = 0;
      /**
       * Pending retry
       * @type {boolean}
       */

      this.pendingRetry = false;
      /**
       * Preprocess state
       * @type {number} 0 = unprocessed, 1 = processing, 2 = finished
       */

      this.preprocessState = 0;
      /**
       * Read state
       * @type {number} 0 = not read, 1 = reading, 2 = finished
       */

      this.readState = 0;
      /**
       * The payload.
       * @type {Blob|string}
       */

      this.payload = null;
      /**
       * Mostly for streams: how many bytes were actually read
       * @type {number} -1 = not read
       */

      this.readBytes = -1;
      /**
       * File-level read state.
       * When reading from a stream we can't slice a known-size buffer in chunks.
       * These are constructed sequentially from blocking read. This list stores the
       * respective Promise status of each chunk.
       * @type {Promise}
       */

      this.readStreamState = new DeferredPromise();
      /**
       * Bytes transferred from total request size
       * @type {number}
       */

      this.loaded = 0;
      /**
       * Total request size
       * @type {number}
       */

      this.total = 0;
      /**
       * Size of a chunk
       * @type {number}
       */

      this.chunkSize = this.fileObj.chunkSize;
      /**
       * Chunk start byte in a file
       * @type {number}
       */

      this.startByte = this.offset * this.chunkSize;
      /**
       * A specific filename for this chunk which otherwise default to the main name
       * @type {string}
       */

      this.filename = null;
      /**
       * Chunk end byte in a file
       * @type {number}
       */

      this.endByte = this.computeEndByte();
      /**
       * XMLHttpRequest
       * @type {XMLHttpRequest}
       */

      this.xhr = null;
    }
    /**
     * Compute the endbyte in a file
     *
     */


    _createClass(FlowChunk, [{
      key: "computeEndByte",
      value: function computeEndByte() {
        var endByte = Math.min(this.fileObj.size, (this.offset + 1) * this.chunkSize);

        if (this.fileObj.size - endByte < this.chunkSize && !this.flowObj.opts.forceChunkSize) {
          // The last chunk will be bigger than the chunk size,
          // but less than 2 * this.chunkSize
          endByte = this.fileObj.size;
        }

        return endByte;
      }
      /**
       * Send chunk event
       * @param event
       * @param {...} args arguments of a callback
       */

    }, {
      key: "event",
      value: function event(_event, args) {
        args = Array.prototype.slice.call(arguments);
        args.unshift(this);
        this.fileObj.chunkEvent.apply(this.fileObj, args);
      }
      /**
       * Catch progress event
       * @param {ProgressEvent} event
       */

    }, {
      key: "progressHandler",
      value: function progressHandler(event) {
        // console.log(event);
        if (event.lengthComputable) {
          this.loaded = event.loaded;
          this.total = event.total;
        }

        this.event('progress', event);
      }
      /**
       * Catch test event
       * @param {Event} event
       */

    }, {
      key: "testHandler",
      value: function testHandler(event) {
        var status = this.status(true);

        if (status === 'error') {
          this.event(status, this.message());
          this.flowObj.uploadNextChunk();
        } else if (status === 'success') {
          this.tested = true;
          this.event(status, this.message());
          this.flowObj.uploadNextChunk();
        } else if (!this.fileObj.paused) {
          // Error might be caused by file pause method
          // Chunks does not exist on the server side
          this.tested = true;
          this.send();
        }
      }
      /**
       * Upload has stopped
       * @param {Event} event
       */

    }, {
      key: "doneHandler",
      value: function doneHandler(event) {
        var _this = this;

        var status = this.status();

        if (status === 'success' || status === 'error') {
          delete this.data;
          this.event(status, this.message());
          this.flowObj.uploadNextChunk();
        } else if (!this.fileObj.paused) {
          this.event('retry', this.message());
          this.pendingRetry = true;
          this.abort();
          this.retries++;
          var retryInterval = this.flowObj.opts.chunkRetryInterval;

          if (retryInterval !== null) {
            setTimeout(function () {
              return _this.send();
            }, retryInterval);
          } else {
            this.send();
          }
        }
      }
      /**
       * Get params for a request
       * @function
       */

    }, {
      key: "getParams",
      value: function getParams() {
        return {
          flowChunkNumber: this.offset + 1,
          flowChunkSize: this.chunkSize,
          flowCurrentChunkSize: this.endByte - this.startByte,
          flowTotalSize: this.fileObj.size,
          flowIdentifier: this.fileObj.uniqueIdentifier,
          flowFilename: this.fileObj.name,
          flowRelativePath: this.fileObj.relativePath,
          flowTotalChunks: this.fileObj.chunks.length
        };
      }
      /**
       * Get target option with query params
       * @function
       * @param params
       * @returns {string}
       */

    }, {
      key: "getTarget",
      value: function getTarget(target, params) {
        if (params.length == 0) {
          return target;
        }

        if (target.indexOf('?') < 0) {
          target += '?';
        } else {
          target += '&';
        }

        return target + params.join('&');
      }
      /**
       * Makes a GET request without any data to see if the chunk has already
       * been uploaded in a previous session
       * @function
       */

    }, {
      key: "test",
      value: function test() {
        // Set up request and listen for event
        this.xhr = new XMLHttpRequest();
        this.xhr.addEventListener("load", this.testHandler.bind(this), false);
        this.xhr.addEventListener("error", this.testHandler.bind(this), false);
        var testMethod = evalOpts(this.flowObj.opts.testMethod, this.fileObj, this);
        var data = this.prepareXhrRequest(testMethod, true);
        this.xhr.send(data);
      }
      /**
       * Finish preprocess state
       * @function
       */

    }, {
      key: "preprocessFinished",
      value: function () {
        var _preprocessFinished = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
          return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  // Re-compute the endByte after the preprocess function to allow an
                  // implementer of preprocess to set the fileObj size
                  this.endByte = this.computeEndByte();
                  this.preprocessState = 2;
                  _context.next = 4;
                  return this.send();

                case 4:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee, this);
        }));

        function preprocessFinished() {
          return _preprocessFinished.apply(this, arguments);
        }

        return preprocessFinished;
      }()
      /**
       * Finish read state
       * @function
       */

    }, {
      key: "readFinished",
      value: function readFinished(payload) {
        this.readState = 2;
        this.payload = payload;
        this.send();
      }
      /**
       * asyncReadFileFn() helper provides the ability of asynchronous read()
       * Eg: When reading from a ReadableStream.getReader().
       *
       * But:
       * - FlowChunk.send() can be called up to {simultaneousUploads} times.
       * - Concurrent or misordered read() would result in a corrupted payload.
       *
       * This function guards from this: As soon a previous chunk exists and as long as
       *  this previous chunk is not fully read(), we assume corresponding reader is unavailable
       *  and wait for it.
       * @function
       */

    }, {
      key: "readStreamGuard",
      value: function () {
        var _readStreamGuard = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
          var map;
          return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  map = this.fileObj.chunks.map(function (e) {
                    return e.readStreamState;
                  }).slice(0, this.offset);
                  _context2.prev = 1;
                  _context2.next = 4;
                  return Promise.all(map);

                case 4:
                  _context2.next = 10;
                  break;

                case 6:
                  _context2.prev = 6;
                  _context2.t0 = _context2["catch"](1);
                  console.error("Chunk ".concat(this.offset, ": Error while waiting for ").concat(map.length, " previous chunks being read."));
                  throw _context2.t0;

                case 10:
                case "end":
                  return _context2.stop();
              }
            }
          }, _callee2, this, [[1, 6]]);
        }));

        function readStreamGuard() {
          return _readStreamGuard.apply(this, arguments);
        }

        return readStreamGuard;
      }()
    }, {
      key: "readStreamChunk",
      value: function () {
        var _readStreamChunk = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
          var data, asyncRead, lastReadBytes;
          return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
              switch (_context3.prev = _context3.next) {
                case 0:
                  if (!this.readStreamState.resolved) {
                    _context3.next = 3;
                    break;
                  }

                  // This is normally impossible to reach. Has it been uploaded?
                  console.warn("Chunk ".concat(this.offset, " already read. xhr initialized = ").concat(this.xhr ? 1 : 0)); // We may want to retry (or not) to upload (but never try to read from the stream again or risk misordered chunks

                  return _context3.abrupt("return");

                case 3:
                  _context3.next = 5;
                  return this.readStreamGuard();

                case 5:
                  asyncRead = this.flowObj.opts.asyncReadFileFn;
                  _context3.next = 8;
                  return asyncRead(this.fileObj, this.startByte, this.endByte, this.fileObj.file.type, this);

                case 8:
                  data = _context3.sent;
                  this.readStreamState.resolve(); // Equivalent to readFinished()

                  this.readState = 2;

                  if (data) {
                    this.readBytes = data.size || data.size === 0 ? data.size : -1;
                  }

                  if (!(data && data.size > 0)) {
                    _context3.next = 17;
                    break;
                  }

                  if (this.flowObj.chunkSize) {
                    // This may imply a miscalculation of the total chunk numbers.
                    console.warn("Chunk ".concat(this.offset, ": returned too much data. Got ").concat(data.size, ". Expected not more than ").concat(this.flowObj.chunkSize, "."));
                  }

                  this.payload = data;
                  this.xhrSend(data);
                  return _context3.abrupt("return");

                case 17:
                  if (!(this.offset > 0)) {
                    _context3.next = 25;
                    break;
                  }

                  // last size of the buffer read for the previous chunk
                  lastReadBytes = this.fileObj.chunks[this.offset - 1].readBytes;

                  if (!(lastReadBytes < parseInt(this.chunkSize))) {
                    _context3.next = 25;
                    break;
                  }

                  console.warn("Chunk ".concat(this.offset, " seems superfluous. No byte read() meanwhile previous chunk was only ").concat(lastReadBytes, " bytes instead of ").concat(this.chunkSize)); // The last chunk's buffer wasn't even full. That means the number of chunk may
                  // have been miscomputed and this chunk is superfluous.
                  // We make a fake request so that overall status is "complete" and we can move on
                  // on this FlowFile.

                  this.pendingRetry = false;
                  this.xhr = {
                    readyState: 5,
                    status: 1
                  };
                  this.doneHandler(null);
                  return _context3.abrupt("return");

                case 25:
                  console.warn("Chunk ".concat(this.offset, ": no byte to read()"));
                  this.pendingRetry = false;

                case 27:
                case "end":
                  return _context3.stop();
              }
            }
          }, _callee3, this);
        }));

        function readStreamChunk() {
          return _readStreamChunk.apply(this, arguments);
        }

        return readStreamChunk;
      }()
      /**
       * Prepare data (preprocess/read) data then call xhrSend()
       * @function
       */

    }, {
      key: "send",
      value: function () {
        var _send = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
          var preprocess, read, asyncRead;
          return regeneratorRuntime.wrap(function _callee4$(_context4) {
            while (1) {
              switch (_context4.prev = _context4.next) {
                case 0:
                  preprocess = this.flowObj.opts.preprocess;
                  read = this.flowObj.opts.readFileFn;
                  asyncRead = this.flowObj.opts.asyncReadFileFn;

                  if (!(typeof preprocess === 'function')) {
                    _context4.next = 11;
                    break;
                  }

                  _context4.t0 = this.preprocessState;
                  _context4.next = _context4.t0 === 0 ? 7 : _context4.t0 === 1 ? 10 : 11;
                  break;

                case 7:
                  this.preprocessState = 1;
                  preprocess(this);
                  return _context4.abrupt("return");

                case 10:
                  return _context4.abrupt("return");

                case 11:
                  if (!asyncRead) {
                    _context4.next = 16;
                    break;
                  }

                  this.readState = 1;
                  _context4.next = 15;
                  return this.readStreamChunk();

                case 15:
                  return _context4.abrupt("return");

                case 16:
                  _context4.t1 = this.readState;
                  _context4.next = _context4.t1 === 0 ? 19 : _context4.t1 === 1 ? 22 : 23;
                  break;

                case 19:
                  this.readState = 1;
                  read(this.fileObj, this.startByte, this.endByte, this.fileObj.file.type, this);
                  return _context4.abrupt("return");

                case 22:
                  return _context4.abrupt("return");

                case 23:
                  this.xhrSend(this.payload);

                case 24:
                case "end":
                  return _context4.stop();
              }
            }
          }, _callee4, this);
        }));

        function send() {
          return _send.apply(this, arguments);
        }

        return send;
      }()
      /**
       * Actually uploads data in a POST call
       * @function
       */

    }, {
      key: "xhrSend",
      value: function xhrSend(payload) {
        if (this.flowObj.opts.testChunks && !this.tested) {
          this.test();
          return;
        }

        this.loaded = 0;
        this.total = 0;
        this.pendingRetry = false; // Set up request and listen for event

        this.xhr = new XMLHttpRequest();
        this.xhr.upload.addEventListener('progress', this.progressHandler.bind(this), false);
        this.xhr.addEventListener('load', this.doneHandler.bind(this), false);
        this.xhr.addEventListener('error', this.doneHandler.bind(this), false);
        var uploadMethod = evalOpts(this.flowObj.opts.uploadMethod, this.fileObj, this);
        var xhrPayload = this.prepareXhrRequest(uploadMethod, false, this.flowObj.opts.method, payload);
        var changeRawDataBeforeSend = this.flowObj.opts.changeRawDataBeforeSend;

        if (typeof changeRawDataBeforeSend === 'function') {
          xhrPayload = changeRawDataBeforeSend(this, xhrPayload);
        }

        this.xhr.send(xhrPayload);
      }
      /**
       * Abort current xhr request
       * @function
       */

    }, {
      key: "abort",
      value: function abort() {
        // Abort and reset
        var xhr = this.xhr;
        this.xhr = null;

        if (xhr) {
          xhr.abort();
        }
      }
      /**
       * Retrieve current chunk upload status
       * @function
       * @returns {string} 'pending', 'uploading', 'success', 'error'
       */

    }, {
      key: "status",
      value: function status(isTest) {
        if (this.readState === 1) {
          return 'reading';
        } else if (this.pendingRetry || this.preprocessState === 1) {
          // if pending retry then that's effectively the same as actively uploading,
          // there might just be a slight delay before the retry starts
          return 'uploading';
        } else if (!this.xhr) {
          return 'pending';
        } else if (this.xhr.readyState < 4) {
          // Status is really 'OPENED', 'HEADERS_RECEIVED'
          // or 'LOADING' - meaning that stuff is happening
          return 'uploading';
        } else {
          if (this.flowObj.opts.successStatuses.indexOf(this.xhr.status) > -1) {
            // HTTP 200, perfect
            // HTTP 202 Accepted - The request has been accepted for processing, but the processing has not been completed.
            return 'success';
          } else if (this.flowObj.opts.permanentErrors.indexOf(this.xhr.status) > -1 || !isTest && this.retries >= this.flowObj.opts.maxChunkRetries) {
            // HTTP 413/415/500/501, permanent error
            return 'error';
          } else {
            // this should never happen, but we'll reset and queue a retry
            // a likely case for this would be 503 service unavailable
            this.abort();
            return 'pending';
          }
        }
      }
      /**
       * Get response from xhr request
       * @function
       * @returns {String}
       */

    }, {
      key: "message",
      value: function message() {
        return this.xhr ? this.xhr.responseText : '';
      }
      /**
       * Get upload progress
       * @function
       * @returns {number}
       */

    }, {
      key: "progress",
      value: function progress() {
        if (this.pendingRetry) {
          return 0;
        }

        var s = this.status();

        if (s === 'success' || s === 'error') {
          return 1;
        } else if (s === 'pending') {
          return 0;
        } else {
          return this.total > 0 ? this.loaded / this.total : 0;
        }
      }
      /**
       * Count total size uploaded
       * @function
       * @returns {number}
       */

    }, {
      key: "sizeUploaded",
      value: function sizeUploaded() {
        var size = this.endByte - this.startByte; // can't return only chunk.loaded value, because it is bigger than chunk size

        if (this.status() !== 'success') {
          size = this.progress() * size;
        }

        return size;
      }
      /**
       * Prepare Xhr request. Set query, headers and data
       * @param {string} method GET or POST
       * @param {bool} isTest is this a test request
       * @param {string} [paramsMethod] octet or form
       * @param {Blob} [blob] to send
       * @returns {FormData|Blob|Null} data to send
       */

    }, {
      key: "prepareXhrRequest",
      value: function prepareXhrRequest(method, isTest, paramsMethod, blob) {
        // Add data from the query options
        var query = evalOpts(this.flowObj.opts.query, this.fileObj, this, isTest);
        query = Object.assign({}, query || {}, this.getParams());
        var target = evalOpts(this.flowObj.opts.target, this.fileObj, this, isTest);
        var data = null;

        if (method === 'GET' || paramsMethod === 'octet') {
          // Add data from the query options
          var params = [];
          each(query, function (v, k) {
            params.push([encodeURIComponent(k), encodeURIComponent(v)].join('='));
          });
          target = this.getTarget(target, params);
          data = blob || null;
        } else {
          // Add data from the query options
          data = new FormData();
          each(query, function (v, k) {
            data.append(k, v);
          });

          if (typeof blob !== "undefined") {
            data.append(this.flowObj.opts.fileParameterName, blob, this.filename || this.fileObj.file.name);
          }
        }

        this.xhr.open(method, target, true);
        this.xhr.withCredentials = this.flowObj.opts.withCredentials; // Add data from header options

        each(evalOpts(this.flowObj.opts.headers, this.fileObj, this, isTest), function (v, k) {
          this.xhr.setRequestHeader(k, v);
        }, this);
        return data;
      }
    }]);

    return FlowChunk;
  }();

  /**
   * FlowFile class
   * @name FlowFile
   * @param {Flow} flowObj
   * @param {File} file
   * @param {string} uniqueIdentifier
   * @constructor
   */

  var FlowFile = /*#__PURE__*/function () {
    function FlowFile(flowObj, file, uniqueIdentifier) {
      _classCallCheck(this, FlowFile);

      /**
       * Reference to parent Flow instance
       * @type {Flow}
       */
      this.flowObj = flowObj;
      /**
       * Reference to file
       * @type {File}
       */

      this.file = file;
      /**
       * File name. Some confusion in different versions of Firefox
       * @type {string}
       */

      this.name = file.fileName || file.name;
      /**
       * File size
       * @type {number}
       */

      this.size = file.size;
      /**
       * Relative file path
       * @type {string}
       */

      this.relativePath = file.relativePath || file.webkitRelativePath || this.name;
      /**
       * File unique identifier
       * @type {string}
       */

      this.uniqueIdentifier = uniqueIdentifier === undefined ? flowObj.generateUniqueIdentifier(file) : uniqueIdentifier;
      /**
       * Size of Each Chunk
       * @type {number}
       */

      this.chunkSize = 0;
      /**
       * List of chunks
       * @type {Array.<FlowChunk>}
       */

      this.chunks = [];
      /**
       * Indicated if file is paused
       * @type {boolean}
       */

      this.paused = false;
      /**
       * Indicated if file has encountered an error
       * @type {boolean}
       */

      this.error = false;
      /**
       * Average upload speed
       * @type {number}
       */

      this.averageSpeed = 0;
      /**
       * Current upload speed
       * @type {number}
       */

      this.currentSpeed = 0;
      /**
       * Date then progress was called last time
       * @type {number}
       * @private
       */

      this._lastProgressCallback = Date.now();
      /**
       * Previously uploaded file size
       * @type {number}
       * @private
       */

      this._prevUploadedSize = 0;
      /**
       * Holds previous progress
       * @type {number}
       * @private
       */

      this._prevProgress = 0;
    }
    /**
     * Update speed parameters
     * @link http://stackoverflow.com/questions/2779600/how-to-estimate-download-time-remaining-accurately
     * @function
     */


    _createClass(FlowFile, [{
      key: "measureSpeed",
      value: function measureSpeed() {
        var timeSpan = Date.now() - this._lastProgressCallback;

        if (!timeSpan) {
          return;
        }

        var smoothingFactor = this.flowObj.opts.speedSmoothingFactor;
        var uploaded = this.sizeUploaded(); // Prevent negative upload speed after file upload resume

        this.currentSpeed = Math.max((uploaded - this._prevUploadedSize) / timeSpan * 1000, 0);
        this.averageSpeed = smoothingFactor * this.currentSpeed + (1 - smoothingFactor) * this.averageSpeed;
        this._prevUploadedSize = uploaded;
      }
      /**
       * For internal usage only.
       * Callback when something happens within the chunk.
       * @function
       * @param {FlowChunk} chunk
       * @param {string} event can be 'progress', 'success', 'error' or 'retry'
       * @param {string} [message]
       */

    }, {
      key: "chunkEvent",
      value: function chunkEvent(chunk, event, message) {
        switch (event) {
          case 'progress':
            if (Date.now() - this._lastProgressCallback < this.flowObj.opts.progressCallbacksInterval) {
              break;
            }

            this.measureSpeed();
            this.flowObj.emit('file-progress', this, chunk);
            this.flowObj.emit('progress');
            this._lastProgressCallback = Date.now();
            break;

          case 'error':
            this.error = true;
            this.abort(true);
            this.flowObj.emit('file-error', this, message, chunk);
            this.flowObj.emit('error', message, this, chunk);
            break;

          case 'success':
            if (this.error) {
              return;
            }

            this.measureSpeed();
            this.flowObj.emit('file-progress', this, chunk);
            this.flowObj.emit('progress');
            this._lastProgressCallback = Date.now();

            if (this.isComplete()) {
              this.currentSpeed = 0;
              this.averageSpeed = 0;
              this.flowObj.emit('file-success', this, message, chunk);
            }

            break;

          case 'retry':
            this.flowObj.emit('file-retry', this, chunk);
            break;
        }
      }
      /**
       * Pause file upload
       * @function
       */

    }, {
      key: "pause",
      value: function pause() {
        this.paused = true;
        this.abort();
      }
      /**
       * Resume file upload
       * @function
       */

    }, {
      key: "resume",
      value: function resume() {
        this.paused = false;
        this.flowObj.upload();
      }
      /**
       * Abort current upload
       * @function
       */

    }, {
      key: "abort",
      value: function abort(reset) {
        this.currentSpeed = 0;
        this.averageSpeed = 0;
        var chunks = this.chunks;

        if (reset) {
          this.chunks = [];
        }

        each(chunks, function (c) {
          if (c.status() === 'uploading') {
            c.abort();
            this.flowObj.uploadNextChunk();
          }
        }, this);
      }
      /**
       * Cancel current upload and remove from a list
       * @function
       */

    }, {
      key: "cancel",
      value: function cancel() {
        this.flowObj.removeFile(this);
      }
      /**
       * Retry aborted file upload
       * @function
       */

    }, {
      key: "retry",
      value: function retry() {
        this.bootstrap('retry');
        this.flowObj.upload();
      }
      /**
       * Clear current chunks and slice file again
       * @function
       */

    }, {
      key: "bootstrap",
      value: function bootstrap() {
        var initFileFn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.flowObj.opts.initFileFn;

        if (typeof initFileFn === "function") {
          initFileFn(this);
        }

        this._bootstrap();
      }
    }, {
      key: "_bootstrap",
      value: function _bootstrap() {
        this.abort(true);
        this.error = false; // Rebuild stack of chunks from file

        this._prevProgress = 0;
        var round = this.flowObj.opts.forceChunkSize ? Math.ceil : Math.floor;
        this.chunkSize = evalOpts(this.flowObj.opts.chunkSize, this);
        var chunks = Math.max(round(this.size / this.chunkSize), 1);

        for (var offset = 0; offset < chunks; offset++) {
          this.chunks.push(new FlowChunk(this.flowObj, this, offset));
        }
      }
      /**
       * Get current upload progress status
       * @function
       * @returns {number} from 0 to 1
       */

    }, {
      key: "progress",
      value: function progress() {
        if (this.error) {
          return 1;
        }

        if (this.chunks.length === 1) {
          this._prevProgress = Math.max(this._prevProgress, this.chunks[0].progress());
          return this._prevProgress;
        } // Sum up progress across everything


        var bytesLoaded = 0;
        each(this.chunks, function (c) {
          // get chunk progress relative to entire file
          bytesLoaded += c.progress() * (c.endByte - c.startByte);
        });
        var percent = bytesLoaded / this.size; // We don't want to lose percentages when an upload is paused

        this._prevProgress = Math.max(this._prevProgress, percent > 0.9999 ? 1 : percent);
        return this._prevProgress;
      }
      /**
       * Indicates if file is being uploaded at the moment
       * @function
       * @returns {boolean}
       */

    }, {
      key: "isUploading",
      value: function isUploading() {
        var uploading = false;
        each(this.chunks, function (chunk) {
          if (chunk.status() === 'uploading') {
            uploading = true;
            return false;
          }
        });
        return uploading;
      }
      /**
       * Indicates if file is has finished uploading and received a response
       * @function
       * @returns {boolean}
       */

    }, {
      key: "isComplete",
      value: function isComplete() {
        var outstanding = false;
        each(this.chunks, function (chunk) {
          var status = chunk.status();

          if (status === 'pending' || status === 'uploading' || status === 'reading' || chunk.preprocessState === 1 || chunk.readState === 1) {
            outstanding = true;
            return false;
          }
        });
        return !outstanding;
      }
      /**
       * Count total size uploaded
       * @function
       * @returns {number}
       */

    }, {
      key: "sizeUploaded",
      value: function sizeUploaded() {
        var size = 0;
        each(this.chunks, function (chunk) {
          size += chunk.sizeUploaded();
        });
        return size;
      }
      /**
       * Returns remaining time to finish upload file in seconds. Accuracy is based on average speed.
       * If speed is zero, time remaining will be equal to positive infinity `Number.POSITIVE_INFINITY`
       * @function
       * @returns {number}
       */

    }, {
      key: "timeRemaining",
      value: function timeRemaining() {
        if (this.paused || this.error) {
          return 0;
        }

        var delta = this.size - this.sizeUploaded();

        if (delta && !this.averageSpeed) {
          return Number.POSITIVE_INFINITY;
        }

        if (!delta && !this.averageSpeed) {
          return 0;
        }

        return Math.floor(delta / this.averageSpeed);
      }
      /**
       * Get file type
       * @function
       * @returns {string}
       */

    }, {
      key: "getType",
      value: function getType() {
        return this.file.type && this.file.type.split('/')[1];
      }
      /**
       * Get file extension
       * @function
       * @returns {string}
       */

    }, {
      key: "getExtension",
      value: function getExtension() {
        return this.name.substr((~-this.name.lastIndexOf(".") >>> 0) + 2).toLowerCase();
      }
    }]);

    return FlowFile;
  }();
  var g$1 = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};
  g$1.FlowFile = FlowFile;

  /**
   * AsyncFlowFile class
   * @name AsyncFlowFile
   */

  var AsyncFlowFile = /*#__PURE__*/function (_FlowFile) {
    _inherits(AsyncFlowFile, _FlowFile);

    var _super = _createSuper(AsyncFlowFile);

    function AsyncFlowFile() {
      _classCallCheck(this, AsyncFlowFile);

      return _super.apply(this, arguments);
    }

    _createClass(AsyncFlowFile, [{
      key: "retry",

      /**
       * Retry aborted file upload
       * @function
       */
      value: function () {
        var _retry = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
          return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  _context.next = 2;
                  return this.bootstrap('retry');

                case 2:
                  return _context.abrupt("return", this.flowObj.upload());

                case 3:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee, this);
        }));

        function retry() {
          return _retry.apply(this, arguments);
        }

        return retry;
      }()
    }, {
      key: "bootstrap",
      value: function () {
        var _bootstrap = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
          var event,
              initFileFn,
              _args2 = arguments;
          return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  event = _args2.length > 0 && _args2[0] !== undefined ? _args2[0] : null;
                  initFileFn = _args2.length > 1 && _args2[1] !== undefined ? _args2[1] : this.flowObj.opts.initFileFn;

                  if (!(typeof initFileFn === 'function')) {
                    _context2.next = 5;
                    break;
                  }

                  _context2.next = 5;
                  return initFileFn(this, event);

                case 5:
                  this._bootstrap();

                  if (event !== 'retry') {
                    this.flowObj.hook('file-added', this, event);
                  } // console.log("Flowfile returns [async]", this._bootstrapped);


                  return _context2.abrupt("return", this);

                case 8:
                case "end":
                  return _context2.stop();
              }
            }
          }, _callee2, this);
        }));

        function bootstrap() {
          return _bootstrap.apply(this, arguments);
        }

        return bootstrap;
      }()
    }]);

    return AsyncFlowFile;
  }(FlowFile);

  /**
   * Flow.js is a library providing multiple simultaneous, stable and
   * resumable uploads via the HTML5 File API.
   * @param [opts]
   * @param {number|Function} [opts.chunkSize]
   * @param {bool} [opts.forceChunkSize]
   * @param {number} [opts.simultaneousUploads]
   * @param {bool} [opts.singleFile]
   * @param {string} [opts.fileParameterName]
   * @param {number} [opts.progressCallbacksInterval]
   * @param {number} [opts.speedSmoothingFactor]
   * @param {Object|Function} [opts.query]
   * @param {Object|Function} [opts.headers]
   * @param {bool} [opts.withCredentials]
   * @param {Function} [opts.preprocess]
   * @param {string} [opts.method]
   * @param {string|Function} [opts.testMethod]
   * @param {string|Function} [opts.uploadMethod]
   * @param {bool} [opts.prioritizeFirstAndLastChunk]
   * @param {bool} [opts.allowDuplicateUploads]
   * @param {string|Function} [opts.target]
   * @param {number} [opts.maxChunkRetries]
   * @param {number} [opts.chunkRetryInterval]
   * @param {Array.<number>} [opts.permanentErrors]
   * @param {Array.<number>} [opts.successStatuses]
   * @param {Function} [opts.initFileFn]
   * @param {Function} [opts.readFileFn]
   * @param {Function} [opts.asyncReadFileFn]
   * @param {Function} [opts.generateUniqueIdentifier]
   * @constructor
   */

  var Flow = /*#__PURE__*/function (_Eventizer) {
    _inherits(Flow, _Eventizer);

    var _super = _createSuper(Flow);

    /**
     * For the events object:
     *  - keys: stands for event name
     *  - values: array list of callbacks
     * All keys are lowercased as on() would do.
     */
    function Flow(opts, events) {
      var _this;

      _classCallCheck(this, Flow);

      _this = _super.call(this, events);
      /**
       * Library version
       * @type {string}
       */

      Flow.version = '3.0.0-alpha.0';
      /**
       * Check if directory upload is supported
       * @type {boolean}
       */

      _this.supportDirectory = /Chrome/.test(window.navigator.userAgent) || /Firefox/.test(window.navigator.userAgent) || /Edge/.test(window.navigator.userAgent);
      /**
       * List of FlowFile objects
       * @type {Array.<FlowFile>}
       */

      _this.files = [];
      /**
       * Default options for flow.js
       * @type {Object}
       */

      _this.defaults = {
        chunkSize: 1024 * 1024,
        forceChunkSize: false,
        simultaneousUploads: 3,
        singleFile: false,
        fileParameterName: 'file',
        progressCallbacksInterval: 500,
        speedSmoothingFactor: 0.1,
        query: {},
        headers: {},
        withCredentials: false,
        preprocess: null,
        changeRawDataBeforeSend: null,
        method: 'multipart',
        testMethod: 'GET',
        uploadMethod: 'POST',
        prioritizeFirstAndLastChunk: false,
        allowDuplicateUploads: false,
        target: '/',
        testChunks: true,
        generateUniqueIdentifier: null,
        maxChunkRetries: 0,
        chunkRetryInterval: null,
        permanentErrors: [404, 413, 415, 500, 501],
        successStatuses: [200, 201, 202],
        onDropStopPropagation: false,
        initFileFn: null,
        readFileFn: webAPIFileRead,
        asyncReadFileFn: null
      };
      /**
       * Current options
       * @type {Object}
       */

      _this.opts = {};
      /**
       * Current options
       * @type {Object}
       */

      _this.opts = Object.assign({}, _this.defaults, opts || {}); // A workaround for using this.method.bind(this) as a (removable) event handler.
      // https://stackoverflow.com/questions/11565471

      _this._onDropBound = null;
      return _this;
    }
    /**
     * On drop event
     * @function
     * @param {MouseEvent} event
     */


    _createClass(Flow, [{
      key: "onDrop",
      value: function onDrop(event) {
        if (this.opts.onDropStopPropagation) {
          event.stopPropagation();
        }

        event.preventDefault();
        var dataTransfer = event.dataTransfer;

        if (dataTransfer.items && dataTransfer.items[0] && dataTransfer.items[0].webkitGetAsEntry) {
          this.webkitReadDataTransfer(event);
        } else {
          this.addFiles(dataTransfer.files, event);
        }
      }
      /**
       * Prevent default
       * @function
       * @param {MouseEvent} event
       */

    }, {
      key: "preventEvent",
      value: function preventEvent(event) {
        event.preventDefault();
      }
      /**
       * Read webkit dataTransfer object
       * @param event
       */

    }, {
      key: "webkitReadDataTransfer",
      value: function webkitReadDataTransfer(event) {
        var _this2 = this;

        var queue = event.dataTransfer.items.length;

        var decrement = function decrement() {
          if (--queue == 0) {
            _this2.addFiles(files, event);
          }
        };

        var files = [];

        var _iterator = _createForOfIteratorHelper(event.dataTransfer.items),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var item = _step.value;
            var entry = item.webkitGetAsEntry();

            if (!entry) {
              decrement();
              return;
            }

            if (entry.isFile) {
              // due to a bug in Chrome's File System API impl - #149735
              fileReadSuccess(item.getAsFile(), entry.fullPath);
            } else {
              readDirectory(entry.createReader());
            }
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }

        function readDirectory(reader) {
          reader.readEntries(function (entries) {
            if (entries.length) {
              queue += entries.length;
              var fullPaths = {};

              var _iterator2 = _createForOfIteratorHelper(entries),
                  _step2;

              try {
                for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                  var _entry = _step2.value;

                  if (_entry.isFile) {
                    fullPaths[_entry.name] = _entry.fullPath;

                    _entry.file(function (file) {
                      return fileReadSuccess(file, fullPaths[file.name]);
                    }, readError);
                  } else if (_entry.isDirectory) {
                    readDirectory(_entry.createReader());
                  }
                }
              } catch (err) {
                _iterator2.e(err);
              } finally {
                _iterator2.f();
              }

              readDirectory(reader);
            } else {
              decrement();
            }
          }, readError);
        }

        function fileReadSuccess(file, fullPath) {
          // relative path should not start with "/"
          file.relativePath = fullPath.substring(1);
          files.push(file);
          decrement();
        }

        function readError(fileError) {
          decrement();
          throw fileError;
        }
      }
      /**
       * Generate unique identifier for a file
       * @function
       * @param {FlowFile} file
       * @returns {string}
       */

    }, {
      key: "generateUniqueIdentifier",
      value: function generateUniqueIdentifier(file) {
        var custom = this.opts.generateUniqueIdentifier;

        if (typeof custom === 'function') {
          return custom(file);
        } // Some confusion in different versions of Firefox


        var relativePath = file.relativePath || file.webkitRelativePath || file.fileName || file.name;
        return file.size + '-' + relativePath.replace(/[^0-9a-zA-Z_-]/img, '');
      }
      /**
       * Upload next chunk from the queue
       * @function
       * @returns {boolean}
       * @private
       */

    }, {
      key: "uploadNextChunk",
      value: function uploadNextChunk(preventEvents) {
        // In some cases (such as videos) it's really handy to upload the first
        // and last chunk of a file quickly; this let's the server check the file's
        // metadata and determine if there's even a point in continuing.
        var found = false;

        if (this.opts.prioritizeFirstAndLastChunk) {
          var _iterator3 = _createForOfIteratorHelper(this.files),
              _step3;

          try {
            for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
              var file = _step3.value;

              if (!file.paused && file.chunks.length && file.chunks[0].status() === 'pending') {
                file.chunks[0].send();
                found = true;
                break;
              }

              if (!file.paused && file.chunks.length > 1 && file.chunks[file.chunks.length - 1].status() === 'pending') {
                file.chunks[file.chunks.length - 1].send();
                found = true;
                break;
              }
            }
          } catch (err) {
            _iterator3.e(err);
          } finally {
            _iterator3.f();
          }

          if (found) {
            return found;
          }
        } // Now, simply look for the next, best thing to upload


        var _iterator4 = _createForOfIteratorHelper(this.files),
            _step4;

        try {
          outer_loop: for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
            var _file = _step4.value;

            if (_file.paused) {
              continue;
            }

            var _iterator6 = _createForOfIteratorHelper(_file.chunks),
                _step6;

            try {
              for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
                var chunk = _step6.value;

                if (chunk.status() === 'pending') {
                  chunk.send();
                  found = true;
                  break outer_loop;
                }
              }
            } catch (err) {
              _iterator6.e(err);
            } finally {
              _iterator6.f();
            }
          }
        } catch (err) {
          _iterator4.e(err);
        } finally {
          _iterator4.f();
        }

        if (found) {
          return true;
        } // The are no more outstanding chunks to upload, check if everything is done


        var outstanding = false;

        var _iterator5 = _createForOfIteratorHelper(this.files),
            _step5;

        try {
          for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
            var _file2 = _step5.value;

            if (!_file2.isComplete()) {
              outstanding = true;
              return false;
            }
          }
        } catch (err) {
          _iterator5.e(err);
        } finally {
          _iterator5.f();
        }

        if (!outstanding && !preventEvents) {
          // All chunks have been uploaded, complete
          this.emit('complete');
        }

        return false;
      }
      /**
       * Assign a browse action to one or more DOM nodes.
       * @function
       * @param {Element|Array.<Element>} domNodes
       * @param {boolean} isDirectory Pass in true to allow directories to
       * @param {boolean} singleFile prevent multi file upload
       * @param {Object} attributes set custom attributes:
       *  http://www.w3.org/TR/html-markup/input.file.html#input.file-attributes
       *  eg: accept: 'image/*'
       * be selected (Chrome only).
       */

    }, {
      key: "assignBrowse",
      value: function assignBrowse(domNodes, isDirectory, singleFile, attributes) {
        if (domNodes instanceof Element) {
          domNodes = [domNodes];
        }

        each(domNodes, function (domNode) {
          var _this3 = this;

          var input;

          if (domNode.tagName === 'INPUT' && domNode.type === 'file') {
            input = domNode;
          } else {
            input = document.createElement('input');
            input.setAttribute('type', 'file'); // display:none - not working in opera 12

            Object.assign(input.style, {
              visibility: 'hidden',
              position: 'absolute',
              width: '1px',
              height: '1px'
            }); // for opera 12 browser, input must be assigned to a document

            domNode.appendChild(input); // https://developer.mozilla.org/en/using_files_from_web_applications)
            // event listener is executed two times
            // first one - original mouse click event
            // second - input.click(), input is inside domNode

            domNode.addEventListener('click', function () {
              input.click();
            }, false);
          }

          if (!this.opts.singleFile && !singleFile) {
            input.setAttribute('multiple', 'multiple');
          }

          if (isDirectory) {
            input.setAttribute('webkitdirectory', 'webkitdirectory');
          }

          each(attributes, function (value, key) {
            input.setAttribute(key, value);
          }); // When new files are added, simply append them to the overall list

          input.addEventListener('change', function (e) {
            if (e.target.value) {
              _this3.addFiles(e.target.files, e);

              e.target.value = '';
            }
          }, false);
        }, this);
      }
      /**
       * Assign one or more DOM nodes as a drop target.
       * @function
       * @param {Element|Array.<Element>} domNodes
       */

    }, {
      key: "assignDrop",
      value: function assignDrop(domNodes) {
        if (typeof domNodes.length === 'undefined') {
          domNodes = [domNodes];
        }

        this._onDropBound = this.onDrop.bind(this);

        var _iterator7 = _createForOfIteratorHelper(domNodes),
            _step7;

        try {
          for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
            var domNode = _step7.value;
            domNode.addEventListener('dragover', this.preventEvent, false);
            domNode.addEventListener('dragenter', this.preventEvent, false);
            domNode.addEventListener('drop', this._onDropBound, false);
          }
        } catch (err) {
          _iterator7.e(err);
        } finally {
          _iterator7.f();
        }
      }
      /**
       * Un-assign drop event from DOM nodes
       * @function
       * @param domNodes
       */

    }, {
      key: "unAssignDrop",
      value: function unAssignDrop(domNodes) {
        if (typeof domNodes.length === 'undefined') {
          domNodes = [domNodes];
        }

        var _iterator8 = _createForOfIteratorHelper(domNodes),
            _step8;

        try {
          for (_iterator8.s(); !(_step8 = _iterator8.n()).done;) {
            var domNode = _step8.value;
            domNode.removeEventListener('dragover', this.preventEvent, false);
            domNode.removeEventListener('dragenter', this.preventEvent, false);
            domNode.removeEventListener('drop', this._onDropBound, false);
          }
        } catch (err) {
          _iterator8.e(err);
        } finally {
          _iterator8.f();
        }
      }
      /**
       * Returns a boolean indicating whether or not the instance is currently
       * uploading anything.
       * @function
       * @returns {boolean}
       */

    }, {
      key: "isUploading",
      value: function isUploading() {
        var uploading = false;
        each(this.files, function (file) {
          if (file.isUploading()) {
            uploading = true;
            return false;
          }
        });
        return uploading;
      }
      /**
       * should upload next chunk
       * @function
       * @returns {boolean|number}
       */

    }, {
      key: "_shouldUploadNext",
      value: function _shouldUploadNext() {
        var num = 0;
        var should = true;
        var simultaneousUploads = this.opts.simultaneousUploads;
        each(this.files, function (file) {
          each(file.chunks, function (chunk) {
            if (chunk.status() === 'uploading') {
              num++;

              if (num >= simultaneousUploads) {
                should = false;
                return false;
              }
            }
          });
        }); // if should is true then return uploading chunks's length

        return should && num;
      }
      /**
       * Start or resume uploading.
       * @function
       */

    }, {
      key: "upload",
      value: function upload() {
        // Make sure we don't start too many uploads at once
        var ret = this._shouldUploadNext();

        if (ret === false) {
          return;
        } // Kick off the queue


        this.emit('upload-start');
        var started = false;

        for (var num = 1; num <= this.opts.simultaneousUploads - ret; num++) {
          started = this.uploadNextChunk(true) || started;
        }

        if (!started) {
          this.emit('complete');
        }
      }
      /**
       * Resume uploading.
       * @function
       */

    }, {
      key: "resume",
      value: function resume() {
        each(this.files, function (file) {
          if (!file.isComplete()) {
            file.resume();
          }
        });
      }
      /**
       * Pause uploading.
       * @function
       */

    }, {
      key: "pause",
      value: function pause() {
        each(this.files, function (file) {
          file.pause();
        });
      }
      /**
       * Cancel upload of all FlowFile objects and remove them from the list.
       * @function
       */

    }, {
      key: "cancel",
      value: function cancel() {
        for (var i = this.files.length - 1; i >= 0; i--) {
          this.files[i].cancel();
        }
      }
      /**
       * Returns a number between 0 and 1 indicating the current upload progress
       * of all files.
       * @function
       * @returns {number}
       */

    }, {
      key: "progress",
      value: function progress() {
        var totalDone = 0;
        var totalSize = 0; // Resume all chunks currently being uploaded

        each(this.files, function (file) {
          totalDone += file.progress() * file.size;
          totalSize += file.size;
        });
        return totalSize > 0 ? totalDone / totalSize : 0;
      }
      /**
       * A generator to yield files and factor the sync part of the filtering logic used by both
       * addFiles & asyncAddFiles
       */

    }, {
      key: "filterFileList",
      value: /*#__PURE__*/regeneratorRuntime.mark(function filterFileList(fileList, event) {
        var ie10plus, _iterator9, _step9, file, uniqueIdentifier;

        return regeneratorRuntime.wrap(function filterFileList$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                // ie10+
                ie10plus = window.navigator.msPointerEnabled;
                _iterator9 = _createForOfIteratorHelper(fileList);
                _context.prev = 2;

                _iterator9.s();

              case 4:
                if ((_step9 = _iterator9.n()).done) {
                  _context.next = 17;
                  break;
                }

                file = _step9.value;

                if (!(ie10plus && file.size === 0 || file.size % 4096 === 0 && (file.name === '.' || file.fileName === '.'))) {
                  _context.next = 8;
                  break;
                }

                return _context.abrupt("continue", 15);

              case 8:
                uniqueIdentifier = this.generateUniqueIdentifier(file);

                if (!(!this.opts.allowDuplicateUploads && this.getFromUniqueIdentifier(uniqueIdentifier))) {
                  _context.next = 11;
                  break;
                }

                return _context.abrupt("continue", 15);

              case 11:
                if (this.hook('filter-file', file, event)) {
                  _context.next = 13;
                  break;
                }

                return _context.abrupt("continue", 15);

              case 13:
                _context.next = 15;
                return [file, uniqueIdentifier];

              case 15:
                _context.next = 4;
                break;

              case 17:
                _context.next = 22;
                break;

              case 19:
                _context.prev = 19;
                _context.t0 = _context["catch"](2);

                _iterator9.e(_context.t0);

              case 22:
                _context.prev = 22;

                _iterator9.f();

                return _context.finish(22);

              case 25:
              case "end":
                return _context.stop();
            }
          }
        }, filterFileList, this, [[2, 19, 22, 25]]);
      })
      /**
       * Add a HTML5 File object to the list of files.
       * @function
       * @param {File} file
       * @param Any other parameters supported by addFiles
       */

    }, {
      key: "addFile",
      value: function addFile(file) {
        for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }

        this.addFiles.apply(this, [[file]].concat(args));
      }
      /**
       * Add a HTML5 File object to the list of files.
       * @function
       * @param {FileList|Array} fileList
       * @param {Event} [event] event is optional
       */

    }, {
      key: "addFiles",
      value: function addFiles(fileList) {
        var event = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        var initFileFn = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.opts.initFileFn;

        if (this.hasHook(true)) {
          console.warn('Using addFiles() while settings asynchronous events can lead to unpredictable results. Use asyncAddFiles() instead.');
        }

        var item,
            file,
            uniqueIdentifier,
            files = [];
        var iterator = this.filterFileList(fileList, event);

        while ((item = iterator.next()) && !item.done) {
          var _item$value = _slicedToArray(item.value, 2);

          file = _item$value[0];
          uniqueIdentifier = _item$value[1];
          var f = new FlowFile(this, file, uniqueIdentifier);
          f.bootstrap(event, initFileFn);
          this.hook('file-added', f, event);
          this.aHook('file-added', f, event);

          if (!f.file) {
            continue;
          }

          files.push(f);
        }

        this.hook('files-added', files, event);
        this.aHook('files-added', files, event);
        files = files.filter(function (e) {
          return e;
        });

        var _iterator10 = _createForOfIteratorHelper(files),
            _step10;

        try {
          for (_iterator10.s(); !(_step10 = _iterator10.n()).done;) {
            file = _step10.value;

            if (this.opts.singleFile && this.files.length > 0) {
              this.removeFile(this.files[0]);
            }

            this.files.push(file); // console.log(`enqueue file ${file.name} of ${file.chunks.length} chunks`);
          }
        } catch (err) {
          _iterator10.e(err);
        } finally {
          _iterator10.f();
        }

        this.hook('files-submitted', this.files, event);
        this.aHook('files-submitted', this.files, event);
      }
      /**
       * Add a HTML5 File object to the list of files.
       * @function
       * @param {File} file
       * @param Any other parameters supported by asyncAddFiles.
       *
       * @return (async) An initialized <AsyncFlowFile>.
       */

    }, {
      key: "asyncAddFile",
      value: function () {
        var _asyncAddFile = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(file) {
          var _len2,
              args,
              _key2,
              _args2 = arguments;

          return regeneratorRuntime.wrap(function _callee$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  for (_len2 = _args2.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                    args[_key2 - 1] = _args2[_key2];
                  }

                  _context2.next = 3;
                  return this.asyncAddFiles.apply(this, [[file]].concat(args));

                case 3:
                  return _context2.abrupt("return", _context2.sent[0]);

                case 4:
                case "end":
                  return _context2.stop();
              }
            }
          }, _callee, this);
        }));

        function asyncAddFile(_x) {
          return _asyncAddFile.apply(this, arguments);
        }

        return asyncAddFile;
      }()
      /**
       * Add a HTML5 File object to the list of files.
       * @function
       * @param {FileList|Array} fileList
       * @param {Event} [event] event is optional
       *
       * @return Promise{[<AsyncFlowFile>,...]} The promise of getting an array of AsyncFlowFile.
       */

    }, {
      key: "asyncAddFiles",
      value: function () {
        var _asyncAddFiles = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(fileList) {
          var event,
              initFileFn,
              item,
              file,
              uniqueIdentifier,
              states,
              iterator,
              _item$value2,
              flowFile,
              state,
              flowfiles,
              _iterator11,
              _step11,
              ff,
              _iterator12,
              _step12,
              _file3,
              _args3 = arguments;

          return regeneratorRuntime.wrap(function _callee2$(_context3) {
            while (1) {
              switch (_context3.prev = _context3.next) {
                case 0:
                  event = _args3.length > 1 && _args3[1] !== undefined ? _args3[1] : null;
                  initFileFn = _args3.length > 2 && _args3[2] !== undefined ? _args3[2] : this.opts.initFileFn;
                  states = [];
                  iterator = this.filterFileList(fileList, event);

                case 4:
                  if (!((item = iterator.next()) && !item.done)) {
                    _context3.next = 16;
                    break;
                  }

                  _item$value2 = _slicedToArray(item.value, 2);
                  file = _item$value2[0];
                  uniqueIdentifier = _item$value2[1];
                  _context3.next = 10;
                  return this.aHook('filter-file', file, event);

                case 10:
                  if (_context3.sent) {
                    _context3.next = 12;
                    break;
                  }

                  return _context3.abrupt("continue", 4);

                case 12:
                  // ToDo: parallelizable ?
                  flowFile = new AsyncFlowFile(this, file, uniqueIdentifier), state = flowFile.bootstrap(event, initFileFn);
                  states.push(state);
                  _context3.next = 4;
                  break;

                case 16:
                  _context3.next = 18;
                  return Promise.all(states);

                case 18:
                  flowfiles = _context3.sent;
                  _iterator11 = _createForOfIteratorHelper(flowfiles);
                  _context3.prev = 20;

                  _iterator11.s();

                case 22:
                  if ((_step11 = _iterator11.n()).done) {
                    _context3.next = 29;
                    break;
                  }

                  ff = _step11.value;
                  this.hook('file-added', ff, event);
                  _context3.next = 27;
                  return this.aHook('file-added', ff, event);

                case 27:
                  _context3.next = 22;
                  break;

                case 29:
                  _context3.next = 34;
                  break;

                case 31:
                  _context3.prev = 31;
                  _context3.t0 = _context3["catch"](20);

                  _iterator11.e(_context3.t0);

                case 34:
                  _context3.prev = 34;

                  _iterator11.f();

                  return _context3.finish(34);

                case 37:
                  this.hook('files-added', flowfiles, event);
                  _context3.next = 40;
                  return this.aHook('files-added', flowfiles, event);

                case 40:
                  flowfiles = flowfiles.filter(function (e) {
                    return e && e.file;
                  });
                  _iterator12 = _createForOfIteratorHelper(flowfiles);

                  try {
                    for (_iterator12.s(); !(_step12 = _iterator12.n()).done;) {
                      _file3 = _step12.value;

                      if (this.opts.singleFile && this.files.length > 0) {
                        this.removeFile(this.files[0]);
                      }

                      this.files.push(_file3);
                    }
                  } catch (err) {
                    _iterator12.e(err);
                  } finally {
                    _iterator12.f();
                  }

                  this.hook('files-submitted', this.files, event);
                  _context3.next = 46;
                  return this.aHook('files-submitted', this.files, event);

                case 46:
                  return _context3.abrupt("return", flowfiles);

                case 47:
                case "end":
                  return _context3.stop();
              }
            }
          }, _callee2, this, [[20, 31, 34, 37]]);
        }));

        function asyncAddFiles(_x2) {
          return _asyncAddFiles.apply(this, arguments);
        }

        return asyncAddFiles;
      }()
      /**
       * Cancel upload of a specific FlowFile object from the list.
       * @function
       * @param {FlowFile} file
       */

    }, {
      key: "removeFile",
      value: function removeFile(file) {
        for (var i = this.files.length - 1; i >= 0; i--) {
          if (this.files[i] === file) {
            this.files.splice(i, 1);
            file.abort();
            this.emit('file-removed', file);
          }
        }
      }
      /**
       * Look up a FlowFile object by its unique identifier.
       * @function
       * @param {string} uniqueIdentifier
       * @returns {boolean|FlowFile} false if file was not found
       */

    }, {
      key: "getFromUniqueIdentifier",
      value: function getFromUniqueIdentifier(uniqueIdentifier) {
        var ret = false;
        each(this.files, function (file) {
          if (file.uniqueIdentifier === uniqueIdentifier) {
            ret = file;
          }
        });
        return ret;
      }
      /**
       * Returns the total size of all files in bytes.
       * @function
       * @returns {number}
       */

    }, {
      key: "getSize",
      value: function getSize() {
        var totalSize = 0;
        each(this.files, function (file) {
          totalSize += file.size;
        });
        return totalSize;
      }
      /**
       * Returns the total size uploaded of all files in bytes.
       * @function
       * @returns {number}
       */

    }, {
      key: "sizeUploaded",
      value: function sizeUploaded() {
        var size = 0;
        each(this.files, function (file) {
          size += file.sizeUploaded();
        });
        return size;
      }
      /**
       * Returns remaining time to upload all files in seconds. Accuracy is based on average speed.
       * If speed is zero, time remaining will be equal to positive infinity `Number.POSITIVE_INFINITY`
       * @function
       * @returns {number}
       */

    }, {
      key: "timeRemaining",
      value: function timeRemaining() {
        var sizeDelta = 0;
        var averageSpeed = 0;
        each(this.files, function (file) {
          if (!file.paused && !file.error) {
            sizeDelta += file.size - file.sizeUploaded();
            averageSpeed += file.averageSpeed;
          }
        });

        if (sizeDelta && !averageSpeed) {
          return Number.POSITIVE_INFINITY;
        }

        if (!sizeDelta && !averageSpeed) {
          return 0;
        }

        return Math.floor(sizeDelta / averageSpeed);
      }
    }]);

    return Flow;
  }(_default);

  return Flow;

})));
//# sourceMappingURL=flow.js.map
