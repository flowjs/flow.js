(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Flow = factory());
}(this, (function () { 'use strict';

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function createCommonjsModule(fn, basedir, module) {
		return module = {
		  path: basedir,
		  exports: {},
		  require: function (path, base) {
	      return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
	    }
		}, fn(module, module.exports), module.exports;
	}

	function commonjsRequire () {
		throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
	}

	var check = function (it) {
	  return it && it.Math == Math && it;
	}; // https://github.com/zloirock/core-js/issues/86#issuecomment-115759028


	var global_1 = // eslint-disable-next-line no-undef
	check(typeof globalThis == 'object' && globalThis) || check(typeof window == 'object' && window) || check(typeof self == 'object' && self) || check(typeof commonjsGlobal == 'object' && commonjsGlobal) || // eslint-disable-next-line no-new-func
	Function('return this')();

	var fails = function (exec) {
	  try {
	    return !!exec();
	  } catch (error) {
	    return true;
	  }
	};

	var descriptors = !fails(function () {
	  return Object.defineProperty({}, 1, {
	    get: function () {
	      return 7;
	    }
	  })[1] != 7;
	});

	var nativePropertyIsEnumerable = {}.propertyIsEnumerable;
	var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor; // Nashorn ~ JDK8 bug

	var NASHORN_BUG = getOwnPropertyDescriptor && !nativePropertyIsEnumerable.call({
	  1: 2
	}, 1); // `Object.prototype.propertyIsEnumerable` method implementation
	// https://tc39.github.io/ecma262/#sec-object.prototype.propertyisenumerable

	var f = NASHORN_BUG ? function propertyIsEnumerable(V) {
	  var descriptor = getOwnPropertyDescriptor(this, V);
	  return !!descriptor && descriptor.enumerable;
	} : nativePropertyIsEnumerable;
	var objectPropertyIsEnumerable = {
	  f: f
	};

	var createPropertyDescriptor = function (bitmap, value) {
	  return {
	    enumerable: !(bitmap & 1),
	    configurable: !(bitmap & 2),
	    writable: !(bitmap & 4),
	    value: value
	  };
	};

	var toString = {}.toString;

	var classofRaw = function (it) {
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
	// https://tc39.github.io/ecma262/#sec-requireobjectcoercible
	var requireObjectCoercible = function (it) {
	  if (it == undefined) throw TypeError("Can't call method on " + it);
	  return it;
	};

	var toIndexedObject = function (it) {
	  return indexedObject(requireObjectCoercible(it));
	};

	var isObject = function (it) {
	  return typeof it === 'object' ? it !== null : typeof it === 'function';
	};

	// https://tc39.github.io/ecma262/#sec-toprimitive
	// instead of the ES6 spec version, we didn't implement @@toPrimitive case
	// and the second argument - flag - preferred type is a string

	var toPrimitive = function (input, PREFERRED_STRING) {
	  if (!isObject(input)) return input;
	  var fn, val;
	  if (PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) return val;
	  if (typeof (fn = input.valueOf) == 'function' && !isObject(val = fn.call(input))) return val;
	  if (!PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) return val;
	  throw TypeError("Can't convert object to primitive value");
	};

	var hasOwnProperty = {}.hasOwnProperty;

	var has = function (it, key) {
	  return hasOwnProperty.call(it, key);
	};

	var document$1 = global_1.document; // typeof document.createElement is 'object' in old IE

	var EXISTS = isObject(document$1) && isObject(document$1.createElement);

	var documentCreateElement = function (it) {
	  return EXISTS ? document$1.createElement(it) : {};
	};

	var ie8DomDefine = !descriptors && !fails(function () {
	  return Object.defineProperty(documentCreateElement('div'), 'a', {
	    get: function () {
	      return 7;
	    }
	  }).a != 7;
	});

	var nativeGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor; // `Object.getOwnPropertyDescriptor` method
	// https://tc39.github.io/ecma262/#sec-object.getownpropertydescriptor

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

	var anObject = function (it) {
	  if (!isObject(it)) {
	    throw TypeError(String(it) + ' is not an object');
	  }

	  return it;
	};

	var nativeDefineProperty = Object.defineProperty; // `Object.defineProperty` method
	// https://tc39.github.io/ecma262/#sec-object.defineproperty

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

	var setGlobal = function (key, value) {
	  try {
	    createNonEnumerableProperty(global_1, key, value);
	  } catch (error) {
	    global_1[key] = value;
	  }

	  return value;
	};

	var SHARED = '__core-js_shared__';
	var store = global_1[SHARED] || setGlobal(SHARED, {});
	var sharedStore = store;

	var functionToString = Function.toString; // this helper broken in `3.4.1-3.4.4`, so we can't use `shared` helper

	if (typeof sharedStore.inspectSource != 'function') {
	  sharedStore.inspectSource = function (it) {
	    return functionToString.call(it);
	  };
	}

	var inspectSource = sharedStore.inspectSource;

	var WeakMap = global_1.WeakMap;
	var nativeWeakMap = typeof WeakMap === 'function' && /native code/.test(inspectSource(WeakMap));

	var shared = createCommonjsModule(function (module) {
	  (module.exports = function (key, value) {
	    return sharedStore[key] || (sharedStore[key] = value !== undefined ? value : {});
	  })('versions', []).push({
	    version: '3.6.5',
	    mode:  'global',
	    copyright: '© 2020 Denis Pushkarev (zloirock.ru)'
	  });
	});

	var id = 0;
	var postfix = Math.random();

	var uid = function (key) {
	  return 'Symbol(' + String(key === undefined ? '' : key) + ')_' + (++id + postfix).toString(36);
	};

	var keys = shared('keys');

	var sharedKey = function (key) {
	  return keys[key] || (keys[key] = uid(key));
	};

	var hiddenKeys = {};

	var WeakMap$1 = global_1.WeakMap;
	var set, get, has$1;

	var enforce = function (it) {
	  return has$1(it) ? get(it) : set(it, {});
	};

	var getterFor = function (TYPE) {
	  return function (it) {
	    var state;

	    if (!isObject(it) || (state = get(it)).type !== TYPE) {
	      throw TypeError('Incompatible receiver, ' + TYPE + ' required');
	    }

	    return state;
	  };
	};

	if (nativeWeakMap) {
	  var store$1 = new WeakMap$1();
	  var wmget = store$1.get;
	  var wmhas = store$1.has;
	  var wmset = store$1.set;

	  set = function (it, metadata) {
	    wmset.call(store$1, it, metadata);
	    return metadata;
	  };

	  get = function (it) {
	    return wmget.call(store$1, it) || {};
	  };

	  has$1 = function (it) {
	    return wmhas.call(store$1, it);
	  };
	} else {
	  var STATE = sharedKey('state');
	  hiddenKeys[STATE] = true;

	  set = function (it, metadata) {
	    createNonEnumerableProperty(it, STATE, metadata);
	    return metadata;
	  };

	  get = function (it) {
	    return has(it, STATE) ? it[STATE] : {};
	  };

	  has$1 = function (it) {
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

	    if (typeof value == 'function') {
	      if (typeof key == 'string' && !has(value, 'name')) createNonEnumerableProperty(value, 'name', key);
	      enforceInternalState(value).source = TEMPLATE.join(typeof key == 'string' ? key : '');
	    }

	    if (O === global_1) {
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

	var path = global_1;

	var aFunction = function (variable) {
	  return typeof variable == 'function' ? variable : undefined;
	};

	var getBuiltIn = function (namespace, method) {
	  return arguments.length < 2 ? aFunction(path[namespace]) || aFunction(global_1[namespace]) : path[namespace] && path[namespace][method] || global_1[namespace] && global_1[namespace][method];
	};

	var ceil = Math.ceil;
	var floor = Math.floor; // `ToInteger` abstract operation
	// https://tc39.github.io/ecma262/#sec-tointeger

	var toInteger = function (argument) {
	  return isNaN(argument = +argument) ? 0 : (argument > 0 ? floor : ceil)(argument);
	};

	var min = Math.min; // `ToLength` abstract operation
	// https://tc39.github.io/ecma262/#sec-tolength

	var toLength = function (argument) {
	  return argument > 0 ? min(toInteger(argument), 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
	};

	var max = Math.max;
	var min$1 = Math.min; // Helper for a popular repeating case of the spec:
	// Let integer be ? ToInteger(index).
	// If integer < 0, let result be max((length + integer), 0); else let result be min(integer, length).

	var toAbsoluteIndex = function (index, length) {
	  var integer = toInteger(index);
	  return integer < 0 ? max(integer + length, 0) : min$1(integer, length);
	};

	var createMethod = function (IS_INCLUDES) {
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
	  // https://tc39.github.io/ecma262/#sec-array.prototype.includes
	  includes: createMethod(true),
	  // `Array.prototype.indexOf` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.indexof
	  indexOf: createMethod(false)
	};

	var indexOf = arrayIncludes.indexOf;

	var objectKeysInternal = function (object, names) {
	  var O = toIndexedObject(object);
	  var i = 0;
	  var result = [];
	  var key;

	  for (key in O) !has(hiddenKeys, key) && has(O, key) && result.push(key); // Don't enum bug & hidden keys


	  while (names.length > i) if (has(O, key = names[i++])) {
	    ~indexOf(result, key) || result.push(key);
	  }

	  return result;
	};

	// IE8- don't enum bug keys
	var enumBugKeys = ['constructor', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString', 'toString', 'valueOf'];

	var hiddenKeys$1 = enumBugKeys.concat('length', 'prototype'); // `Object.getOwnPropertyNames` method
	// https://tc39.github.io/ecma262/#sec-object.getownpropertynames

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

	var ownKeys = getBuiltIn('Reflect', 'ownKeys') || function ownKeys(it) {
	  var keys = objectGetOwnPropertyNames.f(anObject(it));
	  var getOwnPropertySymbols = objectGetOwnPropertySymbols.f;
	  return getOwnPropertySymbols ? keys.concat(getOwnPropertySymbols(it)) : keys;
	};

	var copyConstructorProperties = function (target, source) {
	  var keys = ownKeys(source);
	  var defineProperty = objectDefineProperty.f;
	  var getOwnPropertyDescriptor = objectGetOwnPropertyDescriptor.f;

	  for (var i = 0; i < keys.length; i++) {
	    var key = keys[i];
	    if (!has(target, key)) defineProperty(target, key, getOwnPropertyDescriptor(source, key));
	  }
	};

	var replacement = /#|\.prototype\./;

	var isForced = function (feature, detection) {
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

	var _export = function (options, source) {
	  var TARGET = options.target;
	  var GLOBAL = options.global;
	  var STATIC = options.stat;
	  var FORCED, target, key, targetProperty, sourceProperty, descriptor;

	  if (GLOBAL) {
	    target = global_1;
	  } else if (STATIC) {
	    target = global_1[TARGET] || setGlobal(TARGET, {});
	  } else {
	    target = (global_1[TARGET] || {}).prototype;
	  }

	  if (target) for (key in source) {
	    sourceProperty = source[key];

	    if (options.noTargetGet) {
	      descriptor = getOwnPropertyDescriptor$1(target, key);
	      targetProperty = descriptor && descriptor.value;
	    } else targetProperty = target[key];

	    FORCED = isForced_1(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced); // contained in target

	    if (!FORCED && targetProperty !== undefined) {
	      if (typeof sourceProperty === typeof targetProperty) continue;
	      copyConstructorProperties(sourceProperty, targetProperty);
	    } // add a flag to not completely full polyfills


	    if (options.sham || targetProperty && targetProperty.sham) {
	      createNonEnumerableProperty(sourceProperty, 'sham', true);
	    } // extend global


	    redefine(target, key, sourceProperty, options);
	  }
	};

	// https://tc39.github.io/ecma262/#sec-isarray

	var isArray = Array.isArray || function isArray(arg) {
	  return classofRaw(arg) == 'Array';
	};

	var createProperty = function (object, key, value) {
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
	&& typeof Symbol.iterator == 'symbol';

	var WellKnownSymbolsStore = shared('wks');
	var Symbol$1 = global_1.Symbol;
	var createWellKnownSymbol = useSymbolAsUid ? Symbol$1 : Symbol$1 && Symbol$1.withoutSetter || uid;

	var wellKnownSymbol = function (name) {
	  if (!has(WellKnownSymbolsStore, name)) {
	    if (nativeSymbol && has(Symbol$1, name)) WellKnownSymbolsStore[name] = Symbol$1[name];else WellKnownSymbolsStore[name] = createWellKnownSymbol('Symbol.' + name);
	  }

	  return WellKnownSymbolsStore[name];
	};

	var engineUserAgent = getBuiltIn('navigator', 'userAgent') || '';

	var process = global_1.process;
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

	var SPECIES = wellKnownSymbol('species');

	var arrayMethodHasSpeciesSupport = function (METHOD_NAME) {
	  // We can't use this feature detection in V8 since it causes
	  // deoptimization and serious performance degradation
	  // https://github.com/zloirock/core-js/issues/677
	  return engineV8Version >= 51 || !fails(function () {
	    var array = [];
	    var constructor = array.constructor = {};

	    constructor[SPECIES] = function () {
	      return {
	        foo: 1
	      };
	    };

	    return array[METHOD_NAME](Boolean).foo !== 1;
	  });
	};

	var defineProperty = Object.defineProperty;
	var cache = {};

	var thrower = function (it) {
	  throw it;
	};

	var arrayMethodUsesToLength = function (METHOD_NAME, options) {
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

	var HAS_SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('slice');
	var USES_TO_LENGTH = arrayMethodUsesToLength('slice', {
	  ACCESSORS: true,
	  0: 0,
	  1: 2
	});
	var SPECIES$1 = wellKnownSymbol('species');
	var nativeSlice = [].slice;
	var max$1 = Math.max; // `Array.prototype.slice` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.slice
	// fallback for not array-like ES3 strings and DOM objects

	_export({
	  target: 'Array',
	  proto: true,
	  forced: !HAS_SPECIES_SUPPORT || !USES_TO_LENGTH
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
	        Constructor = Constructor[SPECIES$1];
	        if (Constructor === null) Constructor = undefined;
	      }

	      if (Constructor === Array || Constructor === undefined) {
	        return nativeSlice.call(O, k, fin);
	      }
	    }

	    result = new (Constructor === undefined ? Array : Constructor)(max$1(fin - k, 0));

	    for (n = 0; k < fin; k++, n++) if (k in O) createProperty(result, n, O[k]);

	    result.length = n;
	    return result;
	  }
	});

	// https://tc39.github.io/ecma262/#sec-toobject

	var toObject = function (argument) {
	  return Object(requireObjectCoercible(argument));
	};

	var SPECIES$2 = wellKnownSymbol('species'); // `ArraySpeciesCreate` abstract operation
	// https://tc39.github.io/ecma262/#sec-arrayspeciescreate

	var arraySpeciesCreate = function (originalArray, length) {
	  var C;

	  if (isArray(originalArray)) {
	    C = originalArray.constructor; // cross-realm fallback

	    if (typeof C == 'function' && (C === Array || isArray(C.prototype))) C = undefined;else if (isObject(C)) {
	      C = C[SPECIES$2];
	      if (C === null) C = undefined;
	    }
	  }

	  return new (C === undefined ? Array : C)(length === 0 ? 0 : length);
	};

	var HAS_SPECIES_SUPPORT$1 = arrayMethodHasSpeciesSupport('splice');
	var USES_TO_LENGTH$1 = arrayMethodUsesToLength('splice', {
	  ACCESSORS: true,
	  0: 0,
	  1: 2
	});
	var max$2 = Math.max;
	var min$2 = Math.min;
	var MAX_SAFE_INTEGER = 0x1FFFFFFFFFFFFF;
	var MAXIMUM_ALLOWED_LENGTH_EXCEEDED = 'Maximum allowed length exceeded'; // `Array.prototype.splice` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.splice
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
	      actualDeleteCount = min$2(max$2(toInteger(deleteCount), 0), len - actualStart);
	    }

	    if (len + insertCount - actualDeleteCount > MAX_SAFE_INTEGER) {
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

	      for (k = len; k > len - actualDeleteCount + insertCount; k--) delete O[k - 1];
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

	var defineProperty$1 = objectDefineProperty.f;
	var FunctionPrototype = Function.prototype;
	var FunctionPrototypeToString = FunctionPrototype.toString;
	var nameRE = /^\s*function ([^ (]*)/;
	var NAME = 'name'; // Function instances `.name` property
	// https://tc39.github.io/ecma262/#sec-function-instances-name

	if (descriptors && !(NAME in FunctionPrototype)) {
	  defineProperty$1(FunctionPrototype, NAME, {
	    configurable: true,
	    get: function () {
	      try {
	        return FunctionPrototypeToString.call(this).match(nameRE)[1];
	      } catch (error) {
	        return '';
	      }
	    }
	  });
	}

	var aPossiblePrototype = function (it) {
	  if (!isObject(it) && it !== null) {
	    throw TypeError("Can't set " + String(it) + ' as a prototype');
	  }

	  return it;
	};

	// https://tc39.github.io/ecma262/#sec-object.setprototypeof
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

	var inheritIfRequired = function ($this, dummy, Wrapper) {
	  var NewTarget, NewTargetPrototype;
	  if ( // it can work only with native `setPrototypeOf`
	  objectSetPrototypeOf && // we haven't completely correct pre-ES6 way for getting `new.target`, so use this
	  typeof (NewTarget = dummy.constructor) == 'function' && NewTarget !== Wrapper && isObject(NewTargetPrototype = NewTarget.prototype) && NewTargetPrototype !== Wrapper.prototype) objectSetPrototypeOf($this, NewTargetPrototype);
	  return $this;
	};

	// https://tc39.github.io/ecma262/#sec-object.keys

	var objectKeys = Object.keys || function keys(O) {
	  return objectKeysInternal(O, enumBugKeys);
	};

	// https://tc39.github.io/ecma262/#sec-object.defineproperties

	var objectDefineProperties = descriptors ? Object.defineProperties : function defineProperties(O, Properties) {
	  anObject(O);
	  var keys = objectKeys(Properties);
	  var length = keys.length;
	  var index = 0;
	  var key;

	  while (length > index) objectDefineProperty.f(O, key = keys[index++], Properties[key]);

	  return O;
	};

	var html = getBuiltIn('document', 'documentElement');

	var GT = '>';
	var LT = '<';
	var PROTOTYPE = 'prototype';
	var SCRIPT = 'script';
	var IE_PROTO = sharedKey('IE_PROTO');

	var EmptyConstructor = function () {
	  /* empty */
	};

	var scriptTag = function (content) {
	  return LT + SCRIPT + GT + content + LT + '/' + SCRIPT + GT;
	}; // Create object with fake `null` prototype: use ActiveX Object with cleared prototype


	var NullProtoObjectViaActiveX = function (activeXDocument) {
	  activeXDocument.write(scriptTag(''));
	  activeXDocument.close();
	  var temp = activeXDocument.parentWindow.Object;
	  activeXDocument = null; // avoid memory leak

	  return temp;
	}; // Create object with fake `null` prototype: use iframe Object with cleared prototype


	var NullProtoObjectViaIFrame = function () {
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

	var NullProtoObject = function () {
	  try {
	    /* global ActiveXObject */
	    activeXDocument = document.domain && new ActiveXObject('htmlfile');
	  } catch (error) {
	    /* ignore */
	  }

	  NullProtoObject = activeXDocument ? NullProtoObjectViaActiveX(activeXDocument) : NullProtoObjectViaIFrame();
	  var length = enumBugKeys.length;

	  while (length--) delete NullProtoObject[PROTOTYPE][enumBugKeys[length]];

	  return NullProtoObject();
	};

	hiddenKeys[IE_PROTO] = true; // `Object.create` method
	// https://tc39.github.io/ecma262/#sec-object.create

	var objectCreate = Object.create || function create(O, Properties) {
	  var result;

	  if (O !== null) {
	    EmptyConstructor[PROTOTYPE] = anObject(O);
	    result = new EmptyConstructor();
	    EmptyConstructor[PROTOTYPE] = null; // add "__proto__" for Object.getPrototypeOf polyfill

	    result[IE_PROTO] = O;
	  } else result = NullProtoObject();

	  return Properties === undefined ? result : objectDefineProperties(result, Properties);
	};

	// a string of all valid unicode whitespaces
	// eslint-disable-next-line max-len
	var whitespaces = '\u0009\u000A\u000B\u000C\u000D\u0020\u00A0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF';

	var whitespace = '[' + whitespaces + ']';
	var ltrim = RegExp('^' + whitespace + whitespace + '*');
	var rtrim = RegExp(whitespace + whitespace + '*$'); // `String.prototype.{ trim, trimStart, trimEnd, trimLeft, trimRight }` methods implementation

	var createMethod$1 = function (TYPE) {
	  return function ($this) {
	    var string = String(requireObjectCoercible($this));
	    if (TYPE & 1) string = string.replace(ltrim, '');
	    if (TYPE & 2) string = string.replace(rtrim, '');
	    return string;
	  };
	};

	var stringTrim = {
	  // `String.prototype.{ trimLeft, trimStart }` methods
	  // https://tc39.github.io/ecma262/#sec-string.prototype.trimstart
	  start: createMethod$1(1),
	  // `String.prototype.{ trimRight, trimEnd }` methods
	  // https://tc39.github.io/ecma262/#sec-string.prototype.trimend
	  end: createMethod$1(2),
	  // `String.prototype.trim` method
	  // https://tc39.github.io/ecma262/#sec-string.prototype.trim
	  trim: createMethod$1(3)
	};

	var getOwnPropertyNames = objectGetOwnPropertyNames.f;
	var getOwnPropertyDescriptor$2 = objectGetOwnPropertyDescriptor.f;
	var defineProperty$2 = objectDefineProperty.f;
	var trim = stringTrim.trim;
	var NUMBER = 'Number';
	var NativeNumber = global_1[NUMBER];
	var NumberPrototype = NativeNumber.prototype; // Opera ~12 has broken Object#toString

	var BROKEN_CLASSOF = classofRaw(objectCreate(NumberPrototype)) == NUMBER; // `ToNumber` abstract operation
	// https://tc39.github.io/ecma262/#sec-tonumber

	var toNumber = function (argument) {
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
	// https://tc39.github.io/ecma262/#sec-number-constructor


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
	  'EPSILON,isFinite,isInteger,isNaN,isSafeInteger,MAX_SAFE_INTEGER,' + 'MIN_SAFE_INTEGER,parseFloat,parseInt,isInteger').split(','), j = 0, key; keys$1.length > j; j++) {
	    if (has(NativeNumber, key = keys$1[j]) && !has(NumberWrapper, key)) {
	      defineProperty$2(NumberWrapper, key, getOwnPropertyDescriptor$2(NativeNumber, key));
	    }
	  }

	  NumberWrapper.prototype = NumberPrototype;
	  NumberPrototype.constructor = NumberWrapper;
	  redefine(global_1, NUMBER, NumberWrapper);
	}

	// https://tc39.github.io/ecma262/#sec-get-regexp.prototype.flags


	var regexpFlags = function () {
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

	_export({
	  target: 'RegExp',
	  proto: true,
	  forced: /./.exec !== regexpExec
	}, {
	  exec: regexpExec
	});

	var SPECIES$3 = wellKnownSymbol('species');
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

	var fixRegexpWellKnownSymbolLogic = function (KEY, length, exec, sham) {
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

	      re.constructor[SPECIES$3] = function () {
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

	var createMethod$2 = function (CONVERT_TO_STRING) {
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
	  // https://tc39.github.io/ecma262/#sec-string.prototype.codepointat
	  codeAt: createMethod$2(false),
	  // `String.prototype.at` method
	  // https://github.com/mathiasbynens/String.prototype.at
	  charAt: createMethod$2(true)
	};

	var charAt = stringMultibyte.charAt; // `AdvanceStringIndex` abstract operation
	// https://tc39.github.io/ecma262/#sec-advancestringindex

	var advanceStringIndex = function (S, index, unicode) {
	  return index + (unicode ? charAt(S, index).length : 1);
	};

	// https://tc39.github.io/ecma262/#sec-regexpexec

	var regexpExecAbstract = function (R, S) {
	  var exec = R.exec;

	  if (typeof exec === 'function') {
	    var result = exec.call(R, S);

	    if (typeof result !== 'object') {
	      throw TypeError('RegExp exec method returned something other than an Object or null');
	    }

	    return result;
	  }

	  if (classofRaw(R) !== 'RegExp') {
	    throw TypeError('RegExp#exec called on incompatible receiver');
	  }

	  return regexpExec.call(R, S);
	};

	var max$3 = Math.max;
	var min$3 = Math.min;
	var floor$1 = Math.floor;
	var SUBSTITUTION_SYMBOLS = /\$([$&'`]|\d\d?|<[^>]*>)/g;
	var SUBSTITUTION_SYMBOLS_NO_NAMED = /\$([$&'`]|\d\d?)/g;

	var maybeToString = function (it) {
	  return it === undefined ? it : String(it);
	}; // @@replace logic


	fixRegexpWellKnownSymbolLogic('replace', 2, function (REPLACE, nativeReplace, maybeCallNative, reason) {
	  var REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE = reason.REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE;
	  var REPLACE_KEEPS_$0 = reason.REPLACE_KEEPS_$0;
	  var UNSAFE_SUBSTITUTE = REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE ? '$' : '$0';
	  return [// `String.prototype.replace` method
	  // https://tc39.github.io/ecma262/#sec-string.prototype.replace
	  function replace(searchValue, replaceValue) {
	    var O = requireObjectCoercible(this);
	    var replacer = searchValue == undefined ? undefined : searchValue[REPLACE];
	    return replacer !== undefined ? replacer.call(searchValue, O, replaceValue) : nativeReplace.call(String(O), searchValue, replaceValue);
	  }, // `RegExp.prototype[@@replace]` method
	  // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@replace
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
	      var position = max$3(min$3(toInteger(result.index), S.length), 0);
	      var captures = []; // NOTE: This is equivalent to
	      //   captures = result.slice(1).map(maybeToString)
	      // but for some reason `nativeSlice.call(result, 1, result.length)` (called in
	      // the slice polyfill when slicing native arrays) "doesn't work" in safari 9 and
	      // causes a crash (https://pastebin.com/N21QzeQA) when trying to debug it.

	      for (var j = 1; j < result.length; j++) captures.push(maybeToString(result[j]));

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
	  }]; // https://tc39.github.io/ecma262/#sec-getsubstitution

	  function getSubstitution(matched, str, position, captures, namedCaptures, replacement) {
	    var tailPos = position + matched.length;
	    var m = captures.length;
	    var symbols = SUBSTITUTION_SYMBOLS_NO_NAMED;

	    if (namedCaptures !== undefined) {
	      namedCaptures = toObject(namedCaptures);
	      symbols = SUBSTITUTION_SYMBOLS;
	    }

	    return nativeReplace.call(replacement, symbols, function (match, ch) {
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
	  }
	});

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

	var arrayMethodIsStrict = function (METHOD_NAME, argument) {
	  var method = [][METHOD_NAME];
	  return !!method && fails(function () {
	    // eslint-disable-next-line no-useless-call,no-throw-literal
	    method.call(null, argument || function () {
	      throw 1;
	    }, 1);
	  });
	};

	var min$4 = Math.min;
	var nativeLastIndexOf = [].lastIndexOf;
	var NEGATIVE_ZERO = !!nativeLastIndexOf && 1 / [1].lastIndexOf(1, -0) < 0;
	var STRICT_METHOD = arrayMethodIsStrict('lastIndexOf'); // For preventing possible almost infinite loop in non-standard implementations, test the forward version of the method

	var USES_TO_LENGTH$2 = arrayMethodUsesToLength('indexOf', {
	  ACCESSORS: true,
	  1: 0
	});
	var FORCED = NEGATIVE_ZERO || !STRICT_METHOD || !USES_TO_LENGTH$2; // `Array.prototype.lastIndexOf` method implementation
	// https://tc39.github.io/ecma262/#sec-array.prototype.lastindexof

	var arrayLastIndexOf = FORCED ? function lastIndexOf(searchElement
	/* , fromIndex = @[*-1] */
	) {
	  // convert -0 to +0
	  if (NEGATIVE_ZERO) return nativeLastIndexOf.apply(this, arguments) || 0;
	  var O = toIndexedObject(this);
	  var length = toLength(O.length);
	  var index = length - 1;
	  if (arguments.length > 1) index = min$4(index, toInteger(arguments[1]));
	  if (index < 0) index = length + index;

	  for (; index >= 0; index--) if (index in O && O[index] === searchElement) return index || 0;

	  return -1;
	} : nativeLastIndexOf;

	// https://tc39.github.io/ecma262/#sec-array.prototype.lastindexof

	_export({
	  target: 'Array',
	  proto: true,
	  forced: arrayLastIndexOf !== [].lastIndexOf
	}, {
	  lastIndexOf: arrayLastIndexOf
	});

	var MATCH = wellKnownSymbol('match'); // `IsRegExp` abstract operation
	// https://tc39.github.io/ecma262/#sec-isregexp

	var isRegexp = function (it) {
	  var isRegExp;
	  return isObject(it) && ((isRegExp = it[MATCH]) !== undefined ? !!isRegExp : classofRaw(it) == 'RegExp');
	};

	var aFunction$1 = function (it) {
	  if (typeof it != 'function') {
	    throw TypeError(String(it) + ' is not a function');
	  }

	  return it;
	};

	var SPECIES$4 = wellKnownSymbol('species'); // `SpeciesConstructor` abstract operation
	// https://tc39.github.io/ecma262/#sec-speciesconstructor

	var speciesConstructor = function (O, defaultConstructor) {
	  var C = anObject(O).constructor;
	  var S;
	  return C === undefined || (S = anObject(C)[SPECIES$4]) == undefined ? defaultConstructor : aFunction$1(S);
	};

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
	    internalSplit = function (separator, limit) {
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
	    internalSplit = function (separator, limit) {
	      return separator === undefined && limit === 0 ? [] : nativeSplit.call(this, separator, limit);
	    };
	  } else internalSplit = nativeSplit;

	  return [// `String.prototype.split` method
	  // https://tc39.github.io/ecma262/#sec-string.prototype.split
	  function split(separator, limit) {
	    var O = requireObjectCoercible(this);
	    var splitter = separator == undefined ? undefined : separator[SPLIT];
	    return splitter !== undefined ? splitter.call(separator, O, limit) : internalSplit.call(String(O), separator, limit);
	  }, // `RegExp.prototype[@@split]` method
	  // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@split
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

	var $indexOf = arrayIncludes.indexOf;
	var nativeIndexOf = [].indexOf;
	var NEGATIVE_ZERO$1 = !!nativeIndexOf && 1 / [1].indexOf(1, -0) < 0;
	var STRICT_METHOD$1 = arrayMethodIsStrict('indexOf');
	var USES_TO_LENGTH$3 = arrayMethodUsesToLength('indexOf', {
	  ACCESSORS: true,
	  1: 0
	}); // `Array.prototype.indexOf` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.indexof

	_export({
	  target: 'Array',
	  proto: true,
	  forced: NEGATIVE_ZERO$1 || !STRICT_METHOD$1 || !USES_TO_LENGTH$3
	}, {
	  indexOf: function indexOf(searchElement
	  /* , fromIndex = 0 */
	  ) {
	    return NEGATIVE_ZERO$1 // convert -0 to +0
	    ? nativeIndexOf.apply(this, arguments) || 0 : $indexOf(this, searchElement, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});

	var nativeJoin = [].join;
	var ES3_STRINGS = indexedObject != Object;
	var STRICT_METHOD$2 = arrayMethodIsStrict('join', ','); // `Array.prototype.join` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.join

	_export({
	  target: 'Array',
	  proto: true,
	  forced: ES3_STRINGS || !STRICT_METHOD$2
	}, {
	  join: function join(separator) {
	    return nativeJoin.call(toIndexedObject(this), separator === undefined ? ',' : separator);
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
	 * Execute function asynchronously
	 * @param fn
	 * @param context
	 */


	function async(fn, context) {
	  setTimeout(fn.bind(context), 0);
	}
	/**
	 * Extends the destination object `dst` by copying all of the properties from
	 * the `src` object(s) to `dst`. You can specify multiple `src` objects.
	 * @function
	 * @param {Object} dst Destination object.
	 * @param {...Object} src Source object(s).
	 * @returns {Object} Reference to `dst`.
	 */


	function extend(dst, src) {
	  each(arguments, function (obj) {
	    if (obj !== dst) {
	      each(obj, function (value, key) {
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
	    value: function preprocessFinished() {
	      // Re-compute the endByte after the preprocess function to allow an
	      // implementer of preprocess to set the fileObj size
	      this.endByte = this.computeEndByte();
	      this.preprocessState = 2;
	      this.send();
	    }
	    /**
	     * Finish read state
	     * @function
	     */

	  }, {
	    key: "readFinished",
	    value: function readFinished(bytes) {
	      this.readState = 2;
	      this.bytes = bytes;
	      this.send();
	    }
	    /**
	     * Uploads the actual data in a POST call
	     * @function
	     */

	  }, {
	    key: "send",
	    value: function send() {
	      var preprocess = this.flowObj.opts.preprocess;
	      var read = this.flowObj.opts.readFileFn;

	      if (typeof preprocess === 'function') {
	        switch (this.preprocessState) {
	          case 0:
	            this.preprocessState = 1;
	            preprocess(this);
	            return;

	          case 1:
	            return;
	        }
	      }

	      switch (this.readState) {
	        case 0:
	          this.readState = 1;
	          read(this.fileObj, this.startByte, this.endByte, this.fileObj.file.type, this);
	          return;

	        case 1:
	          return;
	      }

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
	      var data = this.prepareXhrRequest(uploadMethod, false, this.flowObj.opts.method, this.bytes);
	      var changeRawDataBeforeSend = this.flowObj.opts.changeRawDataBeforeSend;

	      if (typeof changeRawDataBeforeSend === 'function') {
	        data = changeRawDataBeforeSend(this, data);
	      }

	      this.xhr.send(data);
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
	      query = extend(query || {}, this.getParams());
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
	     * Used to store the bytes read
	     * @type {Blob|string}
	     */

	    this.bytes = null;
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
	    this.bootstrap();
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
	          this.flowObj.fire('fileProgress', this, chunk);
	          this.flowObj.fire('progress');
	          this._lastProgressCallback = Date.now();
	          break;

	        case 'error':
	          this.error = true;
	          this.abort(true);
	          this.flowObj.fire('fileError', this, message, chunk);
	          this.flowObj.fire('error', message, this, chunk);
	          break;

	        case 'success':
	          if (this.error) {
	            return;
	          }

	          this.measureSpeed();
	          this.flowObj.fire('fileProgress', this, chunk);
	          this.flowObj.fire('progress');
	          this._lastProgressCallback = Date.now();

	          if (this.isComplete()) {
	            this.currentSpeed = 0;
	            this.averageSpeed = 0;
	            this.flowObj.fire('fileSuccess', this, message, chunk);
	          }

	          break;

	        case 'retry':
	          this.flowObj.fire('fileRetry', this, chunk);
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
	      this.bootstrap();
	      this.flowObj.upload();
	    }
	    /**
	     * Clear current chunks and slice file again
	     * @function
	     */

	  }, {
	    key: "bootstrap",
	    value: function bootstrap() {
	      if (typeof this.flowObj.opts.initFileFn === "function") {
	        var ret = this.flowObj.opts.initFileFn(this);

	        if (ret && 'then' in ret) {
	          ret.then(this._bootstrap.bind(this));
	          return;
	        }
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
	 * @param {Function} [opts.generateUniqueIdentifier]
	 * @constructor
	 */

	var Flow = /*#__PURE__*/function () {
	  function Flow(opts) {
	    _classCallCheck(this, Flow);

	    /**
	     * Library version
	     * @type {string}
	     */
	    Flow.version = '2.14.1';
	    /**
	     * Check if directory upload is supported
	     * @type {boolean}
	     */

	    this.supportDirectory = /Chrome/.test(window.navigator.userAgent) || /Firefox/.test(window.navigator.userAgent) || /Edge/.test(window.navigator.userAgent);
	    /**
	     * List of FlowFile objects
	     * @type {Array.<FlowFile>}
	     */

	    this.files = [];
	    /**
	     * Default options for flow.js
	     * @type {Object}
	     */

	    this.defaults = {
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
	      readFileFn: webAPIFileRead
	    };
	    /**
	     * Current options
	     * @type {Object}
	     */

	    this.opts = {};
	    /**
	     * List of events:
	     *  key stands for event name
	     *  value array list of callbacks
	     * @type {}
	     */

	    this.events = {};
	    /**
	     * Current options
	     * @type {Object}
	     */

	    this.opts = extend({}, this.defaults, opts || {}); // A workaround for using this.method.bind(this) as a (removable) event handler.
	    // https://stackoverflow.com/questions/11565471

	    this._onDropBound = null;
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
	     * Set a callback for an event, possible events:
	     * fileSuccess(file), fileProgress(file), fileAdded(file, event),
	     * fileRemoved(file), fileRetry(file), fileError(file, message),
	     * complete(), progress(), error(message, file), pause()
	     * @function
	     * @param {string} event
	     * @param {Function} callback
	     */

	  }, {
	    key: "on",
	    value: function on(event, callback) {
	      event = event.toLowerCase();

	      if (!this.events.hasOwnProperty(event)) {
	        this.events[event] = [];
	      }

	      this.events[event].push(callback);
	    }
	    /**
	     * Remove event callback
	     * @function
	     * @param {string} [event] removes all events if not specified
	     * @param {Function} [fn] removes all callbacks of event if not specified
	     */

	  }, {
	    key: "off",
	    value: function off(event, fn) {
	      if (event !== undefined) {
	        event = event.toLowerCase();

	        if (fn !== undefined) {
	          if (this.events.hasOwnProperty(event)) {
	            arrayRemove(this.events[event], fn);
	          }
	        } else {
	          delete this.events[event];
	        }
	      } else {
	        this.events = {};
	      }
	    }
	    /**
	     * Fire an event
	     * @function
	     * @param {string} event event name
	     * @param {...} args arguments of a callback
	     * @return {bool} value is false if at least one of the event handlers which handled this event
	     * returned false. Otherwise it returns true.
	     */

	  }, {
	    key: "fire",
	    value: function fire(event, args) {
	      // `arguments` is an object, not array, in FF, so:
	      args = Array.prototype.slice.call(arguments);
	      event = event.toLowerCase();
	      var preventDefault = false;

	      if (this.events.hasOwnProperty(event)) {
	        each(this.events[event], function (callback) {
	          preventDefault = callback.apply(this, args.slice(1)) === false || preventDefault;
	        }, this);
	      }

	      if (event != 'catchall') {
	        args.unshift('catchAll');
	        preventDefault = this.fire.apply(this, args) === false || preventDefault;
	      }

	      return !preventDefault;
	    }
	    /**
	     * Read webkit dataTransfer object
	     * @param event
	     */

	  }, {
	    key: "webkitReadDataTransfer",
	    value: function webkitReadDataTransfer(event) {
	      var _this = this;

	      var queue = event.dataTransfer.items.length;

	      var decrement = function decrement() {
	        if (--queue == 0) {
	          _this.addFiles(files, event);
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

	            var _iterator2 = _createForOfIteratorHelper(entries),
	                _step2;

	            try {
	              for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
	                var _entry = _step2.value;

	                if (_entry.isFile) {
	                  var fullPath = _entry.fullPath;

	                  _entry.file(function (file) {
	                    return fileReadSuccess(file, fullPath);
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
	        each(this.files, function (file) {
	          if (!file.paused && file.chunks.length && file.chunks[0].status() === 'pending') {
	            file.chunks[0].send();
	            found = true;
	            return false;
	          }

	          if (!file.paused && file.chunks.length > 1 && file.chunks[file.chunks.length - 1].status() === 'pending') {
	            file.chunks[file.chunks.length - 1].send();
	            found = true;
	            return false;
	          }
	        });

	        if (found) {
	          return found;
	        }
	      } // Now, simply look for the next, best thing to upload


	      each(this.files, function (file) {
	        if (!file.paused) {
	          each(file.chunks, function (chunk) {
	            if (chunk.status() === 'pending') {
	              chunk.send();
	              found = true;
	              return false;
	            }
	          });
	        }

	        if (found) {
	          return false;
	        }
	      });

	      if (found) {
	        return true;
	      } // The are no more outstanding chunks to upload, check is everything is done


	      var outstanding = false;
	      each(this.files, function (file) {
	        if (!file.isComplete()) {
	          outstanding = true;
	          return false;
	        }
	      });

	      if (!outstanding && !preventEvents) {
	        // All chunks have been uploaded, complete
	        async(function () {
	          this.fire('complete');
	        }, this);
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
	        var _this2 = this;

	        var input;

	        if (domNode.tagName === 'INPUT' && domNode.type === 'file') {
	          input = domNode;
	        } else {
	          input = document.createElement('input');
	          input.setAttribute('type', 'file'); // display:none - not working in opera 12

	          extend(input.style, {
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
	            _this2.addFiles(e.target.files, e);

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

	      var _iterator3 = _createForOfIteratorHelper(domNodes),
	          _step3;

	      try {
	        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
	          var domNode = _step3.value;
	          domNode.addEventListener('dragover', this.preventEvent, false);
	          domNode.addEventListener('dragenter', this.preventEvent, false);
	          domNode.addEventListener('drop', this._onDropBound, false);
	        }
	      } catch (err) {
	        _iterator3.e(err);
	      } finally {
	        _iterator3.f();
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

	      var _iterator4 = _createForOfIteratorHelper(domNodes),
	          _step4;

	      try {
	        for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
	          var domNode = _step4.value;
	          domNode.removeEventListener('dragover', this.preventEvent, false);
	          domNode.removeEventListener('dragenter', this.preventEvent, false);
	          domNode.removeEventListener('drop', this._onDropBound, false);
	        }
	      } catch (err) {
	        _iterator4.e(err);
	      } finally {
	        _iterator4.f();
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


	      this.fire('uploadStart');
	      var started = false;

	      for (var num = 1; num <= this.opts.simultaneousUploads - ret; num++) {
	        started = this.uploadNextChunk(true) || started;
	      }

	      if (!started) {
	        async(function () {
	          this.fire('complete');
	        }, this);
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
	     * Add a HTML5 File object to the list of files.
	     * @function
	     * @param {File} file
	     * @param {Event} [event] event is optional
	     */

	  }, {
	    key: "addFile",
	    value: function addFile(file, event) {
	      this.addFiles([file], event);
	    }
	    /**
	     * Add a HTML5 File object to the list of files.
	     * @function
	     * @param {FileList|Array} fileList
	     * @param {Event} [event] event is optional
	     */

	  }, {
	    key: "addFiles",
	    value: function addFiles(fileList, event) {
	      var files = []; // ie10+

	      var ie10plus = window.navigator.msPointerEnabled;
	      each(fileList, function (file) {
	        // https://github.com/flowjs/flow.js/issues/55
	        if ((!ie10plus || ie10plus && file.size > 0) && !(file.size % 4096 === 0 && (file.name === '.' || file.fileName === '.'))) {
	          var uniqueIdentifier = this.generateUniqueIdentifier(file);

	          if (this.opts.allowDuplicateUploads || !this.getFromUniqueIdentifier(uniqueIdentifier)) {
	            var f = new FlowFile(this, file, uniqueIdentifier);

	            if (this.fire('fileAdded', f, event)) {
	              files.push(f);
	            }
	          }
	        }
	      }, this);

	      if (this.fire('filesAdded', files, event)) {
	        each(files, function (file) {
	          if (this.opts.singleFile && this.files.length > 0) {
	            this.removeFile(this.files[0]);
	          }

	          this.files.push(file);
	        }, this);
	        this.fire('filesSubmitted', files, event);
	      }
	    }
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
	          this.fire('fileRemoved', file);
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
	}();

	return Flow;

})));
//# sourceMappingURL=flow.js.map
