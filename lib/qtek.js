 (function(factory){
 	// AMD
 	if( typeof define !== "undefined" && define["amd"] ){
 		define( ["exports"], factory.bind(window) );
 	// No module loader
 	}else{
 		factory( window["qtek"] = {} );
 	}

})(function(_exports){

/**
 * almond 0.2.5 Copyright (c) 2011-2012, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*jslint sloppy: true */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap,
            foundI, foundStarMap, starI, i, j, part,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that "directory" and not name of the baseName's
                //module. For instance, baseName of "one/two/three", maps to
                //"one/two/three.js", but we want the directory, "one/two" for
                //this normalization.
                baseParts = baseParts.slice(0, baseParts.length - 1);

                name = baseParts.concat(name.split("/"));

                //start trimDots
                for (i = 0; i < name.length; i += 1) {
                    part = name[i];
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            break;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            } else if (name.indexOf('./') === 0) {
                // No baseName, so this is ID is resolved relative
                // to baseUrl, pull off the leading dot.
                name = name.substring(2);
            }
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            return req.apply(undef, aps.call(arguments, 0).concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relName) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i,
            args = [],
            usingExports;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (typeof callback === 'function') {

            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback.apply(defined[name], args);

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            //Using a non-zero value because of concern for what old browsers
            //do, and latest browsers "upgrade" to 4 if lower value is used:
            //http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
            //If want a value immediately, use require('id') instead -- something
            //that works in almond on the global level, but not guaranteed and
            //unlikely to work in other AMD implementations.
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 4);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        config = cfg;
        if (config.deps) {
            req(config.deps, config.callback);
        }
        return req;
    };

    define = function (name, deps, callback) {

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
}());

define("../build/almond", function(){});

define('core/mixin/derive',[],function() {

/**
 * derive a sub class from base class
 * @makeDefaultOpt [Object|Function] default option of this sub class, 
                        method of the sub can use this.xxx to access this option
 * @initialize [Function](optional) initialize after the sub class is instantiated
 * @proto [Object](optional) prototype methods/property of the sub class
 *
 * @export{object}
 */
function derive(makeDefaultOpt, initialize/*optional*/, proto/*optional*/) {

    if (typeof initialize == "object") {
        proto = initialize;
        initialize = null;
    }

    var _super = this;

    var sub = function(options) {

        // call super constructor
        _super.call(this);

        // call defaultOpt generate function each time
        // if it is a function, So we can make sure each 
        // property in the object is fresh
        _.extend(this, typeof makeDefaultOpt == "function" ?
                        makeDefaultOpt.call(this) : makeDefaultOpt);

        _.extend(this, options);

        if (this.constructor == sub) {
            // find the base class, and the initialize function will be called 
            // in the order of inherit
            var base = sub;
            var initializeChain = [initialize];
            while (base.__super__) {
                base = base.__super__;
                initializeChain.unshift(base.__initialize__);
            }
            for (var i = 0; i < initializeChain.length; i++) {
                if (initializeChain[i]) {
                    initializeChain[i].call(this);
                }
            }
        }
    };
    // save super constructor
    sub.__super__ = _super;
    // initialize function will be called after all the super constructor is called
    sub.__initialize__ = initialize;

    var Ghost = function() {this.constructor = sub};
    Ghost.prototype = _super.prototype;
    sub.prototype = new Ghost();
    _.extend(sub.prototype, proto);
    
    // extend the derive method as a static method;
    sub.derive = _super.derive;

    return sub;
}

return {
    derive : derive
}

});
/**
 * Event interface
 *
 * @method on(eventName, handler[, context])
 * @method trigger(eventName[, arg1[, arg2]])
 * @method off(eventName[, handler])
 * @method has(eventName)
 * @export{object}
 */
define('core/mixin/notifier',[],function() {

    return{
        trigger : function(name) {
            if (! this.hasOwnProperty('__handlers__')) {
                return;
            }
            if (!this.__handlers__.hasOwnProperty(name)) {
                return;
            }
            var params = Array.prototype.slice.call(arguments, 1);

            var handlers = this.__handlers__[name];
            for (var i = 0; i < handlers.length; i+=2) {
                var handler = handlers[i];
                var context = handlers[i+1];
                handler.apply(context || this, params);
            }
        },
        
        on : function(target, handler, context/*optional*/) {
            if (!target) {
                return;
            }
            var handlers = this.__handlers__ || (this.__handlers__={});
            if (! handlers[target]) {
                handlers[target] = [];
            }
            if (handlers[target].indexOf(handler) == -1) {
                // structure in list
                // [handler,context,handler,context,handler,context..]
                handlers[target].push(handler);
                handlers[target].push(context);
            }

            return handler;
        },

        off : function(target, handler) {
            
            var handlers = this.__handlers__ || (this.__handlers__={});

            if (handlers[target]) {
                if (handler) {
                    var arr = handlers[target];
                    // remove handler and context
                    var idx = arr.indexOf(handler);
                    if(idx >= 0)
                        arr.splice(idx, 2);
                } else {
                    handlers[target] = [];
                }
            }
        },

        has : function(target, handler) {
            if (! this.__handlers__ ||
                ! this.__handlers__[target]) {
                return false;
            }
            if (! handler) {
                return this.__handlers__[target].length;
            } else {
                return this.__handlers__[target].indexOf(handler) !== -1;
            }
        }
    }
    
});
define('core/Cache',[],function() {

    var Cache = function() {

        this._contextId = "",

        this._caches = {},

        this._context = {}

    }

    Cache.prototype = {

        use : function(contextId, documentSchema) {

            if (! this._caches.hasOwnProperty(contextId)) {
                this._caches[contextId] = {};

                if (documentSchema) {
                    for (var name in documentSchema) {
                        this._caches[contextId][name] = documentSchema[name];
                    }   
                }
            }
            this._contextId = contextId;

            this._context = this._caches[contextId];
        },

        put : function(key, value) {
            this._context[key] = value;
        },

        get : function(key) {
            return this._context[key];
        },

        dirty : function(field) {
            field = field || "";
            var key = "__dirty__" + field;
            this.put(key, true)
        },
        
        dirtyAll : function(field) {
            field = field || "";
            var key = "__dirty__" + field;
            for (var contextId in this._caches) {
                this._caches[contextId][key] = true;
            }
        },

        fresh : function(field) {
            field = field || "";
            var key = "__dirty__" + field;
            this.put(key, false);
        },

        freshAll : function(field) {
            field = field || "";
            var key = "__dirty__" + field;
            for (var contextId in this._caches) {
                this._caches[contextId][key] = false;
            }
        },

        isDirty : function(field) {
            field = field || "";
            var key = "__dirty__" + field;
            return  !this._context.hasOwnProperty(key)
                    || this._context[key] === true
        },

        clearContext : function() {
            this._caches[this._contextId] = {};
            this._context = {};
        },

        deleteContext : function(contextId) {
            delete this._caches[contextId];
            this._context = {};
        },

        'delete' : function(key) {
            delete this._context[key];
        },

        clearAll : function() {
            this._caches = {};
        },

        getContext : function() {
            return this._context;
        },

        miss : function(key) {
            return ! this._context.hasOwnProperty(key);
        }
    }

    Cache.prototype.constructor = Cache;

    return Cache;

});
/**
 * @license
 * Lo-Dash 1.1.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash -o ./dist/lodash.compat.js`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.4.4 <http://underscorejs.org/>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud Inc.
 * Available under MIT license <http://lodash.com/license>
 */
;(function(window) {

  /** Used as a safe reference for `undefined` in pre ES5 environments */
  var undefined;

  /** Detect free variable `exports` */
  var freeExports = typeof exports == 'object' && exports;

  /** Detect free variable `module` */
  var freeModule = typeof module == 'object' && module && module.exports == freeExports && module;

  /** Detect free variable `global` and use it as `window` */
  var freeGlobal = typeof global == 'object' && global;
  if (freeGlobal.global === freeGlobal) {
    window = freeGlobal;
  }

  /** Used to generate unique IDs */
  var idCounter = 0;

  /** Used internally to indicate various things */
  var indicatorObject = {};

  /** Used to match empty string literals in compiled template source */
  var reEmptyStringLeading = /\b__p \+= '';/g,
      reEmptyStringMiddle = /\b(__p \+=) '' \+/g,
      reEmptyStringTrailing = /(__e\(.*?\)|\b__t\)) \+\n'';/g;

  /** Used to match HTML entities */
  var reEscapedHtml = /&(?:amp|lt|gt|quot|#39);/g;

  /**
   * Used to match ES6 template delimiters
   * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-7.8.6
   */
  var reEsTemplate = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g;

  /** Used to match regexp flags from their coerced string values */
  var reFlags = /\w*$/;

  /** Used to match "interpolate" template delimiters */
  var reInterpolate = /<%=([\s\S]+?)%>/g;

  /** Used to match leading zeros to be removed */
  var reLeadingZeros = /^0+(?=.$)/;

  /** Used to ensure capturing order of template delimiters */
  var reNoMatch = /($^)/;

  /** Used to match HTML characters */
  var reUnescapedHtml = /[&<>"']/g;

  /** Used to match unescaped characters in compiled string literals */
  var reUnescapedString = /['\n\r\t\u2028\u2029\\]/g;

  /** Used to assign default `context` object properties */
  var contextProps = [
    'Array', 'Boolean', 'Date', 'Function', 'Math', 'Number', 'Object', 'RegExp',
    'String', '_', 'attachEvent', 'clearTimeout', 'isFinite', 'isNaN', 'parseInt',
    'setImmediate', 'setTimeout'
  ];

  /** Used to fix the JScript [[DontEnum]] bug */
  var shadowedProps = [
    'constructor', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable',
    'toLocaleString', 'toString', 'valueOf'
  ];

  /** Used to make template sourceURLs easier to identify */
  var templateCounter = 0;

  /** `Object#toString` result shortcuts */
  var argsClass = '[object Arguments]',
      arrayClass = '[object Array]',
      boolClass = '[object Boolean]',
      dateClass = '[object Date]',
      funcClass = '[object Function]',
      numberClass = '[object Number]',
      objectClass = '[object Object]',
      regexpClass = '[object RegExp]',
      stringClass = '[object String]';

  /** Used to identify object classifications that `_.clone` supports */
  var cloneableClasses = {};
  cloneableClasses[funcClass] = false;
  cloneableClasses[argsClass] = cloneableClasses[arrayClass] =
  cloneableClasses[boolClass] = cloneableClasses[dateClass] =
  cloneableClasses[numberClass] = cloneableClasses[objectClass] =
  cloneableClasses[regexpClass] = cloneableClasses[stringClass] = true;

  /** Used to determine if values are of the language type Object */
  var objectTypes = {
    'boolean': false,
    'function': true,
    'object': true,
    'number': false,
    'string': false,
    'undefined': false
  };

  /** Used to escape characters for inclusion in compiled string literals */
  var stringEscapes = {
    '\\': '\\',
    "'": "'",
    '\n': 'n',
    '\r': 'r',
    '\t': 't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  /*--------------------------------------------------------------------------*/

  /**
   * Create a new `lodash` function using the given `context` object.
   *
   * @static
   * @memberOf _
   * @category Utilities
   * @param {Object} [context=window] The context object.
   * @returns {Function} Returns the `lodash` function.
   */
  function runInContext(context) {
    // Avoid issues with some ES3 environments that attempt to use values, named
    // after built-in constructors like `Object`, for the creation of literals.
    // ES5 clears this up by stating that literals must use built-in constructors.
    // See http://es5.github.com/#x11.1.5.
    context = context ? _.defaults(window.Object(), context, _.pick(window, contextProps)) : window;

    /** Native constructor references */
    var Array = context.Array,
        Boolean = context.Boolean,
        Date = context.Date,
        Function = context.Function,
        Math = context.Math,
        Number = context.Number,
        Object = context.Object,
        RegExp = context.RegExp,
        String = context.String,
        TypeError = context.TypeError;

    /** Used for `Array` and `Object` method references */
    var arrayRef = Array(),
        objectRef = Object();

    /** Used to restore the original `_` reference in `noConflict` */
    var oldDash = context._;

    /** Used to detect if a method is native */
    var reNative = RegExp('^' +
      String(objectRef.valueOf)
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        .replace(/valueOf|for [^\]]+/g, '.+?') + '$'
    );

    /** Native method shortcuts */
    var ceil = Math.ceil,
        clearTimeout = context.clearTimeout,
        concat = arrayRef.concat,
        floor = Math.floor,
        getPrototypeOf = reNative.test(getPrototypeOf = Object.getPrototypeOf) && getPrototypeOf,
        hasOwnProperty = objectRef.hasOwnProperty,
        push = arrayRef.push,
        setImmediate = context.setImmediate,
        setTimeout = context.setTimeout,
        toString = objectRef.toString;

    /* Native method shortcuts for methods with the same name as other `lodash` methods */
    var nativeBind = reNative.test(nativeBind = slice.bind) && nativeBind,
        nativeIsArray = reNative.test(nativeIsArray = Array.isArray) && nativeIsArray,
        nativeIsFinite = context.isFinite,
        nativeIsNaN = context.isNaN,
        nativeKeys = reNative.test(nativeKeys = Object.keys) && nativeKeys,
        nativeMax = Math.max,
        nativeMin = Math.min,
        nativeParseInt = context.parseInt,
        nativeRandom = Math.random;

    /** Detect various environments */
    var isIeOpera = reNative.test(context.attachEvent),
        isV8 = nativeBind && !/\n|true/.test(nativeBind + isIeOpera);

    /** Used to lookup a built-in constructor by [[Class]] */
    var ctorByClass = {};
    ctorByClass[arrayClass] = Array;
    ctorByClass[boolClass] = Boolean;
    ctorByClass[dateClass] = Date;
    ctorByClass[objectClass] = Object;
    ctorByClass[numberClass] = Number;
    ctorByClass[regexpClass] = RegExp;
    ctorByClass[stringClass] = String;

    /*--------------------------------------------------------------------------*/

    /**
     * Creates a `lodash` object, that wraps the given `value`, to enable method
     * chaining.
     *
     * In addition to Lo-Dash methods, wrappers also have the following `Array` methods:
     * `concat`, `join`, `pop`, `push`, `reverse`, `shift`, `slice`, `sort`, `splice`,
     * and `unshift`
     *
     * Chaining is supported in custom builds as long as the `value` method is
     * implicitly or explicitly included in the build.
     *
     * The chainable wrapper functions are:
     * `after`, `assign`, `bind`, `bindAll`, `bindKey`, `chain`, `compact`,
     * `compose`, `concat`, `countBy`, `createCallback`, `debounce`, `defaults`,
     * `defer`, `delay`, `difference`, `filter`, `flatten`, `forEach`, `forIn`,
     * `forOwn`, `functions`, `groupBy`, `initial`, `intersection`, `invert`,
     * `invoke`, `keys`, `map`, `max`, `memoize`, `merge`, `min`, `object`, `omit`,
     * `once`, `pairs`, `partial`, `partialRight`, `pick`, `pluck`, `push`, `range`,
     * `reject`, `rest`, `reverse`, `shuffle`, `slice`, `sort`, `sortBy`, `splice`,
     * `tap`, `throttle`, `times`, `toArray`, `union`, `uniq`, `unshift`, `values`,
     * `where`, `without`, `wrap`, and `zip`
     *
     * The non-chainable wrapper functions are:
     * `clone`, `cloneDeep`, `contains`, `escape`, `every`, `find`, `has`,
     * `identity`, `indexOf`, `isArguments`, `isArray`, `isBoolean`, `isDate`,
     * `isElement`, `isEmpty`, `isEqual`, `isFinite`, `isFunction`, `isNaN`,
     * `isNull`, `isNumber`, `isObject`, `isPlainObject`, `isRegExp`, `isString`,
     * `isUndefined`, `join`, `lastIndexOf`, `mixin`, `noConflict`, `parseInt`,
     * `pop`, `random`, `reduce`, `reduceRight`, `result`, `shift`, `size`, `some`,
     * `sortedIndex`, `runInContext`, `template`, `unescape`, `uniqueId`, and `value`
     *
     * The wrapper functions `first` and `last` return wrapped values when `n` is
     * passed, otherwise they return unwrapped values.
     *
     * @name _
     * @constructor
     * @category Chaining
     * @param {Mixed} value The value to wrap in a `lodash` instance.
     * @returns {Object} Returns a `lodash` instance.
     */
    function lodash(value) {
      // don't wrap if already wrapped, even if wrapped by a different `lodash` constructor
      return (value && typeof value == 'object' && !isArray(value) && hasOwnProperty.call(value, '__wrapped__'))
       ? value
       : new lodashWrapper(value);
    }

    /**
     * An object used to flag environments features.
     *
     * @static
     * @memberOf _
     * @type Object
     */
    var support = lodash.support = {};

    (function() {
      var ctor = function() { this.x = 1; },
          object = { '0': 1, 'length': 1 },
          props = [];

      ctor.prototype = { 'valueOf': 1, 'y': 1 };
      for (var prop in new ctor) { props.push(prop); }
      for (prop in arguments) { }

      /**
       * Detect if `arguments` objects are `Object` objects (all but Opera < 10.5).
       *
       * @memberOf _.support
       * @type Boolean
       */
      support.argsObject = arguments.constructor == Object;

      /**
       * Detect if an `arguments` object's [[Class]] is resolvable (all but Firefox < 4, IE < 9).
       *
       * @memberOf _.support
       * @type Boolean
       */
      support.argsClass = isArguments(arguments);

      /**
       * Detect if `prototype` properties are enumerable by default.
       *
       * Firefox < 3.6, Opera > 9.50 - Opera < 11.60, and Safari < 5.1
       * (if the prototype or a property on the prototype has been set)
       * incorrectly sets a function's `prototype` property [[Enumerable]]
       * value to `true`.
       *
       * @memberOf _.support
       * @type Boolean
       */
      support.enumPrototypes = ctor.propertyIsEnumerable('prototype');

      /**
       * Detect if `Function#bind` exists and is inferred to be fast (all but V8).
       *
       * @memberOf _.support
       * @type Boolean
       */
      support.fastBind = nativeBind && !isV8;

      /**
       * Detect if own properties are iterated after inherited properties (all but IE < 9).
       *
       * @memberOf _.support
       * @type Boolean
       */
      support.ownLast = props[0] != 'x';

      /**
       * Detect if `arguments` object indexes are non-enumerable
       * (Firefox < 4, IE < 9, PhantomJS, Safari < 5.1).
       *
       * @memberOf _.support
       * @type Boolean
       */
      support.nonEnumArgs = prop != 0;

      /**
       * Detect if properties shadowing those on `Object.prototype` are non-enumerable.
       *
       * In IE < 9 an objects own properties, shadowing non-enumerable ones, are
       * made non-enumerable as well (a.k.a the JScript [[DontEnum]] bug).
       *
       * @memberOf _.support
       * @type Boolean
       */
      support.nonEnumShadows = !/valueOf/.test(props);

      /**
       * Detect if `Array#shift` and `Array#splice` augment array-like objects correctly.
       *
       * Firefox < 10, IE compatibility mode, and IE < 9 have buggy Array `shift()`
       * and `splice()` functions that fail to remove the last element, `value[0]`,
       * of array-like objects even though the `length` property is set to `0`.
       * The `shift()` method is buggy in IE 8 compatibility mode, while `splice()`
       * is buggy regardless of mode in IE < 9 and buggy in compatibility mode in IE 9.
       *
       * @memberOf _.support
       * @type Boolean
       */
      support.spliceObjects = (arrayRef.splice.call(object, 0, 1), !object[0]);

      /**
       * Detect lack of support for accessing string characters by index.
       *
       * IE < 8 can't access characters by index and IE 8 can only access
       * characters by index on string literals.
       *
       * @memberOf _.support
       * @type Boolean
       */
      support.unindexedChars = ('x'[0] + Object('x')[0]) != 'xx';

      /**
       * Detect if a DOM node's [[Class]] is resolvable (all but IE < 9)
       * and that the JS engine errors when attempting to coerce an object to
       * a string without a `toString` function.
       *
       * @memberOf _.support
       * @type Boolean
       */
      try {
        support.nodeClass = !(toString.call(document) == objectClass && !({ 'toString': 0 } + ''));
      } catch(e) {
        support.nodeClass = true;
      }
    }(1));

    /**
     * By default, the template delimiters used by Lo-Dash are similar to those in
     * embedded Ruby (ERB). Change the following template settings to use alternative
     * delimiters.
     *
     * @static
     * @memberOf _
     * @type Object
     */
    lodash.templateSettings = {

      /**
       * Used to detect `data` property values to be HTML-escaped.
       *
       * @memberOf _.templateSettings
       * @type RegExp
       */
      'escape': /<%-([\s\S]+?)%>/g,

      /**
       * Used to detect code to be evaluated.
       *
       * @memberOf _.templateSettings
       * @type RegExp
       */
      'evaluate': /<%([\s\S]+?)%>/g,

      /**
       * Used to detect `data` property values to inject.
       *
       * @memberOf _.templateSettings
       * @type RegExp
       */
      'interpolate': reInterpolate,

      /**
       * Used to reference the data object in the template text.
       *
       * @memberOf _.templateSettings
       * @type String
       */
      'variable': '',

      /**
       * Used to import variables into the compiled template.
       *
       * @memberOf _.templateSettings
       * @type Object
       */
      'imports': {

        /**
         * A reference to the `lodash` function.
         *
         * @memberOf _.templateSettings.imports
         * @type Function
         */
        '_': lodash
      }
    };

    /*--------------------------------------------------------------------------*/

    /**
     * The template used to create iterator functions.
     *
     * @private
     * @param {Obect} data The data object used to populate the text.
     * @returns {String} Returns the interpolated text.
     */
    var iteratorTemplate = function(obj) {

      var __p = 'var index, iterable = ' +
      (obj.firstArg) +
      ', result = ' +
      (obj.init) +
      ';\nif (!iterable) return result;\n' +
      (obj.top) +
      ';\n';
       if (obj.arrays) {
      __p += 'var length = iterable.length; index = -1;\nif (' +
      (obj.arrays) +
      ') {  ';
       if (support.unindexedChars) {
      __p += '\n  if (isString(iterable)) {\n    iterable = iterable.split(\'\')\n  }  ';
       }
      __p += '\n  while (++index < length) {\n    ' +
      (obj.loop) +
      '\n  }\n}\nelse {  ';
        } else if (support.nonEnumArgs) {
      __p += '\n  var length = iterable.length; index = -1;\n  if (length && isArguments(iterable)) {\n    while (++index < length) {\n      index += \'\';\n      ' +
      (obj.loop) +
      '\n    }\n  } else {  ';
       }

       if (support.enumPrototypes) {
      __p += '\n  var skipProto = typeof iterable == \'function\';\n  ';
       }

       if (obj.useHas && obj.useKeys) {
      __p += '\n  var ownIndex = -1,\n      ownProps = objectTypes[typeof iterable] ? keys(iterable) : [],\n      length = ownProps.length;\n\n  while (++ownIndex < length) {\n    index = ownProps[ownIndex];\n    ';
       if (support.enumPrototypes) {
      __p += 'if (!(skipProto && index == \'prototype\')) {\n  ';
       }
      __p += 
      (obj.loop);
       if (support.enumPrototypes) {
      __p += '}\n';
       }
      __p += '  }  ';
       } else {
      __p += '\n  for (index in iterable) {';
          if (support.enumPrototypes || obj.useHas) {
      __p += '\n    if (';
            if (support.enumPrototypes) {
      __p += '!(skipProto && index == \'prototype\')';
       }      if (support.enumPrototypes && obj.useHas) {
      __p += ' && ';
       }      if (obj.useHas) {
      __p += 'hasOwnProperty.call(iterable, index)';
       }
      __p += ') {    ';
       }
      __p += 
      (obj.loop) +
      ';    ';
       if (support.enumPrototypes || obj.useHas) {
      __p += '\n    }';
       }
      __p += '\n  }    ';
       if (support.nonEnumShadows) {
      __p += '\n\n  var ctor = iterable.constructor;\n      ';
       for (var k = 0; k < 7; k++) {
      __p += '\n  index = \'' +
      (obj.shadowedProps[k]) +
      '\';\n  if (';
            if (obj.shadowedProps[k] == 'constructor') {
      __p += '!(ctor && ctor.prototype === iterable) && ';
            }
      __p += 'hasOwnProperty.call(iterable, index)) {\n    ' +
      (obj.loop) +
      '\n  }      ';
       }

       }

       }

       if (obj.arrays || support.nonEnumArgs) {
      __p += '\n}';
       }
      __p += 
      (obj.bottom) +
      ';\nreturn result';

      return __p
    };

    /** Reusable iterator options for `assign` and `defaults` */
    var defaultsIteratorOptions = {
      'args': 'object, source, guard',
      'top':
        'var args = arguments,\n' +
        '    argsIndex = 0,\n' +
        "    argsLength = typeof guard == 'number' ? 2 : args.length;\n" +
        'while (++argsIndex < argsLength) {\n' +
        '  iterable = args[argsIndex];\n' +
        '  if (iterable && objectTypes[typeof iterable]) {',
      'loop': "if (typeof result[index] == 'undefined') result[index] = iterable[index]",
      'bottom': '  }\n}'
    };

    /** Reusable iterator options shared by `each`, `forIn`, and `forOwn` */
    var eachIteratorOptions = {
      'args': 'collection, callback, thisArg',
      'top': "callback = callback && typeof thisArg == 'undefined' ? callback : lodash.createCallback(callback, thisArg)",
      'arrays': "typeof length == 'number'",
      'loop': 'if (callback(iterable[index], index, collection) === false) return result'
    };

    /** Reusable iterator options for `forIn` and `forOwn` */
    var forOwnIteratorOptions = {
      'top': 'if (!objectTypes[typeof iterable]) return result;\n' + eachIteratorOptions.top,
      'arrays': false
    };

    /*--------------------------------------------------------------------------*/

    /**
     * Creates a function optimized to search large arrays for a given `value`,
     * starting at `fromIndex`, using strict equality for comparisons, i.e. `===`.
     *
     * @private
     * @param {Array} array The array to search.
     * @param {Mixed} value The value to search for.
     * @param {Number} fromIndex The index to search from.
     * @param {Number} largeSize The length at which an array is considered large.
     * @returns {Boolean} Returns `true`, if `value` is found, else `false`.
     */
    function cachedContains(array, fromIndex, largeSize) {
      var length = array.length,
          isLarge = (length - fromIndex) >= largeSize;

      if (isLarge) {
        var cache = {},
            index = fromIndex - 1;

        while (++index < length) {
          // manually coerce `value` to a string because `hasOwnProperty`, in some
          // older versions of Firefox, coerces objects incorrectly
          var key = String(array[index]);
          (hasOwnProperty.call(cache, key) ? cache[key] : (cache[key] = [])).push(array[index]);
        }
      }
      return function(value) {
        if (isLarge) {
          var key = String(value);
          return hasOwnProperty.call(cache, key) && indexOf(cache[key], value) > -1;
        }
        return indexOf(array, value, fromIndex) > -1;
      }
    }

    /**
     * Used by `_.max` and `_.min` as the default `callback` when a given
     * `collection` is a string value.
     *
     * @private
     * @param {String} value The character to inspect.
     * @returns {Number} Returns the code unit of given character.
     */
    function charAtCallback(value) {
      return value.charCodeAt(0);
    }

    /**
     * Used by `sortBy` to compare transformed `collection` values, stable sorting
     * them in ascending order.
     *
     * @private
     * @param {Object} a The object to compare to `b`.
     * @param {Object} b The object to compare to `a`.
     * @returns {Number} Returns the sort order indicator of `1` or `-1`.
     */
    function compareAscending(a, b) {
      var ai = a.index,
          bi = b.index;

      a = a.criteria;
      b = b.criteria;

      // ensure a stable sort in V8 and other engines
      // http://code.google.com/p/v8/issues/detail?id=90
      if (a !== b) {
        if (a > b || typeof a == 'undefined') {
          return 1;
        }
        if (a < b || typeof b == 'undefined') {
          return -1;
        }
      }
      return ai < bi ? -1 : 1;
    }

    /**
     * Creates a function that, when called, invokes `func` with the `this` binding
     * of `thisArg` and prepends any `partialArgs` to the arguments passed to the
     * bound function.
     *
     * @private
     * @param {Function|String} func The function to bind or the method name.
     * @param {Mixed} [thisArg] The `this` binding of `func`.
     * @param {Array} partialArgs An array of arguments to be partially applied.
     * @param {Object} [idicator] Used to indicate binding by key or partially
     *  applying arguments from the right.
     * @returns {Function} Returns the new bound function.
     */
    function createBound(func, thisArg, partialArgs, indicator) {
      var isFunc = isFunction(func),
          isPartial = !partialArgs,
          key = thisArg;

      // juggle arguments
      if (isPartial) {
        var rightIndicator = indicator;
        partialArgs = thisArg;
      }
      else if (!isFunc) {
        if (!indicator) {
          throw new TypeError;
        }
        thisArg = func;
      }

      function bound() {
        // `Function#bind` spec
        // http://es5.github.com/#x15.3.4.5
        var args = arguments,
            thisBinding = isPartial ? this : thisArg;

        if (!isFunc) {
          func = thisArg[key];
        }
        if (partialArgs.length) {
          args = args.length
            ? (args = slice(args), rightIndicator ? args.concat(partialArgs) : partialArgs.concat(args))
            : partialArgs;
        }
        if (this instanceof bound) {
          // ensure `new bound` is an instance of `func`
          noop.prototype = func.prototype;
          thisBinding = new noop;
          noop.prototype = null;

          // mimic the constructor's `return` behavior
          // http://es5.github.com/#x13.2.2
          var result = func.apply(thisBinding, args);
          return isObject(result) ? result : thisBinding;
        }
        return func.apply(thisBinding, args);
      }
      return bound;
    }

    /**
     * Creates compiled iteration functions.
     *
     * @private
     * @param {Object} [options1, options2, ...] The compile options object(s).
     *  arrays - A string of code to determine if the iterable is an array or array-like.
     *  useHas - A boolean to specify using `hasOwnProperty` checks in the object loop.
     *  args - A string of comma separated arguments the iteration function will accept.
     *  top - A string of code to execute before the iteration branches.
     *  loop - A string of code to execute in the object loop.
     *  bottom - A string of code to execute after the iteration branches.
     * @returns {Function} Returns the compiled function.
     */
    function createIterator() {
      var data = {
        // data properties
        'shadowedProps': shadowedProps,
        // iterator options
        'arrays': 'isArray(iterable)',
        'bottom': '',
        'init': 'iterable',
        'loop': '',
        'top': '',
        'useHas': true,
        'useKeys': !!keys
      };

      // merge options into a template data object
      for (var object, index = 0; object = arguments[index]; index++) {
        for (var key in object) {
          data[key] = object[key];
        }
      }
      var args = data.args;
      data.firstArg = /^[^,]+/.exec(args)[0];

      // create the function factory
      var factory = Function(
          'hasOwnProperty, isArguments, isArray, isString, keys, ' +
          'lodash, objectTypes',
        'return function(' + args + ') {\n' + iteratorTemplate(data) + '\n}'
      );
      // return the compiled function
      return factory(
        hasOwnProperty, isArguments, isArray, isString, keys,
        lodash, objectTypes
      );
    }

    /**
     * Used by `template` to escape characters for inclusion in compiled
     * string literals.
     *
     * @private
     * @param {String} match The matched character to escape.
     * @returns {String} Returns the escaped character.
     */
    function escapeStringChar(match) {
      return '\\' + stringEscapes[match];
    }

    /**
     * Used by `escape` to convert characters to HTML entities.
     *
     * @private
     * @param {String} match The matched character to escape.
     * @returns {String} Returns the escaped character.
     */
    function escapeHtmlChar(match) {
      return htmlEscapes[match];
    }

    /**
     * Checks if `value` is a DOM node in IE < 9.
     *
     * @private
     * @param {Mixed} value The value to check.
     * @returns {Boolean} Returns `true` if the `value` is a DOM node, else `false`.
     */
    function isNode(value) {
      // IE < 9 presents DOM nodes as `Object` objects except they have `toString`
      // methods that are `typeof` "string" and still can coerce nodes to strings
      return typeof value.toString != 'function' && typeof (value + '') == 'string';
    }

    /**
     * A fast path for creating `lodash` wrapper objects.
     *
     * @private
     * @param {Mixed} value The value to wrap in a `lodash` instance.
     * @returns {Object} Returns a `lodash` instance.
     */
    function lodashWrapper(value) {
      this.__wrapped__ = value;
    }
    // ensure `new lodashWrapper` is an instance of `lodash`
    lodashWrapper.prototype = lodash.prototype;

    /**
     * A no-operation function.
     *
     * @private
     */
    function noop() {
      // no operation performed
    }

    /**
     * A fallback implementation of `isPlainObject` that checks if a given `value`
     * is an object created by the `Object` constructor, assuming objects created
     * by the `Object` constructor have no inherited enumerable properties and that
     * there are no `Object.prototype` extensions.
     *
     * @private
     * @param {Mixed} value The value to check.
     * @returns {Boolean} Returns `true`, if `value` is a plain object, else `false`.
     */
    function shimIsPlainObject(value) {
      // avoid non-objects and false positives for `arguments` objects
      var result = false;
      if (!(value && toString.call(value) == objectClass) || (!support.argsClass && isArguments(value))) {
        return result;
      }
      // check that the constructor is `Object` (i.e. `Object instanceof Object`)
      var ctor = value.constructor;

      if (isFunction(ctor) ? ctor instanceof ctor : (support.nodeClass || !isNode(value))) {
        // IE < 9 iterates inherited properties before own properties. If the first
        // iterated property is an object's own property then there are no inherited
        // enumerable properties.
        if (support.ownLast) {
          forIn(value, function(value, key, object) {
            result = hasOwnProperty.call(object, key);
            return false;
          });
          return result === true;
        }
        // In most environments an object's own properties are iterated before
        // its inherited properties. If the last iterated property is an object's
        // own property then there are no inherited enumerable properties.
        forIn(value, function(value, key) {
          result = key;
        });
        return result === false || hasOwnProperty.call(value, result);
      }
      return result;
    }

    /**
     * Slices the `collection` from the `start` index up to, but not including,
     * the `end` index.
     *
     * Note: This function is used, instead of `Array#slice`, to support node lists
     * in IE < 9 and to ensure dense arrays are returned.
     *
     * @private
     * @param {Array|Object|String} collection The collection to slice.
     * @param {Number} start The start index.
     * @param {Number} end The end index.
     * @returns {Array} Returns the new array.
     */
    function slice(array, start, end) {
      start || (start = 0);
      if (typeof end == 'undefined') {
        end = array ? array.length : 0;
      }
      var index = -1,
          length = end - start || 0,
          result = Array(length < 0 ? 0 : length);

      while (++index < length) {
        result[index] = array[start + index];
      }
      return result;
    }

    /**
     * Used by `unescape` to convert HTML entities to characters.
     *
     * @private
     * @param {String} match The matched character to unescape.
     * @returns {String} Returns the unescaped character.
     */
    function unescapeHtmlChar(match) {
      return htmlUnescapes[match];
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Checks if `value` is an `arguments` object.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Mixed} value The value to check.
     * @returns {Boolean} Returns `true`, if the `value` is an `arguments` object, else `false`.
     * @example
     *
     * (function() { return _.isArguments(arguments); })(1, 2, 3);
     * // => true
     *
     * _.isArguments([1, 2, 3]);
     * // => false
     */
    function isArguments(value) {
      return toString.call(value) == argsClass;
    }
    // fallback for browsers that can't detect `arguments` objects by [[Class]]
    if (!support.argsClass) {
      isArguments = function(value) {
        return value ? hasOwnProperty.call(value, 'callee') : false;
      };
    }

    /**
     * Checks if `value` is an array.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Mixed} value The value to check.
     * @returns {Boolean} Returns `true`, if the `value` is an array, else `false`.
     * @example
     *
     * (function() { return _.isArray(arguments); })();
     * // => false
     *
     * _.isArray([1, 2, 3]);
     * // => true
     */
    var isArray = nativeIsArray || function(value) {
      // `instanceof` may cause a memory leak in IE 7 if `value` is a host object
      // http://ajaxian.com/archives/working-aroung-the-instanceof-memory-leak
      return (support.argsObject && value instanceof Array) || toString.call(value) == arrayClass;
    };

    /**
     * A fallback implementation of `Object.keys` that produces an array of the
     * given object's own enumerable property names.
     *
     * @private
     * @type Function
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns a new array of property names.
     */
    var shimKeys = createIterator({
      'args': 'object',
      'init': '[]',
      'top': 'if (!(objectTypes[typeof object])) return result',
      'loop': 'result.push(index)',
      'arrays': false
    });

    /**
     * Creates an array composed of the own enumerable property names of `object`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns a new array of property names.
     * @example
     *
     * _.keys({ 'one': 1, 'two': 2, 'three': 3 });
     * // => ['one', 'two', 'three'] (order is not guaranteed)
     */
    var keys = !nativeKeys ? shimKeys : function(object) {
      if (!isObject(object)) {
        return [];
      }
      if ((support.enumPrototypes && typeof object == 'function') ||
          (support.nonEnumArgs && object.length && isArguments(object))) {
        return shimKeys(object);
      }
      return nativeKeys(object);
    };

    /**
     * A function compiled to iterate `arguments` objects, arrays, objects, and
     * strings consistenly across environments, executing the `callback` for each
     * element in the `collection`. The `callback` is bound to `thisArg` and invoked
     * with three arguments; (value, index|key, collection). Callbacks may exit
     * iteration early by explicitly returning `false`.
     *
     * @private
     * @type Function
     * @param {Array|Object|String} collection The collection to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {Mixed} [thisArg] The `this` binding of `callback`.
     * @returns {Array|Object|String} Returns `collection`.
     */
    var each = createIterator(eachIteratorOptions);

    /**
     * Used to convert characters to HTML entities:
     *
     * Though the `>` character is escaped for symmetry, characters like `>` and `/`
     * don't require escaping in HTML and have no special meaning unless they're part
     * of a tag or an unquoted attribute value.
     * http://mathiasbynens.be/notes/ambiguous-ampersands (under "semi-related fun fact")
     */
    var htmlEscapes = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };

    /** Used to convert HTML entities to characters */
    var htmlUnescapes = invert(htmlEscapes);

    /*--------------------------------------------------------------------------*/

    /**
     * Assigns own enumerable properties of source object(s) to the destination
     * object. Subsequent sources will overwrite property assignments of previous
     * sources. If a `callback` function is passed, it will be executed to produce
     * the assigned values. The `callback` is bound to `thisArg` and invoked with
     * two arguments; (objectValue, sourceValue).
     *
     * @static
     * @memberOf _
     * @type Function
     * @alias extend
     * @category Objects
     * @param {Object} object The destination object.
     * @param {Object} [source1, source2, ...] The source objects.
     * @param {Function} [callback] The function to customize assigning values.
     * @param {Mixed} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the destination object.
     * @example
     *
     * _.assign({ 'name': 'moe' }, { 'age': 40 });
     * // => { 'name': 'moe', 'age': 40 }
     *
     * var defaults = _.partialRight(_.assign, function(a, b) {
     *   return typeof a == 'undefined' ? b : a;
     * });
     *
     * var food = { 'name': 'apple' };
     * defaults(food, { 'name': 'banana', 'type': 'fruit' });
     * // => { 'name': 'apple', 'type': 'fruit' }
     */
    var assign = createIterator(defaultsIteratorOptions, {
      'top':
        defaultsIteratorOptions.top.replace(';',
          ';\n' +
          "if (argsLength > 3 && typeof args[argsLength - 2] == 'function') {\n" +
          '  var callback = lodash.createCallback(args[--argsLength - 1], args[argsLength--], 2);\n' +
          "} else if (argsLength > 2 && typeof args[argsLength - 1] == 'function') {\n" +
          '  callback = args[--argsLength];\n' +
          '}'
        ),
      'loop': 'result[index] = callback ? callback(result[index], iterable[index]) : iterable[index]'
    });

    /**
     * Creates a clone of `value`. If `deep` is `true`, nested objects will also
     * be cloned, otherwise they will be assigned by reference. If a `callback`
     * function is passed, it will be executed to produce the cloned values. If
     * `callback` returns `undefined`, cloning will be handled by the method instead.
     * The `callback` is bound to `thisArg` and invoked with one argument; (value).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Mixed} value The value to clone.
     * @param {Boolean} [deep=false] A flag to indicate a deep clone.
     * @param {Function} [callback] The function to customize cloning values.
     * @param {Mixed} [thisArg] The `this` binding of `callback`.
     * @param- {Array} [stackA=[]] Tracks traversed source objects.
     * @param- {Array} [stackB=[]] Associates clones with source counterparts.
     * @returns {Mixed} Returns the cloned `value`.
     * @example
     *
     * var stooges = [
     *   { 'name': 'moe', 'age': 40 },
     *   { 'name': 'larry', 'age': 50 }
     * ];
     *
     * var shallow = _.clone(stooges);
     * shallow[0] === stooges[0];
     * // => true
     *
     * var deep = _.clone(stooges, true);
     * deep[0] === stooges[0];
     * // => false
     *
     * _.mixin({
     *   'clone': _.partialRight(_.clone, function(value) {
     *     return _.isElement(value) ? value.cloneNode(false) : undefined;
     *   })
     * });
     *
     * var clone = _.clone(document.body);
     * clone.childNodes.length;
     * // => 0
     */
    function clone(value, deep, callback, thisArg, stackA, stackB) {
      var result = value;

      // allows working with "Collections" methods without using their `callback`
      // argument, `index|key`, for this method's `callback`
      if (typeof deep == 'function') {
        thisArg = callback;
        callback = deep;
        deep = false;
      }
      if (typeof callback == 'function') {
        callback = (typeof thisArg == 'undefined')
          ? callback
          : lodash.createCallback(callback, thisArg, 1);

        result = callback(result);
        if (typeof result != 'undefined') {
          return result;
        }
        result = value;
      }
      // inspect [[Class]]
      var isObj = isObject(result);
      if (isObj) {
        var className = toString.call(result);
        if (!cloneableClasses[className] || (!support.nodeClass && isNode(result))) {
          return result;
        }
        var isArr = isArray(result);
      }
      // shallow clone
      if (!isObj || !deep) {
        return isObj
          ? (isArr ? slice(result) : assign({}, result))
          : result;
      }
      var ctor = ctorByClass[className];
      switch (className) {
        case boolClass:
        case dateClass:
          return new ctor(+result);

        case numberClass:
        case stringClass:
          return new ctor(result);

        case regexpClass:
          return ctor(result.source, reFlags.exec(result));
      }
      // check for circular references and return corresponding clone
      stackA || (stackA = []);
      stackB || (stackB = []);

      var length = stackA.length;
      while (length--) {
        if (stackA[length] == value) {
          return stackB[length];
        }
      }
      // init cloned object
      result = isArr ? ctor(result.length) : {};

      // add array properties assigned by `RegExp#exec`
      if (isArr) {
        if (hasOwnProperty.call(value, 'index')) {
          result.index = value.index;
        }
        if (hasOwnProperty.call(value, 'input')) {
          result.input = value.input;
        }
      }
      // add the source value to the stack of traversed objects
      // and associate it with its clone
      stackA.push(value);
      stackB.push(result);

      // recursively populate clone (susceptible to call stack limits)
      (isArr ? forEach : forOwn)(value, function(objValue, key) {
        result[key] = clone(objValue, deep, callback, undefined, stackA, stackB);
      });

      return result;
    }

    /**
     * Creates a deep clone of `value`. If a `callback` function is passed,
     * it will be executed to produce the cloned values. If `callback` returns
     * `undefined`, cloning will be handled by the method instead. The `callback`
     * is bound to `thisArg` and invoked with one argument; (value).
     *
     * Note: This function is loosely based on the structured clone algorithm. Functions
     * and DOM nodes are **not** cloned. The enumerable properties of `arguments` objects and
     * objects created by constructors other than `Object` are cloned to plain `Object` objects.
     * See http://www.w3.org/TR/html5/infrastructure.html#internal-structured-cloning-algorithm.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Mixed} value The value to deep clone.
     * @param {Function} [callback] The function to customize cloning values.
     * @param {Mixed} [thisArg] The `this` binding of `callback`.
     * @returns {Mixed} Returns the deep cloned `value`.
     * @example
     *
     * var stooges = [
     *   { 'name': 'moe', 'age': 40 },
     *   { 'name': 'larry', 'age': 50 }
     * ];
     *
     * var deep = _.cloneDeep(stooges);
     * deep[0] === stooges[0];
     * // => false
     *
     * var view = {
     *   'label': 'docs',
     *   'node': element
     * };
     *
     * var clone = _.cloneDeep(view, function(value) {
     *   return _.isElement(value) ? value.cloneNode(true) : undefined;
     * });
     *
     * clone.node == view.node;
     * // => false
     */
    function cloneDeep(value, callback, thisArg) {
      return clone(value, true, callback, thisArg);
    }

    /**
     * Assigns own enumerable properties of source object(s) to the destination
     * object for all destination properties that resolve to `undefined`. Once a
     * property is set, additional defaults of the same property will be ignored.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Objects
     * @param {Object} object The destination object.
     * @param {Object} [source1, source2, ...] The source objects.
     * @param- {Object} [guard] Allows working with `_.reduce` without using its
     *  callback's `key` and `object` arguments as sources.
     * @returns {Object} Returns the destination object.
     * @example
     *
     * var food = { 'name': 'apple' };
     * _.defaults(food, { 'name': 'banana', 'type': 'fruit' });
     * // => { 'name': 'apple', 'type': 'fruit' }
     */
    var defaults = createIterator(defaultsIteratorOptions);

    /**
     * This method is similar to `_.find`, except that it returns the key of the
     * element that passes the callback check, instead of the element itself.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Array|Object|String} collection The collection to iterate over.
     * @param {Function|Object|String} [callback=identity] The function called per
     *  iteration. If a property name or object is passed, it will be used to create
     *  a "_.pluck" or "_.where" style callback, respectively.
     * @param {Mixed} [thisArg] The `this` binding of `callback`.
     * @returns {Mixed} Returns the key of the found element, else `undefined`.
     * @example
     *
     * _.findKey({ 'a': 1, 'b': 2, 'c': 3, 'd': 4 }, function(num) { return num % 2 == 0; });
     * // => 'b'
     */
    function findKey(collection, callback, thisArg) {
      var result;
      callback = lodash.createCallback(callback, thisArg);
      forOwn(collection, function(value, key, collection) {
        if (callback(value, key, collection)) {
          result = key;
          return false;
        }
      });
      return result;
    }

    /**
     * Iterates over `object`'s own and inherited enumerable properties, executing
     * the `callback` for each property. The `callback` is bound to `thisArg` and
     * invoked with three arguments; (value, key, object). Callbacks may exit iteration
     * early by explicitly returning `false`.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {Mixed} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns `object`.
     * @example
     *
     * function Dog(name) {
     *   this.name = name;
     * }
     *
     * Dog.prototype.bark = function() {
     *   alert('Woof, woof!');
     * };
     *
     * _.forIn(new Dog('Dagny'), function(value, key) {
     *   alert(key);
     * });
     * // => alerts 'name' and 'bark' (order is not guaranteed)
     */
    var forIn = createIterator(eachIteratorOptions, forOwnIteratorOptions, {
      'useHas': false
    });

    /**
     * Iterates over an object's own enumerable properties, executing the `callback`
     * for each property. The `callback` is bound to `thisArg` and invoked with three
     * arguments; (value, key, object). Callbacks may exit iteration early by explicitly
     * returning `false`.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {Mixed} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns `object`.
     * @example
     *
     * _.forOwn({ '0': 'zero', '1': 'one', 'length': 2 }, function(num, key) {
     *   alert(key);
     * });
     * // => alerts '0', '1', and 'length' (order is not guaranteed)
     */
    var forOwn = createIterator(eachIteratorOptions, forOwnIteratorOptions);

    /**
     * Creates a sorted array of all enumerable properties, own and inherited,
     * of `object` that have function values.
     *
     * @static
     * @memberOf _
     * @alias methods
     * @category Objects
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns a new array of property names that have function values.
     * @example
     *
     * _.functions(_);
     * // => ['all', 'any', 'bind', 'bindAll', 'clone', 'compact', 'compose', ...]
     */
    function functions(object) {
      var result = [];
      forIn(object, function(value, key) {
        if (isFunction(value)) {
          result.push(key);
        }
      });
      return result.sort();
    }

    /**
     * Checks if the specified object `property` exists and is a direct property,
     * instead of an inherited property.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to check.
     * @param {String} property The property to check for.
     * @returns {Boolean} Returns `true` if key is a direct property, else `false`.
     * @example
     *
     * _.has({ 'a': 1, 'b': 2, 'c': 3 }, 'b');
     * // => true
     */
    function has(object, property) {
      return object ? hasOwnProperty.call(object, property) : false;
    }

    /**
     * Creates an object composed of the inverted keys and values of the given `object`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to invert.
     * @returns {Object} Returns the created inverted object.
     * @example
     *
     *  _.invert({ 'first': 'moe', 'second': 'larry' });
     * // => { 'moe': 'first', 'larry': 'second' }
     */
    function invert(object) {
      var index = -1,
          props = keys(object),
          length = props.length,
          result = {};

      while (++index < length) {
        var key = props[index];
        result[object[key]] = key;
      }
      return result;
    }

    /**
     * Checks if `value` is a boolean value.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Mixed} value The value to check.
     * @returns {Boolean} Returns `true`, if the `value` is a boolean value, else `false`.
     * @example
     *
     * _.isBoolean(null);
     * // => false
     */
    function isBoolean(value) {
      return value === true || value === false || toString.call(value) == boolClass;
    }

    /**
     * Checks if `value` is a date.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Mixed} value The value to check.
     * @returns {Boolean} Returns `true`, if the `value` is a date, else `false`.
     * @example
     *
     * _.isDate(new Date);
     * // => true
     */
    function isDate(value) {
      return value instanceof Date || toString.call(value) == dateClass;
    }

    /**
     * Checks if `value` is a DOM element.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Mixed} value The value to check.
     * @returns {Boolean} Returns `true`, if the `value` is a DOM element, else `false`.
     * @example
     *
     * _.isElement(document.body);
     * // => true
     */
    function isElement(value) {
      return value ? value.nodeType === 1 : false;
    }

    /**
     * Checks if `value` is empty. Arrays, strings, or `arguments` objects with a
     * length of `0` and objects with no own enumerable properties are considered
     * "empty".
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Array|Object|String} value The value to inspect.
     * @returns {Boolean} Returns `true`, if the `value` is empty, else `false`.
     * @example
     *
     * _.isEmpty([1, 2, 3]);
     * // => false
     *
     * _.isEmpty({});
     * // => true
     *
     * _.isEmpty('');
     * // => true
     */
    function isEmpty(value) {
      var result = true;
      if (!value) {
        return result;
      }
      var className = toString.call(value),
          length = value.length;

      if ((className == arrayClass || className == stringClass ||
          (support.argsClass ? className == argsClass : isArguments(value))) ||
          (className == objectClass && typeof length == 'number' && isFunction(value.splice))) {
        return !length;
      }
      forOwn(value, function() {
        return (result = false);
      });
      return result;
    }

    /**
     * Performs a deep comparison between two values to determine if they are
     * equivalent to each other. If `callback` is passed, it will be executed to
     * compare values. If `callback` returns `undefined`, comparisons will be handled
     * by the method instead. The `callback` is bound to `thisArg` and invoked with
     * two arguments; (a, b).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Mixed} a The value to compare.
     * @param {Mixed} b The other value to compare.
     * @param {Function} [callback] The function to customize comparing values.
     * @param {Mixed} [thisArg] The `this` binding of `callback`.
     * @param- {Array} [stackA=[]] Tracks traversed `a` objects.
     * @param- {Array} [stackB=[]] Tracks traversed `b` objects.
     * @returns {Boolean} Returns `true`, if the values are equivalent, else `false`.
     * @example
     *
     * var moe = { 'name': 'moe', 'age': 40 };
     * var copy = { 'name': 'moe', 'age': 40 };
     *
     * moe == copy;
     * // => false
     *
     * _.isEqual(moe, copy);
     * // => true
     *
     * var words = ['hello', 'goodbye'];
     * var otherWords = ['hi', 'goodbye'];
     *
     * _.isEqual(words, otherWords, function(a, b) {
     *   var reGreet = /^(?:hello|hi)$/i,
     *       aGreet = _.isString(a) && reGreet.test(a),
     *       bGreet = _.isString(b) && reGreet.test(b);
     *
     *   return (aGreet || bGreet) ? (aGreet == bGreet) : undefined;
     * });
     * // => true
     */
    function isEqual(a, b, callback, thisArg, stackA, stackB) {
      // used to indicate that when comparing objects, `a` has at least the properties of `b`
      var whereIndicator = callback === indicatorObject;
      if (callback && !whereIndicator) {
        callback = (typeof thisArg == 'undefined')
          ? callback
          : lodash.createCallback(callback, thisArg, 2);

        var result = callback(a, b);
        if (typeof result != 'undefined') {
          return !!result;
        }
      }
      // exit early for identical values
      if (a === b) {
        // treat `+0` vs. `-0` as not equal
        return a !== 0 || (1 / a == 1 / b);
      }
      var type = typeof a,
          otherType = typeof b;

      // exit early for unlike primitive values
      if (a === a &&
          (!a || (type != 'function' && type != 'object')) &&
          (!b || (otherType != 'function' && otherType != 'object'))) {
        return false;
      }
      // exit early for `null` and `undefined`, avoiding ES3's Function#call behavior
      // http://es5.github.com/#x15.3.4.4
      if (a == null || b == null) {
        return a === b;
      }
      // compare [[Class]] names
      var className = toString.call(a),
          otherClass = toString.call(b);

      if (className == argsClass) {
        className = objectClass;
      }
      if (otherClass == argsClass) {
        otherClass = objectClass;
      }
      if (className != otherClass) {
        return false;
      }
      switch (className) {
        case boolClass:
        case dateClass:
          // coerce dates and booleans to numbers, dates to milliseconds and booleans
          // to `1` or `0`, treating invalid dates coerced to `NaN` as not equal
          return +a == +b;

        case numberClass:
          // treat `NaN` vs. `NaN` as equal
          return (a != +a)
            ? b != +b
            // but treat `+0` vs. `-0` as not equal
            : (a == 0 ? (1 / a == 1 / b) : a == +b);

        case regexpClass:
        case stringClass:
          // coerce regexes to strings (http://es5.github.com/#x15.10.6.4)
          // treat string primitives and their corresponding object instances as equal
          return a == String(b);
      }
      var isArr = className == arrayClass;
      if (!isArr) {
        // unwrap any `lodash` wrapped values
        if (hasOwnProperty.call(a, '__wrapped__ ') || hasOwnProperty.call(b, '__wrapped__')) {
          return isEqual(a.__wrapped__ || a, b.__wrapped__ || b, callback, thisArg, stackA, stackB);
        }
        // exit for functions and DOM nodes
        if (className != objectClass || (!support.nodeClass && (isNode(a) || isNode(b)))) {
          return false;
        }
        // in older versions of Opera, `arguments` objects have `Array` constructors
        var ctorA = !support.argsObject && isArguments(a) ? Object : a.constructor,
            ctorB = !support.argsObject && isArguments(b) ? Object : b.constructor;

        // non `Object` object instances with different constructors are not equal
        if (ctorA != ctorB && !(
              isFunction(ctorA) && ctorA instanceof ctorA &&
              isFunction(ctorB) && ctorB instanceof ctorB
            )) {
          return false;
        }
      }
      // assume cyclic structures are equal
      // the algorithm for detecting cyclic structures is adapted from ES 5.1
      // section 15.12.3, abstract operation `JO` (http://es5.github.com/#x15.12.3)
      stackA || (stackA = []);
      stackB || (stackB = []);

      var length = stackA.length;
      while (length--) {
        if (stackA[length] == a) {
          return stackB[length] == b;
        }
      }
      var size = 0;
      result = true;

      // add `a` and `b` to the stack of traversed objects
      stackA.push(a);
      stackB.push(b);

      // recursively compare objects and arrays (susceptible to call stack limits)
      if (isArr) {
        length = a.length;
        size = b.length;

        // compare lengths to determine if a deep comparison is necessary
        result = size == a.length;
        if (!result && !whereIndicator) {
          return result;
        }
        // deep compare the contents, ignoring non-numeric properties
        while (size--) {
          var index = length,
              value = b[size];

          if (whereIndicator) {
            while (index--) {
              if ((result = isEqual(a[index], value, callback, thisArg, stackA, stackB))) {
                break;
              }
            }
          } else if (!(result = isEqual(a[size], value, callback, thisArg, stackA, stackB))) {
            break;
          }
        }
        return result;
      }
      // deep compare objects using `forIn`, instead of `forOwn`, to avoid `Object.keys`
      // which, in this case, is more costly
      forIn(b, function(value, key, b) {
        if (hasOwnProperty.call(b, key)) {
          // count the number of properties.
          size++;
          // deep compare each property value.
          return (result = hasOwnProperty.call(a, key) && isEqual(a[key], value, callback, thisArg, stackA, stackB));
        }
      });

      if (result && !whereIndicator) {
        // ensure both objects have the same number of properties
        forIn(a, function(value, key, a) {
          if (hasOwnProperty.call(a, key)) {
            // `size` will be `-1` if `a` has more properties than `b`
            return (result = --size > -1);
          }
        });
      }
      return result;
    }

    /**
     * Checks if `value` is, or can be coerced to, a finite number.
     *
     * Note: This is not the same as native `isFinite`, which will return true for
     * booleans and empty strings. See http://es5.github.com/#x15.1.2.5.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Mixed} value The value to check.
     * @returns {Boolean} Returns `true`, if the `value` is finite, else `false`.
     * @example
     *
     * _.isFinite(-101);
     * // => true
     *
     * _.isFinite('10');
     * // => true
     *
     * _.isFinite(true);
     * // => false
     *
     * _.isFinite('');
     * // => false
     *
     * _.isFinite(Infinity);
     * // => false
     */
    function isFinite(value) {
      return nativeIsFinite(value) && !nativeIsNaN(parseFloat(value));
    }

    /**
     * Checks if `value` is a function.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Mixed} value The value to check.
     * @returns {Boolean} Returns `true`, if the `value` is a function, else `false`.
     * @example
     *
     * _.isFunction(_);
     * // => true
     */
    function isFunction(value) {
      return typeof value == 'function';
    }
    // fallback for older versions of Chrome and Safari
    if (isFunction(/x/)) {
      isFunction = function(value) {
        return value instanceof Function || toString.call(value) == funcClass;
      };
    }

    /**
     * Checks if `value` is the language type of Object.
     * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Mixed} value The value to check.
     * @returns {Boolean} Returns `true`, if the `value` is an object, else `false`.
     * @example
     *
     * _.isObject({});
     * // => true
     *
     * _.isObject([1, 2, 3]);
     * // => true
     *
     * _.isObject(1);
     * // => false
     */
    function isObject(value) {
      // check if the value is the ECMAScript language type of Object
      // http://es5.github.com/#x8
      // and avoid a V8 bug
      // http://code.google.com/p/v8/issues/detail?id=2291
      return value ? objectTypes[typeof value] : false;
    }

    /**
     * Checks if `value` is `NaN`.
     *
     * Note: This is not the same as native `isNaN`, which will return `true` for
     * `undefined` and other values. See http://es5.github.com/#x15.1.2.4.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Mixed} value The value to check.
     * @returns {Boolean} Returns `true`, if the `value` is `NaN`, else `false`.
     * @example
     *
     * _.isNaN(NaN);
     * // => true
     *
     * _.isNaN(new Number(NaN));
     * // => true
     *
     * isNaN(undefined);
     * // => true
     *
     * _.isNaN(undefined);
     * // => false
     */
    function isNaN(value) {
      // `NaN` as a primitive is the only value that is not equal to itself
      // (perform the [[Class]] check first to avoid errors with some host objects in IE)
      return isNumber(value) && value != +value
    }

    /**
     * Checks if `value` is `null`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Mixed} value The value to check.
     * @returns {Boolean} Returns `true`, if the `value` is `null`, else `false`.
     * @example
     *
     * _.isNull(null);
     * // => true
     *
     * _.isNull(undefined);
     * // => false
     */
    function isNull(value) {
      return value === null;
    }

    /**
     * Checks if `value` is a number.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Mixed} value The value to check.
     * @returns {Boolean} Returns `true`, if the `value` is a number, else `false`.
     * @example
     *
     * _.isNumber(8.4 * 5);
     * // => true
     */
    function isNumber(value) {
      return typeof value == 'number' || toString.call(value) == numberClass;
    }

    /**
     * Checks if a given `value` is an object created by the `Object` constructor.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Mixed} value The value to check.
     * @returns {Boolean} Returns `true`, if `value` is a plain object, else `false`.
     * @example
     *
     * function Stooge(name, age) {
     *   this.name = name;
     *   this.age = age;
     * }
     *
     * _.isPlainObject(new Stooge('moe', 40));
     * // => false
     *
     * _.isPlainObject([1, 2, 3]);
     * // => false
     *
     * _.isPlainObject({ 'name': 'moe', 'age': 40 });
     * // => true
     */
    var isPlainObject = !getPrototypeOf ? shimIsPlainObject : function(value) {
      if (!(value && toString.call(value) == objectClass) || (!support.argsClass && isArguments(value))) {
        return false;
      }
      var valueOf = value.valueOf,
          objProto = typeof valueOf == 'function' && (objProto = getPrototypeOf(valueOf)) && getPrototypeOf(objProto);

      return objProto
        ? (value == objProto || getPrototypeOf(value) == objProto)
        : shimIsPlainObject(value);
    };

    /**
     * Checks if `value` is a regular expression.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Mixed} value The value to check.
     * @returns {Boolean} Returns `true`, if the `value` is a regular expression, else `false`.
     * @example
     *
     * _.isRegExp(/moe/);
     * // => true
     */
    function isRegExp(value) {
      return value instanceof RegExp || toString.call(value) == regexpClass;
    }

    /**
     * Checks if `value` is a string.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Mixed} value The value to check.
     * @returns {Boolean} Returns `true`, if the `value` is a string, else `false`.
     * @example
     *
     * _.isString('moe');
     * // => true
     */
    function isString(value) {
      return typeof value == 'string' || toString.call(value) == stringClass;
    }

    /**
     * Checks if `value` is `undefined`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Mixed} value The value to check.
     * @returns {Boolean} Returns `true`, if the `value` is `undefined`, else `false`.
     * @example
     *
     * _.isUndefined(void 0);
     * // => true
     */
    function isUndefined(value) {
      return typeof value == 'undefined';
    }

    /**
     * Recursively merges own enumerable properties of the source object(s), that
     * don't resolve to `undefined`, into the destination object. Subsequent sources
     * will overwrite property assignments of previous sources. If a `callback` function
     * is passed, it will be executed to produce the merged values of the destination
     * and source properties. If `callback` returns `undefined`, merging will be
     * handled by the method instead. The `callback` is bound to `thisArg` and
     * invoked with two arguments; (objectValue, sourceValue).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The destination object.
     * @param {Object} [source1, source2, ...] The source objects.
     * @param {Function} [callback] The function to customize merging properties.
     * @param {Mixed} [thisArg] The `this` binding of `callback`.
     * @param- {Object} [deepIndicator] Indicates that `stackA` and `stackB` are
     *  arrays of traversed objects, instead of source objects.
     * @param- {Array} [stackA=[]] Tracks traversed source objects.
     * @param- {Array} [stackB=[]] Associates values with source counterparts.
     * @returns {Object} Returns the destination object.
     * @example
     *
     * var names = {
     *   'stooges': [
     *     { 'name': 'moe' },
     *     { 'name': 'larry' }
     *   ]
     * };
     *
     * var ages = {
     *   'stooges': [
     *     { 'age': 40 },
     *     { 'age': 50 }
     *   ]
     * };
     *
     * _.merge(names, ages);
     * // => { 'stooges': [{ 'name': 'moe', 'age': 40 }, { 'name': 'larry', 'age': 50 }] }
     *
     * var food = {
     *   'fruits': ['apple'],
     *   'vegetables': ['beet']
     * };
     *
     * var otherFood = {
     *   'fruits': ['banana'],
     *   'vegetables': ['carrot']
     * };
     *
     * _.merge(food, otherFood, function(a, b) {
     *   return _.isArray(a) ? a.concat(b) : undefined;
     * });
     * // => { 'fruits': ['apple', 'banana'], 'vegetables': ['beet', 'carrot] }
     */
    function merge(object, source, deepIndicator) {
      var args = arguments,
          index = 0,
          length = 2;

      if (!isObject(object)) {
        return object;
      }
      if (deepIndicator === indicatorObject) {
        var callback = args[3],
            stackA = args[4],
            stackB = args[5];
      } else {
        stackA = [];
        stackB = [];

        // allows working with `_.reduce` and `_.reduceRight` without
        // using their `callback` arguments, `index|key` and `collection`
        if (typeof deepIndicator != 'number') {
          length = args.length;
        }
        if (length > 3 && typeof args[length - 2] == 'function') {
          callback = lodash.createCallback(args[--length - 1], args[length--], 2);
        } else if (length > 2 && typeof args[length - 1] == 'function') {
          callback = args[--length];
        }
      }
      while (++index < length) {
        (isArray(args[index]) ? forEach : forOwn)(args[index], function(source, key) {
          var found,
              isArr,
              result = source,
              value = object[key];

          if (source && ((isArr = isArray(source)) || isPlainObject(source))) {
            // avoid merging previously merged cyclic sources
            var stackLength = stackA.length;
            while (stackLength--) {
              if ((found = stackA[stackLength] == source)) {
                value = stackB[stackLength];
                break;
              }
            }
            if (!found) {
              value = isArr
                ? (isArray(value) ? value : [])
                : (isPlainObject(value) ? value : {});

              if (callback) {
                result = callback(value, source);
                if (typeof result != 'undefined') {
                  value = result;
                }
              }
              // add `source` and associated `value` to the stack of traversed objects
              stackA.push(source);
              stackB.push(value);

              // recursively merge objects and arrays (susceptible to call stack limits)
              if (!callback) {
                value = merge(value, source, indicatorObject, callback, stackA, stackB);
              }
            }
          }
          else {
            if (callback) {
              result = callback(value, source);
              if (typeof result == 'undefined') {
                result = source;
              }
            }
            if (typeof result != 'undefined') {
              value = result;
            }
          }
          object[key] = value;
        });
      }
      return object;
    }

    /**
     * Creates a shallow clone of `object` excluding the specified properties.
     * Property names may be specified as individual arguments or as arrays of
     * property names. If a `callback` function is passed, it will be executed
     * for each property in the `object`, omitting the properties `callback`
     * returns truthy for. The `callback` is bound to `thisArg` and invoked
     * with three arguments; (value, key, object).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The source object.
     * @param {Function|String} callback|[prop1, prop2, ...] The properties to omit
     *  or the function called per iteration.
     * @param {Mixed} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns an object without the omitted properties.
     * @example
     *
     * _.omit({ 'name': 'moe', 'age': 40 }, 'age');
     * // => { 'name': 'moe' }
     *
     * _.omit({ 'name': 'moe', 'age': 40 }, function(value) {
     *   return typeof value == 'number';
     * });
     * // => { 'name': 'moe' }
     */
    function omit(object, callback, thisArg) {
      var isFunc = typeof callback == 'function',
          result = {};

      if (isFunc) {
        callback = lodash.createCallback(callback, thisArg);
      } else {
        var props = concat.apply(arrayRef, arguments);
      }
      forIn(object, function(value, key, object) {
        if (isFunc
              ? !callback(value, key, object)
              : indexOf(props, key, 1) < 0
            ) {
          result[key] = value;
        }
      });
      return result;
    }

    /**
     * Creates a two dimensional array of the given object's key-value pairs,
     * i.e. `[[key1, value1], [key2, value2]]`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns new array of key-value pairs.
     * @example
     *
     * _.pairs({ 'moe': 30, 'larry': 40 });
     * // => [['moe', 30], ['larry', 40]] (order is not guaranteed)
     */
    function pairs(object) {
      var index = -1,
          props = keys(object),
          length = props.length,
          result = Array(length);

      while (++index < length) {
        var key = props[index];
        result[index] = [key, object[key]];
      }
      return result;
    }

    /**
     * Creates a shallow clone of `object` composed of the specified properties.
     * Property names may be specified as individual arguments or as arrays of property
     * names. If `callback` is passed, it will be executed for each property in the
     * `object`, picking the properties `callback` returns truthy for. The `callback`
     * is bound to `thisArg` and invoked with three arguments; (value, key, object).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The source object.
     * @param {Array|Function|String} callback|[prop1, prop2, ...] The function called
     *  per iteration or properties to pick, either as individual arguments or arrays.
     * @param {Mixed} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns an object composed of the picked properties.
     * @example
     *
     * _.pick({ 'name': 'moe', '_userid': 'moe1' }, 'name');
     * // => { 'name': 'moe' }
     *
     * _.pick({ 'name': 'moe', '_userid': 'moe1' }, function(value, key) {
     *   return key.charAt(0) != '_';
     * });
     * // => { 'name': 'moe' }
     */
    function pick(object, callback, thisArg) {
      var result = {};
      if (typeof callback != 'function') {
        var index = 0,
            props = concat.apply(arrayRef, arguments),
            length = isObject(object) ? props.length : 0;

        while (++index < length) {
          var key = props[index];
          if (key in object) {
            result[key] = object[key];
          }
        }
      } else {
        callback = lodash.createCallback(callback, thisArg);
        forIn(object, function(value, key, object) {
          if (callback(value, key, object)) {
            result[key] = value;
          }
        });
      }
      return result;
    }

    /**
     * Creates an array composed of the own enumerable property values of `object`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns a new array of property values.
     * @example
     *
     * _.values({ 'one': 1, 'two': 2, 'three': 3 });
     * // => [1, 2, 3] (order is not guaranteed)
     */
    function values(object) {
      var index = -1,
          props = keys(object),
          length = props.length,
          result = Array(length);

      while (++index < length) {
        result[index] = object[props[index]];
      }
      return result;
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Creates an array of elements from the specified indexes, or keys, of the
     * `collection`. Indexes may be specified as individual arguments or as arrays
     * of indexes.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|String} collection The collection to iterate over.
     * @param {Array|Number|String} [index1, index2, ...] The indexes of
     *  `collection` to retrieve, either as individual arguments or arrays.
     * @returns {Array} Returns a new array of elements corresponding to the
     *  provided indexes.
     * @example
     *
     * _.at(['a', 'b', 'c', 'd', 'e'], [0, 2, 4]);
     * // => ['a', 'c', 'e']
     *
     * _.at(['moe', 'larry', 'curly'], 0, 2);
     * // => ['moe', 'curly']
     */
    function at(collection) {
      var index = -1,
          props = concat.apply(arrayRef, slice(arguments, 1)),
          length = props.length,
          result = Array(length);

      if (support.unindexedChars && isString(collection)) {
        collection = collection.split('');
      }
      while(++index < length) {
        result[index] = collection[props[index]];
      }
      return result;
    }

    /**
     * Checks if a given `target` element is present in a `collection` using strict
     * equality for comparisons, i.e. `===`. If `fromIndex` is negative, it is used
     * as the offset from the end of the collection.
     *
     * @static
     * @memberOf _
     * @alias include
     * @category Collections
     * @param {Array|Object|String} collection The collection to iterate over.
     * @param {Mixed} target The value to check for.
     * @param {Number} [fromIndex=0] The index to search from.
     * @returns {Boolean} Returns `true` if the `target` element is found, else `false`.
     * @example
     *
     * _.contains([1, 2, 3], 1);
     * // => true
     *
     * _.contains([1, 2, 3], 1, 2);
     * // => false
     *
     * _.contains({ 'name': 'moe', 'age': 40 }, 'moe');
     * // => true
     *
     * _.contains('curly', 'ur');
     * // => true
     */
    function contains(collection, target, fromIndex) {
      var index = -1,
          length = collection ? collection.length : 0,
          result = false;

      fromIndex = (fromIndex < 0 ? nativeMax(0, length + fromIndex) : fromIndex) || 0;
      if (typeof length == 'number') {
        result = (isString(collection)
          ? collection.indexOf(target, fromIndex)
          : indexOf(collection, target, fromIndex)
        ) > -1;
      } else {
        each(collection, function(value) {
          if (++index >= fromIndex) {
            return !(result = value === target);
          }
        });
      }
      return result;
    }

    /**
     * Creates an object composed of keys returned from running each element of the
     * `collection` through the given `callback`. The corresponding value of each key
     * is the number of times the key was returned by the `callback`. The `callback`
     * is bound to `thisArg` and invoked with three arguments; (value, index|key, collection).
     *
     * If a property name is passed for `callback`, the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is passed for `callback`, the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|String} collection The collection to iterate over.
     * @param {Function|Object|String} [callback=identity] The function called per
     *  iteration. If a property name or object is passed, it will be used to create
     *  a "_.pluck" or "_.where" style callback, respectively.
     * @param {Mixed} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the composed aggregate object.
     * @example
     *
     * _.countBy([4.3, 6.1, 6.4], function(num) { return Math.floor(num); });
     * // => { '4': 1, '6': 2 }
     *
     * _.countBy([4.3, 6.1, 6.4], function(num) { return this.floor(num); }, Math);
     * // => { '4': 1, '6': 2 }
     *
     * _.countBy(['one', 'two', 'three'], 'length');
     * // => { '3': 2, '5': 1 }
     */
    function countBy(collection, callback, thisArg) {
      var result = {};
      callback = lodash.createCallback(callback, thisArg);

      forEach(collection, function(value, key, collection) {
        key = String(callback(value, key, collection));
        (hasOwnProperty.call(result, key) ? result[key]++ : result[key] = 1);
      });
      return result;
    }

    /**
     * Checks if the `callback` returns a truthy value for **all** elements of a
     * `collection`. The `callback` is bound to `thisArg` and invoked with three
     * arguments; (value, index|key, collection).
     *
     * If a property name is passed for `callback`, the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is passed for `callback`, the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias all
     * @category Collections
     * @param {Array|Object|String} collection The collection to iterate over.
     * @param {Function|Object|String} [callback=identity] The function called per
     *  iteration. If a property name or object is passed, it will be used to create
     *  a "_.pluck" or "_.where" style callback, respectively.
     * @param {Mixed} [thisArg] The `this` binding of `callback`.
     * @returns {Boolean} Returns `true` if all elements pass the callback check,
     *  else `false`.
     * @example
     *
     * _.every([true, 1, null, 'yes'], Boolean);
     * // => false
     *
     * var stooges = [
     *   { 'name': 'moe', 'age': 40 },
     *   { 'name': 'larry', 'age': 50 }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.every(stooges, 'age');
     * // => true
     *
     * // using "_.where" callback shorthand
     * _.every(stooges, { 'age': 50 });
     * // => false
     */
    function every(collection, callback, thisArg) {
      var result = true;
      callback = lodash.createCallback(callback, thisArg);

      if (isArray(collection)) {
        var index = -1,
            length = collection.length;

        while (++index < length) {
          if (!(result = !!callback(collection[index], index, collection))) {
            break;
          }
        }
      } else {
        each(collection, function(value, index, collection) {
          return (result = !!callback(value, index, collection));
        });
      }
      return result;
    }

    /**
     * Examines each element in a `collection`, returning an array of all elements
     * the `callback` returns truthy for. The `callback` is bound to `thisArg` and
     * invoked with three arguments; (value, index|key, collection).
     *
     * If a property name is passed for `callback`, the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is passed for `callback`, the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias select
     * @category Collections
     * @param {Array|Object|String} collection The collection to iterate over.
     * @param {Function|Object|String} [callback=identity] The function called per
     *  iteration. If a property name or object is passed, it will be used to create
     *  a "_.pluck" or "_.where" style callback, respectively.
     * @param {Mixed} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of elements that passed the callback check.
     * @example
     *
     * var evens = _.filter([1, 2, 3, 4, 5, 6], function(num) { return num % 2 == 0; });
     * // => [2, 4, 6]
     *
     * var food = [
     *   { 'name': 'apple',  'organic': false, 'type': 'fruit' },
     *   { 'name': 'carrot', 'organic': true,  'type': 'vegetable' }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.filter(food, 'organic');
     * // => [{ 'name': 'carrot', 'organic': true, 'type': 'vegetable' }]
     *
     * // using "_.where" callback shorthand
     * _.filter(food, { 'type': 'fruit' });
     * // => [{ 'name': 'apple', 'organic': false, 'type': 'fruit' }]
     */
    function filter(collection, callback, thisArg) {
      var result = [];
      callback = lodash.createCallback(callback, thisArg);

      if (isArray(collection)) {
        var index = -1,
            length = collection.length;

        while (++index < length) {
          var value = collection[index];
          if (callback(value, index, collection)) {
            result.push(value);
          }
        }
      } else {
        each(collection, function(value, index, collection) {
          if (callback(value, index, collection)) {
            result.push(value);
          }
        });
      }
      return result;
    }

    /**
     * Examines each element in a `collection`, returning the first that the `callback`
     * returns truthy for. The `callback` is bound to `thisArg` and invoked with three
     * arguments; (value, index|key, collection).
     *
     * If a property name is passed for `callback`, the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is passed for `callback`, the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias detect
     * @category Collections
     * @param {Array|Object|String} collection The collection to iterate over.
     * @param {Function|Object|String} [callback=identity] The function called per
     *  iteration. If a property name or object is passed, it will be used to create
     *  a "_.pluck" or "_.where" style callback, respectively.
     * @param {Mixed} [thisArg] The `this` binding of `callback`.
     * @returns {Mixed} Returns the found element, else `undefined`.
     * @example
     *
     * _.find([1, 2, 3, 4], function(num) { return num % 2 == 0; });
     * // => 2
     *
     * var food = [
     *   { 'name': 'apple',  'organic': false, 'type': 'fruit' },
     *   { 'name': 'banana', 'organic': true,  'type': 'fruit' },
     *   { 'name': 'beet',   'organic': false, 'type': 'vegetable' }
     * ];
     *
     * // using "_.where" callback shorthand
     * _.find(food, { 'type': 'vegetable' });
     * // => { 'name': 'beet', 'organic': false, 'type': 'vegetable' }
     *
     * // using "_.pluck" callback shorthand
     * _.find(food, 'organic');
     * // => { 'name': 'banana', 'organic': true, 'type': 'fruit' }
     */
    function find(collection, callback, thisArg) {
      callback = lodash.createCallback(callback, thisArg);

      if (isArray(collection)) {
        var index = -1,
            length = collection.length;

        while (++index < length) {
          var value = collection[index];
          if (callback(value, index, collection)) {
            return value;
          }
        }
      } else {
        var result;
        each(collection, function(value, index, collection) {
          if (callback(value, index, collection)) {
            result = value;
            return false;
          }
        });
        return result;
      }
    }

    /**
     * Iterates over a `collection`, executing the `callback` for each element in
     * the `collection`. The `callback` is bound to `thisArg` and invoked with three
     * arguments; (value, index|key, collection). Callbacks may exit iteration early
     * by explicitly returning `false`.
     *
     * @static
     * @memberOf _
     * @alias each
     * @category Collections
     * @param {Array|Object|String} collection The collection to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {Mixed} [thisArg] The `this` binding of `callback`.
     * @returns {Array|Object|String} Returns `collection`.
     * @example
     *
     * _([1, 2, 3]).forEach(alert).join(',');
     * // => alerts each number and returns '1,2,3'
     *
     * _.forEach({ 'one': 1, 'two': 2, 'three': 3 }, alert);
     * // => alerts each number value (order is not guaranteed)
     */
    function forEach(collection, callback, thisArg) {
      if (callback && typeof thisArg == 'undefined' && isArray(collection)) {
        var index = -1,
            length = collection.length;

        while (++index < length) {
          if (callback(collection[index], index, collection) === false) {
            break;
          }
        }
      } else {
        each(collection, callback, thisArg);
      }
      return collection;
    }

    /**
     * Creates an object composed of keys returned from running each element of the
     * `collection` through the `callback`. The corresponding value of each key is
     * an array of elements passed to `callback` that returned the key. The `callback`
     * is bound to `thisArg` and invoked with three arguments; (value, index|key, collection).
     *
     * If a property name is passed for `callback`, the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is passed for `callback`, the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|String} collection The collection to iterate over.
     * @param {Function|Object|String} [callback=identity] The function called per
     *  iteration. If a property name or object is passed, it will be used to create
     *  a "_.pluck" or "_.where" style callback, respectively.
     * @param {Mixed} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the composed aggregate object.
     * @example
     *
     * _.groupBy([4.2, 6.1, 6.4], function(num) { return Math.floor(num); });
     * // => { '4': [4.2], '6': [6.1, 6.4] }
     *
     * _.groupBy([4.2, 6.1, 6.4], function(num) { return this.floor(num); }, Math);
     * // => { '4': [4.2], '6': [6.1, 6.4] }
     *
     * // using "_.pluck" callback shorthand
     * _.groupBy(['one', 'two', 'three'], 'length');
     * // => { '3': ['one', 'two'], '5': ['three'] }
     */
    function groupBy(collection, callback, thisArg) {
      var result = {};
      callback = lodash.createCallback(callback, thisArg);

      forEach(collection, function(value, key, collection) {
        key = String(callback(value, key, collection));
        (hasOwnProperty.call(result, key) ? result[key] : result[key] = []).push(value);
      });
      return result;
    }

    /**
     * Invokes the method named by `methodName` on each element in the `collection`,
     * returning an array of the results of each invoked method. Additional arguments
     * will be passed to each invoked method. If `methodName` is a function, it will
     * be invoked for, and `this` bound to, each element in the `collection`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|String} collection The collection to iterate over.
     * @param {Function|String} methodName The name of the method to invoke or
     *  the function invoked per iteration.
     * @param {Mixed} [arg1, arg2, ...] Arguments to invoke the method with.
     * @returns {Array} Returns a new array of the results of each invoked method.
     * @example
     *
     * _.invoke([[5, 1, 7], [3, 2, 1]], 'sort');
     * // => [[1, 5, 7], [1, 2, 3]]
     *
     * _.invoke([123, 456], String.prototype.split, '');
     * // => [['1', '2', '3'], ['4', '5', '6']]
     */
    function invoke(collection, methodName) {
      var args = slice(arguments, 2),
          index = -1,
          isFunc = typeof methodName == 'function',
          length = collection ? collection.length : 0,
          result = Array(typeof length == 'number' ? length : 0);

      forEach(collection, function(value) {
        result[++index] = (isFunc ? methodName : value[methodName]).apply(value, args);
      });
      return result;
    }

    /**
     * Creates an array of values by running each element in the `collection`
     * through the `callback`. The `callback` is bound to `thisArg` and invoked with
     * three arguments; (value, index|key, collection).
     *
     * If a property name is passed for `callback`, the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is passed for `callback`, the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias collect
     * @category Collections
     * @param {Array|Object|String} collection The collection to iterate over.
     * @param {Function|Object|String} [callback=identity] The function called per
     *  iteration. If a property name or object is passed, it will be used to create
     *  a "_.pluck" or "_.where" style callback, respectively.
     * @param {Mixed} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of the results of each `callback` execution.
     * @example
     *
     * _.map([1, 2, 3], function(num) { return num * 3; });
     * // => [3, 6, 9]
     *
     * _.map({ 'one': 1, 'two': 2, 'three': 3 }, function(num) { return num * 3; });
     * // => [3, 6, 9] (order is not guaranteed)
     *
     * var stooges = [
     *   { 'name': 'moe', 'age': 40 },
     *   { 'name': 'larry', 'age': 50 }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.map(stooges, 'name');
     * // => ['moe', 'larry']
     */
    function map(collection, callback, thisArg) {
      var index = -1,
          length = collection ? collection.length : 0,
          result = Array(typeof length == 'number' ? length : 0);

      callback = lodash.createCallback(callback, thisArg);
      if (isArray(collection)) {
        while (++index < length) {
          result[index] = callback(collection[index], index, collection);
        }
      } else {
        each(collection, function(value, key, collection) {
          result[++index] = callback(value, key, collection);
        });
      }
      return result;
    }

    /**
     * Retrieves the maximum value of an `array`. If `callback` is passed,
     * it will be executed for each value in the `array` to generate the
     * criterion by which the value is ranked. The `callback` is bound to
     * `thisArg` and invoked with three arguments; (value, index, collection).
     *
     * If a property name is passed for `callback`, the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is passed for `callback`, the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|String} collection The collection to iterate over.
     * @param {Function|Object|String} [callback=identity] The function called per
     *  iteration. If a property name or object is passed, it will be used to create
     *  a "_.pluck" or "_.where" style callback, respectively.
     * @param {Mixed} [thisArg] The `this` binding of `callback`.
     * @returns {Mixed} Returns the maximum value.
     * @example
     *
     * _.max([4, 2, 8, 6]);
     * // => 8
     *
     * var stooges = [
     *   { 'name': 'moe', 'age': 40 },
     *   { 'name': 'larry', 'age': 50 }
     * ];
     *
     * _.max(stooges, function(stooge) { return stooge.age; });
     * // => { 'name': 'larry', 'age': 50 };
     *
     * // using "_.pluck" callback shorthand
     * _.max(stooges, 'age');
     * // => { 'name': 'larry', 'age': 50 };
     */
    function max(collection, callback, thisArg) {
      var computed = -Infinity,
          result = computed;

      if (!callback && isArray(collection)) {
        var index = -1,
            length = collection.length;

        while (++index < length) {
          var value = collection[index];
          if (value > result) {
            result = value;
          }
        }
      } else {
        callback = (!callback && isString(collection))
          ? charAtCallback
          : lodash.createCallback(callback, thisArg);

        each(collection, function(value, index, collection) {
          var current = callback(value, index, collection);
          if (current > computed) {
            computed = current;
            result = value;
          }
        });
      }
      return result;
    }

    /**
     * Retrieves the minimum value of an `array`. If `callback` is passed,
     * it will be executed for each value in the `array` to generate the
     * criterion by which the value is ranked. The `callback` is bound to `thisArg`
     * and invoked with three arguments; (value, index, collection).
     *
     * If a property name is passed for `callback`, the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is passed for `callback`, the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|String} collection The collection to iterate over.
     * @param {Function|Object|String} [callback=identity] The function called per
     *  iteration. If a property name or object is passed, it will be used to create
     *  a "_.pluck" or "_.where" style callback, respectively.
     * @param {Mixed} [thisArg] The `this` binding of `callback`.
     * @returns {Mixed} Returns the minimum value.
     * @example
     *
     * _.min([4, 2, 8, 6]);
     * // => 2
     *
     * var stooges = [
     *   { 'name': 'moe', 'age': 40 },
     *   { 'name': 'larry', 'age': 50 }
     * ];
     *
     * _.min(stooges, function(stooge) { return stooge.age; });
     * // => { 'name': 'moe', 'age': 40 };
     *
     * // using "_.pluck" callback shorthand
     * _.min(stooges, 'age');
     * // => { 'name': 'moe', 'age': 40 };
     */
    function min(collection, callback, thisArg) {
      var computed = Infinity,
          result = computed;

      if (!callback && isArray(collection)) {
        var index = -1,
            length = collection.length;

        while (++index < length) {
          var value = collection[index];
          if (value < result) {
            result = value;
          }
        }
      } else {
        callback = (!callback && isString(collection))
          ? charAtCallback
          : lodash.createCallback(callback, thisArg);

        each(collection, function(value, index, collection) {
          var current = callback(value, index, collection);
          if (current < computed) {
            computed = current;
            result = value;
          }
        });
      }
      return result;
    }

    /**
     * Retrieves the value of a specified property from all elements in the `collection`.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Collections
     * @param {Array|Object|String} collection The collection to iterate over.
     * @param {String} property The property to pluck.
     * @returns {Array} Returns a new array of property values.
     * @example
     *
     * var stooges = [
     *   { 'name': 'moe', 'age': 40 },
     *   { 'name': 'larry', 'age': 50 }
     * ];
     *
     * _.pluck(stooges, 'name');
     * // => ['moe', 'larry']
     */
    var pluck = map;

    /**
     * Reduces a `collection` to a value that is the accumulated result of running
     * each element in the `collection` through the `callback`, where each successive
     * `callback` execution consumes the return value of the previous execution.
     * If `accumulator` is not passed, the first element of the `collection` will be
     * used as the initial `accumulator` value. The `callback` is bound to `thisArg`
     * and invoked with four arguments; (accumulator, value, index|key, collection).
     *
     * @static
     * @memberOf _
     * @alias foldl, inject
     * @category Collections
     * @param {Array|Object|String} collection The collection to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {Mixed} [accumulator] Initial value of the accumulator.
     * @param {Mixed} [thisArg] The `this` binding of `callback`.
     * @returns {Mixed} Returns the accumulated value.
     * @example
     *
     * var sum = _.reduce([1, 2, 3], function(sum, num) {
     *   return sum + num;
     * });
     * // => 6
     *
     * var mapped = _.reduce({ 'a': 1, 'b': 2, 'c': 3 }, function(result, num, key) {
     *   result[key] = num * 3;
     *   return result;
     * }, {});
     * // => { 'a': 3, 'b': 6, 'c': 9 }
     */
    function reduce(collection, callback, accumulator, thisArg) {
      var noaccum = arguments.length < 3;
      callback = lodash.createCallback(callback, thisArg, 4);

      if (isArray(collection)) {
        var index = -1,
            length = collection.length;

        if (noaccum) {
          accumulator = collection[++index];
        }
        while (++index < length) {
          accumulator = callback(accumulator, collection[index], index, collection);
        }
      } else {
        each(collection, function(value, index, collection) {
          accumulator = noaccum
            ? (noaccum = false, value)
            : callback(accumulator, value, index, collection)
        });
      }
      return accumulator;
    }

    /**
     * This method is similar to `_.reduce`, except that it iterates over a
     * `collection` from right to left.
     *
     * @static
     * @memberOf _
     * @alias foldr
     * @category Collections
     * @param {Array|Object|String} collection The collection to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {Mixed} [accumulator] Initial value of the accumulator.
     * @param {Mixed} [thisArg] The `this` binding of `callback`.
     * @returns {Mixed} Returns the accumulated value.
     * @example
     *
     * var list = [[0, 1], [2, 3], [4, 5]];
     * var flat = _.reduceRight(list, function(a, b) { return a.concat(b); }, []);
     * // => [4, 5, 2, 3, 0, 1]
     */
    function reduceRight(collection, callback, accumulator, thisArg) {
      var iterable = collection,
          length = collection ? collection.length : 0,
          noaccum = arguments.length < 3;

      if (typeof length != 'number') {
        var props = keys(collection);
        length = props.length;
      } else if (support.unindexedChars && isString(collection)) {
        iterable = collection.split('');
      }
      callback = lodash.createCallback(callback, thisArg, 4);
      forEach(collection, function(value, index, collection) {
        index = props ? props[--length] : --length;
        accumulator = noaccum
          ? (noaccum = false, iterable[index])
          : callback(accumulator, iterable[index], index, collection);
      });
      return accumulator;
    }

    /**
     * The opposite of `_.filter`, this method returns the elements of a
     * `collection` that `callback` does **not** return truthy for.
     *
     * If a property name is passed for `callback`, the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is passed for `callback`, the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|String} collection The collection to iterate over.
     * @param {Function|Object|String} [callback=identity] The function called per
     *  iteration. If a property name or object is passed, it will be used to create
     *  a "_.pluck" or "_.where" style callback, respectively.
     * @param {Mixed} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of elements that did **not** pass the
     *  callback check.
     * @example
     *
     * var odds = _.reject([1, 2, 3, 4, 5, 6], function(num) { return num % 2 == 0; });
     * // => [1, 3, 5]
     *
     * var food = [
     *   { 'name': 'apple',  'organic': false, 'type': 'fruit' },
     *   { 'name': 'carrot', 'organic': true,  'type': 'vegetable' }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.reject(food, 'organic');
     * // => [{ 'name': 'apple', 'organic': false, 'type': 'fruit' }]
     *
     * // using "_.where" callback shorthand
     * _.reject(food, { 'type': 'fruit' });
     * // => [{ 'name': 'carrot', 'organic': true, 'type': 'vegetable' }]
     */
    function reject(collection, callback, thisArg) {
      callback = lodash.createCallback(callback, thisArg);
      return filter(collection, function(value, index, collection) {
        return !callback(value, index, collection);
      });
    }

    /**
     * Creates an array of shuffled `array` values, using a version of the
     * Fisher-Yates shuffle. See http://en.wikipedia.org/wiki/Fisher-Yates_shuffle.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|String} collection The collection to shuffle.
     * @returns {Array} Returns a new shuffled collection.
     * @example
     *
     * _.shuffle([1, 2, 3, 4, 5, 6]);
     * // => [4, 1, 6, 3, 5, 2]
     */
    function shuffle(collection) {
      var index = -1,
          length = collection ? collection.length : 0,
          result = Array(typeof length == 'number' ? length : 0);

      forEach(collection, function(value) {
        var rand = floor(nativeRandom() * (++index + 1));
        result[index] = result[rand];
        result[rand] = value;
      });
      return result;
    }

    /**
     * Gets the size of the `collection` by returning `collection.length` for arrays
     * and array-like objects or the number of own enumerable properties for objects.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|String} collection The collection to inspect.
     * @returns {Number} Returns `collection.length` or number of own enumerable properties.
     * @example
     *
     * _.size([1, 2]);
     * // => 2
     *
     * _.size({ 'one': 1, 'two': 2, 'three': 3 });
     * // => 3
     *
     * _.size('curly');
     * // => 5
     */
    function size(collection) {
      var length = collection ? collection.length : 0;
      return typeof length == 'number' ? length : keys(collection).length;
    }

    /**
     * Checks if the `callback` returns a truthy value for **any** element of a
     * `collection`. The function returns as soon as it finds passing value, and
     * does not iterate over the entire `collection`. The `callback` is bound to
     * `thisArg` and invoked with three arguments; (value, index|key, collection).
     *
     * If a property name is passed for `callback`, the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is passed for `callback`, the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias any
     * @category Collections
     * @param {Array|Object|String} collection The collection to iterate over.
     * @param {Function|Object|String} [callback=identity] The function called per
     *  iteration. If a property name or object is passed, it will be used to create
     *  a "_.pluck" or "_.where" style callback, respectively.
     * @param {Mixed} [thisArg] The `this` binding of `callback`.
     * @returns {Boolean} Returns `true` if any element passes the callback check,
     *  else `false`.
     * @example
     *
     * _.some([null, 0, 'yes', false], Boolean);
     * // => true
     *
     * var food = [
     *   { 'name': 'apple',  'organic': false, 'type': 'fruit' },
     *   { 'name': 'carrot', 'organic': true,  'type': 'vegetable' }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.some(food, 'organic');
     * // => true
     *
     * // using "_.where" callback shorthand
     * _.some(food, { 'type': 'meat' });
     * // => false
     */
    function some(collection, callback, thisArg) {
      var result;
      callback = lodash.createCallback(callback, thisArg);

      if (isArray(collection)) {
        var index = -1,
            length = collection.length;

        while (++index < length) {
          if ((result = callback(collection[index], index, collection))) {
            break;
          }
        }
      } else {
        each(collection, function(value, index, collection) {
          return !(result = callback(value, index, collection));
        });
      }
      return !!result;
    }

    /**
     * Creates an array of elements, sorted in ascending order by the results of
     * running each element in the `collection` through the `callback`. This method
     * performs a stable sort, that is, it will preserve the original sort order of
     * equal elements. The `callback` is bound to `thisArg` and invoked with three
     * arguments; (value, index|key, collection).
     *
     * If a property name is passed for `callback`, the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is passed for `callback`, the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|String} collection The collection to iterate over.
     * @param {Function|Object|String} [callback=identity] The function called per
     *  iteration. If a property name or object is passed, it will be used to create
     *  a "_.pluck" or "_.where" style callback, respectively.
     * @param {Mixed} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of sorted elements.
     * @example
     *
     * _.sortBy([1, 2, 3], function(num) { return Math.sin(num); });
     * // => [3, 1, 2]
     *
     * _.sortBy([1, 2, 3], function(num) { return this.sin(num); }, Math);
     * // => [3, 1, 2]
     *
     * // using "_.pluck" callback shorthand
     * _.sortBy(['banana', 'strawberry', 'apple'], 'length');
     * // => ['apple', 'banana', 'strawberry']
     */
    function sortBy(collection, callback, thisArg) {
      var index = -1,
          length = collection ? collection.length : 0,
          result = Array(typeof length == 'number' ? length : 0);

      callback = lodash.createCallback(callback, thisArg);
      forEach(collection, function(value, key, collection) {
        result[++index] = {
          'criteria': callback(value, key, collection),
          'index': index,
          'value': value
        };
      });

      length = result.length;
      result.sort(compareAscending);
      while (length--) {
        result[length] = result[length].value;
      }
      return result;
    }

    /**
     * Converts the `collection` to an array.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|String} collection The collection to convert.
     * @returns {Array} Returns the new converted array.
     * @example
     *
     * (function() { return _.toArray(arguments).slice(1); })(1, 2, 3, 4);
     * // => [2, 3, 4]
     */
    function toArray(collection) {
      if (collection && typeof collection.length == 'number') {
        return (support.unindexedChars && isString(collection))
          ? collection.split('')
          : slice(collection);
      }
      return values(collection);
    }

    /**
     * Examines each element in a `collection`, returning an array of all elements
     * that have the given `properties`. When checking `properties`, this method
     * performs a deep comparison between values to determine if they are equivalent
     * to each other.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Collections
     * @param {Array|Object|String} collection The collection to iterate over.
     * @param {Object} properties The object of property values to filter by.
     * @returns {Array} Returns a new array of elements that have the given `properties`.
     * @example
     *
     * var stooges = [
     *   { 'name': 'moe', 'age': 40 },
     *   { 'name': 'larry', 'age': 50 }
     * ];
     *
     * _.where(stooges, { 'age': 40 });
     * // => [{ 'name': 'moe', 'age': 40 }]
     */
    var where = filter;

    /*--------------------------------------------------------------------------*/

    /**
     * Creates an array with all falsey values of `array` removed. The values
     * `false`, `null`, `0`, `""`, `undefined` and `NaN` are all falsey.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to compact.
     * @returns {Array} Returns a new filtered array.
     * @example
     *
     * _.compact([0, 1, false, 2, '', 3]);
     * // => [1, 2, 3]
     */
    function compact(array) {
      var index = -1,
          length = array ? array.length : 0,
          result = [];

      while (++index < length) {
        var value = array[index];
        if (value) {
          result.push(value);
        }
      }
      return result;
    }

    /**
     * Creates an array of `array` elements not present in the other arrays
     * using strict equality for comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to process.
     * @param {Array} [array1, array2, ...] Arrays to check.
     * @returns {Array} Returns a new array of `array` elements not present in the
     *  other arrays.
     * @example
     *
     * _.difference([1, 2, 3, 4, 5], [5, 2, 10]);
     * // => [1, 3, 4]
     */
    function difference(array) {
      var index = -1,
          length = array ? array.length : 0,
          flattened = concat.apply(arrayRef, arguments),
          contains = cachedContains(flattened, length, 100),
          result = [];

      while (++index < length) {
        var value = array[index];
        if (!contains(value)) {
          result.push(value);
        }
      }
      return result;
    }

    /**
     * This method is similar to `_.find`, except that it returns the index of
     * the element that passes the callback check, instead of the element itself.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array|Object|String} collection The collection to iterate over.
     * @param {Function|Object|String} [callback=identity] The function called per
     *  iteration. If a property name or object is passed, it will be used to create
     *  a "_.pluck" or "_.where" style callback, respectively.
     * @param {Mixed} [thisArg] The `this` binding of `callback`.
     * @returns {Mixed} Returns the index of the found element, else `-1`.
     * @example
     *
     * _.findIndex(['apple', 'banana', 'beet'], function(food) { return /^b/.test(food); });
     * // => 1
     */
    function findIndex(collection, callback, thisArg) {
      var index = -1,
          length = collection ? collection.length : 0;

      callback = lodash.createCallback(callback, thisArg);
      while (++index < length) {
        if (callback(collection[index], index, collection)) {
          return index;
        }
      }
      return -1;
    }

    /**
     * Gets the first element of the `array`. If a number `n` is passed, the first
     * `n` elements of the `array` are returned. If a `callback` function is passed,
     * elements at the beginning of the array are returned as long as the `callback`
     * returns truthy. The `callback` is bound to `thisArg` and invoked with three
     * arguments; (value, index, array).
     *
     * If a property name is passed for `callback`, the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is passed for `callback`, the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias head, take
     * @category Arrays
     * @param {Array} array The array to query.
     * @param {Function|Object|Number|String} [callback|n] The function called
     *  per element or the number of elements to return. If a property name or
     *  object is passed, it will be used to create a "_.pluck" or "_.where"
     *  style callback, respectively.
     * @param {Mixed} [thisArg] The `this` binding of `callback`.
     * @returns {Mixed} Returns the first element(s) of `array`.
     * @example
     *
     * _.first([1, 2, 3]);
     * // => 1
     *
     * _.first([1, 2, 3], 2);
     * // => [1, 2]
     *
     * _.first([1, 2, 3], function(num) {
     *   return num < 3;
     * });
     * // => [1, 2]
     *
     * var food = [
     *   { 'name': 'banana', 'organic': true },
     *   { 'name': 'beet',   'organic': false },
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.first(food, 'organic');
     * // => [{ 'name': 'banana', 'organic': true }]
     *
     * var food = [
     *   { 'name': 'apple',  'type': 'fruit' },
     *   { 'name': 'banana', 'type': 'fruit' },
     *   { 'name': 'beet',   'type': 'vegetable' }
     * ];
     *
     * // using "_.where" callback shorthand
     * _.first(food, { 'type': 'fruit' });
     * // => [{ 'name': 'apple', 'type': 'fruit' }, { 'name': 'banana', 'type': 'fruit' }]
     */
    function first(array, callback, thisArg) {
      if (array) {
        var n = 0,
            length = array.length;

        if (typeof callback != 'number' && callback != null) {
          var index = -1;
          callback = lodash.createCallback(callback, thisArg);
          while (++index < length && callback(array[index], index, array)) {
            n++;
          }
        } else {
          n = callback;
          if (n == null || thisArg) {
            return array[0];
          }
        }
        return slice(array, 0, nativeMin(nativeMax(0, n), length));
      }
    }

    /**
     * Flattens a nested array (the nesting can be to any depth). If `isShallow`
     * is truthy, `array` will only be flattened a single level. If `callback`
     * is passed, each element of `array` is passed through a callback` before
     * flattening. The `callback` is bound to `thisArg` and invoked with three
     * arguments; (value, index, array).
     *
     * If a property name is passed for `callback`, the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is passed for `callback`, the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to compact.
     * @param {Boolean} [isShallow=false] A flag to indicate only flattening a single level.
     * @param {Function|Object|String} [callback=identity] The function called per
     *  iteration. If a property name or object is passed, it will be used to create
     *  a "_.pluck" or "_.where" style callback, respectively.
     * @param {Mixed} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new flattened array.
     * @example
     *
     * _.flatten([1, [2], [3, [[4]]]]);
     * // => [1, 2, 3, 4];
     *
     * _.flatten([1, [2], [3, [[4]]]], true);
     * // => [1, 2, 3, [[4]]];
     *
     * var stooges = [
     *   { 'name': 'curly', 'quotes': ['Oh, a wise guy, eh?', 'Poifect!'] },
     *   { 'name': 'moe', 'quotes': ['Spread out!', 'You knucklehead!'] }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.flatten(stooges, 'quotes');
     * // => ['Oh, a wise guy, eh?', 'Poifect!', 'Spread out!', 'You knucklehead!']
     */
    function flatten(array, isShallow, callback, thisArg) {
      var index = -1,
          length = array ? array.length : 0,
          result = [];

      // juggle arguments
      if (typeof isShallow != 'boolean' && isShallow != null) {
        thisArg = callback;
        callback = isShallow;
        isShallow = false;
      }
      if (callback != null) {
        callback = lodash.createCallback(callback, thisArg);
      }
      while (++index < length) {
        var value = array[index];
        if (callback) {
          value = callback(value, index, array);
        }
        // recursively flatten arrays (susceptible to call stack limits)
        if (isArray(value)) {
          push.apply(result, isShallow ? value : flatten(value));
        } else {
          result.push(value);
        }
      }
      return result;
    }

    /**
     * Gets the index at which the first occurrence of `value` is found using
     * strict equality for comparisons, i.e. `===`. If the `array` is already
     * sorted, passing `true` for `fromIndex` will run a faster binary search.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to search.
     * @param {Mixed} value The value to search for.
     * @param {Boolean|Number} [fromIndex=0] The index to search from or `true` to
     *  perform a binary search on a sorted `array`.
     * @returns {Number} Returns the index of the matched value or `-1`.
     * @example
     *
     * _.indexOf([1, 2, 3, 1, 2, 3], 2);
     * // => 1
     *
     * _.indexOf([1, 2, 3, 1, 2, 3], 2, 3);
     * // => 4
     *
     * _.indexOf([1, 1, 2, 2, 3, 3], 2, true);
     * // => 2
     */
    function indexOf(array, value, fromIndex) {
      var index = -1,
          length = array ? array.length : 0;

      if (typeof fromIndex == 'number') {
        index = (fromIndex < 0 ? nativeMax(0, length + fromIndex) : fromIndex || 0) - 1;
      } else if (fromIndex) {
        index = sortedIndex(array, value);
        return array[index] === value ? index : -1;
      }
      while (++index < length) {
        if (array[index] === value) {
          return index;
        }
      }
      return -1;
    }

    /**
     * Gets all but the last element of `array`. If a number `n` is passed, the
     * last `n` elements are excluded from the result. If a `callback` function
     * is passed, elements at the end of the array are excluded from the result
     * as long as the `callback` returns truthy. The `callback` is bound to
     * `thisArg` and invoked with three arguments; (value, index, array).
     *
     * If a property name is passed for `callback`, the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is passed for `callback`, the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to query.
     * @param {Function|Object|Number|String} [callback|n=1] The function called
     *  per element or the number of elements to exclude. If a property name or
     *  object is passed, it will be used to create a "_.pluck" or "_.where"
     *  style callback, respectively.
     * @param {Mixed} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a slice of `array`.
     * @example
     *
     * _.initial([1, 2, 3]);
     * // => [1, 2]
     *
     * _.initial([1, 2, 3], 2);
     * // => [1]
     *
     * _.initial([1, 2, 3], function(num) {
     *   return num > 1;
     * });
     * // => [1]
     *
     * var food = [
     *   { 'name': 'beet',   'organic': false },
     *   { 'name': 'carrot', 'organic': true }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.initial(food, 'organic');
     * // => [{ 'name': 'beet',   'organic': false }]
     *
     * var food = [
     *   { 'name': 'banana', 'type': 'fruit' },
     *   { 'name': 'beet',   'type': 'vegetable' },
     *   { 'name': 'carrot', 'type': 'vegetable' }
     * ];
     *
     * // using "_.where" callback shorthand
     * _.initial(food, { 'type': 'vegetable' });
     * // => [{ 'name': 'banana', 'type': 'fruit' }]
     */
    function initial(array, callback, thisArg) {
      if (!array) {
        return [];
      }
      var n = 0,
          length = array.length;

      if (typeof callback != 'number' && callback != null) {
        var index = length;
        callback = lodash.createCallback(callback, thisArg);
        while (index-- && callback(array[index], index, array)) {
          n++;
        }
      } else {
        n = (callback == null || thisArg) ? 1 : callback || n;
      }
      return slice(array, 0, nativeMin(nativeMax(0, length - n), length));
    }

    /**
     * Computes the intersection of all the passed-in arrays using strict equality
     * for comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} [array1, array2, ...] Arrays to process.
     * @returns {Array} Returns a new array of unique elements that are present
     *  in **all** of the arrays.
     * @example
     *
     * _.intersection([1, 2, 3], [101, 2, 1, 10], [2, 1]);
     * // => [1, 2]
     */
    function intersection(array) {
      var args = arguments,
          argsLength = args.length,
          cache = { '0': {} },
          index = -1,
          length = array ? array.length : 0,
          isLarge = length >= 100,
          result = [],
          seen = result;

      outer:
      while (++index < length) {
        var value = array[index];
        if (isLarge) {
          var key = String(value);
          var inited = hasOwnProperty.call(cache[0], key)
            ? !(seen = cache[0][key])
            : (seen = cache[0][key] = []);
        }
        if (inited || indexOf(seen, value) < 0) {
          if (isLarge) {
            seen.push(value);
          }
          var argsIndex = argsLength;
          while (--argsIndex) {
            if (!(cache[argsIndex] || (cache[argsIndex] = cachedContains(args[argsIndex], 0, 100)))(value)) {
              continue outer;
            }
          }
          result.push(value);
        }
      }
      return result;
    }

    /**
     * Gets the last element of the `array`. If a number `n` is passed, the
     * last `n` elements of the `array` are returned. If a `callback` function
     * is passed, elements at the end of the array are returned as long as the
     * `callback` returns truthy. The `callback` is bound to `thisArg` and
     * invoked with three arguments;(value, index, array).
     *
     *
     * If a property name is passed for `callback`, the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is passed for `callback`, the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to query.
     * @param {Function|Object|Number|String} [callback|n] The function called
     *  per element or the number of elements to return. If a property name or
     *  object is passed, it will be used to create a "_.pluck" or "_.where"
     *  style callback, respectively.
     * @param {Mixed} [thisArg] The `this` binding of `callback`.
     * @returns {Mixed} Returns the last element(s) of `array`.
     * @example
     *
     * _.last([1, 2, 3]);
     * // => 3
     *
     * _.last([1, 2, 3], 2);
     * // => [2, 3]
     *
     * _.last([1, 2, 3], function(num) {
     *   return num > 1;
     * });
     * // => [2, 3]
     *
     * var food = [
     *   { 'name': 'beet',   'organic': false },
     *   { 'name': 'carrot', 'organic': true }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.last(food, 'organic');
     * // => [{ 'name': 'carrot', 'organic': true }]
     *
     * var food = [
     *   { 'name': 'banana', 'type': 'fruit' },
     *   { 'name': 'beet',   'type': 'vegetable' },
     *   { 'name': 'carrot', 'type': 'vegetable' }
     * ];
     *
     * // using "_.where" callback shorthand
     * _.last(food, { 'type': 'vegetable' });
     * // => [{ 'name': 'beet', 'type': 'vegetable' }, { 'name': 'carrot', 'type': 'vegetable' }]
     */
    function last(array, callback, thisArg) {
      if (array) {
        var n = 0,
            length = array.length;

        if (typeof callback != 'number' && callback != null) {
          var index = length;
          callback = lodash.createCallback(callback, thisArg);
          while (index-- && callback(array[index], index, array)) {
            n++;
          }
        } else {
          n = callback;
          if (n == null || thisArg) {
            return array[length - 1];
          }
        }
        return slice(array, nativeMax(0, length - n));
      }
    }

    /**
     * Gets the index at which the last occurrence of `value` is found using strict
     * equality for comparisons, i.e. `===`. If `fromIndex` is negative, it is used
     * as the offset from the end of the collection.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to search.
     * @param {Mixed} value The value to search for.
     * @param {Number} [fromIndex=array.length-1] The index to search from.
     * @returns {Number} Returns the index of the matched value or `-1`.
     * @example
     *
     * _.lastIndexOf([1, 2, 3, 1, 2, 3], 2);
     * // => 4
     *
     * _.lastIndexOf([1, 2, 3, 1, 2, 3], 2, 3);
     * // => 1
     */
    function lastIndexOf(array, value, fromIndex) {
      var index = array ? array.length : 0;
      if (typeof fromIndex == 'number') {
        index = (fromIndex < 0 ? nativeMax(0, index + fromIndex) : nativeMin(fromIndex, index - 1)) + 1;
      }
      while (index--) {
        if (array[index] === value) {
          return index;
        }
      }
      return -1;
    }

    /**
     * Creates an array of numbers (positive and/or negative) progressing from
     * `start` up to but not including `end`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Number} [start=0] The start of the range.
     * @param {Number} end The end of the range.
     * @param {Number} [step=1] The value to increment or decrement by.
     * @returns {Array} Returns a new range array.
     * @example
     *
     * _.range(10);
     * // => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
     *
     * _.range(1, 11);
     * // => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
     *
     * _.range(0, 30, 5);
     * // => [0, 5, 10, 15, 20, 25]
     *
     * _.range(0, -10, -1);
     * // => [0, -1, -2, -3, -4, -5, -6, -7, -8, -9]
     *
     * _.range(0);
     * // => []
     */
    function range(start, end, step) {
      start = +start || 0;
      step = +step || 1;

      if (end == null) {
        end = start;
        start = 0;
      }
      // use `Array(length)` so V8 will avoid the slower "dictionary" mode
      // http://youtu.be/XAqIpGU8ZZk#t=17m25s
      var index = -1,
          length = nativeMax(0, ceil((end - start) / step)),
          result = Array(length);

      while (++index < length) {
        result[index] = start;
        start += step;
      }
      return result;
    }

    /**
     * The opposite of `_.initial`, this method gets all but the first value of
     * `array`. If a number `n` is passed, the first `n` values are excluded from
     * the result. If a `callback` function is passed, elements at the beginning
     * of the array are excluded from the result as long as the `callback` returns
     * truthy. The `callback` is bound to `thisArg` and invoked with three
     * arguments; (value, index, array).
     *
     * If a property name is passed for `callback`, the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is passed for `callback`, the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias drop, tail
     * @category Arrays
     * @param {Array} array The array to query.
     * @param {Function|Object|Number|String} [callback|n=1] The function called
     *  per element or the number of elements to exclude. If a property name or
     *  object is passed, it will be used to create a "_.pluck" or "_.where"
     *  style callback, respectively.
     * @param {Mixed} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a slice of `array`.
     * @example
     *
     * _.rest([1, 2, 3]);
     * // => [2, 3]
     *
     * _.rest([1, 2, 3], 2);
     * // => [3]
     *
     * _.rest([1, 2, 3], function(num) {
     *   return num < 3;
     * });
     * // => [3]
     *
     * var food = [
     *   { 'name': 'banana', 'organic': true },
     *   { 'name': 'beet',   'organic': false },
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.rest(food, 'organic');
     * // => [{ 'name': 'beet', 'organic': false }]
     *
     * var food = [
     *   { 'name': 'apple',  'type': 'fruit' },
     *   { 'name': 'banana', 'type': 'fruit' },
     *   { 'name': 'beet',   'type': 'vegetable' }
     * ];
     *
     * // using "_.where" callback shorthand
     * _.rest(food, { 'type': 'fruit' });
     * // => [{ 'name': 'beet', 'type': 'vegetable' }]
     */
    function rest(array, callback, thisArg) {
      if (typeof callback != 'number' && callback != null) {
        var n = 0,
            index = -1,
            length = array ? array.length : 0;

        callback = lodash.createCallback(callback, thisArg);
        while (++index < length && callback(array[index], index, array)) {
          n++;
        }
      } else {
        n = (callback == null || thisArg) ? 1 : nativeMax(0, callback);
      }
      return slice(array, n);
    }

    /**
     * Uses a binary search to determine the smallest index at which the `value`
     * should be inserted into `array` in order to maintain the sort order of the
     * sorted `array`. If `callback` is passed, it will be executed for `value` and
     * each element in `array` to compute their sort ranking. The `callback` is
     * bound to `thisArg` and invoked with one argument; (value).
     *
     * If a property name is passed for `callback`, the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is passed for `callback`, the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to iterate over.
     * @param {Mixed} value The value to evaluate.
     * @param {Function|Object|String} [callback=identity] The function called per
     *  iteration. If a property name or object is passed, it will be used to create
     *  a "_.pluck" or "_.where" style callback, respectively.
     * @param {Mixed} [thisArg] The `this` binding of `callback`.
     * @returns {Number} Returns the index at which the value should be inserted
     *  into `array`.
     * @example
     *
     * _.sortedIndex([20, 30, 50], 40);
     * // => 2
     *
     * // using "_.pluck" callback shorthand
     * _.sortedIndex([{ 'x': 20 }, { 'x': 30 }, { 'x': 50 }], { 'x': 40 }, 'x');
     * // => 2
     *
     * var dict = {
     *   'wordToNumber': { 'twenty': 20, 'thirty': 30, 'fourty': 40, 'fifty': 50 }
     * };
     *
     * _.sortedIndex(['twenty', 'thirty', 'fifty'], 'fourty', function(word) {
     *   return dict.wordToNumber[word];
     * });
     * // => 2
     *
     * _.sortedIndex(['twenty', 'thirty', 'fifty'], 'fourty', function(word) {
     *   return this.wordToNumber[word];
     * }, dict);
     * // => 2
     */
    function sortedIndex(array, value, callback, thisArg) {
      var low = 0,
          high = array ? array.length : low;

      // explicitly reference `identity` for better inlining in Firefox
      callback = callback ? lodash.createCallback(callback, thisArg, 1) : identity;
      value = callback(value);

      while (low < high) {
        var mid = (low + high) >>> 1;
        (callback(array[mid]) < value)
          ? low = mid + 1
          : high = mid;
      }
      return low;
    }

    /**
     * Computes the union of the passed-in arrays using strict equality for
     * comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} [array1, array2, ...] Arrays to process.
     * @returns {Array} Returns a new array of unique values, in order, that are
     *  present in one or more of the arrays.
     * @example
     *
     * _.union([1, 2, 3], [101, 2, 1, 10], [2, 1]);
     * // => [1, 2, 3, 101, 10]
     */
    function union() {
      return uniq(concat.apply(arrayRef, arguments));
    }

    /**
     * Creates a duplicate-value-free version of the `array` using strict equality
     * for comparisons, i.e. `===`. If the `array` is already sorted, passing `true`
     * for `isSorted` will run a faster algorithm. If `callback` is passed, each
     * element of `array` is passed through a callback` before uniqueness is computed.
     * The `callback` is bound to `thisArg` and invoked with three arguments; (value, index, array).
     *
     * If a property name is passed for `callback`, the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is passed for `callback`, the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias unique
     * @category Arrays
     * @param {Array} array The array to process.
     * @param {Boolean} [isSorted=false] A flag to indicate that the `array` is already sorted.
     * @param {Function|Object|String} [callback=identity] The function called per
     *  iteration. If a property name or object is passed, it will be used to create
     *  a "_.pluck" or "_.where" style callback, respectively.
     * @param {Mixed} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a duplicate-value-free array.
     * @example
     *
     * _.uniq([1, 2, 1, 3, 1]);
     * // => [1, 2, 3]
     *
     * _.uniq([1, 1, 2, 2, 3], true);
     * // => [1, 2, 3]
     *
     * _.uniq([1, 2, 1.5, 3, 2.5], function(num) { return Math.floor(num); });
     * // => [1, 2, 3]
     *
     * _.uniq([1, 2, 1.5, 3, 2.5], function(num) { return this.floor(num); }, Math);
     * // => [1, 2, 3]
     *
     * // using "_.pluck" callback shorthand
     * _.uniq([{ 'x': 1 }, { 'x': 2 }, { 'x': 1 }], 'x');
     * // => [{ 'x': 1 }, { 'x': 2 }]
     */
    function uniq(array, isSorted, callback, thisArg) {
      var index = -1,
          length = array ? array.length : 0,
          result = [],
          seen = result;

      // juggle arguments
      if (typeof isSorted != 'boolean' && isSorted != null) {
        thisArg = callback;
        callback = isSorted;
        isSorted = false;
      }
      // init value cache for large arrays
      var isLarge = !isSorted && length >= 75;
      if (isLarge) {
        var cache = {};
      }
      if (callback != null) {
        seen = [];
        callback = lodash.createCallback(callback, thisArg);
      }
      while (++index < length) {
        var value = array[index],
            computed = callback ? callback(value, index, array) : value;

        if (isLarge) {
          var key = String(computed);
          var inited = hasOwnProperty.call(cache, key)
            ? !(seen = cache[key])
            : (seen = cache[key] = []);
        }
        if (isSorted
              ? !index || seen[seen.length - 1] !== computed
              : inited || indexOf(seen, computed) < 0
            ) {
          if (callback || isLarge) {
            seen.push(computed);
          }
          result.push(value);
        }
      }
      return result;
    }

    /**
     * Creates an array with all occurrences of the passed values removed using
     * strict equality for comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to filter.
     * @param {Mixed} [value1, value2, ...] Values to remove.
     * @returns {Array} Returns a new filtered array.
     * @example
     *
     * _.without([1, 2, 1, 0, 3, 1, 4], 0, 1);
     * // => [2, 3, 4]
     */
    function without(array) {
      var index = -1,
          length = array ? array.length : 0,
          contains = cachedContains(arguments, 1, 30),
          result = [];

      while (++index < length) {
        var value = array[index];
        if (!contains(value)) {
          result.push(value);
        }
      }
      return result;
    }

    /**
     * Groups the elements of each array at their corresponding indexes. Useful for
     * separate data sources that are coordinated through matching array indexes.
     * For a matrix of nested arrays, `_.zip.apply(...)` can transpose the matrix
     * in a similar fashion.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} [array1, array2, ...] Arrays to process.
     * @returns {Array} Returns a new array of grouped elements.
     * @example
     *
     * _.zip(['moe', 'larry'], [30, 40], [true, false]);
     * // => [['moe', 30, true], ['larry', 40, false]]
     */
    function zip(array) {
      var index = -1,
          length = array ? max(pluck(arguments, 'length')) : 0,
          result = Array(length);

      while (++index < length) {
        result[index] = pluck(arguments, index);
      }
      return result;
    }

    /**
     * Creates an object composed from arrays of `keys` and `values`. Pass either
     * a single two dimensional array, i.e. `[[key1, value1], [key2, value2]]`, or
     * two arrays, one of `keys` and one of corresponding `values`.
     *
     * @static
     * @memberOf _
     * @alias object
     * @category Arrays
     * @param {Array} keys The array of keys.
     * @param {Array} [values=[]] The array of values.
     * @returns {Object} Returns an object composed of the given keys and
     *  corresponding values.
     * @example
     *
     * _.zipObject(['moe', 'larry'], [30, 40]);
     * // => { 'moe': 30, 'larry': 40 }
     */
    function zipObject(keys, values) {
      var index = -1,
          length = keys ? keys.length : 0,
          result = {};

      while (++index < length) {
        var key = keys[index];
        if (values) {
          result[key] = values[index];
        } else {
          result[key[0]] = key[1];
        }
      }
      return result;
    }

    /*--------------------------------------------------------------------------*/

    /**
     * If `n` is greater than `0`, a function is created that is restricted to
     * executing `func`, with the `this` binding and arguments of the created
     * function, only after it is called `n` times. If `n` is less than `1`,
     * `func` is executed immediately, without a `this` binding or additional
     * arguments, and its result is returned.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Number} n The number of times the function must be called before
     * it is executed.
     * @param {Function} func The function to restrict.
     * @returns {Function} Returns the new restricted function.
     * @example
     *
     * var renderNotes = _.after(notes.length, render);
     * _.forEach(notes, function(note) {
     *   note.asyncSave({ 'success': renderNotes });
     * });
     * // `renderNotes` is run once, after all notes have saved
     */
    function after(n, func) {
      if (n < 1) {
        return func();
      }
      return function() {
        if (--n < 1) {
          return func.apply(this, arguments);
        }
      };
    }

    /**
     * Creates a function that, when called, invokes `func` with the `this`
     * binding of `thisArg` and prepends any additional `bind` arguments to those
     * passed to the bound function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to bind.
     * @param {Mixed} [thisArg] The `this` binding of `func`.
     * @param {Mixed} [arg1, arg2, ...] Arguments to be partially applied.
     * @returns {Function} Returns the new bound function.
     * @example
     *
     * var func = function(greeting) {
     *   return greeting + ' ' + this.name;
     * };
     *
     * func = _.bind(func, { 'name': 'moe' }, 'hi');
     * func();
     * // => 'hi moe'
     */
    function bind(func, thisArg) {
      // use `Function#bind` if it exists and is fast
      // (in V8 `Function#bind` is slower except when partially applied)
      return support.fastBind || (nativeBind && arguments.length > 2)
        ? nativeBind.call.apply(nativeBind, arguments)
        : createBound(func, thisArg, slice(arguments, 2));
    }

    /**
     * Binds methods on `object` to `object`, overwriting the existing method.
     * Method names may be specified as individual arguments or as arrays of method
     * names. If no method names are provided, all the function properties of `object`
     * will be bound.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Object} object The object to bind and assign the bound methods to.
     * @param {String} [methodName1, methodName2, ...] Method names on the object to bind.
     * @returns {Object} Returns `object`.
     * @example
     *
     * var view = {
     *  'label': 'docs',
     *  'onClick': function() { alert('clicked ' + this.label); }
     * };
     *
     * _.bindAll(view);
     * jQuery('#docs').on('click', view.onClick);
     * // => alerts 'clicked docs', when the button is clicked
     */
    function bindAll(object) {
      var funcs = concat.apply(arrayRef, arguments),
          index = funcs.length > 1 ? 0 : (funcs = functions(object), -1),
          length = funcs.length;

      while (++index < length) {
        var key = funcs[index];
        object[key] = bind(object[key], object);
      }
      return object;
    }

    /**
     * Creates a function that, when called, invokes the method at `object[key]`
     * and prepends any additional `bindKey` arguments to those passed to the bound
     * function. This method differs from `_.bind` by allowing bound functions to
     * reference methods that will be redefined or don't yet exist.
     * See http://michaux.ca/articles/lazy-function-definition-pattern.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Object} object The object the method belongs to.
     * @param {String} key The key of the method.
     * @param {Mixed} [arg1, arg2, ...] Arguments to be partially applied.
     * @returns {Function} Returns the new bound function.
     * @example
     *
     * var object = {
     *   'name': 'moe',
     *   'greet': function(greeting) {
     *     return greeting + ' ' + this.name;
     *   }
     * };
     *
     * var func = _.bindKey(object, 'greet', 'hi');
     * func();
     * // => 'hi moe'
     *
     * object.greet = function(greeting) {
     *   return greeting + ', ' + this.name + '!';
     * };
     *
     * func();
     * // => 'hi, moe!'
     */
    function bindKey(object, key) {
      return createBound(object, key, slice(arguments, 2), indicatorObject);
    }

    /**
     * Creates a function that is the composition of the passed functions,
     * where each function consumes the return value of the function that follows.
     * For example, composing the functions `f()`, `g()`, and `h()` produces `f(g(h()))`.
     * Each function is executed with the `this` binding of the composed function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} [func1, func2, ...] Functions to compose.
     * @returns {Function} Returns the new composed function.
     * @example
     *
     * var greet = function(name) { return 'hi ' + name; };
     * var exclaim = function(statement) { return statement + '!'; };
     * var welcome = _.compose(exclaim, greet);
     * welcome('moe');
     * // => 'hi moe!'
     */
    function compose() {
      var funcs = arguments;
      return function() {
        var args = arguments,
            length = funcs.length;

        while (length--) {
          args = [funcs[length].apply(this, args)];
        }
        return args[0];
      };
    }

    /**
     * Produces a callback bound to an optional `thisArg`. If `func` is a property
     * name, the created callback will return the property value for a given element.
     * If `func` is an object, the created callback will return `true` for elements
     * that contain the equivalent object properties, otherwise it will return `false`.
     *
     * Note: All Lo-Dash methods, that accept a `callback` argument, use `_.createCallback`.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Mixed} [func=identity] The value to convert to a callback.
     * @param {Mixed} [thisArg] The `this` binding of the created callback.
     * @param {Number} [argCount=3] The number of arguments the callback accepts.
     * @returns {Function} Returns a callback function.
     * @example
     *
     * var stooges = [
     *   { 'name': 'moe', 'age': 40 },
     *   { 'name': 'larry', 'age': 50 }
     * ];
     *
     * // wrap to create custom callback shorthands
     * _.createCallback = _.wrap(_.createCallback, function(func, callback, thisArg) {
     *   var match = /^(.+?)__([gl]t)(.+)$/.exec(callback);
     *   return !match ? func(callback, thisArg) : function(object) {
     *     return match[2] == 'gt' ? object[match[1]] > match[3] : object[match[1]] < match[3];
     *   };
     * });
     *
     * _.filter(stooges, 'age__gt45');
     * // => [{ 'name': 'larry', 'age': 50 }]
     *
     * // create mixins with support for "_.pluck" and "_.where" callback shorthands
     * _.mixin({
     *   'toLookup': function(collection, callback, thisArg) {
     *     callback = _.createCallback(callback, thisArg);
     *     return _.reduce(collection, function(result, value, index, collection) {
     *       return (result[callback(value, index, collection)] = value, result);
     *     }, {});
     *   }
     * });
     *
     * _.toLookup(stooges, 'name');
     * // => { 'moe': { 'name': 'moe', 'age': 40 }, 'larry': { 'name': 'larry', 'age': 50 } }
     */
    function createCallback(func, thisArg, argCount) {
      if (func == null) {
        return identity;
      }
      var type = typeof func;
      if (type != 'function') {
        if (type != 'object') {
          return function(object) {
            return object[func];
          };
        }
        var props = keys(func);
        return function(object) {
          var length = props.length,
              result = false;
          while (length--) {
            if (!(result = isEqual(object[props[length]], func[props[length]], indicatorObject))) {
              break;
            }
          }
          return result;
        };
      }
      if (typeof thisArg != 'undefined') {
        if (argCount === 1) {
          return function(value) {
            return func.call(thisArg, value);
          };
        }
        if (argCount === 2) {
          return function(a, b) {
            return func.call(thisArg, a, b);
          };
        }
        if (argCount === 4) {
          return function(accumulator, value, index, collection) {
            return func.call(thisArg, accumulator, value, index, collection);
          };
        }
        return function(value, index, collection) {
          return func.call(thisArg, value, index, collection);
        };
      }
      return func;
    }

    /**
     * Creates a function that will delay the execution of `func` until after
     * `wait` milliseconds have elapsed since the last time it was invoked. Pass
     * `true` for `immediate` to cause debounce to invoke `func` on the leading,
     * instead of the trailing, edge of the `wait` timeout. Subsequent calls to
     * the debounced function will return the result of the last `func` call.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to debounce.
     * @param {Number} wait The number of milliseconds to delay.
     * @param {Boolean} immediate A flag to indicate execution is on the leading
     *  edge of the timeout.
     * @returns {Function} Returns the new debounced function.
     * @example
     *
     * var lazyLayout = _.debounce(calculateLayout, 300);
     * jQuery(window).on('resize', lazyLayout);
     */
    function debounce(func, wait, immediate) {
      var args,
          result,
          thisArg,
          timeoutId;

      function delayed() {
        timeoutId = null;
        if (!immediate) {
          result = func.apply(thisArg, args);
        }
      }
      return function() {
        var isImmediate = immediate && !timeoutId;
        args = arguments;
        thisArg = this;

        clearTimeout(timeoutId);
        timeoutId = setTimeout(delayed, wait);

        if (isImmediate) {
          result = func.apply(thisArg, args);
        }
        return result;
      };
    }

    /**
     * Defers executing the `func` function until the current call stack has cleared.
     * Additional arguments will be passed to `func` when it is invoked.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to defer.
     * @param {Mixed} [arg1, arg2, ...] Arguments to invoke the function with.
     * @returns {Number} Returns the timer id.
     * @example
     *
     * _.defer(function() { alert('deferred'); });
     * // returns from the function before `alert` is called
     */
    function defer(func) {
      var args = slice(arguments, 1);
      return setTimeout(function() { func.apply(undefined, args); }, 1);
    }
    // use `setImmediate` if it's available in Node.js
    if (isV8 && freeModule && typeof setImmediate == 'function') {
      defer = bind(setImmediate, context);
    }

    /**
     * Executes the `func` function after `wait` milliseconds. Additional arguments
     * will be passed to `func` when it is invoked.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to delay.
     * @param {Number} wait The number of milliseconds to delay execution.
     * @param {Mixed} [arg1, arg2, ...] Arguments to invoke the function with.
     * @returns {Number} Returns the timer id.
     * @example
     *
     * var log = _.bind(console.log, console);
     * _.delay(log, 1000, 'logged later');
     * // => 'logged later' (Appears after one second.)
     */
    function delay(func, wait) {
      var args = slice(arguments, 2);
      return setTimeout(function() { func.apply(undefined, args); }, wait);
    }

    /**
     * Creates a function that memoizes the result of `func`. If `resolver` is
     * passed, it will be used to determine the cache key for storing the result
     * based on the arguments passed to the memoized function. By default, the first
     * argument passed to the memoized function is used as the cache key. The `func`
     * is executed with the `this` binding of the memoized function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to have its output memoized.
     * @param {Function} [resolver] A function used to resolve the cache key.
     * @returns {Function} Returns the new memoizing function.
     * @example
     *
     * var fibonacci = _.memoize(function(n) {
     *   return n < 2 ? n : fibonacci(n - 1) + fibonacci(n - 2);
     * });
     */
    function memoize(func, resolver) {
      var cache = {};
      return function() {
        var key = String(resolver ? resolver.apply(this, arguments) : arguments[0]);
        return hasOwnProperty.call(cache, key)
          ? cache[key]
          : (cache[key] = func.apply(this, arguments));
      };
    }

    /**
     * Creates a function that is restricted to execute `func` once. Repeat calls to
     * the function will return the value of the first call. The `func` is executed
     * with the `this` binding of the created function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to restrict.
     * @returns {Function} Returns the new restricted function.
     * @example
     *
     * var initialize = _.once(createApplication);
     * initialize();
     * initialize();
     * // `initialize` executes `createApplication` once
     */
    function once(func) {
      var ran,
          result;

      return function() {
        if (ran) {
          return result;
        }
        ran = true;
        result = func.apply(this, arguments);

        // clear the `func` variable so the function may be garbage collected
        func = null;
        return result;
      };
    }

    /**
     * Creates a function that, when called, invokes `func` with any additional
     * `partial` arguments prepended to those passed to the new function. This
     * method is similar to `_.bind`, except it does **not** alter the `this` binding.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to partially apply arguments to.
     * @param {Mixed} [arg1, arg2, ...] Arguments to be partially applied.
     * @returns {Function} Returns the new partially applied function.
     * @example
     *
     * var greet = function(greeting, name) { return greeting + ' ' + name; };
     * var hi = _.partial(greet, 'hi');
     * hi('moe');
     * // => 'hi moe'
     */
    function partial(func) {
      return createBound(func, slice(arguments, 1));
    }

    /**
     * This method is similar to `_.partial`, except that `partial` arguments are
     * appended to those passed to the new function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to partially apply arguments to.
     * @param {Mixed} [arg1, arg2, ...] Arguments to be partially applied.
     * @returns {Function} Returns the new partially applied function.
     * @example
     *
     * var defaultsDeep = _.partialRight(_.merge, _.defaults);
     *
     * var options = {
     *   'variable': 'data',
     *   'imports': { 'jq': $ }
     * };
     *
     * defaultsDeep(options, _.templateSettings);
     *
     * options.variable
     * // => 'data'
     *
     * options.imports
     * // => { '_': _, 'jq': $ }
     */
    function partialRight(func) {
      return createBound(func, slice(arguments, 1), null, indicatorObject);
    }

    /**
     * Creates a function that, when executed, will only call the `func`
     * function at most once per every `wait` milliseconds. If the throttled
     * function is invoked more than once during the `wait` timeout, `func` will
     * also be called on the trailing edge of the timeout. Subsequent calls to the
     * throttled function will return the result of the last `func` call.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to throttle.
     * @param {Number} wait The number of milliseconds to throttle executions to.
     * @returns {Function} Returns the new throttled function.
     * @example
     *
     * var throttled = _.throttle(updatePosition, 100);
     * jQuery(window).on('scroll', throttled);
     */
    function throttle(func, wait) {
      var args,
          result,
          thisArg,
          timeoutId,
          lastCalled = 0;

      function trailingCall() {
        lastCalled = new Date;
        timeoutId = null;
        result = func.apply(thisArg, args);
      }
      return function() {
        var now = new Date,
            remaining = wait - (now - lastCalled);

        args = arguments;
        thisArg = this;

        if (remaining <= 0) {
          clearTimeout(timeoutId);
          timeoutId = null;
          lastCalled = now;
          result = func.apply(thisArg, args);
        }
        else if (!timeoutId) {
          timeoutId = setTimeout(trailingCall, remaining);
        }
        return result;
      };
    }

    /**
     * Creates a function that passes `value` to the `wrapper` function as its
     * first argument. Additional arguments passed to the function are appended
     * to those passed to the `wrapper` function. The `wrapper` is executed with
     * the `this` binding of the created function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Mixed} value The value to wrap.
     * @param {Function} wrapper The wrapper function.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var hello = function(name) { return 'hello ' + name; };
     * hello = _.wrap(hello, function(func) {
     *   return 'before, ' + func('moe') + ', after';
     * });
     * hello();
     * // => 'before, hello moe, after'
     */
    function wrap(value, wrapper) {
      return function() {
        var args = [value];
        push.apply(args, arguments);
        return wrapper.apply(this, args);
      };
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Converts the characters `&`, `<`, `>`, `"`, and `'` in `string` to their
     * corresponding HTML entities.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {String} string The string to escape.
     * @returns {String} Returns the escaped string.
     * @example
     *
     * _.escape('Moe, Larry & Curly');
     * // => 'Moe, Larry &amp; Curly'
     */
    function escape(string) {
      return string == null ? '' : String(string).replace(reUnescapedHtml, escapeHtmlChar);
    }

    /**
     * This function returns the first argument passed to it.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {Mixed} value Any value.
     * @returns {Mixed} Returns `value`.
     * @example
     *
     * var moe = { 'name': 'moe' };
     * moe === _.identity(moe);
     * // => true
     */
    function identity(value) {
      return value;
    }

    /**
     * Adds functions properties of `object` to the `lodash` function and chainable
     * wrapper.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {Object} object The object of function properties to add to `lodash`.
     * @example
     *
     * _.mixin({
     *   'capitalize': function(string) {
     *     return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
     *   }
     * });
     *
     * _.capitalize('moe');
     * // => 'Moe'
     *
     * _('moe').capitalize();
     * // => 'Moe'
     */
    function mixin(object) {
      forEach(functions(object), function(methodName) {
        var func = lodash[methodName] = object[methodName];

        lodash.prototype[methodName] = function() {
          var value = this.__wrapped__,
              args = [value];

          push.apply(args, arguments);
          var result = func.apply(lodash, args);
          return (value && typeof value == 'object' && value == result)
            ? this
            : new lodashWrapper(result);
        };
      });
    }

    /**
     * Reverts the '_' variable to its previous value and returns a reference to
     * the `lodash` function.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @returns {Function} Returns the `lodash` function.
     * @example
     *
     * var lodash = _.noConflict();
     */
    function noConflict() {
      context._ = oldDash;
      return this;
    }

    /**
     * Converts the given `value` into an integer of the specified `radix`.
     *
     * Note: This method avoids differences in native ES3 and ES5 `parseInt`
     * implementations. See http://es5.github.com/#E.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {Mixed} value The value to parse.
     * @returns {Number} Returns the new integer value.
     * @example
     *
     * _.parseInt('08');
     * // => 8
     */
    var parseInt = nativeParseInt('08') == 8 ? nativeParseInt : function(value, radix) {
      // Firefox and Opera still follow the ES3 specified implementation of `parseInt`
      return nativeParseInt(isString(value) ? value.replace(reLeadingZeros, '') : value, radix || 0);
    };

    /**
     * Produces a random number between `min` and `max` (inclusive). If only one
     * argument is passed, a number between `0` and the given number will be returned.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {Number} [min=0] The minimum possible value.
     * @param {Number} [max=1] The maximum possible value.
     * @returns {Number} Returns a random number.
     * @example
     *
     * _.random(0, 5);
     * // => a number between 0 and 5
     *
     * _.random(5);
     * // => also a number between 0 and 5
     */
    function random(min, max) {
      if (min == null && max == null) {
        max = 1;
      }
      min = +min || 0;
      if (max == null) {
        max = min;
        min = 0;
      }
      return min + floor(nativeRandom() * ((+max || 0) - min + 1));
    }

    /**
     * Resolves the value of `property` on `object`. If `property` is a function,
     * it will be invoked with the `this` binding of `object` and its result returned,
     * else the property value is returned. If `object` is falsey, then `undefined`
     * is returned.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {Object} object The object to inspect.
     * @param {String} property The property to get the value of.
     * @returns {Mixed} Returns the resolved value.
     * @example
     *
     * var object = {
     *   'cheese': 'crumpets',
     *   'stuff': function() {
     *     return 'nonsense';
     *   }
     * };
     *
     * _.result(object, 'cheese');
     * // => 'crumpets'
     *
     * _.result(object, 'stuff');
     * // => 'nonsense'
     */
    function result(object, property) {
      var value = object ? object[property] : undefined;
      return isFunction(value) ? object[property]() : value;
    }

    /**
     * A micro-templating method that handles arbitrary delimiters, preserves
     * whitespace, and correctly escapes quotes within interpolated code.
     *
     * Note: In the development build, `_.template` utilizes sourceURLs for easier
     * debugging. See http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/#toc-sourceurl
     *
     * Note: Lo-Dash may be used in Chrome extensions by either creating a `lodash csp`
     * build and using precompiled templates, or loading Lo-Dash in a sandbox.
     *
     * For more information on precompiling templates see:
     * http://lodash.com/#custom-builds
     *
     * For more information on Chrome extension sandboxes see:
     * http://developer.chrome.com/stable/extensions/sandboxingEval.html
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {String} text The template text.
     * @param {Obect} data The data object used to populate the text.
     * @param {Object} options The options object.
     *  escape - The "escape" delimiter regexp.
     *  evaluate - The "evaluate" delimiter regexp.
     *  interpolate - The "interpolate" delimiter regexp.
     *  sourceURL - The sourceURL of the template's compiled source.
     *  variable - The data object variable name.
     * @returns {Function|String} Returns a compiled function when no `data` object
     *  is given, else it returns the interpolated text.
     * @example
     *
     * // using a compiled template
     * var compiled = _.template('hello <%= name %>');
     * compiled({ 'name': 'moe' });
     * // => 'hello moe'
     *
     * var list = '<% _.forEach(people, function(name) { %><li><%= name %></li><% }); %>';
     * _.template(list, { 'people': ['moe', 'larry'] });
     * // => '<li>moe</li><li>larry</li>'
     *
     * // using the "escape" delimiter to escape HTML in data property values
     * _.template('<b><%- value %></b>', { 'value': '<script>' });
     * // => '<b>&lt;script&gt;</b>'
     *
     * // using the ES6 delimiter as an alternative to the default "interpolate" delimiter
     * _.template('hello ${ name }', { 'name': 'curly' });
     * // => 'hello curly'
     *
     * // using the internal `print` function in "evaluate" delimiters
     * _.template('<% print("hello " + epithet); %>!', { 'epithet': 'stooge' });
     * // => 'hello stooge!'
     *
     * // using custom template delimiters
     * _.templateSettings = {
     *   'interpolate': /{{([\s\S]+?)}}/g
     * };
     *
     * _.template('hello {{ name }}!', { 'name': 'mustache' });
     * // => 'hello mustache!'
     *
     * // using the `sourceURL` option to specify a custom sourceURL for the template
     * var compiled = _.template('hello <%= name %>', null, { 'sourceURL': '/basic/greeting.jst' });
     * compiled(data);
     * // => find the source of "greeting.jst" under the Sources tab or Resources panel of the web inspector
     *
     * // using the `variable` option to ensure a with-statement isn't used in the compiled template
     * var compiled = _.template('hi <%= data.name %>!', null, { 'variable': 'data' });
     * compiled.source;
     * // => function(data) {
     *   var __t, __p = '', __e = _.escape;
     *   __p += 'hi ' + ((__t = ( data.name )) == null ? '' : __t) + '!';
     *   return __p;
     * }
     *
     * // using the `source` property to inline compiled templates for meaningful
     * // line numbers in error messages and a stack trace
     * fs.writeFileSync(path.join(cwd, 'jst.js'), '\
     *   var JST = {\
     *     "main": ' + _.template(mainText).source + '\
     *   };\
     * ');
     */
    function template(text, data, options) {
      // based on John Resig's `tmpl` implementation
      // http://ejohn.org/blog/javascript-micro-templating/
      // and Laura Doktorova's doT.js
      // https://github.com/olado/doT
      var settings = lodash.templateSettings;
      text || (text = '');

      // avoid missing dependencies when `iteratorTemplate` is not defined
      options = defaults({}, options, settings);

      var imports = defaults({}, options.imports, settings.imports),
          importsKeys = keys(imports),
          importsValues = values(imports);

      var isEvaluating,
          index = 0,
          interpolate = options.interpolate || reNoMatch,
          source = "__p += '";

      // compile the regexp to match each delimiter
      var reDelimiters = RegExp(
        (options.escape || reNoMatch).source + '|' +
        interpolate.source + '|' +
        (interpolate === reInterpolate ? reEsTemplate : reNoMatch).source + '|' +
        (options.evaluate || reNoMatch).source + '|$'
      , 'g');

      text.replace(reDelimiters, function(match, escapeValue, interpolateValue, esTemplateValue, evaluateValue, offset) {
        interpolateValue || (interpolateValue = esTemplateValue);

        // escape characters that cannot be included in string literals
        source += text.slice(index, offset).replace(reUnescapedString, escapeStringChar);

        // replace delimiters with snippets
        if (escapeValue) {
          source += "' +\n__e(" + escapeValue + ") +\n'";
        }
        if (evaluateValue) {
          isEvaluating = true;
          source += "';\n" + evaluateValue + ";\n__p += '";
        }
        if (interpolateValue) {
          source += "' +\n((__t = (" + interpolateValue + ")) == null ? '' : __t) +\n'";
        }
        index = offset + match.length;

        // the JS engine embedded in Adobe products requires returning the `match`
        // string in order to produce the correct `offset` value
        return match;
      });

      source += "';\n";

      // if `variable` is not specified, wrap a with-statement around the generated
      // code to add the data object to the top of the scope chain
      var variable = options.variable,
          hasVariable = variable;

      if (!hasVariable) {
        variable = 'obj';
        source = 'with (' + variable + ') {\n' + source + '\n}\n';
      }
      // cleanup code by stripping empty strings
      source = (isEvaluating ? source.replace(reEmptyStringLeading, '') : source)
        .replace(reEmptyStringMiddle, '$1')
        .replace(reEmptyStringTrailing, '$1;');

      // frame code as the function body
      source = 'function(' + variable + ') {\n' +
        (hasVariable ? '' : variable + ' || (' + variable + ' = {});\n') +
        "var __t, __p = '', __e = _.escape" +
        (isEvaluating
          ? ', __j = Array.prototype.join;\n' +
            "function print() { __p += __j.call(arguments, '') }\n"
          : ';\n'
        ) +
        source +
        'return __p\n}';

      // Use a sourceURL for easier debugging and wrap in a multi-line comment to
      // avoid issues with Narwhal, IE conditional compilation, and the JS engine
      // embedded in Adobe products.
      // http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/#toc-sourceurl
      var sourceURL = '\n/*\n//@ sourceURL=' + (options.sourceURL || '/lodash/template/source[' + (templateCounter++) + ']') + '\n*/';

      try {
        var result = Function(importsKeys, 'return ' + source + sourceURL).apply(undefined, importsValues);
      } catch(e) {
        e.source = source;
        throw e;
      }
      if (data) {
        return result(data);
      }
      // provide the compiled function's source via its `toString` method, in
      // supported environments, or the `source` property as a convenience for
      // inlining compiled templates during the build process
      result.source = source;
      return result;
    }

    /**
     * Executes the `callback` function `n` times, returning an array of the results
     * of each `callback` execution. The `callback` is bound to `thisArg` and invoked
     * with one argument; (index).
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {Number} n The number of times to execute the callback.
     * @param {Function} callback The function called per iteration.
     * @param {Mixed} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of the results of each `callback` execution.
     * @example
     *
     * var diceRolls = _.times(3, _.partial(_.random, 1, 6));
     * // => [3, 6, 4]
     *
     * _.times(3, function(n) { mage.castSpell(n); });
     * // => calls `mage.castSpell(n)` three times, passing `n` of `0`, `1`, and `2` respectively
     *
     * _.times(3, function(n) { this.cast(n); }, mage);
     * // => also calls `mage.castSpell(n)` three times
     */
    function times(n, callback, thisArg) {
      n = (n = +n) > -1 ? n : 0;
      var index = -1,
          result = Array(n);

      callback = lodash.createCallback(callback, thisArg, 1);
      while (++index < n) {
        result[index] = callback(index);
      }
      return result;
    }

    /**
     * The opposite of `_.escape`, this method converts the HTML entities
     * `&amp;`, `&lt;`, `&gt;`, `&quot;`, and `&#39;` in `string` to their
     * corresponding characters.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {String} string The string to unescape.
     * @returns {String} Returns the unescaped string.
     * @example
     *
     * _.unescape('Moe, Larry &amp; Curly');
     * // => 'Moe, Larry & Curly'
     */
    function unescape(string) {
      return string == null ? '' : String(string).replace(reEscapedHtml, unescapeHtmlChar);
    }

    /**
     * Generates a unique ID. If `prefix` is passed, the ID will be appended to it.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {String} [prefix] The value to prefix the ID with.
     * @returns {String} Returns the unique ID.
     * @example
     *
     * _.uniqueId('contact_');
     * // => 'contact_104'
     *
     * _.uniqueId();
     * // => '105'
     */
    function uniqueId(prefix) {
      var id = ++idCounter;
      return String(prefix == null ? '' : prefix) + id;
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Invokes `interceptor` with the `value` as the first argument, and then
     * returns `value`. The purpose of this method is to "tap into" a method chain,
     * in order to perform operations on intermediate results within the chain.
     *
     * @static
     * @memberOf _
     * @category Chaining
     * @param {Mixed} value The value to pass to `interceptor`.
     * @param {Function} interceptor The function to invoke.
     * @returns {Mixed} Returns `value`.
     * @example
     *
     * _([1, 2, 3, 4])
     *  .filter(function(num) { return num % 2 == 0; })
     *  .tap(alert)
     *  .map(function(num) { return num * num; })
     *  .value();
     * // => // [2, 4] (alerted)
     * // => [4, 16]
     */
    function tap(value, interceptor) {
      interceptor(value);
      return value;
    }

    /**
     * Produces the `toString` result of the wrapped value.
     *
     * @name toString
     * @memberOf _
     * @category Chaining
     * @returns {String} Returns the string result.
     * @example
     *
     * _([1, 2, 3]).toString();
     * // => '1,2,3'
     */
    function wrapperToString() {
      return String(this.__wrapped__);
    }

    /**
     * Extracts the wrapped value.
     *
     * @name valueOf
     * @memberOf _
     * @alias value
     * @category Chaining
     * @returns {Mixed} Returns the wrapped value.
     * @example
     *
     * _([1, 2, 3]).valueOf();
     * // => [1, 2, 3]
     */
    function wrapperValueOf() {
      return this.__wrapped__;
    }

    /*--------------------------------------------------------------------------*/

    // add functions that return wrapped values when chaining
    lodash.after = after;
    lodash.assign = assign;
    lodash.at = at;
    lodash.bind = bind;
    lodash.bindAll = bindAll;
    lodash.bindKey = bindKey;
    lodash.compact = compact;
    lodash.compose = compose;
    lodash.countBy = countBy;
    lodash.createCallback = createCallback;
    lodash.debounce = debounce;
    lodash.defaults = defaults;
    lodash.defer = defer;
    lodash.delay = delay;
    lodash.difference = difference;
    lodash.filter = filter;
    lodash.flatten = flatten;
    lodash.forEach = forEach;
    lodash.forIn = forIn;
    lodash.forOwn = forOwn;
    lodash.functions = functions;
    lodash.groupBy = groupBy;
    lodash.initial = initial;
    lodash.intersection = intersection;
    lodash.invert = invert;
    lodash.invoke = invoke;
    lodash.keys = keys;
    lodash.map = map;
    lodash.max = max;
    lodash.memoize = memoize;
    lodash.merge = merge;
    lodash.min = min;
    lodash.omit = omit;
    lodash.once = once;
    lodash.pairs = pairs;
    lodash.partial = partial;
    lodash.partialRight = partialRight;
    lodash.pick = pick;
    lodash.pluck = pluck;
    lodash.range = range;
    lodash.reject = reject;
    lodash.rest = rest;
    lodash.shuffle = shuffle;
    lodash.sortBy = sortBy;
    lodash.tap = tap;
    lodash.throttle = throttle;
    lodash.times = times;
    lodash.toArray = toArray;
    lodash.union = union;
    lodash.uniq = uniq;
    lodash.values = values;
    lodash.where = where;
    lodash.without = without;
    lodash.wrap = wrap;
    lodash.zip = zip;
    lodash.zipObject = zipObject;

    // add aliases
    lodash.collect = map;
    lodash.drop = rest;
    lodash.each = forEach;
    lodash.extend = assign;
    lodash.methods = functions;
    lodash.object = zipObject;
    lodash.select = filter;
    lodash.tail = rest;
    lodash.unique = uniq;

    // add functions to `lodash.prototype`
    mixin(lodash);

    /*--------------------------------------------------------------------------*/

    // add functions that return unwrapped values when chaining
    lodash.clone = clone;
    lodash.cloneDeep = cloneDeep;
    lodash.contains = contains;
    lodash.escape = escape;
    lodash.every = every;
    lodash.find = find;
    lodash.findIndex = findIndex;
    lodash.findKey = findKey;
    lodash.has = has;
    lodash.identity = identity;
    lodash.indexOf = indexOf;
    lodash.isArguments = isArguments;
    lodash.isArray = isArray;
    lodash.isBoolean = isBoolean;
    lodash.isDate = isDate;
    lodash.isElement = isElement;
    lodash.isEmpty = isEmpty;
    lodash.isEqual = isEqual;
    lodash.isFinite = isFinite;
    lodash.isFunction = isFunction;
    lodash.isNaN = isNaN;
    lodash.isNull = isNull;
    lodash.isNumber = isNumber;
    lodash.isObject = isObject;
    lodash.isPlainObject = isPlainObject;
    lodash.isRegExp = isRegExp;
    lodash.isString = isString;
    lodash.isUndefined = isUndefined;
    lodash.lastIndexOf = lastIndexOf;
    lodash.mixin = mixin;
    lodash.noConflict = noConflict;
    lodash.parseInt = parseInt;
    lodash.random = random;
    lodash.reduce = reduce;
    lodash.reduceRight = reduceRight;
    lodash.result = result;
    lodash.runInContext = runInContext;
    lodash.size = size;
    lodash.some = some;
    lodash.sortedIndex = sortedIndex;
    lodash.template = template;
    lodash.unescape = unescape;
    lodash.uniqueId = uniqueId;

    // add aliases
    lodash.all = every;
    lodash.any = some;
    lodash.detect = find;
    lodash.foldl = reduce;
    lodash.foldr = reduceRight;
    lodash.include = contains;
    lodash.inject = reduce;

    forOwn(lodash, function(func, methodName) {
      if (!lodash.prototype[methodName]) {
        lodash.prototype[methodName] = function() {
          var args = [this.__wrapped__];
          push.apply(args, arguments);
          return func.apply(lodash, args);
        };
      }
    });

    /*--------------------------------------------------------------------------*/

    // add functions capable of returning wrapped and unwrapped values when chaining
    lodash.first = first;
    lodash.last = last;

    // add aliases
    lodash.take = first;
    lodash.head = first;

    forOwn(lodash, function(func, methodName) {
      if (!lodash.prototype[methodName]) {
        lodash.prototype[methodName]= function(callback, thisArg) {
          var result = func(this.__wrapped__, callback, thisArg);
          return callback == null || (thisArg && typeof callback != 'function')
            ? result
            : new lodashWrapper(result);
        };
      }
    });

    /*--------------------------------------------------------------------------*/

    /**
     * The semantic version number.
     *
     * @static
     * @memberOf _
     * @type String
     */
    lodash.VERSION = '1.1.1';

    // add "Chaining" functions to the wrapper
    lodash.prototype.toString = wrapperToString;
    lodash.prototype.value = wrapperValueOf;
    lodash.prototype.valueOf = wrapperValueOf;

    // add `Array` functions that return unwrapped values
    each(['join', 'pop', 'shift'], function(methodName) {
      var func = arrayRef[methodName];
      lodash.prototype[methodName] = function() {
        return func.apply(this.__wrapped__, arguments);
      };
    });

    // add `Array` functions that return the wrapped value
    each(['push', 'reverse', 'sort', 'unshift'], function(methodName) {
      var func = arrayRef[methodName];
      lodash.prototype[methodName] = function() {
        func.apply(this.__wrapped__, arguments);
        return this;
      };
    });

    // add `Array` functions that return new wrapped values
    each(['concat', 'slice', 'splice'], function(methodName) {
      var func = arrayRef[methodName];
      lodash.prototype[methodName] = function() {
        return new lodashWrapper(func.apply(this.__wrapped__, arguments));
      };
    });

    // avoid array-like object bugs with `Array#shift` and `Array#splice`
    // in Firefox < 10 and IE < 9
    if (!support.spliceObjects) {
      each(['pop', 'shift', 'splice'], function(methodName) {
        var func = arrayRef[methodName],
            isSplice = methodName == 'splice';

        lodash.prototype[methodName] = function() {
          var value = this.__wrapped__,
              result = func.apply(value, arguments);

          if (value.length === 0) {
            delete value[0];
          }
          return isSplice ? new lodashWrapper(result) : result;
        };
      });
    }

    return lodash;
  }

  /*--------------------------------------------------------------------------*/

  // expose Lo-Dash
  var _ = runInContext();

  // some AMD build optimizers, like r.js, check for specific condition patterns like the following:
  if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
    // Expose Lo-Dash to the global object even when an AMD loader is present in
    // case Lo-Dash was injected by a third-party script and not intended to be
    // loaded as a module. The global assignment can be reverted in the Lo-Dash
    // module via its `noConflict()` method.
    window._ = _;

    // define as an anonymous module so, through path mapping, it can be
    // referenced as the "underscore" module
    define('_',[],function() {
      return _;
    });
  }
  // check for `exports` after `define` in case a build optimizer adds an `exports` object
  else if (freeExports && !freeExports.nodeType) {
    // in Node.js or RingoJS v0.8.0+
    if (freeModule) {
      (freeModule.exports = _)._ = _;
    }
    // in Narwhal or RingoJS v0.7.0-
    else {
      freeExports._ = _;
    }
  }
  else {
    // in a browser or Rhino
    window._ = _;
  }
}(this));
define('core/Base',['require','./mixin/derive','./mixin/notifier','./Cache','_'],function(require){

    var deriveMixin = require("./mixin/derive");
    var notifierMixin = require("./mixin/notifier");
    var Cache = require("./Cache");
    var _ = require("_");

    var Base = function(){
        this.cache = new Cache();
    }
    _.extend(Base, deriveMixin);
    _.extend(Base.prototype, notifierMixin);

    return Base;
});
/**
 * @fileoverview gl-matrix - High performance matrix and vector operations
 * @author Brandon Jones
 * @author Colin MacKenzie IV
 * @version 2.2.0
 */

/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */


(function(_global) {
  

  var shim = {};
  if (typeof(exports) === 'undefined') {
    if(typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
      shim.exports = {};
      define('glmatrix',[],function() {
        return shim.exports;
      });
    } else {
      // gl-matrix lives in a browser, define its namespaces in global
      shim.exports = typeof(window) !== 'undefined' ? window : _global;
    }
  }
  else {
    // gl-matrix lives in commonjs, define its namespaces in exports
    shim.exports = exports;
  }

  (function(exports) {
    /* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */


if(!GLMAT_EPSILON) {
    var GLMAT_EPSILON = 0.000001;
}

if(!GLMAT_ARRAY_TYPE) {
    var GLMAT_ARRAY_TYPE = (typeof Float32Array !== 'undefined') ? Float32Array : Array;
}

if(!GLMAT_RANDOM) {
    var GLMAT_RANDOM = Math.random;
}

/**
 * @class Common utilities
 * @name glMatrix
 */
var glMatrix = {};

/**
 * Sets the type of array used when creating new vectors and matricies
 *
 * @param {Type} type Array type, such as Float32Array or Array
 */
glMatrix.setMatrixArrayType = function(type) {
    GLMAT_ARRAY_TYPE = type;
}

if(typeof(exports) !== 'undefined') {
    exports.glMatrix = glMatrix;
}
;
/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */


/**
 * @class 2 Dimensional Vector
 * @name vec2
 */

var vec2 = {};

/**
 * Creates a new, empty vec2
 *
 * @returns {vec2} a new 2D vector
 */
vec2.create = function() {
    var out = new GLMAT_ARRAY_TYPE(2);
    out[0] = 0;
    out[1] = 0;
    return out;
};

/**
 * Creates a new vec2 initialized with values from an existing vector
 *
 * @param {vec2} a vector to clone
 * @returns {vec2} a new 2D vector
 */
vec2.clone = function(a) {
    var out = new GLMAT_ARRAY_TYPE(2);
    out[0] = a[0];
    out[1] = a[1];
    return out;
};

/**
 * Creates a new vec2 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @returns {vec2} a new 2D vector
 */
vec2.fromValues = function(x, y) {
    var out = new GLMAT_ARRAY_TYPE(2);
    out[0] = x;
    out[1] = y;
    return out;
};

/**
 * Copy the values from one vec2 to another
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the source vector
 * @returns {vec2} out
 */
vec2.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    return out;
};

/**
 * Set the components of a vec2 to the given values
 *
 * @param {vec2} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @returns {vec2} out
 */
vec2.set = function(out, x, y) {
    out[0] = x;
    out[1] = y;
    return out;
};

/**
 * Adds two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.add = function(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    return out;
};

/**
 * Subtracts vector b from vector a
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.subtract = function(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    return out;
};

/**
 * Alias for {@link vec2.subtract}
 * @function
 */
vec2.sub = vec2.subtract;

/**
 * Multiplies two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.multiply = function(out, a, b) {
    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
    return out;
};

/**
 * Alias for {@link vec2.multiply}
 * @function
 */
vec2.mul = vec2.multiply;

/**
 * Divides two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.divide = function(out, a, b) {
    out[0] = a[0] / b[0];
    out[1] = a[1] / b[1];
    return out;
};

/**
 * Alias for {@link vec2.divide}
 * @function
 */
vec2.div = vec2.divide;

/**
 * Returns the minimum of two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.min = function(out, a, b) {
    out[0] = Math.min(a[0], b[0]);
    out[1] = Math.min(a[1], b[1]);
    return out;
};

/**
 * Returns the maximum of two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.max = function(out, a, b) {
    out[0] = Math.max(a[0], b[0]);
    out[1] = Math.max(a[1], b[1]);
    return out;
};

/**
 * Scales a vec2 by a scalar number
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec2} out
 */
vec2.scale = function(out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    return out;
};

/**
 * Adds two vec2's after scaling the second operand by a scalar value
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @param {Number} scale the amount to scale b by before adding
 * @returns {vec2} out
 */
vec2.scaleAndAdd = function(out, a, b, scale) {
    out[0] = a[0] + (b[0] * scale);
    out[1] = a[1] + (b[1] * scale);
    return out;
};

/**
 * Calculates the euclidian distance between two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} distance between a and b
 */
vec2.distance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1];
    return Math.sqrt(x*x + y*y);
};

/**
 * Alias for {@link vec2.distance}
 * @function
 */
vec2.dist = vec2.distance;

/**
 * Calculates the squared euclidian distance between two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} squared distance between a and b
 */
vec2.squaredDistance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1];
    return x*x + y*y;
};

/**
 * Alias for {@link vec2.squaredDistance}
 * @function
 */
vec2.sqrDist = vec2.squaredDistance;

/**
 * Calculates the length of a vec2
 *
 * @param {vec2} a vector to calculate length of
 * @returns {Number} length of a
 */
vec2.length = function (a) {
    var x = a[0],
        y = a[1];
    return Math.sqrt(x*x + y*y);
};

/**
 * Alias for {@link vec2.length}
 * @function
 */
vec2.len = vec2.length;

/**
 * Calculates the squared length of a vec2
 *
 * @param {vec2} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
vec2.squaredLength = function (a) {
    var x = a[0],
        y = a[1];
    return x*x + y*y;
};

/**
 * Alias for {@link vec2.squaredLength}
 * @function
 */
vec2.sqrLen = vec2.squaredLength;

/**
 * Negates the components of a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a vector to negate
 * @returns {vec2} out
 */
vec2.negate = function(out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    return out;
};

/**
 * Normalize a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a vector to normalize
 * @returns {vec2} out
 */
vec2.normalize = function(out, a) {
    var x = a[0],
        y = a[1];
    var len = x*x + y*y;
    if (len > 0) {
        //TODO: evaluate use of glm_invsqrt here?
        len = 1 / Math.sqrt(len);
        out[0] = a[0] * len;
        out[1] = a[1] * len;
    }
    return out;
};

/**
 * Calculates the dot product of two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} dot product of a and b
 */
vec2.dot = function (a, b) {
    return a[0] * b[0] + a[1] * b[1];
};

/**
 * Computes the cross product of two vec2's
 * Note that the cross product must by definition produce a 3D vector
 *
 * @param {vec3} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec3} out
 */
vec2.cross = function(out, a, b) {
    var z = a[0] * b[1] - a[1] * b[0];
    out[0] = out[1] = 0;
    out[2] = z;
    return out;
};

/**
 * Performs a linear interpolation between two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {vec2} out
 */
vec2.lerp = function (out, a, b, t) {
    var ax = a[0],
        ay = a[1];
    out[0] = ax + t * (b[0] - ax);
    out[1] = ay + t * (b[1] - ay);
    return out;
};

/**
 * Generates a random vector with the given scale
 *
 * @param {vec2} out the receiving vector
 * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
 * @returns {vec2} out
 */
vec2.random = function (out, scale) {
    scale = scale || 1.0;
    var r = GLMAT_RANDOM() * 2.0 * Math.PI;
    out[0] = Math.cos(r) * scale;
    out[1] = Math.sin(r) * scale;
    return out;
};

/**
 * Transforms the vec2 with a mat2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat2} m matrix to transform with
 * @returns {vec2} out
 */
vec2.transformMat2 = function(out, a, m) {
    var x = a[0],
        y = a[1];
    out[0] = m[0] * x + m[2] * y;
    out[1] = m[1] * x + m[3] * y;
    return out;
};

/**
 * Transforms the vec2 with a mat2d
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat2d} m matrix to transform with
 * @returns {vec2} out
 */
vec2.transformMat2d = function(out, a, m) {
    var x = a[0],
        y = a[1];
    out[0] = m[0] * x + m[2] * y + m[4];
    out[1] = m[1] * x + m[3] * y + m[5];
    return out;
};

/**
 * Transforms the vec2 with a mat3
 * 3rd vector component is implicitly '1'
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat3} m matrix to transform with
 * @returns {vec2} out
 */
vec2.transformMat3 = function(out, a, m) {
    var x = a[0],
        y = a[1];
    out[0] = m[0] * x + m[3] * y + m[6];
    out[1] = m[1] * x + m[4] * y + m[7];
    return out;
};

/**
 * Transforms the vec2 with a mat4
 * 3rd vector component is implicitly '0'
 * 4th vector component is implicitly '1'
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat4} m matrix to transform with
 * @returns {vec2} out
 */
vec2.transformMat4 = function(out, a, m) {
    var x = a[0], 
        y = a[1];
    out[0] = m[0] * x + m[4] * y + m[12];
    out[1] = m[1] * x + m[5] * y + m[13];
    return out;
};

/**
 * Perform some operation over an array of vec2s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec2. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec2s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */
vec2.forEach = (function() {
    var vec = vec2.create();

    return function(a, stride, offset, count, fn, arg) {
        var i, l;
        if(!stride) {
            stride = 2;
        }

        if(!offset) {
            offset = 0;
        }
        
        if(count) {
            l = Math.min((count * stride) + offset, a.length);
        } else {
            l = a.length;
        }

        for(i = offset; i < l; i += stride) {
            vec[0] = a[i]; vec[1] = a[i+1];
            fn(vec, vec, arg);
            a[i] = vec[0]; a[i+1] = vec[1];
        }
        
        return a;
    };
})();

/**
 * Returns a string representation of a vector
 *
 * @param {vec2} vec vector to represent as a string
 * @returns {String} string representation of the vector
 */
vec2.str = function (a) {
    return 'vec2(' + a[0] + ', ' + a[1] + ')';
};

if(typeof(exports) !== 'undefined') {
    exports.vec2 = vec2;
}
;
/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/**
 * @class 3 Dimensional Vector
 * @name vec3
 */

var vec3 = {};

/**
 * Creates a new, empty vec3
 *
 * @returns {vec3} a new 3D vector
 */
vec3.create = function() {
    var out = new GLMAT_ARRAY_TYPE(3);
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    return out;
};

/**
 * Creates a new vec3 initialized with values from an existing vector
 *
 * @param {vec3} a vector to clone
 * @returns {vec3} a new 3D vector
 */
vec3.clone = function(a) {
    var out = new GLMAT_ARRAY_TYPE(3);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    return out;
};

/**
 * Creates a new vec3 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @returns {vec3} a new 3D vector
 */
vec3.fromValues = function(x, y, z) {
    var out = new GLMAT_ARRAY_TYPE(3);
    out[0] = x;
    out[1] = y;
    out[2] = z;
    return out;
};

/**
 * Copy the values from one vec3 to another
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the source vector
 * @returns {vec3} out
 */
vec3.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    return out;
};

/**
 * Set the components of a vec3 to the given values
 *
 * @param {vec3} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @returns {vec3} out
 */
vec3.set = function(out, x, y, z) {
    out[0] = x;
    out[1] = y;
    out[2] = z;
    return out;
};

/**
 * Adds two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.add = function(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    return out;
};

/**
 * Subtracts vector b from vector a
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.subtract = function(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    return out;
};

/**
 * Alias for {@link vec3.subtract}
 * @function
 */
vec3.sub = vec3.subtract;

/**
 * Multiplies two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.multiply = function(out, a, b) {
    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
    out[2] = a[2] * b[2];
    return out;
};

/**
 * Alias for {@link vec3.multiply}
 * @function
 */
vec3.mul = vec3.multiply;

/**
 * Divides two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.divide = function(out, a, b) {
    out[0] = a[0] / b[0];
    out[1] = a[1] / b[1];
    out[2] = a[2] / b[2];
    return out;
};

/**
 * Alias for {@link vec3.divide}
 * @function
 */
vec3.div = vec3.divide;

/**
 * Returns the minimum of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.min = function(out, a, b) {
    out[0] = Math.min(a[0], b[0]);
    out[1] = Math.min(a[1], b[1]);
    out[2] = Math.min(a[2], b[2]);
    return out;
};

/**
 * Returns the maximum of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.max = function(out, a, b) {
    out[0] = Math.max(a[0], b[0]);
    out[1] = Math.max(a[1], b[1]);
    out[2] = Math.max(a[2], b[2]);
    return out;
};

/**
 * Scales a vec3 by a scalar number
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec3} out
 */
vec3.scale = function(out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    out[2] = a[2] * b;
    return out;
};

/**
 * Adds two vec3's after scaling the second operand by a scalar value
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @param {Number} scale the amount to scale b by before adding
 * @returns {vec3} out
 */
vec3.scaleAndAdd = function(out, a, b, scale) {
    out[0] = a[0] + (b[0] * scale);
    out[1] = a[1] + (b[1] * scale);
    out[2] = a[2] + (b[2] * scale);
    return out;
};

/**
 * Calculates the euclidian distance between two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} distance between a and b
 */
vec3.distance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1],
        z = b[2] - a[2];
    return Math.sqrt(x*x + y*y + z*z);
};

/**
 * Alias for {@link vec3.distance}
 * @function
 */
vec3.dist = vec3.distance;

/**
 * Calculates the squared euclidian distance between two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} squared distance between a and b
 */
vec3.squaredDistance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1],
        z = b[2] - a[2];
    return x*x + y*y + z*z;
};

/**
 * Alias for {@link vec3.squaredDistance}
 * @function
 */
vec3.sqrDist = vec3.squaredDistance;

/**
 * Calculates the length of a vec3
 *
 * @param {vec3} a vector to calculate length of
 * @returns {Number} length of a
 */
vec3.length = function (a) {
    var x = a[0],
        y = a[1],
        z = a[2];
    return Math.sqrt(x*x + y*y + z*z);
};

/**
 * Alias for {@link vec3.length}
 * @function
 */
vec3.len = vec3.length;

/**
 * Calculates the squared length of a vec3
 *
 * @param {vec3} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
vec3.squaredLength = function (a) {
    var x = a[0],
        y = a[1],
        z = a[2];
    return x*x + y*y + z*z;
};

/**
 * Alias for {@link vec3.squaredLength}
 * @function
 */
vec3.sqrLen = vec3.squaredLength;

/**
 * Negates the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to negate
 * @returns {vec3} out
 */
vec3.negate = function(out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    out[2] = -a[2];
    return out;
};

/**
 * Normalize a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to normalize
 * @returns {vec3} out
 */
vec3.normalize = function(out, a) {
    var x = a[0],
        y = a[1],
        z = a[2];
    var len = x*x + y*y + z*z;
    if (len > 0) {
        //TODO: evaluate use of glm_invsqrt here?
        len = 1 / Math.sqrt(len);
        out[0] = a[0] * len;
        out[1] = a[1] * len;
        out[2] = a[2] * len;
    }
    return out;
};

/**
 * Calculates the dot product of two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} dot product of a and b
 */
vec3.dot = function (a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
};

/**
 * Computes the cross product of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.cross = function(out, a, b) {
    var ax = a[0], ay = a[1], az = a[2],
        bx = b[0], by = b[1], bz = b[2];

    out[0] = ay * bz - az * by;
    out[1] = az * bx - ax * bz;
    out[2] = ax * by - ay * bx;
    return out;
};

/**
 * Performs a linear interpolation between two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {vec3} out
 */
vec3.lerp = function (out, a, b, t) {
    var ax = a[0],
        ay = a[1],
        az = a[2];
    out[0] = ax + t * (b[0] - ax);
    out[1] = ay + t * (b[1] - ay);
    out[2] = az + t * (b[2] - az);
    return out;
};

/**
 * Generates a random vector with the given scale
 *
 * @param {vec3} out the receiving vector
 * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
 * @returns {vec3} out
 */
vec3.random = function (out, scale) {
    scale = scale || 1.0;

    var r = GLMAT_RANDOM() * 2.0 * Math.PI;
    var z = (GLMAT_RANDOM() * 2.0) - 1.0;
    var zScale = Math.sqrt(1.0-z*z) * scale;

    out[0] = Math.cos(r) * zScale;
    out[1] = Math.sin(r) * zScale;
    out[2] = z * scale;
    return out;
};

/**
 * Transforms the vec3 with a mat4.
 * 4th vector component is implicitly '1'
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to transform
 * @param {mat4} m matrix to transform with
 * @returns {vec3} out
 */
vec3.transformMat4 = function(out, a, m) {
    var x = a[0], y = a[1], z = a[2];
    out[0] = m[0] * x + m[4] * y + m[8] * z + m[12];
    out[1] = m[1] * x + m[5] * y + m[9] * z + m[13];
    out[2] = m[2] * x + m[6] * y + m[10] * z + m[14];
    return out;
};

/**
 * Transforms the vec3 with a mat3.
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to transform
 * @param {mat4} m the 3x3 matrix to transform with
 * @returns {vec3} out
 */
vec3.transformMat3 = function(out, a, m) {
    var x = a[0], y = a[1], z = a[2];
    out[0] = x * m[0] + y * m[3] + z * m[6];
    out[1] = x * m[1] + y * m[4] + z * m[7];
    out[2] = x * m[2] + y * m[5] + z * m[8];
    return out;
};

/**
 * Transforms the vec3 with a quat
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to transform
 * @param {quat} q quaternion to transform with
 * @returns {vec3} out
 */
vec3.transformQuat = function(out, a, q) {
    // benchmarks: http://jsperf.com/quaternion-transform-vec3-implementations

    var x = a[0], y = a[1], z = a[2],
        qx = q[0], qy = q[1], qz = q[2], qw = q[3],

        // calculate quat * vec
        ix = qw * x + qy * z - qz * y,
        iy = qw * y + qz * x - qx * z,
        iz = qw * z + qx * y - qy * x,
        iw = -qx * x - qy * y - qz * z;

    // calculate result * inverse quat
    out[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
    out[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
    out[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
    return out;
};

/**
 * Perform some operation over an array of vec3s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec3. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec3s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */
vec3.forEach = (function() {
    var vec = vec3.create();

    return function(a, stride, offset, count, fn, arg) {
        var i, l;
        if(!stride) {
            stride = 3;
        }

        if(!offset) {
            offset = 0;
        }
        
        if(count) {
            l = Math.min((count * stride) + offset, a.length);
        } else {
            l = a.length;
        }

        for(i = offset; i < l; i += stride) {
            vec[0] = a[i]; vec[1] = a[i+1]; vec[2] = a[i+2];
            fn(vec, vec, arg);
            a[i] = vec[0]; a[i+1] = vec[1]; a[i+2] = vec[2];
        }
        
        return a;
    };
})();

/**
 * Returns a string representation of a vector
 *
 * @param {vec3} vec vector to represent as a string
 * @returns {String} string representation of the vector
 */
vec3.str = function (a) {
    return 'vec3(' + a[0] + ', ' + a[1] + ', ' + a[2] + ')';
};

if(typeof(exports) !== 'undefined') {
    exports.vec3 = vec3;
}
;
/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/**
 * @class 4 Dimensional Vector
 * @name vec4
 */

var vec4 = {};

/**
 * Creates a new, empty vec4
 *
 * @returns {vec4} a new 4D vector
 */
vec4.create = function() {
    var out = new GLMAT_ARRAY_TYPE(4);
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    return out;
};

/**
 * Creates a new vec4 initialized with values from an existing vector
 *
 * @param {vec4} a vector to clone
 * @returns {vec4} a new 4D vector
 */
vec4.clone = function(a) {
    var out = new GLMAT_ARRAY_TYPE(4);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    return out;
};

/**
 * Creates a new vec4 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {vec4} a new 4D vector
 */
vec4.fromValues = function(x, y, z, w) {
    var out = new GLMAT_ARRAY_TYPE(4);
    out[0] = x;
    out[1] = y;
    out[2] = z;
    out[3] = w;
    return out;
};

/**
 * Copy the values from one vec4 to another
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the source vector
 * @returns {vec4} out
 */
vec4.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    return out;
};

/**
 * Set the components of a vec4 to the given values
 *
 * @param {vec4} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {vec4} out
 */
vec4.set = function(out, x, y, z, w) {
    out[0] = x;
    out[1] = y;
    out[2] = z;
    out[3] = w;
    return out;
};

/**
 * Adds two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4.add = function(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    out[3] = a[3] + b[3];
    return out;
};

/**
 * Subtracts vector b from vector a
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4.subtract = function(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    out[3] = a[3] - b[3];
    return out;
};

/**
 * Alias for {@link vec4.subtract}
 * @function
 */
vec4.sub = vec4.subtract;

/**
 * Multiplies two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4.multiply = function(out, a, b) {
    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
    out[2] = a[2] * b[2];
    out[3] = a[3] * b[3];
    return out;
};

/**
 * Alias for {@link vec4.multiply}
 * @function
 */
vec4.mul = vec4.multiply;

/**
 * Divides two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4.divide = function(out, a, b) {
    out[0] = a[0] / b[0];
    out[1] = a[1] / b[1];
    out[2] = a[2] / b[2];
    out[3] = a[3] / b[3];
    return out;
};

/**
 * Alias for {@link vec4.divide}
 * @function
 */
vec4.div = vec4.divide;

/**
 * Returns the minimum of two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4.min = function(out, a, b) {
    out[0] = Math.min(a[0], b[0]);
    out[1] = Math.min(a[1], b[1]);
    out[2] = Math.min(a[2], b[2]);
    out[3] = Math.min(a[3], b[3]);
    return out;
};

/**
 * Returns the maximum of two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4.max = function(out, a, b) {
    out[0] = Math.max(a[0], b[0]);
    out[1] = Math.max(a[1], b[1]);
    out[2] = Math.max(a[2], b[2]);
    out[3] = Math.max(a[3], b[3]);
    return out;
};

/**
 * Scales a vec4 by a scalar number
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec4} out
 */
vec4.scale = function(out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    out[2] = a[2] * b;
    out[3] = a[3] * b;
    return out;
};

/**
 * Adds two vec4's after scaling the second operand by a scalar value
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @param {Number} scale the amount to scale b by before adding
 * @returns {vec4} out
 */
vec4.scaleAndAdd = function(out, a, b, scale) {
    out[0] = a[0] + (b[0] * scale);
    out[1] = a[1] + (b[1] * scale);
    out[2] = a[2] + (b[2] * scale);
    out[3] = a[3] + (b[3] * scale);
    return out;
};

/**
 * Calculates the euclidian distance between two vec4's
 *
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {Number} distance between a and b
 */
vec4.distance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1],
        z = b[2] - a[2],
        w = b[3] - a[3];
    return Math.sqrt(x*x + y*y + z*z + w*w);
};

/**
 * Alias for {@link vec4.distance}
 * @function
 */
vec4.dist = vec4.distance;

/**
 * Calculates the squared euclidian distance between two vec4's
 *
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {Number} squared distance between a and b
 */
vec4.squaredDistance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1],
        z = b[2] - a[2],
        w = b[3] - a[3];
    return x*x + y*y + z*z + w*w;
};

/**
 * Alias for {@link vec4.squaredDistance}
 * @function
 */
vec4.sqrDist = vec4.squaredDistance;

/**
 * Calculates the length of a vec4
 *
 * @param {vec4} a vector to calculate length of
 * @returns {Number} length of a
 */
vec4.length = function (a) {
    var x = a[0],
        y = a[1],
        z = a[2],
        w = a[3];
    return Math.sqrt(x*x + y*y + z*z + w*w);
};

/**
 * Alias for {@link vec4.length}
 * @function
 */
vec4.len = vec4.length;

/**
 * Calculates the squared length of a vec4
 *
 * @param {vec4} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
vec4.squaredLength = function (a) {
    var x = a[0],
        y = a[1],
        z = a[2],
        w = a[3];
    return x*x + y*y + z*z + w*w;
};

/**
 * Alias for {@link vec4.squaredLength}
 * @function
 */
vec4.sqrLen = vec4.squaredLength;

/**
 * Negates the components of a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a vector to negate
 * @returns {vec4} out
 */
vec4.negate = function(out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    out[2] = -a[2];
    out[3] = -a[3];
    return out;
};

/**
 * Normalize a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a vector to normalize
 * @returns {vec4} out
 */
vec4.normalize = function(out, a) {
    var x = a[0],
        y = a[1],
        z = a[2],
        w = a[3];
    var len = x*x + y*y + z*z + w*w;
    if (len > 0) {
        len = 1 / Math.sqrt(len);
        out[0] = a[0] * len;
        out[1] = a[1] * len;
        out[2] = a[2] * len;
        out[3] = a[3] * len;
    }
    return out;
};

/**
 * Calculates the dot product of two vec4's
 *
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {Number} dot product of a and b
 */
vec4.dot = function (a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
};

/**
 * Performs a linear interpolation between two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {vec4} out
 */
vec4.lerp = function (out, a, b, t) {
    var ax = a[0],
        ay = a[1],
        az = a[2],
        aw = a[3];
    out[0] = ax + t * (b[0] - ax);
    out[1] = ay + t * (b[1] - ay);
    out[2] = az + t * (b[2] - az);
    out[3] = aw + t * (b[3] - aw);
    return out;
};

/**
 * Generates a random vector with the given scale
 *
 * @param {vec4} out the receiving vector
 * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
 * @returns {vec4} out
 */
vec4.random = function (out, scale) {
    scale = scale || 1.0;

    //TODO: This is a pretty awful way of doing this. Find something better.
    out[0] = GLMAT_RANDOM();
    out[1] = GLMAT_RANDOM();
    out[2] = GLMAT_RANDOM();
    out[3] = GLMAT_RANDOM();
    vec4.normalize(out, out);
    vec4.scale(out, out, scale);
    return out;
};

/**
 * Transforms the vec4 with a mat4.
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the vector to transform
 * @param {mat4} m matrix to transform with
 * @returns {vec4} out
 */
vec4.transformMat4 = function(out, a, m) {
    var x = a[0], y = a[1], z = a[2], w = a[3];
    out[0] = m[0] * x + m[4] * y + m[8] * z + m[12] * w;
    out[1] = m[1] * x + m[5] * y + m[9] * z + m[13] * w;
    out[2] = m[2] * x + m[6] * y + m[10] * z + m[14] * w;
    out[3] = m[3] * x + m[7] * y + m[11] * z + m[15] * w;
    return out;
};

/**
 * Transforms the vec4 with a quat
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the vector to transform
 * @param {quat} q quaternion to transform with
 * @returns {vec4} out
 */
vec4.transformQuat = function(out, a, q) {
    var x = a[0], y = a[1], z = a[2],
        qx = q[0], qy = q[1], qz = q[2], qw = q[3],

        // calculate quat * vec
        ix = qw * x + qy * z - qz * y,
        iy = qw * y + qz * x - qx * z,
        iz = qw * z + qx * y - qy * x,
        iw = -qx * x - qy * y - qz * z;

    // calculate result * inverse quat
    out[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
    out[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
    out[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
    return out;
};

/**
 * Perform some operation over an array of vec4s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec4. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec2s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */
vec4.forEach = (function() {
    var vec = vec4.create();

    return function(a, stride, offset, count, fn, arg) {
        var i, l;
        if(!stride) {
            stride = 4;
        }

        if(!offset) {
            offset = 0;
        }
        
        if(count) {
            l = Math.min((count * stride) + offset, a.length);
        } else {
            l = a.length;
        }

        for(i = offset; i < l; i += stride) {
            vec[0] = a[i]; vec[1] = a[i+1]; vec[2] = a[i+2]; vec[3] = a[i+3];
            fn(vec, vec, arg);
            a[i] = vec[0]; a[i+1] = vec[1]; a[i+2] = vec[2]; a[i+3] = vec[3];
        }
        
        return a;
    };
})();

/**
 * Returns a string representation of a vector
 *
 * @param {vec4} vec vector to represent as a string
 * @returns {String} string representation of the vector
 */
vec4.str = function (a) {
    return 'vec4(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ')';
};

if(typeof(exports) !== 'undefined') {
    exports.vec4 = vec4;
}
;
/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/**
 * @class 2x2 Matrix
 * @name mat2
 */

var mat2 = {};

/**
 * Creates a new identity mat2
 *
 * @returns {mat2} a new 2x2 matrix
 */
mat2.create = function() {
    var out = new GLMAT_ARRAY_TYPE(4);
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    return out;
};

/**
 * Creates a new mat2 initialized with values from an existing matrix
 *
 * @param {mat2} a matrix to clone
 * @returns {mat2} a new 2x2 matrix
 */
mat2.clone = function(a) {
    var out = new GLMAT_ARRAY_TYPE(4);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    return out;
};

/**
 * Copy the values from one mat2 to another
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the source matrix
 * @returns {mat2} out
 */
mat2.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    return out;
};

/**
 * Set a mat2 to the identity matrix
 *
 * @param {mat2} out the receiving matrix
 * @returns {mat2} out
 */
mat2.identity = function(out) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    return out;
};

/**
 * Transpose the values of a mat2
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the source matrix
 * @returns {mat2} out
 */
mat2.transpose = function(out, a) {
    // If we are transposing ourselves we can skip a few steps but have to cache some values
    if (out === a) {
        var a1 = a[1];
        out[1] = a[2];
        out[2] = a1;
    } else {
        out[0] = a[0];
        out[1] = a[2];
        out[2] = a[1];
        out[3] = a[3];
    }
    
    return out;
};

/**
 * Inverts a mat2
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the source matrix
 * @returns {mat2} out
 */
mat2.invert = function(out, a) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3],

        // Calculate the determinant
        det = a0 * a3 - a2 * a1;

    if (!det) {
        return null;
    }
    det = 1.0 / det;
    
    out[0] =  a3 * det;
    out[1] = -a1 * det;
    out[2] = -a2 * det;
    out[3] =  a0 * det;

    return out;
};

/**
 * Calculates the adjugate of a mat2
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the source matrix
 * @returns {mat2} out
 */
mat2.adjoint = function(out, a) {
    // Caching this value is nessecary if out == a
    var a0 = a[0];
    out[0] =  a[3];
    out[1] = -a[1];
    out[2] = -a[2];
    out[3] =  a0;

    return out;
};

/**
 * Calculates the determinant of a mat2
 *
 * @param {mat2} a the source matrix
 * @returns {Number} determinant of a
 */
mat2.determinant = function (a) {
    return a[0] * a[3] - a[2] * a[1];
};

/**
 * Multiplies two mat2's
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the first operand
 * @param {mat2} b the second operand
 * @returns {mat2} out
 */
mat2.multiply = function (out, a, b) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3];
    var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
    out[0] = a0 * b0 + a1 * b2;
    out[1] = a0 * b1 + a1 * b3;
    out[2] = a2 * b0 + a3 * b2;
    out[3] = a2 * b1 + a3 * b3;
    return out;
};

/**
 * Alias for {@link mat2.multiply}
 * @function
 */
mat2.mul = mat2.multiply;

/**
 * Rotates a mat2 by the given angle
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat2} out
 */
mat2.rotate = function (out, a, rad) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3],
        s = Math.sin(rad),
        c = Math.cos(rad);
    out[0] = a0 *  c + a1 * s;
    out[1] = a0 * -s + a1 * c;
    out[2] = a2 *  c + a3 * s;
    out[3] = a2 * -s + a3 * c;
    return out;
};

/**
 * Scales the mat2 by the dimensions in the given vec2
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the matrix to rotate
 * @param {vec2} v the vec2 to scale the matrix by
 * @returns {mat2} out
 **/
mat2.scale = function(out, a, v) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3],
        v0 = v[0], v1 = v[1];
    out[0] = a0 * v0;
    out[1] = a1 * v1;
    out[2] = a2 * v0;
    out[3] = a3 * v1;
    return out;
};

/**
 * Returns a string representation of a mat2
 *
 * @param {mat2} mat matrix to represent as a string
 * @returns {String} string representation of the matrix
 */
mat2.str = function (a) {
    return 'mat2(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ')';
};

if(typeof(exports) !== 'undefined') {
    exports.mat2 = mat2;
}
;
/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/**
 * @class 2x3 Matrix
 * @name mat2d
 * 
 * @description 
 * A mat2d contains six elements defined as:
 * <pre>
 * [a, b,
 *  c, d,
 *  tx,ty]
 * </pre>
 * This is a short form for the 3x3 matrix:
 * <pre>
 * [a, b, 0
 *  c, d, 0
 *  tx,ty,1]
 * </pre>
 * The last column is ignored so the array is shorter and operations are faster.
 */

var mat2d = {};

/**
 * Creates a new identity mat2d
 *
 * @returns {mat2d} a new 2x3 matrix
 */
mat2d.create = function() {
    var out = new GLMAT_ARRAY_TYPE(6);
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    out[4] = 0;
    out[5] = 0;
    return out;
};

/**
 * Creates a new mat2d initialized with values from an existing matrix
 *
 * @param {mat2d} a matrix to clone
 * @returns {mat2d} a new 2x3 matrix
 */
mat2d.clone = function(a) {
    var out = new GLMAT_ARRAY_TYPE(6);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    return out;
};

/**
 * Copy the values from one mat2d to another
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the source matrix
 * @returns {mat2d} out
 */
mat2d.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    return out;
};

/**
 * Set a mat2d to the identity matrix
 *
 * @param {mat2d} out the receiving matrix
 * @returns {mat2d} out
 */
mat2d.identity = function(out) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    out[4] = 0;
    out[5] = 0;
    return out;
};

/**
 * Inverts a mat2d
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the source matrix
 * @returns {mat2d} out
 */
mat2d.invert = function(out, a) {
    var aa = a[0], ab = a[1], ac = a[2], ad = a[3],
        atx = a[4], aty = a[5];

    var det = aa * ad - ab * ac;
    if(!det){
        return null;
    }
    det = 1.0 / det;

    out[0] = ad * det;
    out[1] = -ab * det;
    out[2] = -ac * det;
    out[3] = aa * det;
    out[4] = (ac * aty - ad * atx) * det;
    out[5] = (ab * atx - aa * aty) * det;
    return out;
};

/**
 * Calculates the determinant of a mat2d
 *
 * @param {mat2d} a the source matrix
 * @returns {Number} determinant of a
 */
mat2d.determinant = function (a) {
    return a[0] * a[3] - a[1] * a[2];
};

/**
 * Multiplies two mat2d's
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the first operand
 * @param {mat2d} b the second operand
 * @returns {mat2d} out
 */
mat2d.multiply = function (out, a, b) {
    var aa = a[0], ab = a[1], ac = a[2], ad = a[3],
        atx = a[4], aty = a[5],
        ba = b[0], bb = b[1], bc = b[2], bd = b[3],
        btx = b[4], bty = b[5];

    out[0] = aa*ba + ab*bc;
    out[1] = aa*bb + ab*bd;
    out[2] = ac*ba + ad*bc;
    out[3] = ac*bb + ad*bd;
    out[4] = ba*atx + bc*aty + btx;
    out[5] = bb*atx + bd*aty + bty;
    return out;
};

/**
 * Alias for {@link mat2d.multiply}
 * @function
 */
mat2d.mul = mat2d.multiply;


/**
 * Rotates a mat2d by the given angle
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat2d} out
 */
mat2d.rotate = function (out, a, rad) {
    var aa = a[0],
        ab = a[1],
        ac = a[2],
        ad = a[3],
        atx = a[4],
        aty = a[5],
        st = Math.sin(rad),
        ct = Math.cos(rad);

    out[0] = aa*ct + ab*st;
    out[1] = -aa*st + ab*ct;
    out[2] = ac*ct + ad*st;
    out[3] = -ac*st + ct*ad;
    out[4] = ct*atx + st*aty;
    out[5] = ct*aty - st*atx;
    return out;
};

/**
 * Scales the mat2d by the dimensions in the given vec2
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the matrix to translate
 * @param {vec2} v the vec2 to scale the matrix by
 * @returns {mat2d} out
 **/
mat2d.scale = function(out, a, v) {
    var vx = v[0], vy = v[1];
    out[0] = a[0] * vx;
    out[1] = a[1] * vy;
    out[2] = a[2] * vx;
    out[3] = a[3] * vy;
    out[4] = a[4] * vx;
    out[5] = a[5] * vy;
    return out;
};

/**
 * Translates the mat2d by the dimensions in the given vec2
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the matrix to translate
 * @param {vec2} v the vec2 to translate the matrix by
 * @returns {mat2d} out
 **/
mat2d.translate = function(out, a, v) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4] + v[0];
    out[5] = a[5] + v[1];
    return out;
};

/**
 * Returns a string representation of a mat2d
 *
 * @param {mat2d} a matrix to represent as a string
 * @returns {String} string representation of the matrix
 */
mat2d.str = function (a) {
    return 'mat2d(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + 
                    a[3] + ', ' + a[4] + ', ' + a[5] + ')';
};

if(typeof(exports) !== 'undefined') {
    exports.mat2d = mat2d;
}
;
/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/**
 * @class 3x3 Matrix
 * @name mat3
 */

var mat3 = {};

/**
 * Creates a new identity mat3
 *
 * @returns {mat3} a new 3x3 matrix
 */
mat3.create = function() {
    var out = new GLMAT_ARRAY_TYPE(9);
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 1;
    out[5] = 0;
    out[6] = 0;
    out[7] = 0;
    out[8] = 1;
    return out;
};

/**
 * Copies the upper-left 3x3 values into the given mat3.
 *
 * @param {mat3} out the receiving 3x3 matrix
 * @param {mat4} a   the source 4x4 matrix
 * @returns {mat3} out
 */
mat3.fromMat4 = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[4];
    out[4] = a[5];
    out[5] = a[6];
    out[6] = a[8];
    out[7] = a[9];
    out[8] = a[10];
    return out;
};

/**
 * Creates a new mat3 initialized with values from an existing matrix
 *
 * @param {mat3} a matrix to clone
 * @returns {mat3} a new 3x3 matrix
 */
mat3.clone = function(a) {
    var out = new GLMAT_ARRAY_TYPE(9);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    return out;
};

/**
 * Copy the values from one mat3 to another
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */
mat3.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    return out;
};

/**
 * Set a mat3 to the identity matrix
 *
 * @param {mat3} out the receiving matrix
 * @returns {mat3} out
 */
mat3.identity = function(out) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 1;
    out[5] = 0;
    out[6] = 0;
    out[7] = 0;
    out[8] = 1;
    return out;
};

/**
 * Transpose the values of a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */
mat3.transpose = function(out, a) {
    // If we are transposing ourselves we can skip a few steps but have to cache some values
    if (out === a) {
        var a01 = a[1], a02 = a[2], a12 = a[5];
        out[1] = a[3];
        out[2] = a[6];
        out[3] = a01;
        out[5] = a[7];
        out[6] = a02;
        out[7] = a12;
    } else {
        out[0] = a[0];
        out[1] = a[3];
        out[2] = a[6];
        out[3] = a[1];
        out[4] = a[4];
        out[5] = a[7];
        out[6] = a[2];
        out[7] = a[5];
        out[8] = a[8];
    }
    
    return out;
};

/**
 * Inverts a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */
mat3.invert = function(out, a) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[3], a11 = a[4], a12 = a[5],
        a20 = a[6], a21 = a[7], a22 = a[8],

        b01 = a22 * a11 - a12 * a21,
        b11 = -a22 * a10 + a12 * a20,
        b21 = a21 * a10 - a11 * a20,

        // Calculate the determinant
        det = a00 * b01 + a01 * b11 + a02 * b21;

    if (!det) { 
        return null; 
    }
    det = 1.0 / det;

    out[0] = b01 * det;
    out[1] = (-a22 * a01 + a02 * a21) * det;
    out[2] = (a12 * a01 - a02 * a11) * det;
    out[3] = b11 * det;
    out[4] = (a22 * a00 - a02 * a20) * det;
    out[5] = (-a12 * a00 + a02 * a10) * det;
    out[6] = b21 * det;
    out[7] = (-a21 * a00 + a01 * a20) * det;
    out[8] = (a11 * a00 - a01 * a10) * det;
    return out;
};

/**
 * Calculates the adjugate of a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */
mat3.adjoint = function(out, a) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[3], a11 = a[4], a12 = a[5],
        a20 = a[6], a21 = a[7], a22 = a[8];

    out[0] = (a11 * a22 - a12 * a21);
    out[1] = (a02 * a21 - a01 * a22);
    out[2] = (a01 * a12 - a02 * a11);
    out[3] = (a12 * a20 - a10 * a22);
    out[4] = (a00 * a22 - a02 * a20);
    out[5] = (a02 * a10 - a00 * a12);
    out[6] = (a10 * a21 - a11 * a20);
    out[7] = (a01 * a20 - a00 * a21);
    out[8] = (a00 * a11 - a01 * a10);
    return out;
};

/**
 * Calculates the determinant of a mat3
 *
 * @param {mat3} a the source matrix
 * @returns {Number} determinant of a
 */
mat3.determinant = function (a) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[3], a11 = a[4], a12 = a[5],
        a20 = a[6], a21 = a[7], a22 = a[8];

    return a00 * (a22 * a11 - a12 * a21) + a01 * (-a22 * a10 + a12 * a20) + a02 * (a21 * a10 - a11 * a20);
};

/**
 * Multiplies two mat3's
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the first operand
 * @param {mat3} b the second operand
 * @returns {mat3} out
 */
mat3.multiply = function (out, a, b) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[3], a11 = a[4], a12 = a[5],
        a20 = a[6], a21 = a[7], a22 = a[8],

        b00 = b[0], b01 = b[1], b02 = b[2],
        b10 = b[3], b11 = b[4], b12 = b[5],
        b20 = b[6], b21 = b[7], b22 = b[8];

    out[0] = b00 * a00 + b01 * a10 + b02 * a20;
    out[1] = b00 * a01 + b01 * a11 + b02 * a21;
    out[2] = b00 * a02 + b01 * a12 + b02 * a22;

    out[3] = b10 * a00 + b11 * a10 + b12 * a20;
    out[4] = b10 * a01 + b11 * a11 + b12 * a21;
    out[5] = b10 * a02 + b11 * a12 + b12 * a22;

    out[6] = b20 * a00 + b21 * a10 + b22 * a20;
    out[7] = b20 * a01 + b21 * a11 + b22 * a21;
    out[8] = b20 * a02 + b21 * a12 + b22 * a22;
    return out;
};

/**
 * Alias for {@link mat3.multiply}
 * @function
 */
mat3.mul = mat3.multiply;

/**
 * Translate a mat3 by the given vector
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the matrix to translate
 * @param {vec2} v vector to translate by
 * @returns {mat3} out
 */
mat3.translate = function(out, a, v) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[3], a11 = a[4], a12 = a[5],
        a20 = a[6], a21 = a[7], a22 = a[8],
        x = v[0], y = v[1];

    out[0] = a00;
    out[1] = a01;
    out[2] = a02;

    out[3] = a10;
    out[4] = a11;
    out[5] = a12;

    out[6] = x * a00 + y * a10 + a20;
    out[7] = x * a01 + y * a11 + a21;
    out[8] = x * a02 + y * a12 + a22;
    return out;
};

/**
 * Rotates a mat3 by the given angle
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat3} out
 */
mat3.rotate = function (out, a, rad) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[3], a11 = a[4], a12 = a[5],
        a20 = a[6], a21 = a[7], a22 = a[8],

        s = Math.sin(rad),
        c = Math.cos(rad);

    out[0] = c * a00 + s * a10;
    out[1] = c * a01 + s * a11;
    out[2] = c * a02 + s * a12;

    out[3] = c * a10 - s * a00;
    out[4] = c * a11 - s * a01;
    out[5] = c * a12 - s * a02;

    out[6] = a20;
    out[7] = a21;
    out[8] = a22;
    return out;
};

/**
 * Scales the mat3 by the dimensions in the given vec2
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the matrix to rotate
 * @param {vec2} v the vec2 to scale the matrix by
 * @returns {mat3} out
 **/
mat3.scale = function(out, a, v) {
    var x = v[0], y = v[1];

    out[0] = x * a[0];
    out[1] = x * a[1];
    out[2] = x * a[2];

    out[3] = y * a[3];
    out[4] = y * a[4];
    out[5] = y * a[5];

    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    return out;
};

/**
 * Copies the values from a mat2d into a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {mat2d} a the matrix to copy
 * @returns {mat3} out
 **/
mat3.fromMat2d = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = 0;

    out[3] = a[2];
    out[4] = a[3];
    out[5] = 0;

    out[6] = a[4];
    out[7] = a[5];
    out[8] = 1;
    return out;
};

/**
* Calculates a 3x3 matrix from the given quaternion
*
* @param {mat3} out mat3 receiving operation result
* @param {quat} q Quaternion to create matrix from
*
* @returns {mat3} out
*/
mat3.fromQuat = function (out, q) {
    var x = q[0], y = q[1], z = q[2], w = q[3],
        x2 = x + x,
        y2 = y + y,
        z2 = z + z,

        xx = x * x2,
        xy = x * y2,
        xz = x * z2,
        yy = y * y2,
        yz = y * z2,
        zz = z * z2,
        wx = w * x2,
        wy = w * y2,
        wz = w * z2;

    out[0] = 1 - (yy + zz);
    out[3] = xy + wz;
    out[6] = xz - wy;

    out[1] = xy - wz;
    out[4] = 1 - (xx + zz);
    out[7] = yz + wx;

    out[2] = xz + wy;
    out[5] = yz - wx;
    out[8] = 1 - (xx + yy);

    return out;
};

/**
* Calculates a 3x3 normal matrix (transpose inverse) from the 4x4 matrix
*
* @param {mat3} out mat3 receiving operation result
* @param {mat4} a Mat4 to derive the normal matrix from
*
* @returns {mat3} out
*/
mat3.normalFromMat4 = function (out, a) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],

        b00 = a00 * a11 - a01 * a10,
        b01 = a00 * a12 - a02 * a10,
        b02 = a00 * a13 - a03 * a10,
        b03 = a01 * a12 - a02 * a11,
        b04 = a01 * a13 - a03 * a11,
        b05 = a02 * a13 - a03 * a12,
        b06 = a20 * a31 - a21 * a30,
        b07 = a20 * a32 - a22 * a30,
        b08 = a20 * a33 - a23 * a30,
        b09 = a21 * a32 - a22 * a31,
        b10 = a21 * a33 - a23 * a31,
        b11 = a22 * a33 - a23 * a32,

        // Calculate the determinant
        det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

    if (!det) { 
        return null; 
    }
    det = 1.0 / det;

    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    out[1] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    out[2] = (a10 * b10 - a11 * b08 + a13 * b06) * det;

    out[3] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    out[4] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    out[5] = (a01 * b08 - a00 * b10 - a03 * b06) * det;

    out[6] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    out[7] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    out[8] = (a30 * b04 - a31 * b02 + a33 * b00) * det;

    return out;
};

/**
 * Returns a string representation of a mat3
 *
 * @param {mat3} mat matrix to represent as a string
 * @returns {String} string representation of the matrix
 */
mat3.str = function (a) {
    return 'mat3(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + 
                    a[3] + ', ' + a[4] + ', ' + a[5] + ', ' + 
                    a[6] + ', ' + a[7] + ', ' + a[8] + ')';
};

if(typeof(exports) !== 'undefined') {
    exports.mat3 = mat3;
}
;
/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/**
 * @class 4x4 Matrix
 * @name mat4
 */

var mat4 = {};

/**
 * Creates a new identity mat4
 *
 * @returns {mat4} a new 4x4 matrix
 */
mat4.create = function() {
    var out = new GLMAT_ARRAY_TYPE(16);
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = 1;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 1;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
};

/**
 * Creates a new mat4 initialized with values from an existing matrix
 *
 * @param {mat4} a matrix to clone
 * @returns {mat4} a new 4x4 matrix
 */
mat4.clone = function(a) {
    var out = new GLMAT_ARRAY_TYPE(16);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    out[9] = a[9];
    out[10] = a[10];
    out[11] = a[11];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
    return out;
};

/**
 * Copy the values from one mat4 to another
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
mat4.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    out[9] = a[9];
    out[10] = a[10];
    out[11] = a[11];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
    return out;
};

/**
 * Set a mat4 to the identity matrix
 *
 * @param {mat4} out the receiving matrix
 * @returns {mat4} out
 */
mat4.identity = function(out) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = 1;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 1;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
};

/**
 * Transpose the values of a mat4
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
mat4.transpose = function(out, a) {
    // If we are transposing ourselves we can skip a few steps but have to cache some values
    if (out === a) {
        var a01 = a[1], a02 = a[2], a03 = a[3],
            a12 = a[6], a13 = a[7],
            a23 = a[11];

        out[1] = a[4];
        out[2] = a[8];
        out[3] = a[12];
        out[4] = a01;
        out[6] = a[9];
        out[7] = a[13];
        out[8] = a02;
        out[9] = a12;
        out[11] = a[14];
        out[12] = a03;
        out[13] = a13;
        out[14] = a23;
    } else {
        out[0] = a[0];
        out[1] = a[4];
        out[2] = a[8];
        out[3] = a[12];
        out[4] = a[1];
        out[5] = a[5];
        out[6] = a[9];
        out[7] = a[13];
        out[8] = a[2];
        out[9] = a[6];
        out[10] = a[10];
        out[11] = a[14];
        out[12] = a[3];
        out[13] = a[7];
        out[14] = a[11];
        out[15] = a[15];
    }
    
    return out;
};

/**
 * Inverts a mat4
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
mat4.invert = function(out, a) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],

        b00 = a00 * a11 - a01 * a10,
        b01 = a00 * a12 - a02 * a10,
        b02 = a00 * a13 - a03 * a10,
        b03 = a01 * a12 - a02 * a11,
        b04 = a01 * a13 - a03 * a11,
        b05 = a02 * a13 - a03 * a12,
        b06 = a20 * a31 - a21 * a30,
        b07 = a20 * a32 - a22 * a30,
        b08 = a20 * a33 - a23 * a30,
        b09 = a21 * a32 - a22 * a31,
        b10 = a21 * a33 - a23 * a31,
        b11 = a22 * a33 - a23 * a32,

        // Calculate the determinant
        det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

    if (!det) { 
        return null; 
    }
    det = 1.0 / det;

    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
    out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
    out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
    out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
    out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
    out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
    out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
    out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
    out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

    return out;
};

/**
 * Calculates the adjugate of a mat4
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
mat4.adjoint = function(out, a) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

    out[0]  =  (a11 * (a22 * a33 - a23 * a32) - a21 * (a12 * a33 - a13 * a32) + a31 * (a12 * a23 - a13 * a22));
    out[1]  = -(a01 * (a22 * a33 - a23 * a32) - a21 * (a02 * a33 - a03 * a32) + a31 * (a02 * a23 - a03 * a22));
    out[2]  =  (a01 * (a12 * a33 - a13 * a32) - a11 * (a02 * a33 - a03 * a32) + a31 * (a02 * a13 - a03 * a12));
    out[3]  = -(a01 * (a12 * a23 - a13 * a22) - a11 * (a02 * a23 - a03 * a22) + a21 * (a02 * a13 - a03 * a12));
    out[4]  = -(a10 * (a22 * a33 - a23 * a32) - a20 * (a12 * a33 - a13 * a32) + a30 * (a12 * a23 - a13 * a22));
    out[5]  =  (a00 * (a22 * a33 - a23 * a32) - a20 * (a02 * a33 - a03 * a32) + a30 * (a02 * a23 - a03 * a22));
    out[6]  = -(a00 * (a12 * a33 - a13 * a32) - a10 * (a02 * a33 - a03 * a32) + a30 * (a02 * a13 - a03 * a12));
    out[7]  =  (a00 * (a12 * a23 - a13 * a22) - a10 * (a02 * a23 - a03 * a22) + a20 * (a02 * a13 - a03 * a12));
    out[8]  =  (a10 * (a21 * a33 - a23 * a31) - a20 * (a11 * a33 - a13 * a31) + a30 * (a11 * a23 - a13 * a21));
    out[9]  = -(a00 * (a21 * a33 - a23 * a31) - a20 * (a01 * a33 - a03 * a31) + a30 * (a01 * a23 - a03 * a21));
    out[10] =  (a00 * (a11 * a33 - a13 * a31) - a10 * (a01 * a33 - a03 * a31) + a30 * (a01 * a13 - a03 * a11));
    out[11] = -(a00 * (a11 * a23 - a13 * a21) - a10 * (a01 * a23 - a03 * a21) + a20 * (a01 * a13 - a03 * a11));
    out[12] = -(a10 * (a21 * a32 - a22 * a31) - a20 * (a11 * a32 - a12 * a31) + a30 * (a11 * a22 - a12 * a21));
    out[13] =  (a00 * (a21 * a32 - a22 * a31) - a20 * (a01 * a32 - a02 * a31) + a30 * (a01 * a22 - a02 * a21));
    out[14] = -(a00 * (a11 * a32 - a12 * a31) - a10 * (a01 * a32 - a02 * a31) + a30 * (a01 * a12 - a02 * a11));
    out[15] =  (a00 * (a11 * a22 - a12 * a21) - a10 * (a01 * a22 - a02 * a21) + a20 * (a01 * a12 - a02 * a11));
    return out;
};

/**
 * Calculates the determinant of a mat4
 *
 * @param {mat4} a the source matrix
 * @returns {Number} determinant of a
 */
mat4.determinant = function (a) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],

        b00 = a00 * a11 - a01 * a10,
        b01 = a00 * a12 - a02 * a10,
        b02 = a00 * a13 - a03 * a10,
        b03 = a01 * a12 - a02 * a11,
        b04 = a01 * a13 - a03 * a11,
        b05 = a02 * a13 - a03 * a12,
        b06 = a20 * a31 - a21 * a30,
        b07 = a20 * a32 - a22 * a30,
        b08 = a20 * a33 - a23 * a30,
        b09 = a21 * a32 - a22 * a31,
        b10 = a21 * a33 - a23 * a31,
        b11 = a22 * a33 - a23 * a32;

    // Calculate the determinant
    return b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
};

/**
 * Multiplies two mat4's
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the first operand
 * @param {mat4} b the second operand
 * @returns {mat4} out
 */
mat4.multiply = function (out, a, b) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

    // Cache only the current line of the second matrix
    var b0  = b[0], b1 = b[1], b2 = b[2], b3 = b[3];  
    out[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
    out[4] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[5] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[6] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
    out[8] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[9] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[10] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
    out[12] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[13] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[14] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
    return out;
};

/**
 * Alias for {@link mat4.multiply}
 * @function
 */
mat4.mul = mat4.multiply;

/**
 * Translate a mat4 by the given vector
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to translate
 * @param {vec3} v vector to translate by
 * @returns {mat4} out
 */
mat4.translate = function (out, a, v) {
    var x = v[0], y = v[1], z = v[2],
        a00, a01, a02, a03,
        a10, a11, a12, a13,
        a20, a21, a22, a23;

    if (a === out) {
        out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
        out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
        out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
        out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
    } else {
        a00 = a[0]; a01 = a[1]; a02 = a[2]; a03 = a[3];
        a10 = a[4]; a11 = a[5]; a12 = a[6]; a13 = a[7];
        a20 = a[8]; a21 = a[9]; a22 = a[10]; a23 = a[11];

        out[0] = a00; out[1] = a01; out[2] = a02; out[3] = a03;
        out[4] = a10; out[5] = a11; out[6] = a12; out[7] = a13;
        out[8] = a20; out[9] = a21; out[10] = a22; out[11] = a23;

        out[12] = a00 * x + a10 * y + a20 * z + a[12];
        out[13] = a01 * x + a11 * y + a21 * z + a[13];
        out[14] = a02 * x + a12 * y + a22 * z + a[14];
        out[15] = a03 * x + a13 * y + a23 * z + a[15];
    }

    return out;
};

/**
 * Scales the mat4 by the dimensions in the given vec3
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to scale
 * @param {vec3} v the vec3 to scale the matrix by
 * @returns {mat4} out
 **/
mat4.scale = function(out, a, v) {
    var x = v[0], y = v[1], z = v[2];

    out[0] = a[0] * x;
    out[1] = a[1] * x;
    out[2] = a[2] * x;
    out[3] = a[3] * x;
    out[4] = a[4] * y;
    out[5] = a[5] * y;
    out[6] = a[6] * y;
    out[7] = a[7] * y;
    out[8] = a[8] * z;
    out[9] = a[9] * z;
    out[10] = a[10] * z;
    out[11] = a[11] * z;
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
    return out;
};

/**
 * Rotates a mat4 by the given angle
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @param {vec3} axis the axis to rotate around
 * @returns {mat4} out
 */
mat4.rotate = function (out, a, rad, axis) {
    var x = axis[0], y = axis[1], z = axis[2],
        len = Math.sqrt(x * x + y * y + z * z),
        s, c, t,
        a00, a01, a02, a03,
        a10, a11, a12, a13,
        a20, a21, a22, a23,
        b00, b01, b02,
        b10, b11, b12,
        b20, b21, b22;

    if (Math.abs(len) < GLMAT_EPSILON) { return null; }
    
    len = 1 / len;
    x *= len;
    y *= len;
    z *= len;

    s = Math.sin(rad);
    c = Math.cos(rad);
    t = 1 - c;

    a00 = a[0]; a01 = a[1]; a02 = a[2]; a03 = a[3];
    a10 = a[4]; a11 = a[5]; a12 = a[6]; a13 = a[7];
    a20 = a[8]; a21 = a[9]; a22 = a[10]; a23 = a[11];

    // Construct the elements of the rotation matrix
    b00 = x * x * t + c; b01 = y * x * t + z * s; b02 = z * x * t - y * s;
    b10 = x * y * t - z * s; b11 = y * y * t + c; b12 = z * y * t + x * s;
    b20 = x * z * t + y * s; b21 = y * z * t - x * s; b22 = z * z * t + c;

    // Perform rotation-specific matrix multiplication
    out[0] = a00 * b00 + a10 * b01 + a20 * b02;
    out[1] = a01 * b00 + a11 * b01 + a21 * b02;
    out[2] = a02 * b00 + a12 * b01 + a22 * b02;
    out[3] = a03 * b00 + a13 * b01 + a23 * b02;
    out[4] = a00 * b10 + a10 * b11 + a20 * b12;
    out[5] = a01 * b10 + a11 * b11 + a21 * b12;
    out[6] = a02 * b10 + a12 * b11 + a22 * b12;
    out[7] = a03 * b10 + a13 * b11 + a23 * b12;
    out[8] = a00 * b20 + a10 * b21 + a20 * b22;
    out[9] = a01 * b20 + a11 * b21 + a21 * b22;
    out[10] = a02 * b20 + a12 * b21 + a22 * b22;
    out[11] = a03 * b20 + a13 * b21 + a23 * b22;

    if (a !== out) { // If the source and destination differ, copy the unchanged last row
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    }
    return out;
};

/**
 * Rotates a matrix by the given angle around the X axis
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
mat4.rotateX = function (out, a, rad) {
    var s = Math.sin(rad),
        c = Math.cos(rad),
        a10 = a[4],
        a11 = a[5],
        a12 = a[6],
        a13 = a[7],
        a20 = a[8],
        a21 = a[9],
        a22 = a[10],
        a23 = a[11];

    if (a !== out) { // If the source and destination differ, copy the unchanged rows
        out[0]  = a[0];
        out[1]  = a[1];
        out[2]  = a[2];
        out[3]  = a[3];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    }

    // Perform axis-specific matrix multiplication
    out[4] = a10 * c + a20 * s;
    out[5] = a11 * c + a21 * s;
    out[6] = a12 * c + a22 * s;
    out[7] = a13 * c + a23 * s;
    out[8] = a20 * c - a10 * s;
    out[9] = a21 * c - a11 * s;
    out[10] = a22 * c - a12 * s;
    out[11] = a23 * c - a13 * s;
    return out;
};

/**
 * Rotates a matrix by the given angle around the Y axis
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
mat4.rotateY = function (out, a, rad) {
    var s = Math.sin(rad),
        c = Math.cos(rad),
        a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a03 = a[3],
        a20 = a[8],
        a21 = a[9],
        a22 = a[10],
        a23 = a[11];

    if (a !== out) { // If the source and destination differ, copy the unchanged rows
        out[4]  = a[4];
        out[5]  = a[5];
        out[6]  = a[6];
        out[7]  = a[7];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    }

    // Perform axis-specific matrix multiplication
    out[0] = a00 * c - a20 * s;
    out[1] = a01 * c - a21 * s;
    out[2] = a02 * c - a22 * s;
    out[3] = a03 * c - a23 * s;
    out[8] = a00 * s + a20 * c;
    out[9] = a01 * s + a21 * c;
    out[10] = a02 * s + a22 * c;
    out[11] = a03 * s + a23 * c;
    return out;
};

/**
 * Rotates a matrix by the given angle around the Z axis
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
mat4.rotateZ = function (out, a, rad) {
    var s = Math.sin(rad),
        c = Math.cos(rad),
        a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a03 = a[3],
        a10 = a[4],
        a11 = a[5],
        a12 = a[6],
        a13 = a[7];

    if (a !== out) { // If the source and destination differ, copy the unchanged last row
        out[8]  = a[8];
        out[9]  = a[9];
        out[10] = a[10];
        out[11] = a[11];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    }

    // Perform axis-specific matrix multiplication
    out[0] = a00 * c + a10 * s;
    out[1] = a01 * c + a11 * s;
    out[2] = a02 * c + a12 * s;
    out[3] = a03 * c + a13 * s;
    out[4] = a10 * c - a00 * s;
    out[5] = a11 * c - a01 * s;
    out[6] = a12 * c - a02 * s;
    out[7] = a13 * c - a03 * s;
    return out;
};

/**
 * Creates a matrix from a quaternion rotation and vector translation
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.translate(dest, vec);
 *     var quatMat = mat4.create();
 *     quat4.toMat4(quat, quatMat);
 *     mat4.multiply(dest, quatMat);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {quat4} q Rotation quaternion
 * @param {vec3} v Translation vector
 * @returns {mat4} out
 */
mat4.fromRotationTranslation = function (out, q, v) {
    // Quaternion math
    var x = q[0], y = q[1], z = q[2], w = q[3],
        x2 = x + x,
        y2 = y + y,
        z2 = z + z,

        xx = x * x2,
        xy = x * y2,
        xz = x * z2,
        yy = y * y2,
        yz = y * z2,
        zz = z * z2,
        wx = w * x2,
        wy = w * y2,
        wz = w * z2;

    out[0] = 1 - (yy + zz);
    out[1] = xy + wz;
    out[2] = xz - wy;
    out[3] = 0;
    out[4] = xy - wz;
    out[5] = 1 - (xx + zz);
    out[6] = yz + wx;
    out[7] = 0;
    out[8] = xz + wy;
    out[9] = yz - wx;
    out[10] = 1 - (xx + yy);
    out[11] = 0;
    out[12] = v[0];
    out[13] = v[1];
    out[14] = v[2];
    out[15] = 1;
    
    return out;
};

/**
* Calculates a 4x4 matrix from the given quaternion
*
* @param {mat4} out mat4 receiving operation result
* @param {quat} q Quaternion to create matrix from
*
* @returns {mat4} out
*/
mat4.fromQuat = function (out, q) {
    var x = q[0], y = q[1], z = q[2], w = q[3],
        x2 = x + x,
        y2 = y + y,
        z2 = z + z,

        xx = x * x2,
        xy = x * y2,
        xz = x * z2,
        yy = y * y2,
        yz = y * z2,
        zz = z * z2,
        wx = w * x2,
        wy = w * y2,
        wz = w * z2;

    out[0] = 1 - (yy + zz);
    out[1] = xy + wz;
    out[2] = xz - wy;
    out[3] = 0;

    out[4] = xy - wz;
    out[5] = 1 - (xx + zz);
    out[6] = yz + wx;
    out[7] = 0;

    out[8] = xz + wy;
    out[9] = yz - wx;
    out[10] = 1 - (xx + yy);
    out[11] = 0;

    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;

    return out;
};

/**
 * Generates a frustum matrix with the given bounds
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {Number} left Left bound of the frustum
 * @param {Number} right Right bound of the frustum
 * @param {Number} bottom Bottom bound of the frustum
 * @param {Number} top Top bound of the frustum
 * @param {Number} near Near bound of the frustum
 * @param {Number} far Far bound of the frustum
 * @returns {mat4} out
 */
mat4.frustum = function (out, left, right, bottom, top, near, far) {
    var rl = 1 / (right - left),
        tb = 1 / (top - bottom),
        nf = 1 / (near - far);
    out[0] = (near * 2) * rl;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = (near * 2) * tb;
    out[6] = 0;
    out[7] = 0;
    out[8] = (right + left) * rl;
    out[9] = (top + bottom) * tb;
    out[10] = (far + near) * nf;
    out[11] = -1;
    out[12] = 0;
    out[13] = 0;
    out[14] = (far * near * 2) * nf;
    out[15] = 0;
    return out;
};

/**
 * Generates a perspective projection matrix with the given bounds
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {number} fovy Vertical field of view in radians
 * @param {number} aspect Aspect ratio. typically viewport width/height
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @returns {mat4} out
 */
mat4.perspective = function (out, fovy, aspect, near, far) {
    var f = 1.0 / Math.tan(fovy / 2),
        nf = 1 / (near - far);
    out[0] = f / aspect;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = f;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = (far + near) * nf;
    out[11] = -1;
    out[12] = 0;
    out[13] = 0;
    out[14] = (2 * far * near) * nf;
    out[15] = 0;
    return out;
};

/**
 * Generates a orthogonal projection matrix with the given bounds
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {number} left Left bound of the frustum
 * @param {number} right Right bound of the frustum
 * @param {number} bottom Bottom bound of the frustum
 * @param {number} top Top bound of the frustum
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @returns {mat4} out
 */
mat4.ortho = function (out, left, right, bottom, top, near, far) {
    var lr = 1 / (left - right),
        bt = 1 / (bottom - top),
        nf = 1 / (near - far);
    out[0] = -2 * lr;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = -2 * bt;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 2 * nf;
    out[11] = 0;
    out[12] = (left + right) * lr;
    out[13] = (top + bottom) * bt;
    out[14] = (far + near) * nf;
    out[15] = 1;
    return out;
};

/**
 * Generates a look-at matrix with the given eye position, focal point, and up axis
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {vec3} eye Position of the viewer
 * @param {vec3} center Point the viewer is looking at
 * @param {vec3} up vec3 pointing up
 * @returns {mat4} out
 */
mat4.lookAt = function (out, eye, center, up) {
    var x0, x1, x2, y0, y1, y2, z0, z1, z2, len,
        eyex = eye[0],
        eyey = eye[1],
        eyez = eye[2],
        upx = up[0],
        upy = up[1],
        upz = up[2],
        centerx = center[0],
        centery = center[1],
        centerz = center[2];

    if (Math.abs(eyex - centerx) < GLMAT_EPSILON &&
        Math.abs(eyey - centery) < GLMAT_EPSILON &&
        Math.abs(eyez - centerz) < GLMAT_EPSILON) {
        return mat4.identity(out);
    }

    z0 = eyex - centerx;
    z1 = eyey - centery;
    z2 = eyez - centerz;

    len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
    z0 *= len;
    z1 *= len;
    z2 *= len;

    x0 = upy * z2 - upz * z1;
    x1 = upz * z0 - upx * z2;
    x2 = upx * z1 - upy * z0;
    len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
    if (!len) {
        x0 = 0;
        x1 = 0;
        x2 = 0;
    } else {
        len = 1 / len;
        x0 *= len;
        x1 *= len;
        x2 *= len;
    }

    y0 = z1 * x2 - z2 * x1;
    y1 = z2 * x0 - z0 * x2;
    y2 = z0 * x1 - z1 * x0;

    len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
    if (!len) {
        y0 = 0;
        y1 = 0;
        y2 = 0;
    } else {
        len = 1 / len;
        y0 *= len;
        y1 *= len;
        y2 *= len;
    }

    out[0] = x0;
    out[1] = y0;
    out[2] = z0;
    out[3] = 0;
    out[4] = x1;
    out[5] = y1;
    out[6] = z1;
    out[7] = 0;
    out[8] = x2;
    out[9] = y2;
    out[10] = z2;
    out[11] = 0;
    out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
    out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
    out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
    out[15] = 1;

    return out;
};

/**
 * Returns a string representation of a mat4
 *
 * @param {mat4} mat matrix to represent as a string
 * @returns {String} string representation of the matrix
 */
mat4.str = function (a) {
    return 'mat4(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ', ' +
                    a[4] + ', ' + a[5] + ', ' + a[6] + ', ' + a[7] + ', ' +
                    a[8] + ', ' + a[9] + ', ' + a[10] + ', ' + a[11] + ', ' + 
                    a[12] + ', ' + a[13] + ', ' + a[14] + ', ' + a[15] + ')';
};

if(typeof(exports) !== 'undefined') {
    exports.mat4 = mat4;
}
;
/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/**
 * @class Quaternion
 * @name quat
 */

var quat = {};

/**
 * Creates a new identity quat
 *
 * @returns {quat} a new quaternion
 */
quat.create = function() {
    var out = new GLMAT_ARRAY_TYPE(4);
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    return out;
};

/**
 * Sets a quaternion to represent the shortest rotation from one
 * vector to another.
 *
 * Both vectors are assumed to be unit length.
 *
 * @param {quat} out the receiving quaternion.
 * @param {vec3} a the initial vector
 * @param {vec3} b the destination vector
 * @returns {quat} out
 */
quat.rotationTo = (function() {
    var tmpvec3 = vec3.create();
    var xUnitVec3 = vec3.fromValues(1,0,0);
    var yUnitVec3 = vec3.fromValues(0,1,0);

    return function(out, a, b) {
        var dot = vec3.dot(a, b);
        if (dot < -0.999999) {
            vec3.cross(tmpvec3, xUnitVec3, a);
            if (vec3.length(tmpvec3) < 0.000001)
                vec3.cross(tmpvec3, yUnitVec3, a);
            vec3.normalize(tmpvec3, tmpvec3);
            quat.setAxisAngle(out, tmpvec3, Math.PI);
            return out;
        } else if (dot > 0.999999) {
            out[0] = 0;
            out[1] = 0;
            out[2] = 0;
            out[3] = 1;
            return out;
        } else {
            vec3.cross(tmpvec3, a, b);
            out[0] = tmpvec3[0];
            out[1] = tmpvec3[1];
            out[2] = tmpvec3[2];
            out[3] = 1 + dot;
            return quat.normalize(out, out);
        }
    };
})();

/**
 * Sets the specified quaternion with values corresponding to the given
 * axes. Each axis is a vec3 and is expected to be unit length and
 * perpendicular to all other specified axes.
 *
 * @param {vec3} view  the vector representing the viewing direction
 * @param {vec3} right the vector representing the local "right" direction
 * @param {vec3} up    the vector representing the local "up" direction
 * @returns {quat} out
 */
quat.setAxes = (function() {
    var matr = mat3.create();

    return function(out, view, right, up) {
        matr[0] = right[0];
        matr[3] = right[1];
        matr[6] = right[2];

        matr[1] = up[0];
        matr[4] = up[1];
        matr[7] = up[2];

        matr[2] = view[0];
        matr[5] = view[1];
        matr[8] = view[2];

        return quat.normalize(out, quat.fromMat3(out, matr));
    };
})();

/**
 * Creates a new quat initialized with values from an existing quaternion
 *
 * @param {quat} a quaternion to clone
 * @returns {quat} a new quaternion
 * @function
 */
quat.clone = vec4.clone;

/**
 * Creates a new quat initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {quat} a new quaternion
 * @function
 */
quat.fromValues = vec4.fromValues;

/**
 * Copy the values from one quat to another
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the source quaternion
 * @returns {quat} out
 * @function
 */
quat.copy = vec4.copy;

/**
 * Set the components of a quat to the given values
 *
 * @param {quat} out the receiving quaternion
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {quat} out
 * @function
 */
quat.set = vec4.set;

/**
 * Set a quat to the identity quaternion
 *
 * @param {quat} out the receiving quaternion
 * @returns {quat} out
 */
quat.identity = function(out) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    return out;
};

/**
 * Sets a quat from the given angle and rotation axis,
 * then returns it.
 *
 * @param {quat} out the receiving quaternion
 * @param {vec3} axis the axis around which to rotate
 * @param {Number} rad the angle in radians
 * @returns {quat} out
 **/
quat.setAxisAngle = function(out, axis, rad) {
    rad = rad * 0.5;
    var s = Math.sin(rad);
    out[0] = s * axis[0];
    out[1] = s * axis[1];
    out[2] = s * axis[2];
    out[3] = Math.cos(rad);
    return out;
};

/**
 * Adds two quat's
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @returns {quat} out
 * @function
 */
quat.add = vec4.add;

/**
 * Multiplies two quat's
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @returns {quat} out
 */
quat.multiply = function(out, a, b) {
    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
        bx = b[0], by = b[1], bz = b[2], bw = b[3];

    out[0] = ax * bw + aw * bx + ay * bz - az * by;
    out[1] = ay * bw + aw * by + az * bx - ax * bz;
    out[2] = az * bw + aw * bz + ax * by - ay * bx;
    out[3] = aw * bw - ax * bx - ay * by - az * bz;
    return out;
};

/**
 * Alias for {@link quat.multiply}
 * @function
 */
quat.mul = quat.multiply;

/**
 * Scales a quat by a scalar number
 *
 * @param {quat} out the receiving vector
 * @param {quat} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {quat} out
 * @function
 */
quat.scale = vec4.scale;

/**
 * Rotates a quaternion by the given angle about the X axis
 *
 * @param {quat} out quat receiving operation result
 * @param {quat} a quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {quat} out
 */
quat.rotateX = function (out, a, rad) {
    rad *= 0.5; 

    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
        bx = Math.sin(rad), bw = Math.cos(rad);

    out[0] = ax * bw + aw * bx;
    out[1] = ay * bw + az * bx;
    out[2] = az * bw - ay * bx;
    out[3] = aw * bw - ax * bx;
    return out;
};

/**
 * Rotates a quaternion by the given angle about the Y axis
 *
 * @param {quat} out quat receiving operation result
 * @param {quat} a quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {quat} out
 */
quat.rotateY = function (out, a, rad) {
    rad *= 0.5; 

    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
        by = Math.sin(rad), bw = Math.cos(rad);

    out[0] = ax * bw - az * by;
    out[1] = ay * bw + aw * by;
    out[2] = az * bw + ax * by;
    out[3] = aw * bw - ay * by;
    return out;
};

/**
 * Rotates a quaternion by the given angle about the Z axis
 *
 * @param {quat} out quat receiving operation result
 * @param {quat} a quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {quat} out
 */
quat.rotateZ = function (out, a, rad) {
    rad *= 0.5; 

    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
        bz = Math.sin(rad), bw = Math.cos(rad);

    out[0] = ax * bw + ay * bz;
    out[1] = ay * bw - ax * bz;
    out[2] = az * bw + aw * bz;
    out[3] = aw * bw - az * bz;
    return out;
};

/**
 * Calculates the W component of a quat from the X, Y, and Z components.
 * Assumes that quaternion is 1 unit in length.
 * Any existing W component will be ignored.
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quat to calculate W component of
 * @returns {quat} out
 */
quat.calculateW = function (out, a) {
    var x = a[0], y = a[1], z = a[2];

    out[0] = x;
    out[1] = y;
    out[2] = z;
    out[3] = -Math.sqrt(Math.abs(1.0 - x * x - y * y - z * z));
    return out;
};

/**
 * Calculates the dot product of two quat's
 *
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @returns {Number} dot product of a and b
 * @function
 */
quat.dot = vec4.dot;

/**
 * Performs a linear interpolation between two quat's
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {quat} out
 * @function
 */
quat.lerp = vec4.lerp;

/**
 * Performs a spherical linear interpolation between two quat
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {quat} out
 */
quat.slerp = function (out, a, b, t) {
    // benchmarks:
    //    http://jsperf.com/quaternion-slerp-implementations

    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
        bx = b[0], by = b[1], bz = b[2], bw = b[3];

    var        omega, cosom, sinom, scale0, scale1;

    // calc cosine
    cosom = ax * bx + ay * by + az * bz + aw * bw;
    // adjust signs (if necessary)
    if ( cosom < 0.0 ) {
        cosom = -cosom;
        bx = - bx;
        by = - by;
        bz = - bz;
        bw = - bw;
    }
    // calculate coefficients
    if ( (1.0 - cosom) > 0.000001 ) {
        // standard case (slerp)
        omega  = Math.acos(cosom);
        sinom  = Math.sin(omega);
        scale0 = Math.sin((1.0 - t) * omega) / sinom;
        scale1 = Math.sin(t * omega) / sinom;
    } else {        
        // "from" and "to" quaternions are very close 
        //  ... so we can do a linear interpolation
        scale0 = 1.0 - t;
        scale1 = t;
    }
    // calculate final values
    out[0] = scale0 * ax + scale1 * bx;
    out[1] = scale0 * ay + scale1 * by;
    out[2] = scale0 * az + scale1 * bz;
    out[3] = scale0 * aw + scale1 * bw;
    
    return out;
};

/**
 * Calculates the inverse of a quat
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quat to calculate inverse of
 * @returns {quat} out
 */
quat.invert = function(out, a) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3],
        dot = a0*a0 + a1*a1 + a2*a2 + a3*a3,
        invDot = dot ? 1.0/dot : 0;
    
    // TODO: Would be faster to return [0,0,0,0] immediately if dot == 0

    out[0] = -a0*invDot;
    out[1] = -a1*invDot;
    out[2] = -a2*invDot;
    out[3] = a3*invDot;
    return out;
};

/**
 * Calculates the conjugate of a quat
 * If the quaternion is normalized, this function is faster than quat.inverse and produces the same result.
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quat to calculate conjugate of
 * @returns {quat} out
 */
quat.conjugate = function (out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    out[2] = -a[2];
    out[3] = a[3];
    return out;
};

/**
 * Calculates the length of a quat
 *
 * @param {quat} a vector to calculate length of
 * @returns {Number} length of a
 * @function
 */
quat.length = vec4.length;

/**
 * Alias for {@link quat.length}
 * @function
 */
quat.len = quat.length;

/**
 * Calculates the squared length of a quat
 *
 * @param {quat} a vector to calculate squared length of
 * @returns {Number} squared length of a
 * @function
 */
quat.squaredLength = vec4.squaredLength;

/**
 * Alias for {@link quat.squaredLength}
 * @function
 */
quat.sqrLen = quat.squaredLength;

/**
 * Normalize a quat
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quaternion to normalize
 * @returns {quat} out
 * @function
 */
quat.normalize = vec4.normalize;

/**
 * Creates a quaternion from the given 3x3 rotation matrix.
 *
 * NOTE: The resultant quaternion is not normalized, so you should be sure
 * to renormalize the quaternion yourself where necessary.
 *
 * @param {quat} out the receiving quaternion
 * @param {mat3} m rotation matrix
 * @returns {quat} out
 * @function
 */
quat.fromMat3 = (function() {
    // benchmarks:
    //    http://jsperf.com/typed-array-access-speed
    //    http://jsperf.com/conversion-of-3x3-matrix-to-quaternion

    var s_iNext = (typeof(Int8Array) !== 'undefined' ? new Int8Array([1,2,0]) : [1,2,0]);

    return function(out, m) {
        // Algorithm in Ken Shoemake's article in 1987 SIGGRAPH course notes
        // article "Quaternion Calculus and Fast Animation".
        var fTrace = m[0] + m[4] + m[8];
        var fRoot;

        if ( fTrace > 0.0 ) {
            // |w| > 1/2, may as well choose w > 1/2
            fRoot = Math.sqrt(fTrace + 1.0);  // 2w
            out[3] = 0.5 * fRoot;
            fRoot = 0.5/fRoot;  // 1/(4w)
            out[0] = (m[7]-m[5])*fRoot;
            out[1] = (m[2]-m[6])*fRoot;
            out[2] = (m[3]-m[1])*fRoot;
        } else {
            // |w| <= 1/2
            var i = 0;
            if ( m[4] > m[0] )
              i = 1;
            if ( m[8] > m[i*3+i] )
              i = 2;
            var j = s_iNext[i];
            var k = s_iNext[j];
            
            fRoot = Math.sqrt(m[i*3+i]-m[j*3+j]-m[k*3+k] + 1.0);
            out[i] = 0.5 * fRoot;
            fRoot = 0.5 / fRoot;
            out[3] = (m[k*3+j] - m[j*3+k]) * fRoot;
            out[j] = (m[j*3+i] + m[i*3+j]) * fRoot;
            out[k] = (m[k*3+i] + m[i*3+k]) * fRoot;
        }
        
        return out;
    };
})();

/**
 * Returns a string representation of a quatenion
 *
 * @param {quat} vec vector to represent as a string
 * @returns {String} string representation of the vector
 */
quat.str = function (a) {
    return 'quat(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ')';
};

if(typeof(exports) !== 'undefined') {
    exports.quat = quat;
}
;













  })(shim.exports);
})(this);

define('core/Vector2',['require','glmatrix'],function(require) {

    

    var glMatrix = require("glmatrix");
    var vec2 = glMatrix.vec2;

    var Vector2 = function(x, y) {
        
        x = x || 0;
        y = y || 0;

        this._array = vec2.fromValues(x, y);
        // Dirty flag is used by the Node to determine
        // if the matrix is updated to latest
        this._dirty = true;
    }

    Vector2.prototype = {

        constructor : Vector2,

        get x() {
            return this._array[0];
        },

        set x(value) {
            this._array[0] = value;
            this._dirty = true;
        },

        get y() {
            return this._array[1];
        },

        set y(value) {
            this._array[1] = value;
            this._dirty = true;
        },

        add : function(b) {
            vec2.add(this._array, this._array, b._array);
            this._dirty = true;
            return this;
        },

        set : function(x, y) {
            this._array[0] = x;
            this._array[1] = y;
            this._dirty = true;
            return this;
        },

        clone : function() {
            return new Vector2(this.x, this.y);
        },

        copy : function(b) {
            vec2.copy(this._array, b._array);
            this._dirty = true;
            return this;
        },

        cross : function(out, b) {
            vec2.cross(out._array, this._array, b._array);
            return this;
        },

        dist : function(b) {
            return vec2.dist(this._array, b._array);
        },

        distance : function(b) {
            return vec2.distance(this._array, b._array);
        },

        div : function(b) {
            vec2.div(this._array, this._array, b._array);
            this._dirty = true;
            return this;
        },

        divide : function(b) {
            vec2.divide(this._array, this._array, b._array);
            this._dirty = true;
            return this;
        },

        dot : function(b) {
            return vec2.dot(this._array, b._array);
        },

        len : function() {
            return vec2.len(this._array);
        },

        length : function() {
            return vec2.length(this._array);
        },
        /**
         * Perform linear interpolation between a and b
         */
        lerp : function(a, b, t) {
            vec2.lerp(this._array, a._array, b._array, t);
            this._dirty = true;
            return this;
        },

        min : function(b) {
            vec2.min(this._array, this._array, b._array);
            this._dirty = true;
            return this;
        },

        max : function(b) {
            vec2.max(this._array, this._array, b._array);
            this._dirty = true;
            return this;
        },

        mul : function(b) {
            vec2.mul(this._array, this._array, b._array);
            this._dirty = true;
            return this;
        },

        multiply : function(b) {
            vec2.multiply(this._array, this._array, b._array);
            this._dirty = true;
            return this;
        },

        negate : function() {
            vec2.negate(this._array, this._array);
            this._dirty = true;
            return this;
        },

        normalize : function() {
            vec2.normalize(this._array, this._array);
            this._dirty = true;
            return this;
        },

        random : function(scale) {
            vec2.random(this._array, scale);
            this._dirty = true;
            return this;
        },

        scale : function(s) {
            vec2.scale(this._array, this._array, s);
            this._dirty = true;
            return this;
        },
        /**
         * add b by a scaled factor
         */
        scaleAndAdd : function(b, s) {
            vec2.scaleAndAdd(this._array, this._array, b._array, s);
            this._dirty = true;
            return this;
        },

        sqrDist : function(b) {
            return vec2.sqrDist(this._array, b._array);
        },

        squaredDistance : function(b) {
            return vec2.squaredDistance(this._array, b._array);
        },

        sqrLen : function() {
            return vec2.sqrLen(this._array);
        },

        squaredLength : function() {
            return vec2.squaredLength(this._array);
        },

        sub : function(b) {
            vec2.sub(this._array, this._array, b._array);
            this._dirty = true;
            return this;
        },

        subtract : function(b) {
            vec2.subtract(this._array, this._array, b._array);
            this._dirty = true;
            return this;
        },

        transformMat2 : function(m) {
            vec2.transformMat2(this._array, this._array, m._array);
            this._dirty = true;
            return this;
        },
        transformMat2d : function(m) {
            vec2.transformMat2d(this._array, this._array, m._array);
            this._dirty = true;
            return this;
        },
        transformMat3 : function(m) {
            vec2.transformMat3(this._array, this._array, m._array);
            this._dirty = true;
            return this;
        },
        transformMat4 : function(m) {
            vec2.transformMat4(this._array, this._array, m._array);
            this._dirty = true;
            return this;
        },

        toString : function() {
            return "[" + Array.prototype.join.call(this._array, ",") + "]";
        },
    }


    function clamp(x) {
        return Math.min(Math.max(x, -1), 1);
    }

    return Vector2;

});
/**
 * Adapter to CanvasGradient
 * base of linear gradient and radial gradient
 *
 * @export{class} Gradient
 */
define('2d/Gradient',['require','core/Base','core/Vector2'],function(require) {

    var Base = require('core/Base');
    var Vector2 = require("core/Vector2");

    var Gradient = Base.derive(function(){
        return {
            stops : []
        }
    }, {
        addColorStop : function(offset, color){
            this.stops.push([offset, color]);
            this.dirty();
        },
        removeAt : function(idx){
            this.stops.splice(idx, 1);
            this.dirty();
        },
        dirty : function(){
            for (var contextId in this.cache._caches){
                this.cache._caches[contextId]['dirty'] = true;
            }
        },
        getInstance : function(ctx){
            this.cache.use(ctx.__GUID__);
            if (this.cache.get("dirty") ||
                this.cache.miss("gradient")) {
                this.update(ctx);
            }
            return this.cache.get("gradient");
        },
        update : function(ctx){}
    });

    return Gradient;
});
define('core/Matrix2d',['require','glmatrix'],function(require) {

    

    var glMatrix = require("glmatrix");
    var mat2d = glMatrix.mat2d;

    function makeProperty(n) {
        return {
            configurable : false,
            set : function(value) {
                this._array[n] = value;
                this._dirty = true;
            },
            get : function() {
                return this._array[n];
            }
        }
    }

    var Matrix2d = function() {

        this._array = mat2d.create();
    };

    var Matrix2dProto = {

        constructor : Matrix2d,

        clone : function() {
            return (new Matrix2d()).copy(this);
        },
        copy : function(b) {
            mat2d.copy(this._array, b._array);
            return this;
        },
        determinant : function() {
            return mat2d.determinant(this._array);
        },
        identity : function() {
            mat2d.identity(this._array);
            return this;
        },
        invert : function() {
            mat2d.invert(this._array, this._array);
            return this;
        },
        mul : function(b) {
            mat2d.mul(this._array, this._array, b._array);
            return this;
        },
        mulLeft : function(b) {
            mat2d.mul(this._array, b._array, this._array);
            return this;
        },
        multiply : function(b) {
            mat2d.multiply(this._array, this._array, b._array);
            return this;
        },
        multiplyLeft : function(b) {
            mat2d.multiply(this._array, b._array, this._array);
            return this;
        },
        rotate : function(rad) {
            mat2d.rotate(this._array, this._array, rad);
            return this;
        },
        scale : function(s) {
            mat2d.scale(this._array, this._array, s._array);
        },
        translate : function(v) {
            mat2d.translate(this._array, this._array, v._array);
        },
        toString : function() {
            return "[" + Array.prototype.join.call(this._array, ",") + "]";
        }
    }

    return Matrix2d;
});
/**
 * Style
 * @config  fillStyle | fill,
 * @config  strokeStyle | stroke,
 * @config  lineWidth,
 * @config  lineCap,
 * @config  lineJoin,
 * @config  lineDash,
 * @config  lineDashOffset,
 * @config  miterLimit,
 * @config  shadowColor,
 * @config  shadowOffsetX,
 * @config  shadowOffsetY,
 * @config  shadowBlur,
 * @config  globalAlpha | alpha,
 * @config  globalCompositeOperation,
 * @config  alpha,
 * @config  shadow
 */
define('2d/Style',['require','core/Base','_'],function(require) {
    
    var Base = require('core/Base');
    var _ = require('_');

    var shadowSyntaxRegex = /([0-9\-]+)\s+([0-9\-]+)\s+([0-9]+)\s+(.+)/;
    
    var Style = Base.derive({}, {

        bind : function(ctx) {
            // Alias
            var fillStyle = this.fillStyle || this.fill;
            var strokeStyle = this.strokeStyle || this.stroke;
            var globalAlpha = this.globalAlpha || this.alpha;
            var globalCompositeOperation = this.globalCompositeOperation || this.composite;
            // parse shadow string
            if (this.shadow) {
                var res = shadowSyntaxRegex.exec(trim(this.shadow));
                if (res) {
                    var shadowOffsetX = parseInt(res[1]);
                    var shadowOffsetY = parseInt(res[2]);
                    var shadowBlur = res[3];
                    var shadowColor = res[4];
                }
            }
            shadowOffsetX = this.shadowOffsetX || shadowOffsetX;
            shadowOffsetY = this.shadowOffsetY || shadowOffsetY;
            shadowBlur = this.shadowBlur || shadowBlur;
            shadowColor = this.shadowColor || shadowColor;

            (globalAlpha !== undefined) &&
                (ctx.globalAlpha = globalAlpha);
            globalCompositeOperation &&
                (ctx.globalCompositeOperation = globalCompositeOperation);
            (this.lineWidth !== undefined) &&
                (ctx.lineWidth = this.lineWidth);
            (this.lineCap !== undefined) && 
                (ctx.lineCap = this.lineCap);
            (this.lineJoin !== undefined) &&
                (ctx.lineJoin = this.lineJoin);
            (this.miterLimit !== undefined) &&
                (ctx.miterLimit = this.miterLimit);
            (shadowOffsetX !== undefined) &&
                (ctx.shadowOffsetX = shadowOffsetX);
            (shadowOffsetY !== undefined) &&
                (ctx.shadowOffsetY = shadowOffsetY);
            (shadowBlur !== undefined) &&
                (ctx.shadowBlur = shadowBlur);
            (shadowColor !== undefined) &&
                (ctx.shadowColor = shadowColor);
            this.font &&
                (ctx.font = this.font);
            this.textAlign &&
                (ctx.textAlign = this.textAlign);
            this.textBaseline &&
                (ctx.textBaseline = this.textBaseline);

            if (fillStyle) {
                // Fill style is gradient or pattern
                if (fillStyle.getInstance) {
                    ctx.fillStyle = fillStyle.getInstance(ctx);
                } else {
                    ctx.fillStyle = fillStyle;
                }
            }
            if (strokeStyle) {
                // Stroke style is gradient or pattern
                if (strokeStyle.getInstance) {
                    ctx.strokeStyle = strokeStyle.getInstance(ctx);
                } else {
                    ctx.strokeStyle = strokeStyle;
                }
            }
            // Set line dash individually
            if (this.lineDash) {
                if (ctx.setLineDash) {
                    ctx.setLineDash(this.lineDash);
                    if (typeof(this.lineDashOffset) === 'number') {
                        ctx.lineDashOffset = this.lineDashOffset;
                    }
                } else {
                    console.warn("Browser does not support setLineDash method");
                }
            }
        }
    })

    function trim(str) {
        return (str || '').replace(/^(\s|\u00A0)+|(\s|\u00A0)+$/g, '');
    }

    return Style;
});
define('util/util',['require'],function(require){

	return {
		genGUID : (function() {
			var guid = 0;
			
			return function() {
				return ++guid;
			}
		})()
	}
});
/**
 * Node of the scene tree
 * And it is the base class of all elements
 */
define('2d/Node',['require','core/Base','core/Vector2','core/Matrix2d','./Style','util/util'],function(require) {
    
    var Base = require("core/Base");
    var Vector2 = require("core/Vector2");
    var Matrix2d = require("core/Matrix2d");
    var Style = require("./Style");
    var util = require("util/util");

    var Node = Base.derive(function() {
        return {

            __GUID__ : util.genGUID(),
            
            name : '',
            
            //Axis Aligned Bounding Box
            boundingBox : {
                min : new Vector2(),
                max : new Vector2()
            },
            // z index
            z : 0,
            
            style : null,
            
            position : new Vector2(0, 0),
            rotation : 0,
            scale : new Vector2(1, 1),

            autoUpdate : true,
            transform : new Matrix2d(),
            // inverse matrix of transform matrix
            transformInverse : new Matrix2d(),
            _prevRotation : 0,

            // visible flag
            visible : true,

            _children : [],
            // virtual width of the stroke line for intersect
            intersectLineWidth : 0,

            // Clip flag
            // If it is true, this element can be used as a mask
            // and all the children will be clipped in its shape
            //
            // TODO: add an other mask flag to distinguish with the clip?
            clip : false,

            // flag of fill when drawing the element
            fill : true,
            // flag of stroke when drawing the element
            stroke : false,
            // Enable picking
            enablePicking : true
        }
    }, {
        updateTransform : function() {
            var transform = this.transform;
            if (! this.scale._dirty &&
                ! this.position._dirty &&
                this.rotation === this._prevRotation) {
                return;
            }
            if (! this.autoUpdate) {
                return;
            }
            transform.identity();
            transform.scale(this.scale);
            transform.rotate(this.rotation);
            transform.translate(this.position);

            this._prevRotation = this.rotation;
        },
        updateTransformInverse : function() {
            this.transformInverse.copy(this.transform).invert();
        },
        // intersect with the bounding box
        intersectBoundingBox : function(x, y) {
            var boundingBox = this.boundingBox;
            return  (boundingBox.min.x < x && x < boundingBox.max.x) && (boundingBox.min.y < y && y< boundingBox.max.y);
        },
        add : function(elem) {
            if (elem) {
                this._children.push(elem);
                if (elem.parent) {
                    elem.parent.remove(elem);
                }
                elem.parent = this;
            }
        },
        remove : function(elem) {
            if (elem) {
                this._children.splice(this._children.indexOf(elem), 1);
                elem.parent = null;
            }
        },
        children : function() {
            // get a copy of children
            return this._children.slice();
        },
        childAt : function(idx) {
            return this._children[idx];
        },
        draw : null,

        render : function(context) {
            
            this.trigger("beforerender", context);

            var renderQueue = this.getSortedRenderQueue();
            // TODO : some style should not be inherited ?
            context.save();
            if (this.style) {
                if (!this.style instanceof Array) {
                    for (var i = 0; i < this.style.length; i++) {
                        this.style[i].bind(context);
                    }
                } else if(this.style.bind) {
                    this.style.bind(context);
                }
            }
            this.updateTransform();
            var m = this.transform._array;
            context.transform(m[0], m[1], m[2], m[3], m[4], m[5]);

            if (this.draw) {
                this.trigger("beforedraw", context);
                this.draw(context);
                this.trigger("afterdraw", context);
            }

            //clip from current path;
            this.clip && context.clip();

            for (var i = 0; i < renderQueue.length; i++) {
                renderQueue[i].render(context);
            }
            context.restore();

            this.trigger("afterrender", context);
        },

        traverse : function(callback) {
            var stopTraverse = callback && callback(this);
            if (! stopTraverse) {
                var children = this._children;
                for (var i = 0, len = children.length; i < len; i++) {
                    children[i].traverse(callback);
                }
            }
        },

        intersect : function(x, y, eventName) {},

        // Get transformed bounding rect
        getBoundingRect : function() {

            return {
                left : null,
                top : null,
                width : null,
                height : null
            }
        },

        getWidth : function() {
            
        },

        getHeight : function() {
            
        },

        getSortedRenderQueue : function() {
            var renderQueue = this._children.slice();
            renderQueue.sort(function(x, y) {
                if (x.z === y.z)
                    return x.__GUID__ > y.__GUID__ ? 1 : -1;
                return x.z > y.z ? 1 : -1 ;
            });
            return renderQueue; 
        }
    })

    return Node;
});
define('2d/picking/Pixel',['require','core/Base'],function(require) {

    var Base = require('core/Base');

    var PixelPicking = Base.derive(function() {

        return {
            layer : null,

            downSampleRatio : 1,

            offset : 1,

            _canvas : null,
            _context : null,
            _imageData : null,

            _lookupTable : [],

        }

    }, function(){
        this.init();
    }, {
        init : function() {
            if ( ! this.layer) {
                return;
            }
            var canvas = document.createElement("canvas");
            canvas.width = this.layer.canvas.width * this.downSampleRatio;
            canvas.height = this.layer.canvas.height * this.downSampleRatio;

            this.layer.on("resize", function(){
                canvas.width = this.layer.canvas.width * this.downSampleRatio;
                canvas.height = this.layer.canvas.height * this.downSampleRatio;
            }, this);

            this._canvas = canvas;
            this._context = canvas.getContext("2d");
        },
        setPrecision : function(ratio) {
            this._canvas.width = this.layer.canvas.width * ratio;
            this._canvas.height = this.layer.canvas.height * ratio;
            this.downSampleRatio = ratio;
        },
        update : function() {
            var ctx = this._context;
            ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
            ctx.save();
            ctx.scale(this.downSampleRatio, this.downSampleRatio);
            this._lookupTable.length = 0;
            this._renderNode(this.layer, ctx);
            ctx.restore();
            // Cache the image data
            // Get image data is slow
            // http://jsperf.com/getimagedata-multi-vs-once
            var imageData = ctx.getImageData(0, 0, this._canvas.width, this._canvas.height);
            this._imageData = imageData.data;
        },
        _renderNode : function(node, ctx) {
            ctx.save();
            node.updateTransform();
            var m = node.transform._array;
            ctx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
            node.clip && ctx.clip();

            if (node.draw && node.enablePicking === true) {
                var lut = this._lookupTable;
                var rgb = packID(lut.length + this.offset);
                var color = 'rgb(' + rgb.join(',') + ')';
                this._lookupTable.push(node);
                
                ctx.fillStyle = color;
                ctx.strokeStyle = color;
                node.draw(ctx, true);
            }
            var renderQueue = node.getSortedRenderQueue();
            for (var i = 0; i < renderQueue.length; i++) {
                var child = renderQueue[i];
                this._renderNode(child, ctx);
            }
            ctx.restore();
        },
        pick : function(x, y) {
            var ratio = this.downSampleRatio;
            var width = this._canvas.width;
            var height = this._canvas.height;
            x = Math.ceil(ratio * x);
            y = Math.ceil(ratio * y);

            // Box sampler, to avoid the problem of anti aliasing
            var ids = [
                        this._sample(x, y),
                        this._sample(x-1, y),
                        this._sample(x+1, y),
                        this._sample(x, y-1),
                        this._sample(x, y+1),
                    ];
            var count = {};
            var max = 0;
            var maxId;
            for (var i = 0; i < ids.length; i++) {
                var id = ids[i];
                if (!count[id]) {
                    count[id]  = 1;
                } else {
                    count[id] ++;
                }
                if (count[id] > max) {
                    max = count[id];
                    maxId = id;
                }
            }

            var id = maxId - this.offset;

            if (id && max >=2) {
                var el = this._lookupTable[id];
                return el;
            }
        },

        _sample : function(x, y) {
            x = Math.max(Math.min(x, this._canvas.width), 1);
            y = Math.max(Math.min(y, this._canvas.height), 1);
            var offset = ((y-1) * this._canvas.width + (x-1))*4;
            var data = this._imageData;
            var r = data[offset],
                g = data[offset+1],
                b = data[offset+2];

            return unpackID(r, g, b);
        }
    });


    function packID(id){
        var r = id >> 16;
        var g = (id - (r << 8)) >> 8;
        var b = id - (r << 16) - (g<<8);
        return [r, g, b];
    }

    function unpackID(r, g, b){
        return (r << 16) + (g<<8) + b;
    }

    return PixelPicking;
});
define('2d/Layer',['require','./Node','./picking/Pixel'],function(require) {

    var Node = require('./Node');
    var PixelPicking = require('./picking/Pixel');

    var Layer = Node.derive(function() {
        return {
            canvas : null,

            ctx : null,
            
            width : 0,
            
            height : 0,
            
            clearColor : '',

            enablePicking : true,

            picking : null
        }
    }, function() {
        if (!this.canvas) {
            this.canvas = document.createElement('canvas');
        }

        if (this.width) {
            this.canvas.width = this.width;
        } else {
            this.width = this.canvas.width;
        }
        if (this.height) {
            this.canvas.height = this.height;
        } else {
            this.height = this.canvas.height;
        }

        this.canvas.style.zIndex = this.z;

        this.ctx = this.canvas.getContext('2d');

        this.ctx.__GUID__ = this.__GUID__;

        if (this.enablePicking) {
            this.picking = new PixelPicking({
                layer : this
            });
        }
    }, {
        resize : function(width, height) {
            this.canvas.width = width;
            this.canvas.height = height;

            this.width = width;
            this.height = height;

            this.trigger("resize", width, height);
        },

        render : function() {
            if (this.clearColor) {
                this.ctx.fillStyle = this.clearColor;
                this.ctx.fillRect(0, 0, this.width, this.height);
            } else {
                this.ctx.clearRect(0, 0, this.width, this.height);
            }

            Node.prototype.render.call(this, this.ctx);

            if (this.enablePicking) {
                this.picking.update();
            }
        },

        setZ : function(z) {
            this.z = z;
            this.canvas.style.zIndex = z;
        }
    });

    return Layer;
} );
/**
 * Adapter to CanvasLinearGradient
 *
 * @export{class} LinearGradient
 */
define('2d/LinearGradient',['require','./Gradient','core/Vector2'],function(require) {

    var Gradient = require('./Gradient');
    var Vector2 = require("core/Vector2");

    var LinearGradient = Gradient.derive(function(){
        return {
            start : new Vector2(),
            end : new Vector2(100, 0)
        }
    }, {
        update : function(ctx){
            var gradient = ctx.createLinearGradient(this.start.x, this.start.y, this.end.x, this.end.y);
            for (var i = 0; i < this.stops.length; i++) {
                var stop = this.stops[i];
                gradient.addColorStop(stop[0], stop[1]);
            }
            this.cache.put('gradient', gradient);
        }
    });

    return LinearGradient;
});
/**
 * Adapter to CanvasPattern
 *
 * @export{class} Pattern
 */
define('2d/Pattern',['require','core/Base','core/Vector2'],function(require) {

    var Base = require('core/Base');
    var Vector2 = require("core/Vector2");

    var Pattern = Base.derive(function(){
        return {
            image : null,
            // 'repeat', 'repeat-x', 'repeat-y', 'no-repeat'
            repetition : 'repeat'
        }
    }, {
        getInstance : function(ctx){
            this.cache.use(ctx.__GUID__);
            if (this.cache.get("dirty") ||
                this.cache.miss("pattern")) {
                var pattern = ctx.createPattern(this.image, this.repetition);
                this.cache.put("pattern", pattern);
                return pattern;
            }
            return this.cache.get("pattern");
        },
    });

    return Pattern;
});
/**
 * Adapter to CanvasRadialGradient
 *
 * @export{class} RadialGradient
 */
define('2d/RadialGradient',['require','./Gradient','core/Vector2'],function(require) {

    var Gradient = require('./Gradient');
    var Vector2 = require("core/Vector2");

    var RadialGradient = Gradient.derive(function(){
        return {
            start : new Vector2(),
            startRadius : 0,
            end : new Vector2(),
            endRadius : 0
        }
    }, {
        update : function(ctx){
            var gradient = ctx.createRadialGradient(this.start.x, this.start.y, this.startRadius, this.end.x, this.end.y, this.endRadius);
            for (var i = 0; i < this.stops.length; i++) {
                var stop = this.stops[i];
                gradient.addColorStop(stop[0], stop[1]);
            }
            this.cache.put('gradient', gradient);
        }
    });

    return RadialGradient;
});
define('core/Event',['require','./Base'], function(require) {

    var Base = require('./Base');

    var QEvent = Base.derive({
        cancelBubble : false
    }, {
        stopPropagation : function() {
            this.cancelBubble = true;
        }
    });

    QEvent.throw = function(eventType, target, props) {
        
        var e = new QEvent(props);

        e.type = eventType;
        e.target = target;

        // enable bubbling
        while (target && !e.cancelBubble ) {
            e.currentTarget = target;
            target.trigger(eventType, e);

            target = target.parent;
        }
    }

    return QEvent;
} );
define('2d/Stage',['require','core/Base','./Layer','core/Event'],function(require) {

    var Base = require('core/Base');
    var Layer = require('./Layer');
    var QEvent = require('core/Event');

    var Stage = Base.derive(function() {
        return {
            container : null,

            width : 100,
            height : 100,

            _layers : [],

            _layersSorted : [],

            _mouseOverEl : null
        }
    }, function() {
        
        if (!this.container) {
            this.container = document.createElement('div');
        }
        if (this.container.style.position !== 'absolute' &&
            this.container.style.position !== 'fixed') {
            this.container.style.position = 'relative';
        }

        if (this.width) {
            this.container.style.width = this.width + 'px';
        } else {
            this.width = this.container.clientWidth;
        }
        if (this.height) {
            this.container.style.height = this.height + 'px';
        } else {
            this.height = this.container.clientHeight;
        }

        this.container.addEventListener("click", this._eventProxy.bind(this, 'click'));
        this.container.addEventListener("dblclick", this._eventProxy.bind(this, 'dblclick'));
        this.container.addEventListener("mousemove", this._mouseMoveHandler.bind(this));
        this.container.addEventListener("mousedown", this._eventProxy.bind(this, 'mousedown'));
        this.container.addEventListener("mouseup", this._eventProxy.bind(this, 'mouseup'));
        this.container.addEventListener("mouseout", this._mouseOutHandler.bind(this));
    }, {

        createLayer : function(options) {
            options = options || {};
            options.width = this.width;
            options.height = this.height;

            var layer = new Layer(options);
            this.addLayer(layer);

            return layer;
        },

        addLayer : function(layer) {
            layer.resize(this.width, this.height);

            var canvas = layer.canvas;
            canvas.style.position = 'absolute';
            canvas.style.left = '0px';
            canvas.style.top = '0px';

            this.container.appendChild(layer.canvas);

            this._layers.push(layer);
            this._layersSorted = this._layers.slice().sort(function(a, b){
                if (a.z === b.z)
                    return a.__GUID__ > b.__GUID__ ? 1 : -1;
                return a.z > b.z ? 1 : -1 ;
            });
        },

        removeLayer : function(layer) {
            this._layers.splice(this._layers.indexOf(layer), 1);

            this.container.removeChild(layer.canvas);
        },

        resize : function(width, height) {
            this.width = width;
            this.height = height;

            for (var i = 0; i < this._layers.length; i++) {
                this._layers[i].resize(width, height);
            }

            this.trigger("resize", width, height);
        },

        render : function() {
            for (var i = 0; i < this._layers.length; i++) {
                this._layers[i].render();
            }
        },

        _eventProxy : function(type, e) {
            var el = this._findTrigger(e);
            if (el) {
                QEvent.throw(type, el, this._assembleE(e));
            }
        },

        _mouseMoveHandler : function(e) {
            var el = this._findTrigger(e);
            if (el) {
                QEvent.throw('mousemove', el, this._assembleE(e));
            }

            if (this._mouseOverEl !== el) {
                if (this._mouseOverEl) {
                    QEvent.throw('mouseout', this._mouseOverEl, this._assembleE(e));
                }
                if (el) {
                    QEvent.throw('mouseover', el, this._assembleE(e));
                }
                this._mouseOverEl = el;
            }
        },

        _mouseOutHandler : function(e) {
            if (this._mouseOverEl) {
                QEvent.throw('mouseout', this._mouseOverEl, this._assembleE(e));
            }
        },

        _findTrigger : function(e) {
            var container = this.container;
            var clientRect = container.getBoundingClientRect();
            var x = e.pageX - clientRect.left - document.body.scrollLeft,
                y = e.pageY - clientRect.top - document.body.scrollTop;

            for (var i = this._layersSorted.length - 1; i >= 0 ; i--) {
                var layer = this._layersSorted[i];
                var el = layer.picking.pick(x, y);
                if (el) {
                    return el;
                }
            }
        },

        _assembleE : function(e){
            return {
                pageX : e.pageX,
                pageY : e.pageY
            }
        }

    });

    return Stage;
});
;
define("2d/picking/Box", function(){});

define('2d/shape/Arc',['require','../Node','core/Vector2'],function(require){

    var Node = require('../Node');
    var Vector2 = require("core/Vector2");

    var Arc = Node.derive(function() {
        return {
            center      : new Vector2(),
            radius      : 0,
            startAngle  : 0,
            endAngle    : Math.PI*2,
            clockwise   : true
        }
    }, {
        computeBoundingBox : function() {
             util.computeArcBoundingBox(
                this.center, this.radius, this.startAngle, 
                this.endAngle, this.clockwise,
                this.boundingBox.min, this.boundingBox.max
            );
        },
        draw : function(contex) {

            ctx.beginPath();
            ctx.arc(this.center.x, this.center.y, this.radius, this.startAngle, this.endAngle,  ! this.clockwise);
            if (this.stroke) {
                ctx.stroke();
            }
            if (this.fill) {
                ctx.fill();
            }   
        },
        intersect : function(x, y){
            // TODO
            return false;
        }
    })

    return Arc;
});
define('2d/shape/Circle',['require','../Node','core/Vector2'],function(require){

    var Node = require('../Node');
    var Vector2 = require("core/Vector2");

    var Circle = Node.derive(function() {
        return {
            center : new Vector2(),
            radius : 0   
        }

    }, {
        computeBoundingBox : function() {
            this.boundingBox = {
                min : new Vector2(this.center.x-this.radius, this.center.y-this.radius),
                max : new Vector2(this.center.x+this.radius, this.center.y+this.radius)
            }
        },
        draw : function(ctx) {

            ctx.beginPath();
            ctx.arc(this.center.x, this.center.y, this.radius, 0, 2*Math.PI, false);
            
            if (this.stroke) {
                ctx.stroke();
            }
            if (this.fill) {
                ctx.fill();
            }
        },
        intersect : function() {

            return vec2.len([this.center[0]-x, this.center[1]-y]) < this.radius;
        }
    } )

    return Circle;
});
define('2d/shape/Ellipse',['require','../Node','core/Vector2'],function(require){

    var Node = require('../Node');
    var Vector2 = require("core/Vector2");

    var Ellipse = Node.derive(function() {
        return {
            center : new Vector2(),
            radius : new Vector2()   
        }

    }, {
        computeBoundingBox : function() {
            this.boundingBox = {
                min : this.center.clone().sub(this.radius),
                max : this.center.clone().add(this.radius)
            }
        },
        draw : function(ctx) {
            ctx.save();
            ctx.translate(this.center.x, this.center.y);
            ctx.scale(1, this.radius.y / this.radius.x);
            ctx.beginPath();
            ctx.arc(0, 0, this.radius.x, 0, 2*Math.PI, false);
            
            if (this.stroke) {
                ctx.stroke();
            }
            if (this.fill) {
                ctx.fill();
            }
            ctx.restore();
        },
        intersect : function() {

            return vec2.len([this.center[0]-x, this.center[1]-y]) < this.radius;
        }
    } )

    return Ellipse;
});
/**
 * https://developer.mozilla.org/en-US/docs/HTML/Canvas/Drawing_DOM_objects_into_a_canvas
 * @export{class} HTML
 */
define('2d/shape/HTML',['require','../Node'],function(require){

    var Node = require("../Node");

    var tpl = '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">\
                    <foreignObject>\
                        {html}\
                    </foreignObject>';

    var HTML = Node.derive(function() {
        return {
            // html string
            html : '',

            _img : null
        }
    }, {
        draw : function(ctx){
            
            var html = this.html;
            var svg = tpl.replace('{html}', html);

            if (!this._img) {
                this.update();
            }

            if (this._img.complete) {
                ctx.drawImage(this._img, 0, 0);
            }
        },

        update : function(){
            var _blob = new Blob([svg], {type:'image/svg+xml;charset=utf-8'});
            var img = new Image();
            var URL = window.URL || window.webkitURL || window;
            var url = URL.createObjectURL(_blob);

            img.onload = function(){
                this.trigger("load");
                URL.revokeObjectURL(url);
            }

            img.src = url;
        }
    });

    return HTML;
});
define('2d/shape/Image',['require','../Node','core/Vector2','_'],function(require) {

    var Node = require('../Node');
    var Vector2 = require("core/Vector2");
    var _ = require("_");

    var _imageCache = {};
    
    var QTImage = Node.derive(function() {
        return {
            image     : null,
            start   : new Vector2(),
            size    : null
        }
    }, {
        computeBoundingBox : function() {
            if (this.size){
                this.boundingBox = {
                    min : this.start.clone(),
                    max : this.start.clone().add(this.size)
                }   
            }
        },
        draw : function(ctx, isPicker) {
            if (this.image && ! isPicker) {
                this.size ? 
                    ctx.drawImage(this.image, this.start.x, this.start.y, this.size.x, this.size.y) :
                    ctx.drawImage(this.image, this.start.x, this.start.y);
            }
        },
        intersect : function(x, y) {
            return this.intersectBoundingBox(x, y);
        }
    });

    QTImage.load = function(src, callback){
        if (_imageCache[src]) {
            var img = _imageCache[src];
            if (img.constructor == Array) {
                img.push(callback);
            } else {
                callback(img);
            }
        } else {
            _imageCache[src] = [callback];
            var img = new Image();
            img.onload = function() {
                _.each(_imageCache[src], function(cb) {
                    cb(img);
                });
                _imageCache[src] = img;

                img.onload = null;
            }
            img.src = src;
        }
    }
    
    return QTImage;
});
/**
 *
 * @export{object}
 */
define('2d/util',['require','core/Vector2','glmatrix'],function(require) {
    
    var Vector2 = require("core/Vector2");
    var glMatrix = require("glmatrix");
    var vec2 = glMatrix.vec2;

    var tmp = new Vector2();

    var util =  {
        fixPos: function(pos) {
            pos.x += 0.5;
            pos.y += 0.5;
            return pos;
        },
        fixPosArray : function(poslist) {
            var len = poslist.length;
            for(var i = 0; i < len; i++) {
                this.fixPos(poslist[i]);
            }
            return poslist;
        },
        computeBoundingBox : function(points, min, max) {
            var left = points[0].x;
            var right = points[0].x;
            var top = points[0].y;
            var bottom = points[0].y;
            
            for (var i = 1; i < points.length; i++) {
                var p = points[i];
                if (p.x < left) {
                    left = p.x;
                }
                if (p.x > right) {
                    right = p.x;
                }
                if (p.y < top) {
                    top = p.y;
                }
                if (p.y > bottom) {
                    bottom = p.y;
                }
            }
            min.set(left, top);
            max.set(right, bottom);
        },

        // http://pomax.github.io/bezierinfo/#extremities
        computeCubeBezierBoundingBox : function(p0, p1, p2, p3, min, max) {
            // var seg = (p0.dist(p1) + p2.dist(p3) + p0.dist(p3)) / 20;

            // min.copy(p0).min(p3);
            // max.copy(p0).max(p3);

            // for (var i = 1; i < seg; i++) {
            //     var t = i / seg;
            //     var t2 = t * t;
            //     var ct = 1 - t;
            //     var ct2 = ct * ct;
            //     var x = ct2 * ct * p0.x + 3 * ct2 * t * p1.x + 3 * ct * t2 * p2.x + t2 * t * p3.x;
            //     var y = ct2 * ct * p0.y + 3 * ct2 * t * p1.y + 3 * ct * t2 * p2.y + t2 * t * p3.y;

            //     tmp.set(x, y);
            //     min.min(tmp);
            //     max.max(tmp);
            // }
            var xDim = util._computeCubeBezierExtremitiesDim(p0.x, p1.x, p2.x, p3.x);
            var yDim = util._computeCubeBezierExtremitiesDim(p0.y, p1.y, p2.y, p3.y);

            xDim.push(p0.x, p3.x);
            yDim.push(p0.y, p3.y);

            var left = Math.min.apply(null, xDim);
            var right = Math.max.apply(null, xDim);
            var top = Math.min.apply(null, yDim);
            var bottom = Math.max.apply(null, yDim);

            min.set(left, top);
            max.set(right, bottom);
        },

        _computeCubeBezierExtremitiesDim : function(p0, p1, p2, p3) {
            var extremities = [];

            var b = 6 * p2 - 12 * p1 + 6 * p0;
            var a = 9 * p1 + 3 * p3 - 3 * p0 - 9 * p2;
            var c = 3 * p1 - 3 * p0;

            var tmp = b * b - 4 * a * c;
            if (tmp > 0){
                var tmpSqrt = Math.sqrt(tmp);
                var t1 = (-b + tmpSqrt) / (2 * a);
                var t2 = (-b - tmpSqrt) / (2 * a);
                extremities.push(t1, t2);
            } else if(tmp == 0) {
                extremities.push(-b / (2 * a));
            }
            var result = [];
            for (var i = 0; i < extremities.length; i++) {
                var t = extremities[i];
                if (Math.abs(2 * a * t + b) > 0.0001 && t < 1 && t > 0) {
                    var ct = 1 - t;
                    var val = ct * ct * ct * p0 
                            + 3 * ct * ct * t * p1
                            + 3 * ct * t * t * p2
                            + t * t *t * p3;

                    result.push(val);
                }
            }

            return result;
        },

        // http://pomax.github.io/bezierinfo/#extremities
        computeQuadraticBezierBoundingBox : function(p0, p1, p2, min, max) {
            // Find extremities, where derivative in x dim or y dim is zero
            var tmp = (p0.x + p2.x - 2 * p1.x);
            // p1 is center of p0 and p2 in x dim
            if (tmp === 0) {
                var t1 = 0.5;
            } else {
                var t1 = (p0.x - p1.x) / tmp;
            }

            tmp = (p0.y + p2.y - 2 * p1.y);
            // p1 is center of p0 and p2 in y dim
            if (tmp === 0) {
                var t2 = 0.5;
            } else {
                var t2 = (p0.y - p1.y) / tmp;
            }

            t1 = Math.max(Math.min(t1, 1), 0);
            t2 = Math.max(Math.min(t2, 1), 0);

            var ct1 = 1-t1;
            var ct2 = 1-t2;

            var x1 = ct1 * ct1 * p0.x + 2 * ct1 * t1 * p1.x + t1 * t1 * p2.x;
            var y1 = ct1 * ct1 * p0.y + 2 * ct1 * t1 * p1.y + t1 * t1 * p2.y;

            var x2 = ct2 * ct2 * p0.x + 2 * ct2 * t2 * p1.x + t2 * t2 * p2.x;
            var y2 = ct2 * ct2 * p0.y + 2 * ct2 * t2 * p1.y + t2 * t2 * p2.y;

            return util.computeBoundingBox(
                        [p0.clone(), p2.clone(), new Vector2(x1, y1), new Vector2(x2, y2)],
                        min, max
                    );
        },
        // http://stackoverflow.com/questions/1336663/2d-bounding-box-of-a-sector
        computeArcBoundingBox : (function(){
            var start = new Vector2();
            var end = new Vector2();
            // At most 4 extremities
            var extremities = [new Vector2(), new Vector2(), new Vector2(), new Vector2()];
            return function(center, radius, startAngle, endAngle, clockwise, min, max) {
                clockwise = clockwise ? 1 : -1;
                start
                    .set(Math.cos(startAngle), Math.sin(startAngle) * clockwise)
                    .scale(radius)
                    .add(center);
                end
                    .set(Math.cos(endAngle), Math.sin(endAngle) * clockwise)
                    .scale(radius)
                    .add(center);
                
                startAngle = startAngle % (Math.PI * 2);
                if (startAngle < 0) {
                    startAngle = startAngle + Math.PI * 2;
                }
                endAngle = endAngle % (Math.PI * 2);
                if (endAngle < 0) {
                    endAngle = endAngle + Math.PI * 2;
                }

                if (startAngle > endAngle) {
                    endAngle += Math.PI * 2;
                }
                var number = 0;
                for (var angle = 0; angle < endAngle; angle += Math.PI / 2) {
                    if (angle > startAngle) {
                        extremities[number++]
                            .set(Math.cos(angle), Math.sin(angle) * clockwise)
                            .scale(radius)
                            .add(center);
                    }
                }
                var points = extremities.slice(0, number)
                points.push(start, end);
                util.computeBoundingBox(points, min, max);
            }
        })()
    }

    return util;
} );
define('2d/shape/Line',['require','../Node','../util','core/Vector2'],function(require) {

    var Node = require('../Node');
    var util = require('../util');
    var Vector2 = require("core/Vector2");

    var Line = Node.derive(function() {
        return {
            start : new Vector2(),
            end : new Vector2(),
            width : 0   //virtual width of the line for intersect computation 
        }
    }, {
        computeBoundingBox : function() {

            this.boundingBox = util.computeBoundingBox(
                                    [this.start, this.end],
                                    this.boundingBox.min,
                                    this.boundingBox.max
                                );
            
            if (this.boundingBox.min.x == this.boundingBox.max.x) { //line is vertical
                this.boundingBox.min.x -= this.width/2;
                this.boundingBox.max.x += this.width/2;
            }
            if (this.boundingBox.min.y == this.boundingBox.max.y) { //line is horizontal
                this.boundingBox.min.y -= this.width/2;
                this.boundingBox.max.y += this.width/2;
            }
        },
        draw : function(ctx) {
            
            var start = this.start,
                end = this.end;

            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();

        },
        intersect : function() {
            var a = new Vector2();
            var ba = new Vector2();
            var bc = new Vector2();

            return function(x, y) {
                if (!this.intersectBoundingBox(x, y)) {
                    return false;
                }
                var b = this.start;
                var c = this.end;

                a.set(x, y);
                ba.copy(a).sub(b);
                bc.copy(c).sub(b);

                var bal = ba.length();
                var bcl = bc.length();

                var tmp = bal * ba.scale(1/bal).dot(bcl.scale(1/bcl));

                var distSquare = bal * bal -  tmp * tmp;
                return distance < this.width * this.width * 0.25;
            }
        }
    });

    return Line;
});
/**
 *
 * Inspired by path in paper.js
 */
define('2d/shape/Path',['require','../Node','../util','core/Vector2'],function(require) {

    var Node = require('../Node');
    var util = require('../util');
    var Vector2 = require("core/Vector2");

    var minTmp = new Vector2();
    var maxTmp = new Vector2();

    var Path = Node.derive(function() {
        return {
            segments : [],
            closePath : false
        }
    }, {
        computeBoundingBox : function() {
            var l = this.segments.length;
            var segs = this.segments;

            var min = this.boundingBox.min;
            var max = this.boundingBox.max;
            min.set(999999, 999999);
            max.set(-999999, -999999);
            
            for (var i = 1; i < l; i++) {
                if (segs[i-1].handleOut || segs[i].handleIn) {
                    var bb = util.computeCubeBezierBoundingBox(
                                segs[i-1].point,
                                segs[i-1].handleOut || segs[i-1].point,
                                segs[i].handleIn || segs[i].point,
                                segs[i].point,
                                minTmp, maxTmp
                            );
                    min.min(minTmp);
                    max.max(maxTmp);
                } else {
                    min.min(segs[i-1].point);
                    min.min(segs[i].point);

                    max.max(segs[i-1].point);
                    max.max(segs[i].point);
                }
            }
        },
        draw : function(ctx) {
            
            var l = this.segments.length;
            var segs = this.segments;
            
            ctx.beginPath();
            ctx.moveTo(segs[0].point.x, segs[0].point.y);
            for (var i = 1; i < l; i++) {
                if (segs[i-1].handleOut || segs[i].handleIn) {
                    var prevHandleOut = segs[i-1].handleOut || segs[i-1].point;
                    var handleIn = segs[i].handleIn || segs[i].point;
                    ctx.bezierCurveTo(prevHandleOut.x, prevHandleOut.y,
                            handleIn.x, handleIn.y, segs[i].point.x, segs[i].point.y);
                } else {
                    ctx.lineTo(segs[i].point.x, segs[i].point.y);
                }
            }
            if (this.closePath) {
                if (segs[l-1].handleOut || segs[0].handleIn) {
                    var prevHandleOut = segs[l-1].handleOut || segs[l-1].point;
                    var handleIn = segs[0].handleIn || segs[0].point;
                    ctx.bezierCurveTo(prevHandleOut.x, prevHandleOut.y,
                            handleIn.x, handleIn.y, segs[0].point.x, segs[0].point.y);
                } else {
                    ctx.lineTo(segs[0].point.x, segs[0].point.y);
                }
            }
            if (this.fill) {
                ctx.fill();
            }
            if (this.stroke) {
                ctx.stroke();
            }
        },
        smooth : function(degree) {

            var len = this.segments.length;
            var segs = this.segments;

            var v = new Vector2();
            for (var i = 0; i < len; i++) {
                var point = segs[i].point;
                var prevPoint = (i == 0) ? segs[len-1].point : segs[i-1].point;
                var nextPoint = (i == len-1) ? segs[0].point : segs[i+1].point;
                var degree = segs[i].smoothLevel || degree || 1;

                v.copy(nextPoint).sub(prevPoint).scale(0.25);

                //use degree to scale the handle length
                v.scale(degree);
                if (!segs[i].handleIn) {
                    segs[i].handleIn = point.clone().sub(v);
                } else {
                    segs[i].handleIn.copy(point).sub(v);
                }
                if (!segs[i].handleOut) {
                    segs[i].handleOut = point.clone().add(v);
                } else {
                    segs[i].handleOut.copy(point).add(v);
                }
            }
        },
        pushPoints : function(points) {
            for (var i = 0; i < points.length; i++) {
                this.segments.push({
                    point : points[i],
                    handleIn : null,
                    handleOut : null
                })
            }
        }
    })

    return Path;
});
define('2d/shape/Polygon',['require','../Node','../util','core/Vector2'],function(require) {

    var Node = require('../Node');
    var util = require('../util');
    var Vector2 = require("core/Vector2");

    var Polygon = Node.derive(function() {
        return {
            points : []
        }
    }, {
        computeBoundingBox : function() {
            this.boundingBox = util.computeBoundingBox(
                                    this.points,
                                    this.boundingBox.min,
                                    this.boundingBox.max
                                );
        },
        draw : function(ctx) {

            var points = this.points;

            ctx.beginPath();
            
            ctx.moveTo(points[0].x, points[0].y);
            for (var i =1; i < points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y);
            }
            ctx.closePath();
            if (this.stroke) {
                ctx.stroke();
            }
            if (this.fill) {
                ctx.fill();
            }
        },
        intersect : function(x, y) {
    
            if (!this.intersectBoundingBox(x, y)) {
                return false;
            }

            var len = this.points.length;
            var angle = 0;
            var points = this.points;
            var vec1 = new Vector2();
            var vec2 = new Vector2();
            for (var i =0; i < len; i++) {
                vec1.set(x, y).sub(points[i]).normalize().negate();
                var j = (i+1)%len;
                vec2.set(x, y).sub(points[j]).normalize().negate();
                var piece = Math.acos(vec1.dot(vec2));
                angle += piece;
            }
            return Math.length(angle - 2*Math.PI) < 0.001;
        }
    })

    return Polygon;
});
define('2d/shape/Rectangle',['require','../Node','../util','core/Vector2'],function(require){

    var Node = require('../Node');
    var util = require('../util');
    var Vector2 = require("core/Vector2");

    var Rectangle = Node.derive( function() {
        return {
            start : new Vector2(0, 0),
            size : new Vector2(0, 0)
        }
    }, {
        computeBoundingBox : function() {
            return {
                min : this.start.clone(),
                max : this.size.clone().add(this.start)
            }
        },
        draw : function(ctx) {

            var start = this.start;

            ctx.beginPath();
            ctx.rect(start.x, start.y, this.size.x, this.size.y);
            if (this.stroke){
                ctx.stroke();
            }
            if (this.fill){
                ctx.fill();
            }
        },
        intersect : function(x, y) {
            return this.intersectBoundingBox(x, y);
        }
    })

    return Rectangle;
});
/**
 * @export{class} RoundedRectangle
 */
define('2d/shape/RoundedRectangle',['require','../Node','../util','core/Vector2'],function(require) {

    var Node = require('../Node');
    var util = require('../util');
    var Vector2 = require("core/Vector2");

    var RoundedRectange = Node.derive(function() {
        return {
            start   : new Vector2(),
            size    : new Vector2(),
            radius  : 0
        }
    }, {
        computeBoundingBox : function() {
            this.boundingBox = {
                min : this.start.clone(),
                max : this.size.clone().add(this.start)
            }
        },
        draw : function(ctx) {

            if (this.radius.constructor == Number) {
                // topleft, topright, bottomright, bottomleft
                var radius = [this.radius, this.radius, this.radius, this.radius];
            } else if (this.radius.length == 2) {
                var radius = [this.radius[0], this.radius[1], this.radius[0], this.radius[1]];
            } else {
                var radius = this.radius;
            }

            var start = this.fixAA ? util.fixPos(this.start.clone()) : this.start;
            var size = this.size;
            var v1 = new Vector2().copy(start).add(new Vector2(radius[0], 0));   //left top
            var v2 = new Vector2().copy(start).add(new Vector2(size.x, 0));     //right top
            var v3 = new Vector2().copy(start).add(size);                        //right bottom
            var v4 = new Vector2().copy(start).add(new Vector2(0, size.y));     //left bottom
            ctx.beginPath();
            ctx.moveTo(v1.x, v1.y);
            radius[1] ? 
                ctx.arcTo(v2.x, v2.y, v3.x, v3.y, radius[1]) :
                ctx.lineTo(v2.x, v2.y);
            radius[2] ?
                ctx.arcTo(v3.x, v3.y, v4.x, v4.y, radius[2]) :
                ctx.lineTo(v3.x, v3.y);
            radius[3] ?
                ctx.arcTo(v4.x, v4.y, start.x, start.y, radius[3]) :
                ctx.lineTo(v4.x, v4.y);
            radius[0] ? 
                ctx.arcTo(start.x, start.y, v2.x, v2.y, radius[0]) :
                ctx.lineTo(start.x, start.y);
            
            if (this.stroke) {
                ctx.stroke();
            }
            if (this.fill) {
                ctx.fill();
            }
        },
        intersect : function(x, y) {
            // TODO
            return false;
        }
    })

    return RoundedRectange;
});
/**
 * 
 * @export{class} SVGPath
 */
define('2d/shape/SVGPath',['require','2d/Node','2d/util','core/Vector2'],function(require) {

    var Node = require("2d/Node");
    var util = require("2d/util");
    var Vector2 = require("core/Vector2");

    var availableCommands = {'m':1,'M':1,'z':1,'Z':1,'l':1,'L':1,'h':1,'H':1,'v':1,'V':1,'c':1,'C':1,'s':1,'S':1,'q':1,'Q':1,'t':1,'T':1,'a':1,'A':1}

    var SVGPath = Node.derive(function() {
        return {
            description : '',
            _ops : []
        }
    }, {
        draw : function(ctx) {
            if (!this._ops.length) {
                this.parse();
            }

            ctx.beginPath();
            for (var i = 0; i < this._ops.length; i++) {
                var op = this._ops[i];
                switch(op[0]) {
                    case 'm':
                        ctx.moveTo(op[1], op[2]);
                        break;
                    case 'l':
                        ctx.lineTo(op[1], op[2]);
                        break;
                    case 'c':
                        ctx.bezierCurveTo(op[1], op[2], op[3], op[4], op[5], op[6]);
                        break;
                    case 'q':
                        ctx.quadraticCurveTo(op[1], op[2], op[3], op[4]);
                        break;
                    case 'z':
                        ctx.closePath();
                        if (this.fill) {
                            ctx.fill();
                        }
                        if (this.stroke) {
                            ctx.stroke();
                        }
                        ctx.beginPath();
                        break;
                }
            }
            if (this.fill) {
                ctx.fill();
            }
            if (this.stroke) {
                ctx.stroke();
            }
        },

        computeBoundingBox : (function() {
            // Temp variables
            var current = new Vector2();
            var p1 = new Vector2();
            var p2 = new Vector2();
            var p3 = new Vector2();

            var minTmp = new Vector2();
            var maxTmp = new Vector2();

            return function() {
                if (!this._ops.length) {
                    this.parse();
                }
                var min = new Vector2(999999, 999999);
                var max = new Vector2(-999999, -999999);

                for (var i = 0; i < this._ops.length; i++) {
                    var op = this._ops[i];
                    switch(op[0]) {
                        case 'm':
                            current.set(op[1], op[2]);
                            break;
                        case 'l':
                            p1.set(op[1], op[2]);
                            current.copy(p1);
                            min.min(current).min(p1);
                            max.max(current).max(p1);
                            break;
                        case 'c':
                            p1.set(op[1], op[2]);
                            p2.set(op[3], op[4]);
                            p3.set(op[5], op[6]);
                            util.computeCubeBezierBoundingBox(current, p1, p2, p3, minTmp, maxTmp);
                            current.copy(p3);
                            min.min(minTmp);
                            max.max(maxTmp);
                            break;
                        case 'q':
                            p1.set(op[1], op[2]);
                            p2.set(op[3], op[4]);
                            var bb = util.computeQuadraticBezierBoundingBox(current, p1, p2, minTmp, maxTmp);
                            current.copy(p2);
                            min.min(minTmp);
                            min.max(maxTmp);
                            break;
                        case 'z':
                            break;
                    }
                }

                this.boundingBox = {
                    min : min,
                    max : max
                }
            }
        })(),

        parse : function(description) {
            // point x, y
            var x = 0;
            var y = 0;
            // control point 1(in cube bezier curve and quadratic bezier curve)
            var x1 = 0;
            var y1 = 0;
            // control point 2(in cube bezier curve)
            var x2 = 0;
            var y2 = 0;

            // pre process
            description = description || this.description;
            var d = description.replace(/\s*,\s*/g, ' ');
            d = d.replace(/(-)/g, ' $1');
            d = d.replace(/([mMzZlLhHvVcCsSqQtTaA])/g, ' $1 ');
            d = d.split(/\s+/);

            var command = "";
            // Save the previous command specially for shorthand/smooth curveto(s/S, t/T)
            var prevCommand = "";
            var offset = 0;
            var len = d.length;
            var next = d[0];

            while (offset <= len) {
                // Skip empty
                if(!next) {
                    next = d[++offset];
                    continue;
                }
                if (availableCommands[next]) {
                    prevCommand = command;
                    command = next;
                    offset++;
                }
                // http://www.w3.org/TR/SVG/paths.html
                switch (command) {
                    case "m":
                        x = pickValue() + x;
                        y = pickValue() + y;
                        this._ops.push(['m', x, y]);
                        break;
                    case "M":
                        x = pickValue();
                        y = pickValue();
                        this._ops.push(['m', x, y]);
                        break;
                    case "z":
                    case "Z":
                        next = d[offset];
                        this._ops.push(['z']);
                        break;
                    case "l":
                        x = pickValue() + x;
                        y = pickValue() + y;
                        this._ops.push(['l', x, y]);
                        break;
                    case "L":
                        x = pickValue();
                        y = pickValue();
                        this._ops.push(['l', x, y]);
                        break;
                    case "h":
                        x = pickValue() + x;
                        this._ops.push(['l', x, y]);
                        break;
                    case "H":
                        x = pickValue();
                        this._ops.push(['l', x, y]);
                        break;
                    case "v":
                        y = pickValue() + y;
                        this._ops.push(['l', x, y]);
                        break;
                    case "V":
                        y = pickValue();
                        this._ops.push(['l', x, y]);
                        break;
                    case "c":
                        x1 = pickValue() + x;
                        y1 = pickValue() + y;
                        x2 = pickValue() + x;
                        y2 = pickValue() + y;
                        x = pickValue() + x;
                        y = pickValue() + y;
                        this._ops.push(['c', x1, y1, x2, y2, x, y]);
                        break;
                    case "C":
                        x1 = pickValue();
                        y1 = pickValue();
                        x2 = pickValue();
                        y2 = pickValue();
                        x = pickValue();
                        y = pickValue();
                        this._ops.push(['c', x1, y1, x2, y2, x, y]);
                        break;
                    case "s":
                        if (prevCommand === "c" || prevCommand === "C" ||
                            prevCommand === "s" || prevCommand === "S") {
                            // Reflection of the second control point on the previous command
                            x1 = x * 2 - x2;
                            y1 = y * 2 - y2;
                        } else {
                            x1 = x;
                            y1 = y;
                        }
                        x2 = pickValue() + x;
                        y2 = pickValue() + y;
                        x = pickValue() + x;
                        y = pickValue() + y;
                        this._ops.push(['c', x1, y1, x2, y2, x, y]);
                        break;
                    case "S":
                        if (prevCommand === "c" || prevCommand === "C" ||
                            prevCommand === "s" || prevCommand === "S") {
                            // Reflection of the second control point on the previous command
                            x1 = x * 2 - x2; 
                            y1 = y * 2 - y2;
                        } else {
                            x1 = x;
                            y1 = y;
                        }
                        x2 = pickValue();
                        y2 = pickValue();
                        x = pickValue();
                        y = pickValue();
                        this._ops.push(['c', x1, y1, x2, y2, x, y]);
                        break;
                    case "q":
                        x1 = pickValue() + x;
                        y1 = pickValue() + y;
                        x = pickValue() + x;
                        y = pickValue() + y;
                        this._ops.push(['q', x1, y1, x, y]);
                        break;
                    case "Q":
                        x1 = pickValue();
                        y1 = pickValue();
                        x = pickValue();
                        y = pickValue();
                        this._ops.push(['q', x1, y1, x, y]);
                        break;
                    case "t":
                        if (prevCommand === "q" || prevCommand === "Q" ||
                            prevCommand === "t" || prevCommand === "T") {
                            // Reflection of the second control point on the previous command
                            x1 = x * 2 - x1; 
                            y1 = y * 2 - y1;
                        } else {
                            x1 = x;
                            y1 = y;
                        }
                        x = pickValue() + x;
                        y = pickValue() + y;
                        this._ops.push(['q', x1, y1, x, y]);
                        break;
                    case "T":
                        if (prevCommand === "q" || prevCommand === "Q" ||
                            prevCommand === "t" || prevCommand === "T") {
                            // Reflection of the second control point on the previous command
                            x1 = x * 2 - x1; 
                            y1 = y * 2 - y1;
                        } else {
                            x1 = x;
                            y1 = y;
                        }
                        x = pickValue();
                        y = pickValue();
                        this._ops.push(['q', x1, y1, x, y]);
                        break;
                    case "a":
                    case "A":
                        pickValue();
                        pickValue();
                        pickValue();
                        pickValue();
                        pickValue();
                        pickValue();
                        pickValue();
                        console.warn("Elliptical arc is not supported yet");
                        break;
                    default:
                        pick();
                        continue;
                }
            }
            
            function pick() {
                next = d[offset+1];
                return d[offset++];
            }

            var _val;
            function pickValue() {
                next = d[offset+1];
                _val = d[offset++];
                return parseFloat(_val);
            }
        }
    });

    return SVGPath;
});
define('2d/shape/Sector',['require','../Node','../util','core/Vector2'],function(require) {

    var Node = require('../Node');
    var util = require('../util');
    var Vector2 = require("core/Vector2");

    var Sector = Node.derive(function() {
        return {
            center      : new Vector2(),
            innerRadius : 0,
            outerRadius : 0,
            startAngle  : 0,
            endAngle    : 0,
            clockwise   : true
        }
    }, {
        computeBoundingBox : function() {
            var min = new Vector2();
            var max = new Vector2();

            util.computeArcBoundingBox(
                this.center, this.innerRadius, this.startAngle, 
                this.endAngle, this.clockwise, min, max
            );
            this.boundingBox.min
                .set(99999, 99999)
                .min(min);
            this.boundingBox.max
                .set(-99999, -99999)
                .max(max);

            util.computeArcBoundingBox(
                this.center, this.outerRadius, this.startAngle, 
                this.endAngle, this.clockwise, min, max
            );
            this.boundingBox.min.min(min);
            this.boundingBox.max.max(max);
        },
        intersect : function(x, y) {

            var startAngle = this.startAngle;
            var endAngle = this.endAngle;
            var r1 = this.innerRadius;
            var r2 = this.outerRadius;
            var c = this.center;
            var v = new Vector2(x, y).sub(c);
            var r = v.length();
            var pi2 = Math.PI * 2;

            if (r < r1 || r > r2) {
                return false;
            }
            var angle = Math.atan2(v.y, v.x);

            //need to constraint the angle between 0 - 360
            if (angle < 0) {
                angle = angle+pi2;
            }
            
            if (this.clockwise) {
                return angle < endAngle && angle > startAngle;
            } else {
                startAngle =  pi2 - startAngle;
                endAngle = pi2 - endAngle;
                return angle > endAngle && angle < startAngle;
            }   
        },
        draw : function(ctx) {

            var startAngle = this.startAngle;
            var endAngle = this.endAngle;
            var r1 = this.innerRadius;
            var r2 = this.outerRadius;
            var c = this.center;

            if (! this.clockwise) {
                startAngle =  Math.PI*2 - startAngle;
                endAngle =  Math.PI*2 - endAngle;
            }

            var startInner = new Vector2(r1 * Math.cos(startAngle), r1 * Math.sin(startAngle)).add(c);
            var startOuter = new Vector2(r2 * Math.cos(startAngle), r2 * Math.sin(startAngle)).add(c);
            var endInner = new Vector2(r1 * Math.cos(endAngle), r1 * Math.sin(endAngle)).add(c);
            var endOuter = new Vector2(r2 * Math.cos(endAngle), r2 * Math.sin(endAngle)).add(c);

            ctx.beginPath();
            ctx.moveTo(startInner.x, startInner.y);
            ctx.lineTo(startOuter.x, startOuter.y);
            ctx.arc(c.x, c.y, r2, startAngle, endAngle, ! this.clockwise);
            ctx.lineTo(endInner.x, endInner.y);
            ctx.arc(c.x, c.y, r1, endAngle, startAngle, this.clockwise);
            ctx.closePath();

            if (this.stroke) {
                ctx.stroke();
            }
            if (this.fill) {
                ctx.fill();
            }
        }
    })

    return Sector;
});
define('2d/shape/Text',['require','../Node','../util','core/Vector2'],function(require) {

    var Node = require('../Node');
    var util = require('../util');
    var Vector2 = require("core/Vector2");

    var Text = Node.derive( function() {
        return {
            text : '',
            start : new Vector2(),
            size : new Vector2()
        }
    }, {
        computeBoundingBox : function() {
            this.boundingBox = {
                min : this.start.clone(),
                max : this.start.clone().add(this.size)
            }
        },
        draw : function(ctx) {
            var start = this.start;
            if (this.fill) {
                this.size.length && this.size.x ?
                    ctx.fillText(this.text, start.x, start.y, this.size.x) :
                    ctx.fillText(this.text, start.x, start.y);
            }
            if (this.stroke) {
                this.size.length && this.size.x ?
                    ctx.strokeText(this.text, start.x, start.y, this.size.x) :
                    ctx.strokeText(this.text, start.x, start.y);
            }
        },
        resize : function(ctx) {
            if (! this.size.x || this.needResize) {
                this.size.x = ctx.measureText(this.text).width;
                this.size.y = ctx.measureText('m').width;
            }
        },
        intersect : function(x, y) {
            return this.intersectBoundingBox(x, y);
        }
    })

    return Text;
});
/**
 * Text Box
 * Support word wrap and word break
 * Drawing is based on the Text
 * @export{class} TextBox
 *
 * TODO: support word wrap of non-english text
 *      shift first line by (lineHeight-fontSize)/2
 */
define('2d/shape/TextBox',['require','../Node','core/Vector2','./Text','_'],function(require) {

    var Node = require('../Node');
    var Vector2 = require("core/Vector2");
    var Text = require('./Text');
    var _ = require('_');

    var TextBox = Node.derive(function() {
        return {
            start           : new Vector2(),
            width           : 0,
            wordWrap        : false,
            wordBreak       : false,
            lineHeight      : 0,
            stroke          : false,
            // private prop, save Text instances
            _texts          : []
        }
    }, function() {
        // to verify if the text is changed
        this._oldText = "";
    }, {
        computeBoundingBox : function() {
            // TODO
        },
        draw : function(ctx) {
            if (this.text != this._oldText) {
                this._oldText = this.text;

                //set font for measureText
                if (this.font) {
                    ctx.font = this.font;
                }
                if (this.wordBreak) {
                    this._texts = this.computeWordBreak(ctx);
                }
                else if (this.wordWrap) {
                    this._texts = this.computeWordWrap(ctx);
                }
                else{
                    var txt = new Text({
                        text : this.text
                    })
                    this.extendCommonProperties(txt);
                    this._texts = [txt]
                }
            }

            ctx.save();
            ctx.textBaseline = 'top';
            _.each(this._texts, function(_text) {
                _text.draw(ctx);
            })
            ctx.restore();
        },
        computeWordWrap : function(ctx) {
            if (! this.text) {
                return;
            }
            var words = this.text.split(' ');
            var len = words.length;
            var lineWidth = 0;
            var wordWidth;
            var wordText;
            var texts = [];
            var txt;

            var wordHeight = ctx.measureText("m").width;

            for(var i = 0; i < len; i++) {
                wordText = i == len-1 ? words[i] : words[i]+' ';
                wordWidth = ctx.measureText(wordText).width;
                if (lineWidth + wordWidth > this.width ||
                    ! txt) {    //first line
                    // create a new text line and put current word
                    // in the head of new line
                    txt = new Text({
                        text : wordText, //append last word
                        start : this.start.clone().add(new Vector2(0, this.lineHeight*(texts.length+1) - wordHeight))
                    })
                    this.extendCommonProperties(txt);
                    texts.push(txt);

                    lineWidth = wordWidth;
                }else{
                    lineWidth += wordWidth;
                    txt.text += wordText;
                }
            }
            return texts;
        },
        computeWordBreak : function(ctx) {
            if (! this.text) {
                return;
            }
            var len = this.text.length;
            var letterWidth;
            var letter;
            var lineWidth = ctx.measureText(this.text[0]).width;
            var texts = [];
            var txt;

            var wordHeight = ctx.measureText("m").width;

            for (var i = 0; i < len; i++) {
                letter = this.text[i];
                letterWidth = ctx.measureText(letter).width;
                if (lineWidth + letterWidth > this.width || 
                    ! txt) {    //first line
                    var txt = new Text({
                        text : letter,
                        start : this.start.clone().add(new Vector2(0, this.lineHeight*(texts.length+1) - wordHeight))
                    });
                    this.extendCommonProperties(txt);
                    texts.push(txt);
                    // clear prev line states
                    lineWidth = letterWidth;
                } else {
                    lineWidth += letterWidth;
                    txt.text += letter;
                }
            }
            return texts;
        },
        extendCommonProperties : function(txt) {
            var props = {};
            _.extend(txt, {
                fill : this.fill,
                stroke : this.stroke
            })
        },
        intersect : function(x, y) {
        }
    })

    return TextBox;
});
define('core/Vector3',['require','glmatrix'],function(require) {
    
    

    var glMatrix = require("glmatrix");
    var vec3 = glMatrix.vec3;

    var Vector3 = function(x, y, z) {
        
        x = x || 0;
        y = y || 0;
        z = z || 0;

        this._array = vec3.fromValues(x, y, z);
        // Dirty flag is used by the Node to determine
        // if the matrix is updated to latest
        this._dirty = true;
    }

    Vector3.prototype= {

        constructor : Vector3,

        get x() {
            return this._array[0];
        },

        set x(value) {
            this._array[0] = value;
            this._dirty = true;
        },

        get y() {
            return this._array[1];
        },

        set y(value) {
            this._array[1] = value;
            this._dirty = true;
        },

        get z() {
            return this._array[2];
        },

        set z(value) {
            this._array[2] = value;
            this._dirty = true;
        },

        add : function(b) {
            vec3.add(this._array, this._array, b._array);
            this._dirty = true;
            return this;
        },

        set : function(x, y, z) {
            this._array[0] = x;
            this._array[1] = y;
            this._array[2] = z;
            this._dirty = true;
            return this;
        },

        clone : function() {
            return new Vector3( this.x, this.y, this.z );
        },

        copy : function(b) {
            vec3.copy( this._array, b._array );
            this._dirty = true;
            return this;
        },

        cross : function(out, b) {
            vec3.cross(out._array, this._array, b._array);
            return this;
        },

        dist : function(b) {
            return vec3.dist(this._array, b._array);
        },

        distance : function(b) {
            return vec3.distance(this._array, b._array);
        },

        div : function(b) {
            vec3.div(this._array, this._array, b._array);
            this._dirty = true;
            return this;
        },

        divide : function(b) {
            vec3.divide(this._array, this._array, b._array);
            this._dirty = true;
            return this;
        },

        dot : function(b) {
            return vec3.dot(this._array, b._array);
        },

        len : function() {
            return vec3.len(this._array);
        },

        length : function() {
            return vec3.length(this._array);
        },
        /**
         * Perform linear interpolation between a and b
         */
        lerp : function(a, b, t) {
            vec3.lerp(this._array, a._array, b._array, t);
            this._dirty = true;
            return this;
        },

        min : function(b) {
            vec2.min(this._array, this._array, b._array);
            this._dirty = true;
            return this;
        },

        max : function(b) {
            vec2.max(this._array, this._array, b._array);
            this._dirty = true;
            return this;
        },

        mul : function(b) {
            vec3.mul(this._array, this._array, b._array);
            this._dirty = true;
            return this;
        },

        multiply : function(b) {
            vec3.multiply(this._array, this._array, b._array);
            this._dirty = true;
            return this;
        },

        negate : function() {
            vec3.negate(this._array, this._array);
            this._dirty = true;
            return this;
        },

        normalize : function() {
            vec3.normalize(this._array, this._array);
            this._dirty = true;
            return this;
        },

        random : function(scale) {
            vec3.random(this._array, scale);
            this._dirty = true;
            return this;
        },

        scale : function(s) {
            vec3.scale(this._array, this._array, s);
            this._dirty = true;
            return this;
        },
        /**
         * add b by a scaled factor
         */
        scaleAndAdd : function(b, s) {
            vec3.scaleAndAdd(this._array, this._array, b._array, s);
            this._dirty = true;
            return this;
        },

        sqrDist : function(b) {
            return vec3.sqrDist(this._array, b._array);
        },

        squaredDistance : function(b) {
            return vec3.squaredDistance(this._array, b._array);
        },

        sqrLen : function() {
            return vec3.sqrLen(this._array);
        },

        squaredLength : function() {
            return vec3.squaredLength(this._array);
        },

        sub : function(b) {
            vec3.sub(this._array, this._array, b._array);
            this._dirty = true;
            return this;
        },

        subtract : function(b) {
            vec3.subtract(this._array, this._array, b._array);
            this._dirty = true;
            return this;
        },

        transformMat3 : function(m) {
            vec3.transformMat3(this._array, this._array, m._array);
            this._dirty = true;
            return this;
        },

        transformMat4 : function(m) {
            vec3.transformMat4(this._array, this._array, m._array);
            this._dirty = true;
            return this;
        },

        transformQuat : function(q) {
            vec3.transformQuat(this._array, this._array, q._array);
            this._dirty = true;
            return this;
        },     
        /**
         * Set euler angle from queternion
         */
        setEulerFromQuaternion : function(q) {
            // var sqx = q.x * q.x;
            // var sqy = q.y * q.y;
            // var sqz = q.z * q.z;
            // var sqw = q.w * q.w;
            // this.x = Math.atan2( 2 * ( q.y * q.z + q.x * q.w ), ( -sqx - sqy + sqz + sqw ) );
            // this.y = Math.asin( -2 * ( q.x * q.z - q.y * q.w ) );
            // this.z = Math.atan2( 2 * ( q.x * q.y + q.z * q.w ), ( sqx - sqy - sqz + sqw ) );

            // return this;
        },

        toString : function() {
            return "[" + Array.prototype.join.call(this._array, ",") + "]";
        },
    }

    function clamp( x ) {
        return Math.min( Math.max( x, -1 ), 1 );
    }

    return Vector3;

} );
define('3d/BoundingBox',['require','core/Base','core/Vector3'],function(require) {

    var Base = require("core/Base");
    var Vector3 = require("core/Vector3");

    var BoundingBox = Base.derive(function() {
        return {
            min : new Vector3(),
            max : new Vector3()
        }
    }, {
        updateFromVertices : function(vertices) {
            if (vertices.length > 0) {
                var min = vertices[0].slice();
                var max = vertices[1].slice();
                for (var i = 1; i < vertices.length; i++) {
                    var vertex = vertices[i];

                    min[0] = Math.min(vertex[0], min[0]);
                    min[1] = Math.min(vertex[1], min[1]);
                    min[2] = Math.min(vertex[2], min[2]);

                    max[0] = Math.max(vertex[0], max[0]);
                    max[1] = Math.max(vertex[1], max[1]);
                    max[2] = Math.max(vertex[2], max[2]);
                }

                this.min.set(min[0], min[1], min[2]);
                this.max.set(max[0], max[1], max[2]);
            }
        }
    });

    return BoundingBox;
});
define('core/Quaternion',['require','glmatrix'],function(require) {

    

    var glMatrix = require("glmatrix");
    var quat = glMatrix.quat;

    var Quaternion = function(x, y, z, w) {

        x = x || 0;
        y = y || 0;
        z = z || 0;
        w = w === undefined ? 1 : w;

        this._array = quat.fromValues(x, y, z, w);
        // Dirty flag is used by the Node to determine
        // if the matrix is updated to latest
        this._dirty = true;
    }

    Quaternion.prototype = {

        constructor : Quaternion,

        get x() {
            return this._array[0];
        },

        set x(value) {
            this._array[0] = value;
            this._dirty = true;
        },

        get y() {
            this._array[1] = value;
            this._dirty = true;
        },

        set y(value) {
            return this._array[1];
        },

        get z() {
            return this._array[2];
        },

        set z(value) {
            this._array[2] = value;
            this._dirty = true;
        },

        get w() {
            return this._array[3];
        },

        set w(value) {
            this._array[3] = value;
            this._dirty = true;
        },

        add : function(b) {
            quat.add( this._array, this._array, b._array );
            this._dirty = true;
            return this;
        },

        calculateW : function() {
            quat.calculateW(this._array, this._array);
            this._dirty = true;
            return this;
        },

        set : function(x, y, z, w) {
            this._array[0] = x;
            this._array[1] = y;
            this._array[2] = z;
            this._array[3] = w;
            this._dirty = true;
            return this;
        },

        clone : function() {
            return new Quaternion( this.x, this.y, this.z, this.w );
        },

        /**
         * Calculates the conjugate of a quat If the quaternion is normalized, 
         * this function is faster than quat.inverse and produces the same result.
         */
        conjugate : function() {
            quat.conjugate(this._array, this._array);
            this._dirty = true;
            return this;
        },

        copy : function(b) {
            quat.copy( this._array, b._array );
            this._dirty = true;
            return this;
        },

        dot : function(b) {
            return quat.dot(this._array, b._array);
        },

        fromMat3 : function(m) {
            quat.fromMat3(this._array, m._array);
            this._dirty = true;
            return this;
        },

        fromMat4 : (function() {
            var mat3 = glMatrix.mat3;
            var m3 = mat3.create();
            return function(m) {
                mat3.fromMat4(m3, m._array);
                // Not like mat4, mat3 in glmatrix seems to be row-based
                mat3.transpose(m3, m3);
                quat.fromMat3(this._array, m3);
                this._dirty = true;
                return this;
            }
        })(),

        identity : function() {
            quat.identity(this._array);
            this._dirty = true;
            return this;
        },

        invert : function() {
            quat.invert(this._array, this._array);
            this._dirty = true;
            return this;
        },

        len : function() {
            return quat.len(this._array);
        },

        length : function() {
            return quat.length(this._array);
        },

        /**
         * Perform linear interpolation between a and b
         */
        lerp : function(a, b, t) {
            quat.lerp(this._array, a._array, b._array, t);
            this._dirty = true;
            return this;
        },

        mul : function(b) {
            quat.mul(this._array, this._array, b._array);
            this._dirty = true;
            return this;
        },

        multiply : function(b) {
            quat.multiply(this._array, this._array, b._array);
            this._dirty = true;
            return this;
        },

        normalize : function() {
            quat.normalize(this._array, this._array);
            this._dirty = true;
            return this;
        },

        rotateX : function(rad) {
            quat.rotateX(this._array, this._array, rad); 
            this._dirty = true;
            return this;
        },

        rotateY : function(rad) {
            quat.rotateY(this._array, this._array, rad);
            this._dirty = true;
            return this;
        },

        rotateZ : function(rad) {
            quat.rotateZ(this._array, this._array, rad);
            this._dirty = true;
            return this;
        },

        setAxisAngle : function(axis /*Vector3*/, rad) {
            quat.setAxisAngle(this._array, axis._array, rad);
            this._dirty = true;
            return this;
        },

        slerp : function(a, b, t) {
            quat.slerp(this._array, a._array, b._array, t);
            this._dirty = true;
            return this;
        },

        sqrLen : function() {
            return quat.sqrLen(this._array);
        },

        squaredLength : function() {
            return quat.squaredLength(this._array);
        },
        /**
         * Set quaternion from euler angle
         */
        setFromEuler : function(v) {
            
        },

        toString : function() {
            return "[" + Array.prototype.join.call(this._array, ",") + "]";
        }
    }

    return Quaternion;
} );
define('core/Matrix4',['require','glmatrix','./Vector3'],function(require) {

    

    var glMatrix = require("glmatrix");
    var Vector3 = require("./Vector3");
    var mat4 = glMatrix.mat4;
    var vec3 = glMatrix.vec3;
    var mat3 = glMatrix.mat3;
    var quat = glMatrix.quat;

    function makeProperty(n) {
        return {
            set : function(value) {
                this._array[n] = value;
                this._dirty = true;
            },
            get : function() {
                return this._array[n];
            }
        }
    }
    var Matrix4 = function() {

        this._axisX = new Vector3();
        this._axisY = new Vector3();
        this._axisZ = new Vector3();

        this._array = mat4.create();
    };

    Matrix4.prototype = {

        constructor : Matrix4,

        get forward() {
            var el = this._array;
            this._axisZ.set(el[8], el[9], el[10]);
            return this._axisZ;
        },

        // TODO Here has a problem
        // If only set an item of vector will not work
        set forward(v) {
            var el = this._array;
            v = v._array;
            el[8] = v[8];
            el[9] = v[9];
            el[10] = v[10];
        },

        get up() {
            var el = this._array;
            this._axisY.set(el[4], el[5], el[6]);
            return this._axisY;
        },

        set up(v) {
            var el = this._array;
            v = v._array;
            el[4] = v[4];
            el[5] = v[5];
            el[6] = v[6];
        },

        get right() {
            var el = this._array;
            this._axisX.set(el[0], el[1], el[2]);
            return this._axisX;
        },

        set right(v) {
            var el = this._array;
            v = v._array;
            el[0] = v[0];
            el[1] = v[1];
            el[2] = v[2];
        },

        adjoint : function() {
            mat4.adjoint(this._array, this._array);
            return this;
        },
        clone : function() {
            return (new Matrix4()).copy(this);
        },
        copy : function(b) {
            mat4.copy(this._array, b._array);
            return this;
        },
        determinant : function() {
            return mat4.determinant(this._array);
        },
        fromQuat : function(q) {
            mat4.fromQuat(this._array, q._array);
            return this;
        },
        fromRotationTranslation : function(q, v) {
            mat4.fromRotationTranslation(this._array, q._array, v._array);
            return this;
        },
        frustum : function(left, right, bottom, top, near, far) {
            mat4.frustum(this._array, left, right, bottom, top, near, far);
            return this;
        },
        identity : function() {
            mat4.identity(this._array);
            return this;
        },
        invert : function() {
            mat4.invert(this._array, this._array);
            return this;
        },
        lookAt : function(eye, center, up) {
            mat4.lookAt(this._array, eye._array, center._array, up._array);
            return this;
        },
        mul : function(b) {
            mat4.mul(this._array, this._array, b._array);
            return this;
        },
        mulLeft : function(b) {
            mat4.mul(this._array, b._array, this._array);
            return this;
        },
        multiply : function(b) {
            mat4.multiply(this._array, this._array, b._array);
            return this;
        },
        // Apply left multiply
        multiplyLeft : function(b) {
            mat4.multiply(this._array, b._array, this._array);
            return this;
        },
        ortho : function(left, right, bottom, top, near, far) {
            mat4.ortho(this._array, left, right, bottom, top, near, far);
            return this;
        },
        perspective : function(fovy, aspect, near, far) {
            mat4.perspective(this._array, fovy, aspect, near, far);
            return this;
        },
        rotate : function(rad, axis /*Vector3*/) {
            mat4.rotate(this._array, this._array, rad, axis._array);
            return this;
        },
        rotateX : function(rad) {
            mat4.rotateX(this._array, this._array, rad);
            return this;
        },
        rotateY : function(rad) {
            mat4.rotateY(this._array, this._array, rad);
            return this;
        },
        rotateZ : function(rad) {
            mat4.rotateZ(this._array, this._array, rad);
            return this;
        },
        scale : function(v) {
            mat4.scale(this._array, this._array, v._array);
            return this;
        },
        translate : function(v) {
            mat4.translate(this._array, this._array, v._array);
            return this;
        },
        transpose : function() {
            mat4.transpose(this._array, this._array);
            return this;
        },

        // Static method
        // Decompose a matrix to SRT
        // http://msdn.microsoft.com/en-us/library/microsoft.xna.framework.matrix.decompose.aspx
        decomposeMatrix : (function() {

            var x = vec3.create();
            var y = vec3.create();
            var z = vec3.create();

            var m3 = mat3.create();
            
            return function(scale, rotation, position) {

                var el = this._array;
                vec3.set(x, el[0], el[1], el[2]);
                vec3.set(y, el[4], el[5], el[6]);
                vec3.set(z, el[8], el[9], el[10]);

                scale.x = vec3.length(x);
                scale.y = vec3.length(y);
                scale.z = vec3.length(z);

                position.set(el[12], el[13], el[14]);

                mat3.fromMat4(m3, el);
                // Not like mat4, mat3 in glmatrix seems to be row-based
                mat3.transpose(m3, m3);

                m3[0] /= scale.x;
                m3[1] /= scale.x;
                m3[2] /= scale.x;

                m3[3] /= scale.y;
                m3[4] /= scale.y;
                m3[5] /= scale.y;

                m3[6] /= scale.z;
                m3[7] /= scale.z;
                m3[8] /= scale.z;

                quat.fromMat3(rotation._array, m3);
                rotation.normalize();
            }
        })(),

        toString : function() {
            return "[" + Array.prototype.join.call(this._array, ",") + "]";
        }
    }

    // Object.defineProperty(Matrix4.prototype, 'm00', makeProperty(0));
    // Object.defineProperty(Matrix4.prototype, 'm01', makeProperty(1));
    // Object.defineProperty(Matrix4.prototype, 'm02', makeProperty(2));
    // Object.defineProperty(Matrix4.prototype, 'm03', makeProperty(3));
    // Object.defineProperty(Matrix4.prototype, 'm10', makeProperty(4));
    // Object.defineProperty(Matrix4.prototype, 'm11', makeProperty(5));
    // Object.defineProperty(Matrix4.prototype, 'm12', makeProperty(6));
    // Object.defineProperty(Matrix4.prototype, 'm13', makeProperty(7));
    // Object.defineProperty(Matrix4.prototype, 'm20', makeProperty(8));
    // Object.defineProperty(Matrix4.prototype, 'm21', makeProperty(9));
    // Object.defineProperty(Matrix4.prototype, 'm22', makeProperty(10));
    // Object.defineProperty(Matrix4.prototype, 'm23', makeProperty(11));
    // Object.defineProperty(Matrix4.prototype, 'm30', makeProperty(12));
    // Object.defineProperty(Matrix4.prototype, 'm31', makeProperty(13));
    // Object.defineProperty(Matrix4.prototype, 'm32', makeProperty(14));
    // Object.defineProperty(Matrix4.prototype, 'm33', makeProperty(15));

    return Matrix4;
});
define('core/Matrix3',['require','glmatrix'],function(require) {

    

    var glMatrix = require("glmatrix");
    var mat3 = glMatrix.mat3;

    function makeProperty(n) {
        return {
            configurable : false,
            set : function(value) {
                this._array[n] = value;
                this._dirty = true;
            },
            get : function() {
                return this._array[n];
            }
        }
    }

    var Matrix3 = function() {

        this._array = mat3.create();
    };

    var Matrix3Proto = {

        constructor : Matrix3,

        adjoint : function() {
            mat3.adjoint(this._array, this._array);
            return this;
        },
        clone : function() {
            return (new Matrix3()).copy(this);
        },
        copy : function(b) {
            mat3.copy(this._array, b._array);
            return this;
        },
        determinant : function() {
            return mat3.determinant(this._array);
        },
        fromMat2d : function(a) {
            return mat3.fromMat2d(this._array, a._array);
        },
        fromMat4 : function(a) {
            return mat3.fromMat4(this._array, a._array);
        },
        fromQuat : function(q) {
            mat3.fromQuat(this._array, q._array);
            return this;
        },
        identity : function() {
            mat3.identity(this._array);
            return this;
        },
        invert : function() {
            mat3.invert(this._array, this._array);
            return this;
        },
        mul : function(b) {
            mat3.mul(this._array, this._array, b._array);
            return this;
        },
        mulLeft : function(b) {
            mat3.mul(this._array, b._array, this._array);
            return this;
        },
        multiply : function(b) {
            mat3.multiply(this._array, this._array, b._array);
            return this;
        },
        multiplyLeft : function(b) {
            mat3.multiply(this._array, b._array, this._array);
            return this;
        },
        /**
         * Calculates a 3x3 normal matrix (transpose inverse) from the 4x4 matrix
         */
        normalFromMat4 : function(a) {
            mat3.normalFromMat4(this._array, a._array);
            return this;
        },
        transpose : function() {
            mat3.transpose(this._array, this._array);
            return this;
        },
        toString : function() {
            return "[" + Array.prototype.join.call(this._array, ",") + "]";
        }
    }

    return Matrix3;
});
define('3d/Node',['require','core/Base','core/Vector3','./BoundingBox','core/Quaternion','core/Matrix4','core/Matrix3','glmatrix','util/util','_'],function(require) {
    
    

    var Base = require("core/Base");
    var Vector3 = require("core/Vector3");
    var BoundingBox = require("./BoundingBox");
    var Quaternion = require("core/Quaternion");
    var Matrix4 = require("core/Matrix4");
    var Matrix3 = require("core/Matrix3");
    var glMatrix = require('glmatrix');
    var mat4 = glMatrix.mat4;
    var util = require("util/util");
    var _ = require("_");

    var _repository = {};

    var Node = Base.derive(function() {

        var id = util.genGUID();

        return {
            __GUID__ : id,

            name : 'NODE_' + id,

            visible : true,

            position : new Vector3(),

            rotation : new Quaternion(),

            scale : new Vector3(1, 1, 1),

            // Euler angles
            // https://en.wikipedia.org/wiki/Rotation_matrix
            eulerAngle : new Vector3(),
            useEuler : false,

            parent : null,
            scene : null,

            worldTransform : new Matrix4(),

            localTransform : new Matrix4(),

            autoUpdateLocalTransform : true,

            boundingBox : new BoundingBox(),

            _children : [],
            _needsUpdateWorldTransform : true,
            // Its for transparent queue sorting
            _depth : 0
        }
    }, {

        setName : function(name) {
            if (this.scene) {
                this.scene._nodeRepository[name] = null;
                this.scene._nodeRepository[newName] = this;
            }
            name = newName;
        },

        add : function(node) {
            if (node.parent === this) {
                return;
            }
            if (node.parent) {
                node.parent.remove(node);
            }
            node.parent = this;
            this._children.push(node);

            var scene = this.scene;

            if (scene) {
                node.traverse(function(n) {
                    scene.addToScene(n);
                    n.scene = scene;
                });
            }
        },

        remove : function(node) {
            this._children.splice(this._children.indexOf(node), 1);
            node.parent = null;

            var scene = this.scene;

            if (scene) {
                node.traverse(function(n) {
                    scene.removeFromScene(n);
                    n.scene = null;
                });
            }
        },

        children : function() {
            return this._children.slice();
        },

        childAt : function(idx) {
            return this._children[idx];
        },

        // pre-order traverse
        traverse : function(callback, parent) {
            var stopTraverse = callback(this, parent);
            if(!stopTraverse) {
                var _children = this._children;
                for(var i = 0, len = _children.length; i < len; i++) {
                    _children[i].traverse(callback, this);
                }
            }
        },

        decomposeMatrix : function() {
            this.localTransform.decomposeMatrix(this.scale, this.rotation, this.position);
            if(! this.useEuler) {
                this.eulerAngle.setEulerFromQuaternion(this.rotation);
            }
            
            this.rotation._dirty = false;
            this.scale._dirty = false;
            this.position._dirty = false;
            this.eulerAngle._dirty = false;
        },

        updateLocalTransform : function() {
            var position = this.position;
            var rotation = this.rotation;
            var scale = this.scale;
            var eulerAngle = this.eulerAngle;

            var needsUpdate = false;
            if (position._dirty || scale._dirty) {
                needsUpdate = true;
            } else {
                if (this.useEuler && eulerAngle._dirty) {
                    needsUpdate = true;
                } else if (rotation._dirty) {
                    needsUpdate = true;
                }
            }
            if (needsUpdate) {
                var m = this.localTransform._array;

                if(this.useEuler) {
                    rotation.identity();
                    rotation.rotateZ(eulerAngle.z);
                    rotation.rotateY(eulerAngle.y);
                    rotation.rotateX(eulerAngle.x);
                    eulerAngle._dirty = false;
                }
                // Transform order, scale->rotation->position
                mat4.fromRotationTranslation(m, rotation._array, position._array);

                mat4.scale(m, m, scale._array);

                rotation._dirty = false;
                scale._dirty = false;
                position._dirty = false;

                this._needsUpdateWorldTransform = true;
            }
        },

        // Update the node status in each frame
        update : function(force) {
            
            this.trigger('beforeupdate', this);

            if (this.autoUpdateLocalTransform) {
                this.updateLocalTransform();
            }

            if (force || this._needsUpdateWorldTransform) {
                if (this.parent) {
                    mat4.multiply(
                        this.worldTransform._array,
                        this.parent.worldTransform._array,
                        this.localTransform._array
                    );
                }
                else {
                    mat4.copy(this.worldTransform._array, this.localTransform._array);
                }
                force = true;
                this._needsUpdateWorldTransform = false;
            }
            
            for(var i = 0; i < this._children.length; i++) {
                var child = this._children[i];
                // Skip the hidden nodes
                if(child.visible) {
                    child.update(force);
                }
            }

            this.trigger('beforeupdate', this);
        },

        getWorldPosition : function(out) {
            var m = this.worldTransform._array;
            if (out) {
                out._array[0] = m[12];
                out._array[1] = m[13];
                out._array[2] = m[14];
                return out;
            } else {
                return new Vector3(m[12], m[13], m[14]);
            }
        },

        // http://docs.unity3d.com/Documentation/ScriptReference/Transform.RotateAround.html
        rotateAround : (function() {
            var v = new Vector3();
            var RTMatrix = new Matrix4();

            return function(point, axis, angle) {

                v.copy(this.position).subtract(point);

                this.localTransform.identity();
                // parent joint
                this.localTransform.translate(point);
                this.localTransform.rotate(angle, axis);

                // Transform self
                if(this.useEuler) {
                    this.rotation.identity();
                    this.rotation.rotateZ(this.eulerAngle.z);
                    this.rotation.rotateY(this.eulerAngle.y);
                    this.rotation.rotateX(this.eulerAngle.x);
                }
                RTMatrix.fromRotationTranslation(this.rotation, v);
                this.localTransform.multiply(RTMatrix);
                this.localTransform.scale(this.scale);

                this.decomposeMatrix();
                this._needsUpdateWorldTransform = true;
            }
            
        })(),

        lookAt : (function() {
            var m = new Matrix4();
            var scaleVector = new Vector3();
            return function(target, up) {
                m.lookAt(this.position, target, up || this.localTransform.up).invert();
                m.decomposeMatrix(scaleVector, this.rotation, this.position);
            }
        })()
    });

    return Node;
});
define('3d/Camera',['require','./Node','core/Matrix4'],function(require) {

    var Node = require("./Node");
    var Matrix4 = require("core/Matrix4");

    var Camera = Node.derive(function() {
        return {
            projectionMatrix : new Matrix4(),
        }
    }, function() {
        this.update();
    }, {
        
        update : function(_gl) {
            Node.prototype.update.call(this, _gl);
            
            this.updateProjectionMatrix();
        }
    });

    return Camera;
});
/**
 * http://www.khronos.org/registry/webgl/specs/latest/1.0/#5.14
 */
define('3d/glenum',[],function() {

return {
    /* ClearBufferMask */
    DEPTH_BUFFER_BIT               : 0x00000100,
    STENCIL_BUFFER_BIT             : 0x00000400,
    COLOR_BUFFER_BIT               : 0x00004000,
    
    /* BeginMode */
    POINTS                         : 0x0000,
    LINES                          : 0x0001,
    LINE_LOOP                      : 0x0002,
    LINE_STRIP                     : 0x0003,
    TRIANGLES                      : 0x0004,
    TRIANGLE_STRIP                 : 0x0005,
    TRIANGLE_FAN                   : 0x0006,
    
    /* AlphaFunction (not supported in ES20) */
    /*      NEVER */
    /*      LESS */
    /*      EQUAL */
    /*      LEQUAL */
    /*      GREATER */
    /*      NOTEQUAL */
    /*      GEQUAL */
    /*      ALWAYS */
    
    /* BlendingFactorDest */
    ZERO                           : 0,
    ONE                            : 1,
    SRC_COLOR                      : 0x0300,
    ONE_MINUS_SRC_COLOR            : 0x0301,
    SRC_ALPHA                      : 0x0302,
    ONE_MINUS_SRC_ALPHA            : 0x0303,
    DST_ALPHA                      : 0x0304,
    ONE_MINUS_DST_ALPHA            : 0x0305,
    
    /* BlendingFactorSrc */
    /*      ZERO */
    /*      ONE */
    DST_COLOR                      : 0x0306,
    ONE_MINUS_DST_COLOR            : 0x0307,
    SRC_ALPHA_SATURATE             : 0x0308,
    /*      SRC_ALPHA */
    /*      ONE_MINUS_SRC_ALPHA */
    /*      DST_ALPHA */
    /*      ONE_MINUS_DST_ALPHA */
    
    /* BlendEquationSeparate */
    FUNC_ADD                       : 0x8006,
    BLEND_EQUATION                 : 0x8009,
    BLEND_EQUATION_RGB             : 0x8009, /* same as BLEND_EQUATION */
    BLEND_EQUATION_ALPHA           : 0x883D,
    
    /* BlendSubtract */
    FUNC_SUBTRACT                  : 0x800A,
    FUNC_REVERSE_SUBTRACT          : 0x800B,
    
    /* Separate Blend Functions */
    BLEND_DST_RGB                  : 0x80C8,
    BLEND_SRC_RGB                  : 0x80C9,
    BLEND_DST_ALPHA                : 0x80CA,
    BLEND_SRC_ALPHA                : 0x80CB,
    CONSTANT_COLOR                 : 0x8001,
    ONE_MINUS_CONSTANT_COLOR       : 0x8002,
    CONSTANT_ALPHA                 : 0x8003,
    ONE_MINUS_CONSTANT_ALPHA       : 0x8004,
    BLEND_COLOR                    : 0x8005,
    
    /* Buffer Objects */
    ARRAY_BUFFER                   : 0x8892,
    ELEMENT_ARRAY_BUFFER           : 0x8893,
    ARRAY_BUFFER_BINDING           : 0x8894,
    ELEMENT_ARRAY_BUFFER_BINDING   : 0x8895,
    
    STREAM_DRAW                    : 0x88E0,
    STATIC_DRAW                    : 0x88E4,
    DYNAMIC_DRAW                   : 0x88E8,
    
    BUFFER_SIZE                    : 0x8764,
    BUFFER_USAGE                   : 0x8765,
    
    CURRENT_VERTEX_ATTRIB          : 0x8626,
    
    /* CullFaceMode */
    FRONT                          : 0x0404,
    BACK                           : 0x0405,
    FRONT_AND_BACK                 : 0x0408,
    
    /* DepthFunction */
    /*      NEVER */
    /*      LESS */
    /*      EQUAL */
    /*      LEQUAL */
    /*      GREATER */
    /*      NOTEQUAL */
    /*      GEQUAL */
    /*      ALWAYS */
    
    /* EnableCap */
    /* TEXTURE_2D */
    CULL_FACE                      : 0x0B44,
    BLEND                          : 0x0BE2,
    DITHER                         : 0x0BD0,
    STENCIL_TEST                   : 0x0B90,
    DEPTH_TEST                     : 0x0B71,
    SCISSOR_TEST                   : 0x0C11,
    POLYGON_OFFSET_FILL            : 0x8037,
    SAMPLE_ALPHA_TO_COVERAGE       : 0x809E,
    SAMPLE_COVERAGE                : 0x80A0,
    
    /* ErrorCode */
    NO_ERROR                       : 0,
    INVALID_ENUM                   : 0x0500,
    INVALID_VALUE                  : 0x0501,
    INVALID_OPERATION              : 0x0502,
    OUT_OF_MEMORY                  : 0x0505,
    
    /* FrontFaceDirection */
    CW                             : 0x0900,
    CCW                            : 0x0901,
    
    /* GetPName */
    LINE_WIDTH                     : 0x0B21,
    ALIASED_POINT_SIZE_RANGE       : 0x846D,
    ALIASED_LINE_WIDTH_RANGE       : 0x846E,
    CULL_FACE_MODE                 : 0x0B45,
    FRONT_FACE                     : 0x0B46,
    DEPTH_RANGE                    : 0x0B70,
    DEPTH_WRITEMASK                : 0x0B72,
    DEPTH_CLEAR_VALUE              : 0x0B73,
    DEPTH_FUNC                     : 0x0B74,
    STENCIL_CLEAR_VALUE            : 0x0B91,
    STENCIL_FUNC                   : 0x0B92,
    STENCIL_FAIL                   : 0x0B94,
    STENCIL_PASS_DEPTH_FAIL        : 0x0B95,
    STENCIL_PASS_DEPTH_PASS        : 0x0B96,
    STENCIL_REF                    : 0x0B97,
    STENCIL_VALUE_MASK             : 0x0B93,
    STENCIL_WRITEMASK              : 0x0B98,
    STENCIL_BACK_FUNC              : 0x8800,
    STENCIL_BACK_FAIL              : 0x8801,
    STENCIL_BACK_PASS_DEPTH_FAIL   : 0x8802,
    STENCIL_BACK_PASS_DEPTH_PASS   : 0x8803,
    STENCIL_BACK_REF               : 0x8CA3,
    STENCIL_BACK_VALUE_MASK        : 0x8CA4,
    STENCIL_BACK_WRITEMASK         : 0x8CA5,
    VIEWPORT                       : 0x0BA2,
    SCISSOR_BOX                    : 0x0C10,
    /*      SCISSOR_TEST */
    COLOR_CLEAR_VALUE              : 0x0C22,
    COLOR_WRITEMASK                : 0x0C23,
    UNPACK_ALIGNMENT               : 0x0CF5,
    PACK_ALIGNMENT                 : 0x0D05,
    MAX_TEXTURE_SIZE               : 0x0D33,
    MAX_VIEWPORT_DIMS              : 0x0D3A,
    SUBPIXEL_BITS                  : 0x0D50,
    RED_BITS                       : 0x0D52,
    GREEN_BITS                     : 0x0D53,
    BLUE_BITS                      : 0x0D54,
    ALPHA_BITS                     : 0x0D55,
    DEPTH_BITS                     : 0x0D56,
    STENCIL_BITS                   : 0x0D57,
    POLYGON_OFFSET_UNITS           : 0x2A00,
    /*      POLYGON_OFFSET_FILL */
    POLYGON_OFFSET_FACTOR          : 0x8038,
    TEXTURE_BINDING_2D             : 0x8069,
    SAMPLE_BUFFERS                 : 0x80A8,
    SAMPLES                        : 0x80A9,
    SAMPLE_COVERAGE_VALUE          : 0x80AA,
    SAMPLE_COVERAGE_INVERT         : 0x80AB,
    
    /* GetTextureParameter */
    /*      TEXTURE_MAG_FILTER */
    /*      TEXTURE_MIN_FILTER */
    /*      TEXTURE_WRAP_S */
    /*      TEXTURE_WRAP_T */
    
    COMPRESSED_TEXTURE_FORMATS     : 0x86A3,
    
    /* HintMode */
    DONT_CARE                      : 0x1100,
    FASTEST                        : 0x1101,
    NICEST                         : 0x1102,
    
    /* HintTarget */
    GENERATE_MIPMAP_HINT            : 0x8192,
    
    /* DataType */
    BYTE                           : 0x1400,
    UNSIGNED_BYTE                  : 0x1401,
    SHORT                          : 0x1402,
    UNSIGNED_SHORT                 : 0x1403,
    INT                            : 0x1404,
    UNSIGNED_INT                   : 0x1405,
    FLOAT                          : 0x1406,
    
    /* PixelFormat */
    DEPTH_COMPONENT                : 0x1902,
    ALPHA                          : 0x1906,
    RGB                            : 0x1907,
    RGBA                           : 0x1908,
    LUMINANCE                      : 0x1909,
    LUMINANCE_ALPHA                : 0x190A,
    
    /* PixelType */
    /*      UNSIGNED_BYTE */
    UNSIGNED_SHORT_4_4_4_4         : 0x8033,
    UNSIGNED_SHORT_5_5_5_1         : 0x8034,
    UNSIGNED_SHORT_5_6_5           : 0x8363,
    
    /* Shaders */
    FRAGMENT_SHADER                  : 0x8B30,
    VERTEX_SHADER                    : 0x8B31,
    MAX_VERTEX_ATTRIBS               : 0x8869,
    MAX_VERTEX_UNIFORM_VECTORS       : 0x8DFB,
    MAX_VARYING_VECTORS              : 0x8DFC,
    MAX_COMBINED_TEXTURE_IMAGE_UNITS : 0x8B4D,
    MAX_VERTEX_TEXTURE_IMAGE_UNITS   : 0x8B4C,
    MAX_TEXTURE_IMAGE_UNITS          : 0x8872,
    MAX_FRAGMENT_UNIFORM_VECTORS     : 0x8DFD,
    SHADER_TYPE                      : 0x8B4F,
    DELETE_STATUS                    : 0x8B80,
    LINK_STATUS                      : 0x8B82,
    VALIDATE_STATUS                  : 0x8B83,
    ATTACHED_SHADERS                 : 0x8B85,
    ACTIVE_UNIFORMS                  : 0x8B86,
    ACTIVE_ATTRIBUTES                : 0x8B89,
    SHADING_LANGUAGE_VERSION         : 0x8B8C,
    CURRENT_PROGRAM                  : 0x8B8D,
    
    /* StencilFunction */
    NEVER                          : 0x0200,
    LESS                           : 0x0201,
    EQUAL                          : 0x0202,
    LEQUAL                         : 0x0203,
    GREATER                        : 0x0204,
    NOTEQUAL                       : 0x0205,
    GEQUAL                         : 0x0206,
    ALWAYS                         : 0x0207,
    
    /* StencilOp */
    /*      ZERO */
    KEEP                           : 0x1E00,
    REPLACE                        : 0x1E01,
    INCR                           : 0x1E02,
    DECR                           : 0x1E03,
    INVERT                         : 0x150A,
    INCR_WRAP                      : 0x8507,
    DECR_WRAP                      : 0x8508,
    
    /* StringName */
    VENDOR                         : 0x1F00,
    RENDERER                       : 0x1F01,
    VERSION                        : 0x1F02,
    
    /* TextureMagFilter */
    NEAREST                        : 0x2600,
    LINEAR                         : 0x2601,
    
    /* TextureMinFilter */
    /*      NEAREST */
    /*      LINEAR */
    NEAREST_MIPMAP_NEAREST         : 0x2700,
    LINEAR_MIPMAP_NEAREST          : 0x2701,
    NEAREST_MIPMAP_LINEAR          : 0x2702,
    LINEAR_MIPMAP_LINEAR           : 0x2703,
    
    /* TextureParameterName */
    TEXTURE_MAG_FILTER             : 0x2800,
    TEXTURE_MIN_FILTER             : 0x2801,
    TEXTURE_WRAP_S                 : 0x2802,
    TEXTURE_WRAP_T                 : 0x2803,
    
    /* TextureTarget */
    TEXTURE_2D                     : 0x0DE1,
    TEXTURE                        : 0x1702,
    
    TEXTURE_CUBE_MAP               : 0x8513,
    TEXTURE_BINDING_CUBE_MAP       : 0x8514,
    TEXTURE_CUBE_MAP_POSITIVE_X    : 0x8515,
    TEXTURE_CUBE_MAP_NEGATIVE_X    : 0x8516,
    TEXTURE_CUBE_MAP_POSITIVE_Y    : 0x8517,
    TEXTURE_CUBE_MAP_NEGATIVE_Y    : 0x8518,
    TEXTURE_CUBE_MAP_POSITIVE_Z    : 0x8519,
    TEXTURE_CUBE_MAP_NEGATIVE_Z    : 0x851A,
    MAX_CUBE_MAP_TEXTURE_SIZE      : 0x851C,
    
    /* TextureUnit */
    TEXTURE0                       : 0x84C0,
    TEXTURE1                       : 0x84C1,
    TEXTURE2                       : 0x84C2,
    TEXTURE3                       : 0x84C3,
    TEXTURE4                       : 0x84C4,
    TEXTURE5                       : 0x84C5,
    TEXTURE6                       : 0x84C6,
    TEXTURE7                       : 0x84C7,
    TEXTURE8                       : 0x84C8,
    TEXTURE9                       : 0x84C9,
    TEXTURE10                      : 0x84CA,
    TEXTURE11                      : 0x84CB,
    TEXTURE12                      : 0x84CC,
    TEXTURE13                      : 0x84CD,
    TEXTURE14                      : 0x84CE,
    TEXTURE15                      : 0x84CF,
    TEXTURE16                      : 0x84D0,
    TEXTURE17                      : 0x84D1,
    TEXTURE18                      : 0x84D2,
    TEXTURE19                      : 0x84D3,
    TEXTURE20                      : 0x84D4,
    TEXTURE21                      : 0x84D5,
    TEXTURE22                      : 0x84D6,
    TEXTURE23                      : 0x84D7,
    TEXTURE24                      : 0x84D8,
    TEXTURE25                      : 0x84D9,
    TEXTURE26                      : 0x84DA,
    TEXTURE27                      : 0x84DB,
    TEXTURE28                      : 0x84DC,
    TEXTURE29                      : 0x84DD,
    TEXTURE30                      : 0x84DE,
    TEXTURE31                      : 0x84DF,
    ACTIVE_TEXTURE                 : 0x84E0,
    
    /* TextureWrapMode */
    REPEAT                         : 0x2901,
    CLAMP_TO_EDGE                  : 0x812F,
    MIRRORED_REPEAT                : 0x8370,
    
    /* Uniform Types */
    FLOAT_VEC2                     : 0x8B50,
    FLOAT_VEC3                     : 0x8B51,
    FLOAT_VEC4                     : 0x8B52,
    INT_VEC2                       : 0x8B53,
    INT_VEC3                       : 0x8B54,
    INT_VEC4                       : 0x8B55,
    BOOL                           : 0x8B56,
    BOOL_VEC2                      : 0x8B57,
    BOOL_VEC3                      : 0x8B58,
    BOOL_VEC4                      : 0x8B59,
    FLOAT_MAT2                     : 0x8B5A,
    FLOAT_MAT3                     : 0x8B5B,
    FLOAT_MAT4                     : 0x8B5C,
    SAMPLER_2D                     : 0x8B5E,
    SAMPLER_CUBE                   : 0x8B60,
    
    /* Vertex Arrays */
    VERTEX_ATTRIB_ARRAY_ENABLED        : 0x8622,
    VERTEX_ATTRIB_ARRAY_SIZE           : 0x8623,
    VERTEX_ATTRIB_ARRAY_STRIDE         : 0x8624,
    VERTEX_ATTRIB_ARRAY_TYPE           : 0x8625,
    VERTEX_ATTRIB_ARRAY_NORMALIZED     : 0x886A,
    VERTEX_ATTRIB_ARRAY_POINTER        : 0x8645,
    VERTEX_ATTRIB_ARRAY_BUFFER_BINDING : 0x889F,
    
    /* Shader Source */
    COMPILE_STATUS                 : 0x8B81,
    
    /* Shader Precision-Specified Types */
    LOW_FLOAT                      : 0x8DF0,
    MEDIUM_FLOAT                   : 0x8DF1,
    HIGH_FLOAT                     : 0x8DF2,
    LOW_INT                        : 0x8DF3,
    MEDIUM_INT                     : 0x8DF4,
    HIGH_INT                       : 0x8DF5,
    
    /* Framebuffer Object. */
    FRAMEBUFFER                    : 0x8D40,
    RENDERBUFFER                   : 0x8D41,
    
    RGBA4                          : 0x8056,
    RGB5_A1                        : 0x8057,
    RGB565                         : 0x8D62,
    DEPTH_COMPONENT16              : 0x81A5,
    STENCIL_INDEX                  : 0x1901,
    STENCIL_INDEX8                 : 0x8D48,
    DEPTH_STENCIL                  : 0x84F9,
    
    RENDERBUFFER_WIDTH             : 0x8D42,
    RENDERBUFFER_HEIGHT            : 0x8D43,
    RENDERBUFFER_INTERNAL_FORMAT   : 0x8D44,
    RENDERBUFFER_RED_SIZE          : 0x8D50,
    RENDERBUFFER_GREEN_SIZE        : 0x8D51,
    RENDERBUFFER_BLUE_SIZE         : 0x8D52,
    RENDERBUFFER_ALPHA_SIZE        : 0x8D53,
    RENDERBUFFER_DEPTH_SIZE        : 0x8D54,
    RENDERBUFFER_STENCIL_SIZE      : 0x8D55,
    
    FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE           : 0x8CD0,
    FRAMEBUFFER_ATTACHMENT_OBJECT_NAME           : 0x8CD1,
    FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL         : 0x8CD2,
    FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE : 0x8CD3,
    
    COLOR_ATTACHMENT0              : 0x8CE0,
    DEPTH_ATTACHMENT               : 0x8D00,
    STENCIL_ATTACHMENT             : 0x8D20,
    DEPTH_STENCIL_ATTACHMENT       : 0x821A,
    
    NONE                           : 0,
    
    FRAMEBUFFER_COMPLETE                      : 0x8CD5,
    FRAMEBUFFER_INCOMPLETE_ATTACHMENT         : 0x8CD6,
    FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT : 0x8CD7,
    FRAMEBUFFER_INCOMPLETE_DIMENSIONS         : 0x8CD9,
    FRAMEBUFFER_UNSUPPORTED                   : 0x8CDD,
    
    FRAMEBUFFER_BINDING            : 0x8CA6,
    RENDERBUFFER_BINDING           : 0x8CA7,
    MAX_RENDERBUFFER_SIZE          : 0x84E8,
    
    INVALID_FRAMEBUFFER_OPERATION  : 0x0506,
    
    /* WebGL-specific enums */
    UNPACK_FLIP_Y_WEBGL            : 0x9240,
    UNPACK_PREMULTIPLY_ALPHA_WEBGL : 0x9241,
    CONTEXT_LOST_WEBGL             : 0x9242,
    UNPACK_COLORSPACE_CONVERSION_WEBGL : 0x9243,
    BROWSER_DEFAULT_WEBGL          : 0x9244,
}
});
/**
 * Base class for all textures like compressed texture, texture2d, texturecube
 * TODO mapping
 */
define('3d/Texture',['require','core/Base','./glenum','util/util','_'],function(require) {

    var Base = require("core/Base");
    var glenum = require("./glenum");
    var util = require("util/util");
    var _ = require("_");

    var Texture = Base.derive(function() {

        return {
            __GUID__ : util.genGUID(),
            // Width and height is used when the image is null and want
            // to use it as a texture attach to framebuffer(RTT)
            width : 512,
            height : 512,

            type : glenum.UNSIGNED_BYTE,

            format : glenum.RGBA,

            wrapS : glenum.CLAMP_TO_EDGE,
            wrapT : glenum.CLAMP_TO_EDGE,

            minFilter : glenum.LINEAR_MIPMAP_LINEAR,

            magFilter : glenum.LINEAR,

            useMipmap : true,

            // http://blog.tojicode.com/2012/03/anisotropic-filtering-in-webgl.html
            anisotropic : 1,
            // pixelStorei parameters
            // http://www.khronos.org/opengles/sdk/docs/man/xhtml/glPixelStorei.xml
            flipY : true,
            unpackAlignment : 4,
            premultiplyAlpha : false,

            // Dynamic option for texture like video
            dynamic : false,

            NPOT : false
        }
    }, {

        getWebGLTexture : function(_gl) {

            this.cache.use(_gl.__GUID__);

            if (this.cache.miss("webgl_texture")) {
                // In a new gl context, create new texture and set dirty true
                this.cache.put("webgl_texture", _gl.createTexture());
            }
            if (this.dynamic) {
                this.update(_gl);
            }
            else if (this.cache.isDirty()) {
                this.update(_gl);
                this.cache.fresh();
            }

            return this.cache.get("webgl_texture");
        },

        bind : function() {},
        unbind : function() {},
        
        // Overwrite the dirty method
        dirty : function() {
            this.cache.dirtyAll();
        },

        update : function(_gl) {},

        // Update the common parameters of texture
        beforeUpdate : function(_gl) {
            _gl.pixelStorei(_gl.UNPACK_FLIP_Y_WEBGL, this.flipY);
            _gl.pixelStorei(_gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, this.premultiplyAlpha);
            _gl.pixelStorei(_gl.UNPACK_ALIGNMENT, this.unpackAlignment);

            this.fallBack();
        },

        fallBack : function() {

            // Use of none-power of two texture
            // http://www.khronos.org/webgl/wiki/WebGL_and_OpenGL_Differences
            
            var isPowerOfTwo = this.isPowerOfTwo();

            if (this.format === glenum.DEPTH_COMPONENT) {
                this.useMipmap = false;
            }

            if (! isPowerOfTwo || ! this.useMipmap) {
                // none-power of two flag
                this.NPOT = true;
                // Save the original value for restore
                this._minFilterOriginal = this.minFilter;
                this._magFilterOriginal = this.magFilter;
                this._wrapSOriginal = this.wrapS;
                this._wrapTOriginal = this.wrapT;

                if (this.minFilter == glenum.NEAREST_MIPMAP_NEAREST ||
                    this.minFilter == glenum.NEAREST_MIPMAP_LINEAR) {
                    this.minFilter = glenum.NEAREST;
                } else if (
                    this.minFilter == glenum.LINEAR_MIPMAP_LINEAR ||
                    this.minFilter == glenum.LINEAR_MIPMAP_NEAREST
                ) {
                    this.minFilter = glenum.LINEAR
                }

                this.wrapS = glenum.CLAMP_TO_EDGE;
                this.wrapT = glenum.CLAMP_TO_EDGE;
            } else {
                if (this._minFilterOriginal) {
                    this.minFilter = this._minFilterOriginal;
                }
                if (this._magFilterOriginal) {
                    this.magFilter = this._magFilterOriginal;
                }
                if (this._wrapSOriginal) {
                    this.wrapS = this._wrapSOriginal;
                }
                if (this._wrapTOriginal) {
                    this.wrapT = this._wrapTOriginal;
                }
            }

        },

        nextHighestPowerOfTwo : function(x) {
            --x;
            for (var i = 1; i < 32; i <<= 1) {
                x = x | x >> i;
            }
            return x + 1;
        },

        dispose : function(_gl) {
            this.cache.use(_gl.__GUID__);
            if (this.cache.get("webgl_texture")){
                _gl.deleteTexture(this.cache.get("webgl_texture"));
            }
            this.cache.deleteContext(_gl.__GUID__);
        },

        isRenderable : function() {},
        
        isPowerOfTwo : function() {},
    })
    
    /* DataType */
    Texture.BYTE = glenum.BYTE;
    Texture.UNSIGNED_BYTE = glenum.UNSIGNED_BYTE;
    Texture.SHORT = glenum.SHORT;
    Texture.UNSIGNED_SHORT = glenum.UNSIGNED_SHORT;
    Texture.INT = glenum.INT;
    Texture.UNSIGNED_INT = glenum.UNSIGNED_INT;
    Texture.FLOAT = glenum.FLOAT;
    
    /* PixelFormat */
    Texture.DEPTH_COMPONENT = glenum.DEPTH_COMPONENT;
    Texture.ALPHA = glenum.ALPHA;
    Texture.RGB = glenum.RGB;
    Texture.RGBA = glenum.RGBA;
    Texture.LUMINANCE = glenum.LUMINANCE;
    Texture.LUMINANCE_ALPHA = glenum.LUMINANCE_ALPHA;

    /* TextureMagFilter */
    Texture.NEAREST = glenum.NEAREST;
    Texture.LINEAR = glenum.LINEAR;
    
    /* TextureMinFilter */
    /*      NEAREST */
    /*      LINEAR */
    Texture.NEAREST_MIPMAP_NEAREST = glenum.NEAREST_MIPMAP_NEAREST;
    Texture.LINEAR_MIPMAP_NEAREST = glenum.LINEAR_MIPMAP_NEAREST;
    Texture.NEAREST_MIPMAP_LINEAR = glenum.NEAREST_MIPMAP_LINEAR;
    Texture.LINEAR_MIPMAP_LINEAR = glenum.LINEAR_MIPMAP_LINEAR;
    
    /* TextureParameterName */
    Texture.TEXTURE_MAG_FILTER = glenum.TEXTURE_MAG_FILTER;
    Texture.TEXTURE_MIN_FILTER = glenum.TEXTURE_MIN_FILTER;

    /* TextureWrapMode */
    Texture.REPEAT = glenum.REPEAT;
    Texture.CLAMP_TO_EDGE = glenum.CLAMP_TO_EDGE;
    Texture.MIRRORED_REPEAT = glenum.MIRRORED_REPEAT;


    return Texture;
});
define('3d/WebGLInfo',[],function() {
    // http://www.khronos.org/registry/webgl/extensions/
    var EXTENSION_LIST = [
                            "OES_texture_float",
                            "OES_texture_half_float",
                            "OES_texture_float_linear",
                            "OES_texture_half_float_linear",
                            "OES_standard_derivatives",
                            "OES_vertex_array_object",
                            "OES_element_index_uint",
                            "WEBGL_compressed_texture_s3tc",
                            'WEBGL_depth_texture',
                            "EXT_texture_filter_anisotropic",
                            "EXT_draw_buffers"
                        ];

    var extensions = {};

    var WebGLInfo = {

        initialize : function(_gl) {

            if (extensions[_gl.__GUID__]) {
                return;
            }
            extensions[_gl.__GUID__] = {};
            // Get webgl extension
            for (var i = 0; i < EXTENSION_LIST.length; i++) {
                var extName = EXTENSION_LIST[i];

                var ext = _gl.getExtension(extName);
                // Try vendors
                if (! ext) {
                    ext = _gl.getExtension("MOZ_" + extName);
                }
                if (! ext) {
                    ext = _gl.getExtension("WEBKIT_" + extName);
                }

                extensions[_gl.__GUID__][extName] = ext;
            }
        },

        getExtension : function(_gl, name) {
            var guid = _gl.__GUID__;
            if (extensions[guid]) {
                return extensions[guid][name];
            }
        }
    }

    return WebGLInfo;
});
define('3d/texture/Texture2D',['require','../Texture','../WebGLInfo'],function(require) {

    var Texture = require('../Texture');
    var WebGLInfo = require('../WebGLInfo');

    var Texture2D = Texture.derive({
        
        image : null,

        pixels : null,
    }, {
        update : function(_gl) {

            _gl.bindTexture(_gl.TEXTURE_2D, this.cache.get("webgl_texture"));
            
            this.beforeUpdate( _gl);

            var glFormat = this.format;
            var glType = this.type;

            _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_WRAP_S, this.wrapS);
            _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_WRAP_T, this.wrapT);

            _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_MAG_FILTER, this.magFilter);
            _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_MIN_FILTER, this.minFilter);
            
            var anisotropicExt = WebGLInfo.getExtension(_gl, "EXT_texture_filter_anisotropic");
            if (anisotropicExt && this.anisotropic > 1) {
                _gl.texParameterf(_gl.TEXTURE_2D, anisotropicExt.TEXTURE_MAX_ANISOTROPY_EXT, this.anisotropic);
            }

            if (this.image) {
                _gl.texImage2D(_gl.TEXTURE_2D, 0, glFormat, glFormat, glType, this.image);
            }
            // Can be used as a blank texture when writing render to texture(RTT)
            else {
                _gl.texImage2D(_gl.TEXTURE_2D, 0, glFormat, this.width, this.height, 0, glFormat, glType, this.pixels);
            }           
        
            if (! this.NPOT && this.useMipmap) {
                _gl.generateMipmap(_gl.TEXTURE_2D);
            }
            
            _gl.bindTexture(_gl.TEXTURE_2D, null);

        },
        generateMipmap : function(_gl) {
            _gl.bindTexture(_gl.TEXTURE_2D, this.cache.get("webgl_texture"));
            _gl.generateMipmap(_gl.TEXTURE_2D);    
        },
        isPowerOfTwo : function() {
            if (this.image) {
                var width = this.image.width,
                    height = this.image.height;   
            } else {
                var width = this.width,
                    height = this.height;
            }
            return (width & (width-1)) === 0 &&
                    (height & (height-1)) === 0;
        },

        isRenderable : function() {
            if (this.image) {
                return this.image.nodeName === "CANVAS" ||
                        this.image.complete;
            } else {
                return this.width && this.height;
            }
        },

        bind : function(_gl) {
            _gl.bindTexture(_gl.TEXTURE_2D, this.getWebGLTexture(_gl));
        },
        unbind : function(_gl) {
            _gl.bindTexture(_gl.TEXTURE_2D, null);
        },
        load : function(src) {
            var image = new Image();
            var self = this;
            image.onload = function() {
                self.dirty();
                self.trigger("load");
                image.onload = null;
            }
            image.src = src;
            this.image = image;
        }
    })

    return Texture2D;
});
define('3d/texture/TextureCube',['require','../Texture','../WebGLInfo','_'],function(require) {

    var Texture = require('../Texture');
    var WebGLInfo = require('../WebGLInfo');
    var _ = require('_');

    var targetMap = {
        'px' : 'TEXTURE_CUBE_MAP_POSITIVE_X',
        'py' : 'TEXTURE_CUBE_MAP_POSITIVE_Y',
        'pz' : 'TEXTURE_CUBE_MAP_POSITIVE_Z',
        'nx' : 'TEXTURE_CUBE_MAP_NEGATIVE_X',
        'ny' : 'TEXTURE_CUBE_MAP_NEGATIVE_Y',
        'nz' : 'TEXTURE_CUBE_MAP_NEGATIVE_Z',
    }

    var TextureCube = Texture.derive({
        image : {
            px : null,
            nx : null,
            py : null,
            ny : null,
            pz : null,
            nz : null
        },
        pixels : {
            px : null,
            nx : null,
            py : null,
            ny : null,
            pz : null,
            nz : null
        }
    }, {

        update : function(_gl) {

            _gl.bindTexture(_gl.TEXTURE_CUBE_MAP, this.cache.get("webgl_texture"));

            this.beforeUpdate(_gl);

            var glFormat = this.format;
            var glType = this.type;

            _gl.texParameteri(_gl.TEXTURE_CUBE_MAP, _gl.TEXTURE_WRAP_S, this.wrapS);
            _gl.texParameteri(_gl.TEXTURE_CUBE_MAP, _gl.TEXTURE_WRAP_T, this.wrapT);

            _gl.texParameteri(_gl.TEXTURE_CUBE_MAP, _gl.TEXTURE_MAG_FILTER, this.magFilter);
            _gl.texParameteri(_gl.TEXTURE_CUBE_MAP, _gl.TEXTURE_MIN_FILTER, this.minFilter);
            
            var anisotropicExt = WebGLInfo.getExtension(_gl, "EXT_texture_filter_anisotropic");
            if (anisotropicExt && this.anisotropic > 1) {
                _gl.texParameterf(_gl.TEXTURE_CUBE_MAP, anisotropicExt.TEXTURE_MAX_ANISOTROPY_EXT, this.anisotropic);
            }

            _.each(this.image, function(img, target) {
                if (img)
                    _gl.texImage2D(_gl[targetMap[target]], 0, glFormat, glFormat, glType, img);
                else
                    _gl.texImage2D(_gl[targetMap[target]], 0, glFormat, this.width, this.height, 0, glFormat, glType, this.pixels[target]);
            }, this);

            if (!this.NPOT && this.useMipmap) {
                _gl.generateMipmap(_gl.TEXTURE_CUBE_MAP);
            }

            _gl.bindTexture(_gl.TEXTURE_CUBE_MAP, null);
        },
        generateMipmap : function(_gl) {
            _gl.bindTexture(_gl.TEXTURE_CUBE_MAP, this.cache.get("webgl_texture"));
            _gl.generateMipmap(_gl.TEXTURE_CUBE_MAP);    
        },
        bind : function(_gl) {

            _gl.bindTexture(_gl.TEXTURE_CUBE_MAP, this.getWebGLTexture(_gl));
        },
        unbind : function(_gl) {
            _gl.bindTexture(_gl.TEXTURE_CUBE_MAP, null);
        },
        // Overwrite the isPowerOfTwo method
        isPowerOfTwo : function() {
            if (this.image.px) {
                return isPowerOfTwo(this.image.px.width) &&
                        isPowerOfTwo(this.image.px.height);
            } else {
                return isPowerOfTwo(this.width) &&
                        isPowerOfTwo(this.height);
            }

            function isPowerOfTwo(value) {
                return value & (value-1) === 0
            }
        },
        isRenderable : function() {
            if (this.image.px) {
                return isImageRenderable(this.image.px) &&
                       isImageRenderable(this.image.nx) &&
                       isImageRenderable(this.image.py) &&
                       isImageRenderable(this.image.ny) &&
                       isImageRenderable(this.image.pz) &&
                       isImageRenderable(this.image.nz);
            } else {
                return this.width && this.height;
            }
        },
        load : function(imageList) {
            var loading = 0;
            var self = this;
            _.each(imageList, function(src, name){
                var image = new Image();
                image.onload = function() {
                    loading -- ;
                    if (loading === 0){
                        self.dirty();
                        self.trigger("load");
                    }
                    image.onload = null;
                }
                loading++;
                image.src = src;
                self.image[name] = image;
            });
        }
    });

    function isImageRenderable(image) {
        return image.nodeName === "CANVAS" ||
                image.complete;
    }

    return TextureCube;
});
define('3d/FrameBuffer',['require','core/Base','./texture/Texture2D','./texture/TextureCube','./WebGLInfo','./glenum'],function(require) {
    
    var Base = require("core/Base");
    var Texture2D = require("./texture/Texture2D");
    var TextureCube = require("./texture/TextureCube");
    var WebGLInfo = require('./WebGLInfo');
    var glenum = require("./glenum");

    var FrameBuffer = Base.derive(function() {

        return {
            depthBuffer : true,

            //Save attached texture and target
            _attachedTextures : {},

            _width : 0,
            _height : 0,
            _depthTextureAttached : false,

            _renderBufferWidth : 0,
            _renderBufferHeight : 0
        }
    }, {

        bind : function(renderer) {

            var _gl = renderer.gl;

            _gl.bindFramebuffer(_gl.FRAMEBUFFER, this.getFrameBuffer(_gl));

            this.cache.put("viewport", renderer.viewportInfo);
            renderer.setViewport(0, 0, this._width, this._height);

            // Create a new render buffer
            if (this.cache.miss("renderbuffer") && this.depthBuffer && ! this._depthTextureAttached) {
                this.cache.put("renderbuffer", _gl.createRenderbuffer());
            }

            if (! this._depthTextureAttached && this.depthBuffer) {

                var width = this._width;
                var height = this._height;
                var renderbuffer = this.cache.get('renderbuffer');

                if (width !== this._renderBufferWidth
                     || height !== this._renderBufferHeight) {

                    _gl.bindRenderbuffer(_gl.RENDERBUFFER, renderbuffer);
                    
                    _gl.renderbufferStorage(_gl.RENDERBUFFER, _gl.DEPTH_COMPONENT16, width, height);
                    this._renderBufferWidth = width;
                    this._renderBUfferHeight = height;

                    _gl.bindRenderbuffer(_gl.RENDERBUFFER, null);                 
                }
                if (! this.cache.get("renderbuffer_attached")) {
                    
                    _gl.framebufferRenderbuffer(_gl.FRAMEBUFFER, _gl.DEPTH_ATTACHMENT, _gl.RENDERBUFFER, renderbuffer);
                    this.cache.put("renderbuffer_attached", true);

                }
            }
            
        },

        unbind : function(renderer) {
            var _gl = renderer.gl;
            
            _gl.bindFramebuffer(_gl.FRAMEBUFFER, null);

            this.cache.use(_gl.__GUID__);
            var viewportInfo = this.cache.get("viewport");
            // Reset viewport;
            if (viewportInfo) {
                renderer.setViewport(viewportInfo.x, viewportInfo.y, viewportInfo.width, viewportInfo.height);
            }

            // Because the data of texture is changed over time,
            // Here update the mipmaps of texture each time after rendered;
            for (var attachment in this._attachedTextures) {
                var texture = this._attachedTextures[attachment];
                if (! texture.NPOT && texture.useMipmap) {
                    var target = texture instanceof TextureCube ? _gl.TEXTURE_CUBE_MAP : _gl.TEXTURE_2D;
                    _gl.bindTexture(target, texture.getWebGLTexture(_gl));
                    _gl.generateMipmap(target);
                    _gl.bindTexture(target, null);
                }
            }
        },

        getFrameBuffer : function(_gl) {

            this.cache.use(_gl.__GUID__);

            if (this.cache.miss("framebuffer")) {
                this.cache.put("framebuffer", _gl.createFramebuffer());
            }

            return this.cache.get("framebuffer");
        },

        attach : function(_gl, texture, attachment, target) {

            if (! texture.width) {
                console.error("The texture attached to color buffer is not a valid.");
                return;
            }

            _gl.bindFramebuffer(_gl.FRAMEBUFFER, this.getFrameBuffer(_gl));

            this._width = texture.width;
            this._height = texture.height;

            target = target || _gl.TEXTURE_2D;

            // If the depth_texture extension is enabled, developers
            // Can attach a depth texture to the depth buffer
            // http://blog.tojicode.com/2012/07/using-webgldepthtexture.html
            attachment = attachment || _gl.COLOR_ATTACHMENT0;
            
            if (attachment === _gl.DEPTH_ATTACHMENT) {

                var extension = WebGLInfo.getExtension(_gl, "WEBGL_depth_texture");

                if (!extension) {
                    console.error(" Depth texture is not supported by the browser ");
                    return;
                }
                if (texture.format !== glenum.DEPTH_COMPONENT) {
                    console.error("The texture attached to depth buffer is not a valid.");
                    return;
                }
                this.cache.put("renderbuffer_attached", false);
                this._depthTextureAttached = true;
            }

            this._attachedTextures[ attachment ] = texture;

            _gl.framebufferTexture2D(_gl.FRAMEBUFFER, attachment, target, texture.getWebGLTexture(_gl), 0)

            _gl.bindFramebuffer(_gl.FRAMEBUFFER, null);
        },

        detach : function() {},

        dispose : function(_gl) {
            this.cache.use(_gl.__GUID__);

            if (this.cache.get("renderbuffer"))
                _gl.deleteRenderbuffer(this.cache.get("renderbuffer"));
            if (this.cache.get("framebuffer"))
                _gl.deleteFramebuffer(this.cache.get("framebuffer"));

            this.cache.deleteContext(_gl.__GUID__);
        }
    });

    FrameBuffer.COLOR_ATTACHMENT0 = glenum.COLOR_ATTACHMENT0;
    FrameBuffer.DEPTH_ATTACHMENT = glenum.DEPTH_ATTACHMENT;
    FrameBuffer.STENCIL_ATTACHMENT = glenum.STENCIL_ATTACHMENT;
    FrameBuffer.DEPTH_STENCIL_ATTACHMENT = glenum.DEPTH_STENCIL_ATTACHMENT;

    return FrameBuffer;
});
/**
 *
 * PENDING: use perfermance hint and remove the array after the data is transfered?
 * static draw & dynamic draw?
 */
define('3d/Geometry',['require','core/Base','core/Vector3','./BoundingBox','./glenum','util/util','glmatrix','_'],function(require) {

    'use strict'

    var Base = require("core/Base");
    var Vector3 = require("core/Vector3");
    var BoundingBox = require("./BoundingBox");
    var glenum = require("./glenum");
    var util = require("util/util");
    var glMatrix = require("glmatrix");
    var vec3 = glMatrix.vec3;
    var vec2 = glMatrix.vec2;
    var mat2 = glMatrix.mat2;
    var mat4 = glMatrix.mat4;
    var _ = require("_");

    var arrSlice = Array.prototype.slice;

    var Geometry = Base.derive(function() {

        return {

            __GUID__ : util.genGUID(),
            
            attributes : {
                 position : {
                    type : 'float',
                    semantic : "POSITION",
                    size : 3,
                    value : []
                 },
                 texcoord0 : {
                    type : 'float',
                    semantic : "TEXCOORD_0",
                    size : 2,
                    value : []
                 },
                 texcoord1 : {
                    type : 'float',
                    semantic : "TEXCOORD_1",
                    size : 2,
                    value : []
                 },
                 normal : {
                    type : 'float',
                    semantic : "NORMAL",
                    size : 3,
                    value : []
                 },
                 tangent : {
                    type : 'float',
                    semantic : "TANGENT",
                    size : 4,
                    value : []
                 },
                 color : {
                    type : 'ubyte',
                    semantic : "COLOR",
                    size : 3,
                    value : []
                 },
                 // Skinning attributes
                 // Each vertex can be bind to 4 bones, because the 
                 // sum of weights is 1, so the weights is stored in vec3 and the last
                 // can be calculated by 1-w.x-w.y-w.z
                 weight : {
                    type : 'float',
                    semantic : 'WEIGHT',
                    size : 3,
                    value : []
                 },
                 joint : {
                    type : 'float',
                    semantic : 'JOINT',
                    size : 4,
                    value : []
                 },
                 // For wireframe display
                 // http://codeflow.org/entries/2012/aug/02/easy-wireframe-display-with-barycentric-coordinates/
                 barycentric : {
                    type : 'float',
                    size : 3,
                    value : []
                 }
            },

            boundingBox : new BoundingBox(),

            useFace : true,
            // Face is list of triangles, each face
            // is an array of the vertex indices of triangle
            faces : [],

            hint : glenum.STATIC_DRAW,

            //Max Value of Uint16, i.e. 0xfff
            chunkSize : 65535,

            _enabledAttributes : null,

            // Save the normal type, can have face normal or vertex normal
            // Normally vertex normal is more smooth
            _normalType : "vertex",

            // Typed Array of each geometry chunk
            // [{
            //     attributeArrays:{
            //         position : TypedArray
            //     },
            //     indicesArray : null
            // }]
            _arrayChunks : [],

            // Map of re organized vertices data
            _verticesReorganizedMap : [],
            _reorganizedFaces : []
        }
    }, {

        computeBoundingBox : function() {
        },
        // Overwrite the dirty method
        dirty : function(field) {
            if (! field) {
                this.dirty("indices");
                for (var name in this.attributes) {
                    this.dirty(name);
                }
                return;
            }
            this.cache.dirtyAll(field);
            
            this._enabledAttributes = null;
        },

        getVerticesNumber : function() {
            return this.attributes.position.value.length;
        },

        isUseFace : function() {
            return this.useFace && (this.faces.length > 0);
        },

        isSplitted : function() {
            return this.getVerticesNumber() > this.chunkSize;
        },

        getEnabledAttributes : function() {
            // Cache
            if (this._enabledAttributes) {
                return this._enabledAttributes;
            }

            var result = {};
            var verticesNumber = this.getVerticesNumber();

            for (var name in this.attributes) {
                var attrib = this.attributes[name];
                if (attrib.value &&
                    attrib.value.length) {
                    if (attrib.value.length === verticesNumber) {
                        result[name] = attrib;
                    }
                }
            }

            this._enabledAttributes = result;

            return result;
        },

        _getDirtyAttributes : function() {

            var result = {};
            var attributes = this.getEnabledAttributes();
            
            var noDirtyAttributes = true;

            if (this.hint = glenum.STATIC_DRAW) {
                if (this.cache.miss('chunks')) {
                    return attributes;
                } else {
                    return null;
                }
            } else {
                for (var name in attributes) {
                    var attrib = attributes[name];
                    if (this.cache.isDirty(name)) {
                        result[name] = attributes[name];
                        noDirtyAttributes = false;
                    }
                }   
            }
            if (! noDirtyAttributes) {
                return result;
            }
        },

        getChunkNumber : function() {
            return this._arrayChunks.length;
        },

        getBufferChunks : function(_gl) {

            this.cache.use(_gl.__GUID__);

            var dirtyAttributes = this._getDirtyAttributes();

            var isFacesDirty = this.cache.isDirty('indices');
            isFacesDirty = isFacesDirty && this.isUseFace();
            
            if (dirtyAttributes) {
                this._updateAttributesAndIndicesArrays(dirtyAttributes, isFacesDirty);
                this._updateBuffer(_gl, dirtyAttributes, isFacesDirty);

                for (var name in dirtyAttributes) {
                    this.cache.fresh(name);
                }
                this.cache.fresh('indices');
            }
            return this.cache.get("chunks");
        },

        _updateAttributesAndIndicesArrays : function(attributes, isFacesDirty) {

            var self = this
            var cursors = {};
            var verticesNumber = this.getVerticesNumber();
            
            var verticesReorganizedMap = this._verticesReorganizedMap;

            var ArrayConstructors = {};
            for (var name in attributes) {
                // Type can be byte, ubyte, short, ushort, float
                switch(type) {
                    case "byte":
                        ArrayConstructors[name] = Int8Array;
                        break;
                    case "ubyte":
                        ArrayConstructors[name] = Uint8Array;
                        break;
                    case "short":
                        ArrayConstructors[name] = Int16Array;
                        break;
                    case "ushort":
                        ArrayConstructors[name] = Uint16Array;
                        break;
                    default:
                        ArrayConstructors[name] = Float32Array;
                        break;
                }
                cursors[name] = 0;
            }

            var newChunk = function(chunkIdx) {
                if (self._arrayChunks[chunkIdx]) {
                    return self._arrayChunks[chunkIdx];
                }
                var chunk = {
                    attributeArrays : {},
                    indicesArray : null
                };

                for (var name in attributes) {
                    chunk.attributeArrays[name] = null;
                }

                for (var name in cursors) {
                    cursors[name] = 0;
                }
                for (var i = 0; i < verticesNumber; i++) {
                    verticesReorganizedMap[i] = -1;
                }
                
                self._arrayChunks.push(chunk);
                return chunk;
            }

            var attribNameList = Object.keys(attributes);
            // Split large geometry into chunks because index buffer
            // only support uint16 which means each draw call can only
             // have at most 65535 vertex data
            if (verticesNumber > this.chunkSize && this.isUseFace()) {
                var vertexCursor = 0,
                    chunkIdx = 0,
                    currentChunk;

                var chunkFaceStart = [0];
                var vertexUseCount = [];

                for (i = 0; i < verticesNumber; i++) {
                    vertexUseCount[i] = -1;
                    verticesReorganizedMap[i] = -1;
                }
                if (isFacesDirty) {
                    if (this._reorganizedFaces.length !== this.faces.length) {
                        for (i = 0; i < this.faces.length; i++) {
                            this._reorganizedFaces[i] = [0, 0, 0];
                        }
                    }
                }

                currentChunk = newChunk(chunkIdx);

                for (var i = 0; i < this.faces.length; i++) {
                    var face = this.faces[i];
                    var reorganizedFace = this._reorganizedFaces[i];
                    var i1 = face[0], i2 = face[1], i3 = face[2];
                    // newChunk
                    if (vertexCursor+3 > this.chunkSize) {
                        chunkIdx++;
                        chunkFaceStart[chunkIdx] = i;
                        vertexCursor = 0;
                        currentChunk = newChunk(chunkIdx);
                    }
                    var newI1 = verticesReorganizedMap[i1] === -1;
                    var newI2 = verticesReorganizedMap[i2] === -1;
                    var newI3 = verticesReorganizedMap[i3] === -1;

                    for (var k = 0; k < attribNameList.length; k++) {
                        var name = attribNameList[k];
                        var attribArray = currentChunk.attributeArrays[name];
                        var values = attributes[name].value;
                        var size = attributes[name].size;
                        if (! attribArray) {
                            // Here use array to put data temporary because i can't predict
                            // the size of chunk precisely.
                            attribArray = currentChunk.attributeArrays[name] = [];
                        }
                        if (size === 1) {
                            if (newI1) {
                                attribArray[cursors[name]++] = values[i1];
                            }
                            if (newI2) {
                                attribArray[cursors[name]++] = values[i2];
                            }
                            if (newI3) {
                                attribArray[cursors[name]++] = values[i3];
                            }
                        }
                        else {
                            if (newI1) {
                                for (var j = 0; j < size; j++) {
                                    attribArray[cursors[name]++] = values[i1][j];
                                }
                            }
                            if (newI2) {
                                for (var j = 0; j < size; j++) {
                                    attribArray[cursors[name]++] = values[i2][j];
                                }
                            }
                            if (newI3) {
                                for (var j = 0; j < size; j++) {
                                    attribArray[cursors[name]++] = values[i3][j];
                                }
                            }
                        }
                    }
                    if (newI1) {
                        verticesReorganizedMap[i1] = vertexCursor;
                        reorganizedFace[0] = vertexCursor;
                        vertexCursor++;
                    } else {
                        reorganizedFace[0] = verticesReorganizedMap[i1];
                    }
                    if (newI2) {
                        verticesReorganizedMap[i2] = vertexCursor;
                        reorganizedFace[1] = vertexCursor;
                        vertexCursor++;
                    } else {
                        reorganizedFace[1] = verticesReorganizedMap[i2];
                    }
                    if (newI3) {
                        verticesReorganizedMap[i3] = vertexCursor;
                        reorganizedFace[2] = vertexCursor;
                        vertexCursor++
                    } else {
                        reorganizedFace[2] = verticesReorganizedMap[i3];
                    }
                }
                //Create typedArray from existed array
                for (var c = 0; c < this._arrayChunks.length; c++) {
                    var chunk = this._arrayChunks[c];
                    for (var name in chunk.attributeArrays) {
                        var array = chunk.attributeArrays[name];
                        if (array instanceof Array) {
                            chunk.attributeArrays[name] = new ArrayConstructors[name](array);
                        }
                    }
                }

                if (isFacesDirty) {
                    var chunkStart, chunkEnd, cursor, chunk;
                    for (var c = 0; c < this._arrayChunks.length; c++) {
                        chunkStart = chunkFaceStart[c];
                        chunkEnd = chunkFaceStart[c+1] || this.faces.length;
                        cursor = 0;
                        chunk = this._arrayChunks[c];
                        var indicesArray = chunk.indicesArray;
                        if (! indicesArray) {
                            indicesArray = chunk.indicesArray = new Uint16Array((chunkEnd-chunkStart)*3);
                        }

                        for (var i = chunkStart; i < chunkEnd; i++) {
                            indicesArray[cursor++] = this._reorganizedFaces[i][0];
                            indicesArray[cursor++] = this._reorganizedFaces[i][1];
                            indicesArray[cursor++] = this._reorganizedFaces[i][2];
                        }
                    }
                }
            } else {
                var chunk = newChunk(0);
                // Use faces
                if (isFacesDirty) {
                    var indicesArray = chunk.indicesArray;
                    if (! indicesArray) {
                        indicesArray = chunk.indicesArray = new Uint16Array(this.faces.length*3);
                    }
                    var cursor = 0;
                    for (var i = 0; i < this.faces.length; i++) {
                        indicesArray[cursor++] = this.faces[i][0];
                        indicesArray[cursor++] = this.faces[i][1];
                        indicesArray[cursor++] = this.faces[i][2];
                    }
                }
                for (var name in attributes) {
                    var values = attributes[name].value,
                        type = attributes[name].type,
                        size = attributes[name].size,
                        attribArray = chunk.attributeArrays[name];
                    
                    if (! attribArray) {
                        attribArray = chunk.attributeArrays[name] = new ArrayConstructors[name](verticesNumber*size);
                    }

                    if (size === 1) {
                        for (var i = 0; i < values.length; i++) {
                            attribArray[i] = values[i];
                        }
                    } else {
                        var cursor = 0;
                        for (var i = 0; i < values.length; i++) {
                            for (var j = 0; j < size; j++) {
                                attribArray[cursor++] = values[i][j];
                            }
                        }
                    }
                }
            }

        },

        _updateBuffer : function(_gl, dirtyAttributes, isFacesDirty) {

            var chunks = this.cache.get("chunks");
            if (! chunks) {
                chunks = [];
                // Intialize
                for (var i = 0; i < this._arrayChunks.length; i++) {
                    chunks[i] = {
                        attributeBuffers : {},
                        indicesBuffer : null
                    }
                }
                this.cache.put("chunks", chunks);
            }
            for (var i = 0; i < chunks.length; i++) {
                var chunk = chunks[i];
                if (! chunk) {
                    chunk = chunks[i] = {
                        attributeBuffers : {},
                        indicesBuffer : null
                    }
                }
                var attributeBuffers = chunk.attributeBuffers,
                    indicesBuffer = chunk.indicesBuffer;
                var arrayChunk = this._arrayChunks[i],
                    attributeArrays = arrayChunk.attributeArrays,
                    indicesArray = arrayChunk.indicesArray;

                for (var name in dirtyAttributes) {
                    var attribute = dirtyAttributes[name];
                    var type = attribute.type;
                    var semantic = attribute.semantic;
                    var size = attribute.size;

                    var bufferInfo = attributeBuffers[name];
                    var buffer;
                    if (bufferInfo) {
                        buffer = bufferInfo.buffer
                    } else {
                        buffer = _gl.createBuffer();
                    }
                    //TODO: Use BufferSubData?
                    _gl.bindBuffer(_gl.ARRAY_BUFFER, buffer);
                    _gl.bufferData(_gl.ARRAY_BUFFER, attributeArrays[name], this.hint);

                    attributeBuffers[name] = {
                        type : type,
                        buffer : buffer,
                        size : size,
                        semantic : semantic,
                    }
                } 
                if (isFacesDirty) {
                    if (! indicesBuffer) {
                        indicesBuffer = chunk.indicesBuffer = {
                            buffer : _gl.createBuffer(),
                            count : indicesArray.length
                        }
                    }
                    _gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, indicesBuffer.buffer);
                    _gl.bufferData(_gl.ELEMENT_ARRAY_BUFFER, indicesArray, this.hint);   
                }
            }
        },

        generateVertexNormals : function() {
            var faces = this.faces
            var len = faces.length
            var positions = this.attributes.position.value
            var normals = this.attributes.normal.value
            var normal = vec3.create();

            var v12 = vec3.create(), v23 = vec3.create();

            var difference = positions.length - normals.length;
            for (var i = 0; i < normals.length; i++) {
                vec3.set(normals[i], 0.0, 0.0, 0.0);
            }
            for (var i = normals.length; i < positions.length; i++) {
                //Use array instead of Float32Array
                normals[i] = [0.0, 0.0, 0.0];
            }

            for (var f = 0; f < len; f++) {

                var face = faces[f],
                    i1 = face[0],
                    i2 = face[1],
                    i3 = face[2],
                    p1 = positions[i1],
                    p2 = positions[i2],
                    p3 = positions[i3];

                vec3.sub(v12, p1, p2);
                vec3.sub(v23, p2, p3);
                vec3.cross(normal, v12, v23);
                // Weighted by the triangle area
                vec3.add(normals[i1], normals[i1], normal);
                vec3.add(normals[i2], normals[i2], normal);
                vec3.add(normals[i3], normals[i3], normal);
            }
            for (var i = 0; i < normals.length; i++) {
                vec3.normalize(normals[i], normals[i]);
            }

            this._normalType = "vertex";
        },

        generateFaceNormals : function() {
            if (! this.isUniqueVertex()) {
                this.generateUniqueVertex();
            }

            var faces = this.faces,
                len = faces.length,
                positions = this.attributes.position.value,
                normals = this.attributes.normal.value,
                normal = vec3.create();

            var v12 = vec3.create(), v23 = vec3.create();

            var isCopy = normals.length === positions.length;
            //   p1
            //  /  \
            // p3---p2
            for (var i = 0; i < len; i++) {
                var face = faces[i],
                    i1 = face[0],
                    i2 = face[1],
                    i3 = face[2],
                    p1 = positions[i1],
                    p2 = positions[i2],
                    p3 = positions[i3];

                vec3.sub(v12, p1, p2);
                vec3.sub(v23, p2, p3);
                vec3.cross(normal, v12, v23);

                if (isCopy) {
                    vec3.copy(normals[i1], normal);
                    vec3.copy(normals[i2], normal);
                    vec3.copy(normals[i3], normal);
                } else {
                    normals[i1] = normals[i2] = normals[i3] = arrSlice.call(normal);
                }
            }

            this._normalType = "face";
        },
        // "Mathmatics for 3D programming and computer graphics, third edition"
        // section 7.8.2
        // http://www.crytek.com/download/Triangle_mesh_tangent_space_calculation.pdf
        generateTangents : function() {
            
            var texcoords = this.attributes.texcoord0.value,
                positions = this.attributes.position.value,
                tangents = this.attributes.tangent.value,
                normals = this.attributes.normal.value;

            var tan1 = [], tan2 = [],
                verticesNumber = this.getVerticesNumber();
            for (var i = 0; i < verticesNumber; i++) {
                tan1[i] = [0.0, 0.0, 0.0];
                tan2[i] = [0.0, 0.0, 0.0];
            }

            var sdir = [0.0, 0.0, 0.0];
            var tdir = [0.0, 0.0, 0.0];
            for (var i = 0; i < this.faces.length; i++) {
                var face = this.faces[i],
                    i1 = face[0],
                    i2 = face[1],
                    i3 = face[2],

                    st1 = texcoords[i1],
                    st2 = texcoords[i2],
                    st3 = texcoords[i3],

                    p1 = positions[i1],
                    p2 = positions[i2],
                    p3 = positions[i3];

                var x1 = p2[0] - p1[0],
                    x2 = p3[0] - p1[0],
                    y1 = p2[1] - p1[1],
                    y2 = p3[1] - p1[1],
                    z1 = p2[2] - p1[2],
                    z2 = p3[2] - p1[2];

                var s1 = st2[0] - st1[0],
                    s2 = st3[0] - st1[0],
                    t1 = st2[1] - st1[1],
                    t2 = st3[1] - st1[1];

                var r = 1.0 / (s1 * t2 - t1 * s2);
                sdir[0] = (t2 * x1 - t1 * x2) * r;
                sdir[1] = (t2 * y1 - t1 * y2) * r; 
                sdir[2] = (t2 * z1 - t1 * z2) * r;

                tdir[0] = (s1 * x2 - s2 * x1) * r;
                tdir[1] = (s1 * y2 - s2 * y1) * r;
                tdir[2] = (s1 * z2 - s2 * z1) * r;

                vec3.add(tan1[i1], tan1[i1], sdir);
                vec3.add(tan1[i2], tan1[i2], sdir);
                vec3.add(tan1[i3], tan1[i3], sdir);
                vec3.add(tan2[i1], tan2[i1], tdir);
                vec3.add(tan2[i2], tan2[i2], tdir);
                vec3.add(tan2[i3], tan2[i3], tdir);
            }
            var tmp = [0, 0, 0, 0];
            var nCrossT = [0, 0, 0];
            for (var i = 0; i < verticesNumber; i++) {
                var n = normals[i];
                var t = tan1[i];

                // Gram-Schmidt orthogonalize
                vec3.scale(tmp, n, vec3.dot(n, t));
                vec3.sub(tmp, t, tmp);
                vec3.normalize(tmp, tmp);
                // Calculate handedness.
                vec3.cross(nCrossT, n, t);
                tmp[3] = vec3.dot(nCrossT, tan2[i]) < 0.0 ? -1.0 : 1.0;
                tangents[i] = tmp.slice();
            }
        },

        isUniqueVertex : function() {
            if (this.isUseFace()) {
                return this.getVerticesNumber() === this.faces.length * 3;
            } else {
                return true;
            }
        },

        generateUniqueVertex : function() {

            var vertexUseCount = [];
            // Intialize with empty value, read undefined value from array
            // is slow
            // http://jsperf.com/undefined-array-read
            for (var i = 0; i < this.getVerticesNumber(); i++) {
                vertexUseCount[i] = 0;
            }

            var cursor = this.getVerticesNumber(),
                attributes = this.getEnabledAttributes(),
                faces = this.faces;

            function cloneAttribute(idx) {
                for (var name in attributes) {
                    var array = attributes[name].value;
                    var size = array[0].length || 1;
                    if (size === 1) {
                        array.push(array[idx]);
                    } else {
                        array.push(arrSlice.call(array[idx]));
                    }
                }
            }
            for (var i = 0; i < faces.length; i++) {
                var face = faces[i],
                    i1 = face[0],
                    i2 = face[1],
                    i3 = face[2];
                if (vertexUseCount[i1] > 0) {
                    cloneAttribute(i1);
                    face[0] = cursor;
                    cursor++;
                }
                if (vertexUseCount[i2] > 0) {
                    cloneAttribute(i2);
                    face[1] = cursor;
                    cursor++;
                }
                if (vertexUseCount[i3] > 0) {
                    cloneAttribute(i3);
                    face[2] = cursor;
                    cursor++;
                }
                vertexUseCount[i1]++;
                vertexUseCount[i2]++;
                vertexUseCount[i3]++;
            }

            this.dirty();
        },

        // http://codeflow.org/entries/2012/aug/02/easy-wireframe-display-with-barycentric-coordinates/
        // http://en.wikipedia.org/wiki/Barycentric_coordinate_system_(mathematics)
        generateBarycentric : (function() {
            var a = [1, 0, 0],
                b = [0, 0, 1],
                c = [0, 1, 0];
            return function() {

                if (! this.isUniqueVertex()) {
                    this.generateUniqueVertex();
                }

                var array = this.attributes.barycentric.value;
                // Already existed;
                if (array.length == this.faces.length * 3) {
                    return;
                }
                var i1, i2, i3, face;
                for (var i = 0; i < this.faces.length; i++) {
                    face = this.faces[i];
                    i1 = face[0];
                    i2 = face[1];
                    i3 = face[2];
                    array[i1] = a;
                    array[i2] = b;
                    array[i3] = c;
                }
            }
        })(),
        // TODO : tangent
        applyMatrix : function(matrix) {
            var positions = this.attributes.position.value;
            var normals = this.attributes.normal.value;

            matrix = matrix._array;
            for (var i = 0; i < positions.length; i++) {
                vec3.transformMat4(positions[i], positions[i], matrix);
            }
            // Normal Matrix
            var inverseTransposeMatrix = mat4.create();
            mat4.invert(inverseTransposeMatrix, matrix);
            mat4.transpose(inverseTransposeMatrix, inverseTransposeMatrix);

            for (var i = 0; i < normals.length; i++) {
                vec3.transformMat4(normals[i], normals[i], inverseTransposeMatrix);
            }
        },

        dispose : function(_gl) {
            this.cache.use(_gl.__GUID__);
            var chunks = this.cache.get('chunks');
            if (chunks) {
                for (var c = 0; c < chunks.length; c++) {
                    var chunk = chunks[c];

                    for (var name in chunk.attributeBuffers) {
                        var attribs = chunk.attributeBuffers[name];
                        _gl.deleteBuffer(attribs.buffer);
                    }
                }
            }
            this.cache.deleteContext(_gl.__GUID__);
        }
    });
    
    Geometry.STATIC_DRAW = glenum.STATIC_DRAW;
    Geometry.DYNAMIC_DRAW = glenum.DYNAMIC_DRAW;
    Geometry.STREAM_DRAW = glenum.STREAM_DRAW;
    
    return Geometry;
});
define('3d/Joint',['require','./Node','core/Quaternion','core/Vector3','core/Matrix4'],function(require) {

    var Node = require("./Node");
    var Quaternion = require("core/Quaternion");
    var Vector3 = require("core/Vector3");
    var Matrix4 = require("core/Matrix4");
    
    var Joint = Node.derive(function() {
        return {
            // Index of bone
            index : -1,
            // Parent bone index
            parentIndex : -1,
            //{
            //  time : 
            //  position : 
            //  rotation :
            //  scale :
            //}
            poses : [],

            _cacheKey : 0,
            _cacheTime : 0
        }
    }, {

        setPose : function(time) {
            this._interpolateField(time, 'position');
            this._interpolateField(time, 'rotation');
            this._interpolateField(time, 'scale');
        },

        _interpolateField : function(time, fieldName) {
            var poses = this.poses;
            var len = poses.length;
            var start;
            var end;

            if (time < this._cacheTime) {
                var s = this._cacheKey >= len-1 ? len-1 : this._cacheKey+1;
                for (var i = s; i >= 0; i--) {
                    if (poses[i].time <= time && poses[i][fieldName]) {
                        start = poses[i];
                        this._cacheKey = i;
                        this._cacheTime = time;
                    } else if (poses[i][fieldName]) {
                        end = poses[i];
                        break;
                    }
                }
            } else {
                for (var i = this._cacheKey; i < len; i++) {
                    if (poses[i].time <= time && poses[i][fieldName]) {
                        start = poses[i];
                        this._cacheKey = i;
                        this._cacheTime = time;
                    } else if (poses[i][fieldName]) {
                        end = poses[i];
                        break;
                    }
                }
            }

            if (start && end) {
                var percent = (time-start.time) / (end.time-start.time);
                percent = Math.max(Math.min(percent, 1), 0);
                if (fieldName === "rotation") {
                    this[fieldName].slerp(start[fieldName], end[fieldName], percent);
                } else {
                    this[fieldName].lerp(start[fieldName], end[fieldName], percent);
                }
            } else {
                this._cacheKey = 0;
                this._cacheTime = 0;
            }
        }
    });

    return Joint;
});
/**
 * Mainly do the parse and compile of shader string
 * Support shader code chunk import and export
 * Support shader semantics
 * http://www.nvidia.com/object/using_sas.html
 * https://github.com/KhronosGroup/collada2json/issues/45
 *
 */
define('3d/Shader',['require','core/Base','glmatrix','util/util','_'],function(require) {
    
    

    var Base = require("core/Base");
    var glMatrix = require("glmatrix");
    var mat2 = glMatrix.mat2;
    var mat3 = glMatrix.mat3;
    var mat4 = glMatrix.mat4;
    var util = require("util/util");
    var _ = require("_");

    var uniformRegex = /uniform\s+(bool|float|int|vec2|vec3|vec4|ivec2|ivec3|ivec4|mat2|mat3|mat4|sampler2D|samplerCube)\s+(\w+)?(\[.*?\])?\s*(:\s*([\S\s]+?))?;/g;
    var attributeRegex = /attribute\s+(float|int|vec2|vec3|vec4)\s+(\w*)\s*(:\s*(\w+))?;/g;

    var uniformTypeMap = {
        "bool" : "1i",
        "int" : "1i",
        "sampler2D" : "t",
        "samplerCube" : "t",
        "float" : "1f",
        "vec2" : "2f",
        "vec3" : "3f",
        "vec4" : "4f",
        "ivec2" : "2i",
        "ivec3" : "3i",
        "ivec4" : "4i",
        "mat2" : "m2",
        "mat3" : "m3",
        "mat4" : "m4"
    }
    var uniformValueConstructor = {
        'bool' : function() {return true;},
        'int' : function() {return 0;},
        'float' : function() {return 0;},
        'sampler2D' : function() {return null;},
        'samplerCube' : function() {return null;},

        'vec2' : function() {return new Float32Array(2);},
        'vec3' : function() {return new Float32Array(3);},
        'vec4' : function() {return new Float32Array(4);},

        'ivec2' : function() {return new Int32Array(2);},
        'ivec3' : function() {return new Int32Array(3);},
        'ivec4' : function() {return new Int32Array(4);},

        'mat2' : function() {return mat2.create();},
        'mat3' : function() {return mat3.create();},
        'mat4' : function() {return mat4.create();},

        'array' : function() {return [];}
    }
    var attribSemantics = [
        'POSITION', 
        'NORMAL',
        'BINORMAL',
        'TANGENT',
        'TEXCOORD',
        'TEXCOORD_0',
        'TEXCOORD_1',
        'COLOR',
        // Skinning
        // https://github.com/KhronosGroup/glTF/blob/master/specification/README.md#semantics
        'JOINT',
        'WEIGHT',
        'INV_BIND_MATRIX'
    ];
    var matrixSemantics = [
        'WORLD',
        'VIEW',
        'PROJECTION',
        'WORLDVIEW',
        'VIEWPROJECTION',
        'WORLDVIEWPROJECTION',
        'WORLDINVERSE',
        'VIEWINVERSE',
        'PROJECTIONINVERSE',
        'WORLDVIEWINVERSE',
        'VIEWPROJECTIONINVERSE',
        'WORLDVIEWPROJECTIONINVERSE',
        'WORLDTRANSPOSE',
        'VIEWTRANSPOSE',
        'PROJECTIONTRANSPOSE',
        'WORLDVIEWTRANSPOSE',
        'VIEWPROJECTIONTRANSPOSE',
        'WORLDVIEWPROJECTIONTRANSPOSE',
        'WORLDINVERSETRANSPOSE',
        'VIEWINVERSETRANSPOSE',
        'PROJECTIONINVERSETRANSPOSE',
        'WORLDVIEWINVERSETRANSPOSE',
        'VIEWPROJECTIONINVERSETRANSPOSE',
        'WORLDVIEWPROJECTIONINVERSETRANSPOSE',
    ];
    
    var errorShader = {};

    // Enable attribute operation is global to all programs
    // Here saved the list of all enabled attribute index 
    // http://www.mjbshaw.com/2013/03/webgl-fixing-invalidoperation.html
    var enabledAttributeList = {};

    var Shader = Base.derive(function() {

        return {

            __GUID__ : util.genGUID(),

            vertex : "",
            
            fragment : "",

            precision : "mediump",
            // Properties follow will be generated by the program
            attribSemantics : {},
            matrixSemantics : {},

            uniformTemplates : {},
            attributeTemplates : {},

            // Custom defined values in the shader
            vertexDefines : {},
            fragmentDefines : {},
            // Glue code
            // Defines the each type light number in the scene
            // AMBIENT_LIGHT
            // POINT_LIGHT
            // SPOT_LIGHT
            // AREA_LIGHT
            lightNumber : {},
            // {
            //  enabled : true
            //  shaderType : "vertex",
            // }
            _textureStatus : {},

            _vertexProcessed : "",
            _fragmentProcessed : "",

            // Assume shader in all context will get the same location
            _locations : {}
        }
    }, function() {

        this._updateShaderString();
        
    }, {

        setVertex : function(str) {
            this.vertex = str;
            this._updateShaderString();
            this.dirty();
        },
        setFragment : function(str) {
            this.fragment = str;
            this._updateShaderString();
            this.dirty();
        },
        bind : function(_gl) {

            this.cache.use(_gl.__GUID__ , {
                "attriblocations" : {}
            });

            if (this.cache.isDirty()) {
                this._updateShaderString();
                this._buildProgram(_gl, this._vertexProcessed, this._fragmentProcessed);
                this.cache.fresh();
            }

            _gl.useProgram(this.cache.get("program"));
        },

        dirty : function() {
            this.cache.dirty();
            for (var contextId in this.cache._caches) {
                var context = this.cache._caches[contextId];
                context["attriblocations"] = {};
            }
            this._locations = {};
        },

        _updateShaderString : function(force) {

            if (this.vertex !== this._vertexPrev ||
                this.fragment !== this._fragmentPrev || force) {

                this._parseImport();
                
                this.attribSemantics = {};
                this.matrixSemantics = {};
                this._textureStatus = {};

                this._parseUniforms();
                this._parseAttributes();

                this._vertexPrev = this.vertex;
                this._fragmentPrev = this.fragment;
            }
            this._addDefine();
        },

        define : function(type, key, val) {
            val = val || null;
            if (type == 'vertex' || type == 'both') {
                if (this.vertexDefines[key] !== val) {
                    this.vertexDefines[key] = val;
                    // Mark as dirty
                    this.dirty();
                }
            }
            if (type == 'fragment' || type == 'both') {
                if (this.fragmentDefines[key] !== val) {
                    this.fragmentDefines[key] = val;
                    // Mark as dirty
                    this.dirty();
                }
            }
        },

        unDefine : function(type, key) {
            switch(type) {
                case "vertex":
                    if (this.isDefined('vertex', key)) {
                        delete this.vertexDefines[key];
                        // Mark as dirty
                        this.dirty();
                    }
                    break;
                case "fragment":
                    if (this.isDefined('fragment', key)) {
                        delete this.fragmentDefines[key];
                        // Mark as dirty
                        this.dirty();
                    }
                    break;
                default:
                    console.warn("Define type must be vertex or fragment");
            }
        },

        isDefined : function(type, key) {
            switch(type) {
                case "vertex":
                    return this.vertexDefines[key] !== undefined;
                case "fragment":
                    return this.fragmentDefines[key] !== undefined;
            }
        },

        getDefine : function(type, key) {
            switch(type) {
                case "vertex":
                    return this.vertexDefines[key];
                case "fragment":
                    return this.fragmentDefines[key];
            }
        },

        enableTexture : function(symbol) {
            var status = this._textureStatus[ symbol ];
            if (status) {
                var isEnabled = status.enabled;
                if (isEnabled) {
                    // Do nothing
                    return;
                }else{
                    status.enabled = true;
                    this.dirty();
                }
            }
        },

        enableTexturesAll : function() {
            for (var symbol in this._textureStatus) {
                this._textureStatus[symbol].enabled = true;
            }

            this.dirty();
        },

        disableTexture : function(symbol) {
            var status = this._textureStatus[ symbol ];
            if (status) {
                var isDisabled = ! status.enabled;
                if (isDisabled) {
                    // Do nothing
                    return;
                }else{
                    status.enabled = false;

                    this.dirty();
                }
            }
        },

        disableTexturesAll : function(symbol) {
            for (var symbol in this._textureStatus) {
                this._textureStatus[symbol].enabled = false;
            }

            this.dirty();
        },

        isTextureEnabled : function(symbol) {
            return this._textureStatus[symbol].enabled;
        },

        setUniform : function(_gl, type, symbol, value) {

            var program = this.cache.get("program");            

            var locationsMap = this._locations;
            var location = locationsMap[symbol];
            // Uniform is not existed in the shader
            if (location === null) {
                return;
            }
            else if (! location) {
                location = _gl.getUniformLocation(program, symbol);
                // Unform location is a WebGLUniformLocation Object
                // If the uniform not exist, it will return null
                if (location === null ) {
                    locationsMap[symbol] = null;
                    return;
                }
                locationsMap[symbol] = location;
            }
            switch (type) {
                case '1i':
                    _gl.uniform1i(location, value);
                    break;
                case '1f':
                    _gl.uniform1f(location, value);
                    break;
                case "1fv":
                    _gl.uniform1fv(location, value);
                    break;
                case "1iv":
                    _gl.uniform1iv(location, value);
                    break;
                case '2iv':
                    _gl.uniform2iv(location, value);
                    break;
                case '2fv':
                    _gl.uniform2fv(location, value);
                    break;
                case '3iv':
                    _gl.uniform3iv(location, value);
                    break;
                case '3fv':
                    _gl.uniform3fv(location, value);
                    break;
                case "4iv":
                    _gl.uniform4iv(location, value);
                    break;
                case "4fv":
                    _gl.uniform4fv(location, value);
                    break;
                case '2i':
                    _gl.uniform2i(location, value[0], value[1]);
                    break;
                case '2f':
                    _gl.uniform2f(location, value[0], value[1]);
                    break;
                case '3i':
                    _gl.uniform3i(location, value[0], value[1], value[2]);
                    break;
                case '3f':
                    _gl.uniform3f(location, value[0], value[1], value[2]);
                    break;
                case '4i':
                    _gl.uniform4i(location, value[0], value[1], value[2], value[3]);
                    break;
                case '4f':
                    _gl.uniform4f(location, value[0], value[1], value[2], value[3]);
                    break;
                case 'm2':
                    // The matrix must be created by glmatrix and can pass it directly.
                    _gl.uniformMatrix2fv(location, false, value);
                    break;
                case 'm3':
                    // The matrix must be created by glmatrix and can pass it directly.
                    _gl.uniformMatrix3fv(location, false, value);
                    break;
                case 'm4':
                    // The matrix must be created by glmatrix and can pass it directly.
                    _gl.uniformMatrix4fv(location, false, value);
                    break;
                case "m2v":
                    var size = 4;
                case "m3v":
                    var size = 9;
                case 'm4v':
                    var size = 16;
                    if (value instanceof Array) {
                        var array = new Float32Array(value.length * size);
                        var cursor = 0;
                        for (var i = 0; i < value.length; i++) {
                            var item = value[i];
                            for (var j = 0; j < item.length; j++) {
                                array[cursor++] = item[j];
                            }
                        }
                        _gl.uniformMatrix4fv(location, false, array);
                    // Raw value
                    }else if (value instanceof Float32Array) {   // ArrayBufferView
                        _gl.uniformMatrix4fv(location, false, value);
                    }
                    break;
            }
        },

        setUniformBySemantic : function(_gl, semantic, val) {
            var semanticInfo = this.attribSemantics[semantic];
            if (semanticInfo) {
                return this.setUniform(_gl, semanticInfo.type, semanticInfo.symbol, val);
            }
            return false;
        },
        /**
         * Enable the attributes passed in and disable the rest
         * Example Usage:
         * enableAttributes(_gl, "position", "texcoords")
         * OR
         * enableAttributes(_gl, ["position", "texcoords"])
         */
        enableAttributes : function(_gl, attribList) {
            
            var program = this.cache.get("program");

            var locationsMap = this.cache.get("attriblocations");

            if (typeof(attribList) === "string") {
                attribList = Array.prototype.slice.call(arguments, 1);
            }

            var enabledAttributeListInContext = enabledAttributeList[_gl.__GUID__];
            if (! enabledAttributeListInContext) {
                enabledAttributeListInContext 
                    = enabledAttributeList[_gl.__GUID__] 
                    = [];
            }

            for (var i = 0; i < attribList.length; i++) {
                var symbol = attribList[i];
                if (!this.attributeTemplates[symbol]) {
                    continue;
                }
                var location = locationsMap[symbol];                        
                if (location === undefined) {
                    location = _gl.getAttribLocation(program, symbol);
                    // Attrib location is a number from 0 to ...
                    if (location === -1) {
                        continue;
                    }
                    locationsMap[symbol] = location;
                }
                // 2 is going to enable(not enabled yet), 
                // 3 has beend enabled, and marked not to be disable
                if (!enabledAttributeListInContext[location]) {
                    enabledAttributeListInContext[location] = 2;
                } else {
                    enabledAttributeListInContext[location] = 3;
                }
            }

            for (var i = 0; i < enabledAttributeListInContext.length; i++) {
                switch(enabledAttributeListInContext[i]){
                    case 2:
                        _gl.enableVertexAttribArray(i);
                        enabledAttributeListInContext[i] = 1;
                        break;
                    case 3:
                        enabledAttributeListInContext[i] = 1;
                        break;
                    // Expired
                    case 1:
                        _gl.disableVertexAttribArray(i);
                        enabledAttributeListInContext[i] = 0;
                        break;
                }
            }

        },

        setMeshAttribute : function(_gl, symbol, type, size) {
            var glType;
            switch (type) {
                case "byte":
                    glType = _gl.BYTE;
                    break;
                case "ubyte":
                    glType = _gl.UNSIGNED_BYTE;
                    break;
                case "short":
                    glType = _gl.SHORT;
                    break;
                case "ushort":
                    glType = _gl.UNSIGNED_SHORT;
                    break;
                default:
                    glType = _gl.FLOAT;
                    break;
            }

            var program = this.cache.get("program");            

            var locationsMap = this.cache.get("attriblocations");
            var location = locationsMap[symbol];

            if (typeof(location) === "undefined") {
                location = _gl.getAttribLocation(program, symbol);
                // Attrib location is a number from 0 to ...
                if (location === -1) {
                    return;
                }
                locationsMap[symbol] = location;
            }

            _gl.vertexAttribPointer(location, size, glType, false, 0, 0);
        },

        _parseImport : function() {

            this._vertexProcessedWithoutDefine = Shader.parseImport(this.vertex);
            this._fragmentProcessedWithoutDefine = Shader.parseImport(this.fragment);

        },

        _addDefine : function() {

            // Add defines
            var defineStr = [];
            _.each(this.lightNumber, function(count, lightType) {
                if (count) {
                    defineStr.push("#define "+lightType.toUpperCase()+"_NUMBER "+count);
                }
            });
            _.each(this._textureStatus, function(status, symbol) {
                if (status.enabled && status.shaderType === "vertex") {
                    defineStr.push("#define "+symbol.toUpperCase()+"_ENABLED");
                }
            });
            // Custom Defines
            _.each(this.vertexDefines, function(value, symbol) {
                if (value === null) {
                    defineStr.push("#define "+symbol);
                }else{
                    defineStr.push("#define "+symbol+" "+value.toString());
                }
            })
            this._vertexProcessed = defineStr.join("\n") + "\n" + this._vertexProcessedWithoutDefine;

            defineStr = [];
            _.each(this.lightNumber, function(count, lightType) {
                if (count) {
                    defineStr.push("#define "+lightType+"_NUMBER "+count);
                }
            });
            _.each(this._textureStatus, function(status, symbol) {
                if (status.enabled && status.shaderType === "fragment") {
                    defineStr.push("#define "+symbol.toUpperCase()+"_ENABLED");
                }
            });
            // Custom Defines
            _.each(this.fragmentDefines, function(value, symbol) {
                if (value === null) {
                    defineStr.push("#define "+symbol);
                }else{
                    defineStr.push("#define "+symbol+" "+value.toString());
                }
            })
            var tmp = defineStr.join("\n") + "\n" + this._fragmentProcessedWithoutDefine;
            
            // Add precision
            this._fragmentProcessed = ['precision', this.precision, 'float'].join(' ')+';\n' + tmp;
        },

        _parseUniforms : function() {
            var uniforms = {},
                self = this;
            var shaderType = "vertex";
            this._vertexProcessedWithoutDefine = this._vertexProcessedWithoutDefine.replace(uniformRegex, _uniformParser);
            shaderType = "fragment";
            this._fragmentProcessedWithoutDefine = this._fragmentProcessedWithoutDefine.replace(uniformRegex, _uniformParser);

            function _uniformParser(str, type, symbol, isArray, semanticWrapper, semantic) {
                if (type && symbol) {
                    var uniformType = uniformTypeMap[type];
                    var isConfigurable = true;
                    if (uniformType) {
                        if (type === "sampler2D" || type === "samplerCube") {
                            // Texture is default disabled
                            self._textureStatus[symbol] = {
                                enabled : false,
                                shaderType : shaderType
                            };
                        }
                        if (isArray) {
                            uniformType += 'v';
                        }
                        if (semantic) {
                            // This case is only for INV_BIND_MATRIX
                            if (attribSemantics.indexOf(semantic) >= 0) {
                                self.attribSemantics[semantic] = {
                                    symbol : symbol,
                                    type : uniformType
                                }
                                isConfigurable = false;
                            }
                            else if (matrixSemantics.indexOf(semantic) >= 0) {
                                var isTranspose = false;
                                var semanticNoTranspose = semantic;
                                if (semantic.match(/TRANSPOSE$/)) {
                                    isTranspose = true;
                                    semanticNoTranspose = semantic.slice(0, -9)
                                }
                                self.matrixSemantics[semantic] = {
                                    symbol : symbol,
                                    type : uniformType,
                                    isTranspose : isTranspose,
                                    semanticNoTranspose : semanticNoTranspose
                                }
                                isConfigurable = false;
                            }
                            else {
                                // The uniform is not configurable, which means it will not appear
                                // in the material uniform properties
                                if (semantic === "unconfigurable") {
                                    isConfigurable = false;
                                }else{
                                    var defaultValueFunc = self._parseDefaultValue(type, semantic);
                                    if (! defaultValueFunc)
                                        console.warn('Unkown semantic "' + semantic + '"');
                                    else
                                        semantic = "";
                                }
                            }
                        }
                        if (isConfigurable) {
                            uniforms[ symbol ] = {
                                type : uniformType,
                                value : isArray ? uniformValueConstructor['array'] : (defaultValueFunc || uniformValueConstructor[ type ]),
                                semantic : semantic || null
                            }
                        }
                    }
                    return ["uniform", type, symbol, isArray].join(" ")+";\n";
                }
            }

            this.uniformTemplates = uniforms;
        },

        _parseDefaultValue : function(type, str) {
            var arrayRegex = /\[\s*(.*)\s*\]/
            if (type === "vec2" ||
                type === "vec3" ||
                type === "vec4") {
                var arrayStr = arrayRegex.exec(str)[1];
                if (arrayStr) {
                    var arr = arrayStr.split(/\s*,\s*/);
                    return function() {
                        return new Float32Array(arr);
                    }
                }else{
                    // Invalid value
                    return;
                }
            }
            else if (type === "bool") {
                return function() {
                    return str.toLowerCase() === "true" ? true : false;
                }
            }
            else if (type === "float") {
                return function() {
                    return parseFloat(str);
                }
            }
        },

        // Create a new uniform instance for material
        createUniforms : function() {
            var uniforms = {};
            
            _.each(this.uniformTemplates, function(uniformTpl, symbol) {
                uniforms[ symbol ] = {
                    type : uniformTpl.type,
                    value : uniformTpl.value()
                }
            })

            return uniforms;
        },

        _parseAttributes : function() {
            var attributes = {};
            var self = this;
            this._vertexProcessedWithoutDefine = this._vertexProcessedWithoutDefine.replace(attributeRegex, _attributeParser);

            function _attributeParser(str, type, symbol, semanticWrapper, semantic) {
                if (type && symbol) {
                    var size = 1;
                    switch (type) {
                        case "vec4":
                            size = 4;
                            break;
                        case "vec3":
                            size = 3;
                            break;
                        case "vec2":
                            size = 2;
                            break;
                        case "float":
                            size = 1;
                            break;
                    }

                    attributes[symbol] = {
                        // Force float
                        type : "float",
                        size : size,
                        semantic : semantic || null
                    }

                    if (semantic) {
                        if (attribSemantics.indexOf(semantic) < 0) {
                            console.warn('Unkown semantic "' + semantic + '"');
                        }else{
                            self.attribSemantics[semantic] = {
                                symbol : symbol,
                                type : type
                            }
                        }
                    }
                }

                return ["attribute", type, symbol].join(" ")+";\n";
            }

            this.attributeTemplates = attributes;
        },

        _buildProgram : function(_gl, vertexShaderString, fragmentShaderString) {

            if (this.cache.get("program")) {
                _gl.deleteProgram(this.cache.get("program"));
            }
            var program = _gl.createProgram();

            try {

                var vertexShader = this._compileShader(_gl, "vertex", vertexShaderString);
                var fragmentShader = this._compileShader(_gl, "fragment", fragmentShaderString);
                _gl.attachShader(program, vertexShader);
                _gl.attachShader(program, fragmentShader);
                // Force the position bind to index 0;
                if (this.attribSemantics['POSITION']) {
                    _gl.bindAttribLocation(program, 0, this.attribSemantics['POSITION'].symbol);
                }
                _gl.linkProgram(program);

                if (!_gl.getProgramParameter(program, _gl.LINK_STATUS)) {
                    throw new Error("Could not initialize shader\n" + "VALIDATE_STATUS: " + _gl.getProgramParameter(program, _gl.VALIDATE_STATUS) + ", gl error [" + _gl.getError() + "]");
                }
            } catch(e) {
                if (errorShader[ this.__GUID__]) {
                    return;
                }
                errorShader[ this.__GUID__ ] = this;
                throw e; 
            }

            _gl.deleteShader(vertexShader);
            _gl.deleteShader(fragmentShader);

            this.cache.put("program", program);
        },

        _compileShader : function(_gl, type, shaderString) {
            var shader = _gl.createShader(type === "fragment" ? _gl.FRAGMENT_SHADER : _gl.VERTEX_SHADER);
            _gl.shaderSource(shader, shaderString);
            _gl.compileShader(shader);

            if (!_gl.getShaderParameter(shader, _gl.COMPILE_STATUS)) {
                throw new Error([_gl.getShaderInfoLog(shader),
                                    addLineNumbers(shaderString) ].join("\n"));
            }
            return shader;
        },

        clone : function() {
            var shader = new Shader({
                vertex : this.vertex,
                fragment : this.fragment,
                vertexDefines : _.clone(this.vertexDefines),
                fragmentDefines : _.clone(this.fragmentDefines)
            });
            for (var name in this._textureStatus) {
                shader._textureStatus[name] = _.clone(this._textureStatus[name]);
            }
            return shader;
        },

        dispose : function(_gl) {
            this.cache.use(_gl.__GUID__);
            if (program) {
                var program = this.cache.get('program');
            }
            _gl.deleteProgram(program);
            this.cache.deleteContext(_gl.__GUID__);
            this._locations = {};
        }
    });
        
    // some util functions
    function addLineNumbers(string) {
        var chunks = string.split("\n");
        for (var i = 0, il = chunks.length; i < il; i ++) {
            // Chrome reports shader errors on lines
            // starting counting from 1
            chunks[ i ] = (i + 1) + ": " + chunks[ i ];
        }
        return chunks.join("\n");
    }

    var importRegex = /(@import)\s*([0-9a-zA-Z_\-\.]*)/g;
    Shader.parseImport = function(shaderStr) {
        shaderStr = shaderStr.replace(importRegex, function(str, importSymbol, importName) {
            if (_source[importName]) {
                // Recursively parse
                return Shader.parseImport(_source[ importName ]);
            }
        })
        return shaderStr;
    }

    var exportRegex = /(@export)\s*([0-9a-zA-Z_\-\.]*)\s*\n([\s\S]*?)@end/g;
    // Import the shader to library and chunks
    Shader.import = function(shaderStr) {
        shaderStr.replace(exportRegex, function(str, exportSymbol, exportName, code) {
            _source[ exportName ] = code;
            return code;
        })
    }

    // Library to store all the loaded shader strings
    var _source = {};

    Shader.source = function(name) {
        var shaderStr = _source[name];
        if (! shaderStr) {
            console.error('Shader "' + name + '" not existed in library');
            return;
        }
        return shaderStr;
    }

    return Shader;
});
define('3d/light/light.essl',[],function () { return '@export buildin.header.directional_light\nuniform vec3 directionalLightDirection[ DIRECTIONAL_LIGHT_NUMBER ] : unconfigurable;\nuniform vec3 directionalLightColor[ DIRECTIONAL_LIGHT_NUMBER ] : unconfigurable;\n@end\n\n@export buildin.header.ambient_light\nuniform vec3 ambientLightColor[ AMBIENT_LIGHT_NUMBER ] : unconfigurable;\n@end\n\n@export buildin.header.point_light\nuniform vec3 pointLightPosition[ POINT_LIGHT_NUMBER ] : unconfigurable;\nuniform float pointLightRange[ POINT_LIGHT_NUMBER ] : unconfigurable;\nuniform vec3 pointLightColor[ POINT_LIGHT_NUMBER ] : unconfigurable;\n@end\n\n@export buildin.header.spot_light\nuniform vec3 spotLightPosition[SPOT_LIGHT_NUMBER] : unconfigurable;\nuniform vec3 spotLightDirection[SPOT_LIGHT_NUMBER] : unconfigurable;\nuniform float spotLightRange[SPOT_LIGHT_NUMBER] : unconfigurable;\nuniform float spotLightUmbraAngleCosine[SPOT_LIGHT_NUMBER] : unconfigurable;\nuniform float spotLightPenumbraAngleCosine[SPOT_LIGHT_NUMBER] : unconfigurable;\nuniform float spotLightFalloffFactor[SPOT_LIGHT_NUMBER] : unconfigurable;\nuniform vec3 spotLightColor[SPOT_LIGHT_NUMBER] : unconfigurable;\n@end';});

define('3d/Light',['require','./Node','./Shader','./light/light.essl'],function(require){

    var Node = require("./Node");
    var Shader = require("./Shader");

    var Light = Node.derive(function(){
        return {
            color : [1, 1, 1],
            intensity : 1.0,
            
            // Config for shadow map
            castShadow : true,
            shadowResolution : 512
        }
    }, {
    });

    Shader.import(require('./light/light.essl'));

    return Light;
});
define('3d/Material',['require','core/Base','./Shader','util/util','./glenum','./Texture','./texture/Texture2D','./texture/TextureCube','_'],function(require) {

    var Base = require("core/Base");
    var Shader = require("./Shader");
    var util = require("util/util");
    var glenum = require("./glenum");
    var Texture = require('./Texture');
    var Texture2D = require('./texture/Texture2D');
    var TextureCube = require('./texture/TextureCube');
    var _ = require("_");

    _repository = [];

    var Material = Base.derive(function() {

        var id = util.genGUID();

        return {
            __GUID__ : id,

            name : 'MATERIAL_' + id,

            //{
            // type
            // value
            // semantic
            //}
            uniforms : {},

            shader : null,

            depthTest : true,
            depthMask : true,

            transparent : false,
            // Blend func is a callback function when the material 
            // have custom blending
            // The gl context will be the only argument passed in tho the
            // blend function
            // Detail of blend function in WebGL:
            // http://www.khronos.org/registry/gles/specs/2.0/es_full_spec_2.0.25.pdf
            //
            // Example :
            // function(_gl) {
            //  _gl.blendEquation(_gl.FUNC_ADD);
            //  _gl.blendFunc(_gl.SRC_ALPHA, _gl.ONE_MINUS_SRC_ALPHA);
            // }
            blend : null,

            // Binding lights in the renderer automatically
            // autoBindingLights : true
        }
    }, function() {
        if (this.shader) {
            this.attachShader(this.shader);
        }

        // Registory to repository
        _repository.push(this);

    }, {

        bind : function(_gl) {

            var slot = 0;

            // Set uniforms
            for (var symbol in this.uniforms) {
                var uniform = this.uniforms[symbol];
                if (uniform.value === null) {
                    continue;
                }
                else if (uniform.value instanceof Array
                    && ! uniform.value.length) {
                    continue;
                }
                if (uniform.value instanceof Texture) {
                
                    var texture = uniform.value;
                    // Maybe texture is not loaded yet;
                    if (! texture.isRenderable()) {
                        continue;
                    }

                    _gl.activeTexture(_gl.TEXTURE0 + slot);
                    texture.bind(_gl);

                    this.shader.setUniform(_gl, '1i', symbol, slot);

                    slot++;
                }
                else if (uniform.value instanceof Array) {
                    // Texture Array
                    var exampleValue = uniform.value[0];

                    if (exampleValue instanceof Texture) {

                        var res = [];
                        for (var i = 0; i < uniform.value.length; i++) {
                            var texture = uniform.value[i];
                            // Maybe texture is not loaded yet;
                            if (! texture.isRenderable()) {
                                continue;
                            }

                            _gl.activeTexture(_gl.TEXTURE0 + slot);
                            texture.bind(_gl);
                            res.push(slot++);
                        }
                        this.shader.setUniform(_gl, '1iv', symbol, res);
                    } else {
                        this.shader.setUniform(_gl, uniform.type, symbol, uniform.value);
                    }
                }
                else{
                    this.shader.setUniform(_gl, uniform.type, symbol, uniform.value);
                }
            }
        },

        set : function(symbol, value) {
            if (typeof(symbol) === 'object') {
                for (var key in symbol) {
                    var val = symbol[key];
                    this.set(key, val);
                }
            } else {
                var uniform = this.uniforms[symbol];
                if (uniform) {
                    uniform.value = value;
                } else {
                    // console.warn('Uniform "'+symbol+'" not exist');
                }
            }
        },

        get : function(symbol) {
            var uniform = this.uniforms[symbol];
            if (uniform) {
                return uniform.value;
            } else {
                // console.warn('Uniform '+symbol+' not exist');
            }
        },

        attachShader : function(shader) {
            this.uniforms = shader.createUniforms();
            this.shader = shader;
        },

        detachShader : function() {
            this.shader = null;
            this.uniforms = {};
        },

        dispose : function() {
            _repository.splice(_repository.indexOf(this), 1);
        }
    });

    Material.getMaterial = function(name) {
        for (var i = 0; i < _repository.length; i++) {
            if (_repository[i].name === name) {
                return _repository[i];
            }
        }
    }

    return Material;
});
define('3d/Mesh',['require','./Node','./glenum','core/Vector3','_'],function(require) {

    

    var Node = require("./Node");
    var glenum = require("./glenum");
    var Vector3 = require("core/Vector3");
    var _ = require("_");

    // Cache
    var prevDrawID = 0;
    var prevDrawIndicesBuffer = null;
    var prevDrawIsUseFace = true;

    var Mesh = Node.derive(function() {
        return {
            
            material : null,

            geometry : null,

            mode : glenum.TRIANGLES,
            // Only if mode is LINES
            lineWidth : 1,

            // Culling
            culling : true,
            cullFace : glenum.BACK,
            frontFace : glenum.CCW,
            
            receiveShadow : true,
            castShadow : true,

            // Skinned Mesh
            skeleton : null,
            // Joints indices
            // Meshes can share the one skeleton instance
            // and each mesh can use one part of joints
            // Joints indeces indicate the index of joint in the skeleton instance
            joints : []
        }
    }, {

        render : function(_gl, globalMaterial, silence) {
            var material = globalMaterial || this.material;
            var shader = material.shader;
            var geometry = this.geometry;

            var glDrawMode = this.mode;
            
            // Set pose matrices of skinned mesh
            if (this.skeleton) {
                var invMatricesArray = this.skeleton.getSubInvBindMatrices(this.__GUID__, this.joints);
                shader.setUniformBySemantic(_gl, "INV_BIND_MATRIX", invMatricesArray);
            }

            var vertexNumber = geometry.getVerticesNumber();
            var faceNumber = 0;
            var drawCallNumber = 0;
            // Draw each chunk
            var needsBindAttributes = false;
            if (vertexNumber > geometry.chunkSize) {
                needsBindAttributes = true;
            } else {
                var currentDrawID = _gl.__GUID__ + "_" + geometry.__GUID__;
                if (currentDrawID !== prevDrawID) {
                    needsBindAttributes = true;
                    prevDrawID = currentDrawID;
                }
            }
            if (!needsBindAttributes) {
                // Direct draw
                if (prevDrawIsUseFace) {
                    _gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, prevDrawIndicesBuffer.buffer);
                    _gl.drawElements(glDrawMode, prevDrawIndicesBuffer.count, _gl.UNSIGNED_SHORT, 0);
                    faceNumber = prevDrawIndicesBuffer.count;
                }
                else {
                    _gl.drawArrays(glDrawMode, 0, vertexNumber);
                }
                drawCallNumber = 1;
            } else {
                var chunks = geometry.getBufferChunks(_gl);
                for (var c = 0; c < chunks.length; c++) {

                    var chunk = chunks[c];
                    var attributeBuffers = chunk.attributeBuffers;
                    var indicesBuffer = chunk.indicesBuffer;

                    var availableAttributes = {};
                    for (var name in attributeBuffers) {
                        var attributeBufferInfo = attributeBuffers[name];
                        var semantic = attributeBufferInfo.semantic;

                        if (semantic) {
                            var semanticInfo = shader.attribSemantics[semantic];
                            var symbol = semanticInfo && semanticInfo.symbol;
                        } else {
                            var symbol = name;
                        }
                        if (symbol && shader.attributeTemplates[symbol]) {
                            availableAttributes[symbol] = attributeBufferInfo;
                        }
                    }
                    shader.enableAttributes(_gl, Object.keys(availableAttributes));
                    // Setting attributes;
                    for (var symbol in availableAttributes) {
                        var attributeBufferInfo = availableAttributes[symbol];
                        var buffer = attributeBufferInfo.buffer;

                        _gl.bindBuffer(_gl.ARRAY_BUFFER, buffer);
                        shader.setMeshAttribute(_gl, symbol, attributeBufferInfo.type, attributeBufferInfo.size);
                    }
                }
                if (glDrawMode === glenum.LINES) {
                    _gl.lineWidth(this.lineWidth);
                }
                prevDrawIsUseFace = geometry.isUseFace();
                prevDrawIndicesBuffer = indicesBuffer;
                //Do drawing
                if (prevDrawIsUseFace) {
                    _gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, indicesBuffer.buffer);
                    _gl.drawElements(glDrawMode, indicesBuffer.count, _gl.UNSIGNED_SHORT, 0);
                    faceNumber += indicesBuffer.count;
                } else {
                    _gl.drawArrays(glDrawMode, 0, vertexNumber);
                }
                drawCallNumber++;
            }

            var drawInfo = {
                faceNumber : faceNumber,
                vertexNumber : vertexNumber,
                drawCallNumber : drawCallNumber
            };
            return drawInfo;
        }
    });

    // Called when material is changed
    // In case the material changed and geometry not changed
    // And the previous material has less attributes than next material
    Mesh.materialChanged = function() {
        prevDrawID = 0;
    }

    // Enums
    Mesh.POINTS = glenum.POINTS;
    Mesh.LINES = glenum.LINES;
    Mesh.LINE_LOOP = glenum.LINE_LOOP;
    Mesh.LINE_STRIP = glenum.LINE_STRIP;
    Mesh.TRIANGLES = glenum.TRIANGLES;
    Mesh.TRIANGLE_STRIP = glenum.TRIANGLE_STRIP;
    Mesh.TRIANGLE_FAN = glenum.TRIANGLE_FAN;

    Mesh.BACK = glenum.BACK;
    Mesh.FRONT = glenum.FRONT;
    Mesh.FRONT_AND_BACK = glenum.FRONT_AND_BACK;
    Mesh.CW = glenum.CW;
    Mesh.CCW = glenum.CCW;

    return Mesh;
});
define('3d/Renderer',['require','core/Base','util/util','./Light','./Mesh','./Texture','./WebGLInfo','_','glmatrix','./glenum'],function(require) {

    var Base = require("core/Base");
    var util = require("util/util");
    var Light = require("./Light");
    var Mesh = require("./Mesh");
    var Texture = require("./Texture");
    var WebGLInfo = require('./WebGLInfo');
    var _ = require("_");
    var glMatrix = require("glmatrix");
    var glenum = require('./glenum');
    var mat4 = glMatrix.mat4;
    var vec3 = glMatrix.vec3;

    var Renderer = Base.derive(function() {
        return {

            __GUID__ : util.genGUID(),

            canvas : null,
            // Device Pixel Ratio is for high defination disply
            // like retina display
            // http://www.khronos.org/webgl/wiki/HandlingHighDPI
            devicePixelRatio : window.devicePixelRatio || 1.0,

            color : [0.0, 0.0, 0.0, 0.0],
            
            // _gl.COLOR_BUFFER_BIT | _gl.DEPTH_BUFFER_BIT | _gl.STENCIL_BUFFER_BIT
            clear : 17664,  

            // Settings when getting context
            // http://www.khronos.org/registry/webgl/specs/latest/#2.4
            alhpa : true,
            depth : true,
            stencil : false,
            antialias : true,
            premultipliedAlpha : true,
            preserveDrawingBuffer : false,

            gl : null,

            viewportInfo : {},

            _scene : null,
            _transparentQueue : [],
            _opaqueQueue : [],
            _lights : []
        }
    }, function() {
        if (! this.canvas) {
            this.canvas = document.createElement("canvas");
        }
        try {
            this.gl = this.canvas.getContext('experimental-webgl', {
                alhpa : this.alhpa,
                depth : this.depth,
                stencil : this.stencil,
                antialias : this.antialias,
                premultipliedAlpha : this.premultipliedAlpha,
                preserveDrawingBuffer : this.preserveDrawingBuffer,
            });
            this.gl.__GUID__ = this.__GUID__;

            this.resize(this.canvas.width, this.canvas.height);

            WebGLInfo.initialize(this.gl);
        }
        catch(e) {
            throw "Error creating WebGL Context";
        }
    }, {

        resize : function(width, height) {
            var canvas = this.canvas;
            // http://www.khronos.org/webgl/wiki/HandlingHighDPI
            // set the display size of the canvas.
            if (this.devicePixelRatio !== 1.0) {
                canvas.style.width = width + "px";
                canvas.style.height = height + "px";
            }
             
            // set the size of the drawingBuffer
            canvas.width = width * this.devicePixelRatio;
            canvas.height = height * this.devicePixelRatio;

            this.setViewport(0, 0, canvas.width, canvas.height);
        },

        setViewport : function(x, y, width, height) {

            if (typeof(x) === "object") {
                var obj = x;
                x = obj.x;
                y = obj.y;
                width = obj.width;
                height = obj.height;
            }
            this.gl.viewport(x, y, width, height);

            this.viewportInfo = {
                x : x,
                y : y,
                width : width,
                height : height
            }
        },

        // Traverse the scene and add the renderable
        // object to the render queue;
        _updateRenderQueue : function(parent, sceneMaterialTransparent) {
            for (var i = 0; i < parent._children.length; i++) {
                var child = parent._children[i];
                if (!child.visible) {
                    continue;
                }
                if (child instanceof Light) {
                    this._lights.push(child);
                }
                // A node have render method and material property
                // is treat as a renderable object
                if (child.render && child.geometry && child.material && child.material.shader ) {
                    if (child.material.transparent || sceneMaterialTransparent) {
                        this._transparentQueue.push(child);
                    } else {
                        this._opaqueQueue.push(child);
                    }
                }
                if (child._children.length > 0) {
                    this._updateRenderQueue(child);
                }
            }
        },

        render : function(scene, camera, silent) {
            var _gl = this.gl;
            
            var renderStart = performance.now();
            if (!silent) {
                // Render plugin like shadow mapping must set the silent true
                this.trigger("beforerender", this, scene, camera);
            }
            
            this._scene = scene;

            var color = this.color;
            _gl.clearColor(color[0], color[1], color[2], color[3]);
            _gl.clear(this.clear);

            camera.update(false);
            scene.update(false);

            var opaqueQueue = this._opaqueQueue;
            var transparentQueue = this._transparentQueue;
            var lights = this._lights;
            var sceneMaterial = scene.material;
            var sceneMaterialTransparent = sceneMaterial && sceneMaterial.transparent;
            transparentQueue.length = 0;
            opaqueQueue.length = 0;
            lights.length = 0;

            this._updateRenderQueue(scene, sceneMaterialTransparent);

            var lightNumber = {};
            for (var i = 0; i < lights.length; i++) {
                var light = lights[i];
                if (! lightNumber[light.type]) {
                    lightNumber[light.type] = 0;
                }
                lightNumber[light.type]++;
            }
            scene.lightNumber = lightNumber;
            this.updateLightUnforms(lights);

            // Sort material to reduce the cost of setting uniform in material
            opaqueQueue.sort(this._materialSortFunc);
            // Render Opaque queue
            if (! silent) {
                this.trigger("beforerender:opaque", this, opaqueQueue);
            }

            _gl.disable(_gl.BLEND);
            this.renderQueue(opaqueQueue, camera, sceneMaterial, silent);

            if (! silent) {
                this.trigger("afterrender:opaque", this, opaqueQueue);
                this.trigger("beforerender:transparent", this, transparentQueue);
            }

            // Render Transparent Queue
            _gl.enable(_gl.BLEND);

            // Calculate the object depth
            if (transparentQueue.length > 0) {
                var modelViewMat = mat4.create();
                var posViewSpace = vec3.create();
                mat4.invert(matrices['VIEW'],  camera.worldTransform._array);
                for (var i = 0; i < transparentQueue.length; i++) {
                    var node = transparentQueue[i];
                    mat4.multiply(modelViewMat, matrices['VIEW'], node.worldTransform._array);
                    vec3.transformMat4(posViewSpace, node.position._array, modelViewMat);
                    node._depth = posViewSpace[2];
                }
            }
            transparentQueue = transparentQueue.sort(this._depthSortFunc);
            this.renderQueue(transparentQueue, camera, sceneMaterial, silent);

            if (! silent) {
                this.trigger("afterrender:transparent", this, transparentQueue);
                this.trigger("afterrender", this, scene, camera);
            }
        },

        updateLightUnforms : function(lights) {
            
            var lightUniforms = this._scene.lightUniforms;
            for (var symbol in lightUniforms) {
                lightUniforms[symbol].value.length = 0;
            }
            for (var i = 0; i < lights.length; i++) {
                
                var light = lights[i];
                
                for (symbol in light.uniformTemplates) {

                    var uniformTpl = light.uniformTemplates[symbol];
                    if (! lightUniforms[symbol]) {
                        lightUniforms[symbol] = {
                            type : "",
                            value : []
                        }
                    }
                    var value = uniformTpl.value(light);
                    var lu = lightUniforms[symbol];
                    lu.type = uniformTpl.type + "v";
                    switch (uniformTpl.type) {
                        case "1i":
                        case "1f":
                            lu.value.push(value);
                            break;
                        case "2f":
                        case "3f":
                        case "4f":
                            for (var j =0; j < value.length; j++) {
                                lu.value.push(value[j]);
                            }
                            break;
                        default:
                            console.error("Unkown light uniform type "+uniformTpl.type);
                    }
                }
            }
        },

        renderQueue : function(queue, camera, globalMaterial, silent) {
            // Calculate view and projection matrix
            mat4.invert(matrices['VIEW'],  camera.worldTransform._array);
            mat4.copy(matrices['PROJECTION'], camera.projectionMatrix._array);
            mat4.multiply(matrices['VIEWPROJECTION'], camera.projectionMatrix._array, matrices['VIEW']);
            mat4.copy(matrices['VIEWINVERSE'], camera.worldTransform._array);
            mat4.invert(matrices['PROJECTIONINVERSE'], matrices['PROJECTION']);
            mat4.invert(matrices['VIEWPROJECTIONINVERSE'], matrices['VIEWPROJECTION']);

            var _gl = this.gl;
            var scene = this._scene;
            
            var prevMaterialID;
            var prevShaderID;
            
            // Status 
            var depthTest, depthMask;
            var culling, cullFace, frontFace;

            for (var i =0; i < queue.length; i++) {
                var mesh = queue[i];
                var material = globalMaterial || mesh.material;
                var shader = material.shader;
                var geometry = mesh.geometry;

                if (prevShaderID !== shader.__GUID__) {
                    // Set lights number
                    var lightNumberChanged = false;
                    if (! _.isEqual(shader.lightNumber, scene.lightNumber)) {
                        lightNumberChanged = true;
                    }
                    if (lightNumberChanged) {
                        for (var type in scene.lightNumber) {
                            var number = scene.lightNumber[type];
                            shader.lightNumber[type] = number;
                        }
                        shader.dirty();
                    }

                    shader.bind(_gl);

                    // Set lights uniforms
                    for (var symbol in scene.lightUniforms) {
                        var lu = scene.lightUniforms[symbol];
                        shader.setUniform(_gl, lu.type, symbol, lu.value);
                    }
                    prevShaderID = shader.__GUID__;
                }
                if (prevMaterialID !== material.__GUID__) {
                    if (material.depthTest !== depthTest) {
                        material.depthTest ? 
                            _gl.enable(_gl.DEPTH_TEST) : 
                            _gl.disable(_gl.DEPTH_TEST);
                        depthTest = material.depthTest;
                    }
                    if (material.depthMask !== depthMask) {
                        _gl.depthMask(material.depthMask);
                        depthMask = material.depthMask;
                    }
                    material.bind(_gl);
                    prevMaterialID = material.__GUID__;

                    if (material.transparent) {
                        if (material.blend) {
                            material.blend(_gl);
                        } else {    // Default blend function
                            _gl.blendEquationSeparate(_gl.FUNC_ADD, _gl.FUNC_ADD);
                            _gl.blendFuncSeparate(_gl.SRC_ALPHA, _gl.ONE_MINUS_SRC_ALPHA, _gl.ONE, _gl.ONE_MINUS_SRC_ALPHA);
                        } 
                    }

                    Mesh.materialChanged();
                }

                var worldM = mesh.worldTransform._array;

                // All matrices ralated to world matrix will be updated on demand;
                mat4.copy(matrices['WORLD'], worldM);
                mat4.multiply(matrices['WORLDVIEW'], matrices['VIEW'] , worldM);
                mat4.multiply(matrices['WORLDVIEWPROJECTION'], matrices['VIEWPROJECTION'] , worldM);
                if (shader.matrixSemantics['WORLDINVERSE'] ||
                    shader.matrixSemantics['WORLDINVERSETRANSPOSE']) {
                    mat4.invert(matrices['WORLDINVERSE'], worldM);
                }
                if (shader.matrixSemantics['WORLDVIEWINVERSE'] ||
                    shader.matrixSemantics['WORLDVIEWINVERSETRANSPOSE']) {
                    mat4.invert(matrices['WORLDVIEWINVERSE'], matrices['WORLDVIEW']);
                }
                if (shader.matrixSemantics['WORLDVIEWPROJECTIONINVERSE'] ||
                    shader.matrixSemantics['WORLDVIEWPROJECTIONINVERSETRANSPOSE']) {
                    mat4.invert(matrices['WORLDVIEWPROJECTIONINVERSE'], matrices['WORLDVIEWPROJECTION']);
                }

                for (var semantic in shader.matrixSemantics) {
                    var semanticInfo = shader.matrixSemantics[semantic];
                    var matrix = matrices[semantic];
                    if (semanticInfo.isTranspose) {
                        var matrixNoTranspose = matrices[semanticInfo.semanticNoTranspose];
                        mat4.transpose(matrix, matrixNoTranspose);
                    }
                    shader.setUniform(_gl, semanticInfo.type, semanticInfo.symbol, matrix);
                }

                if (mesh.cullFace !== cullFace) {
                    cullFace = mesh.cullFace;
                    _gl.cullFace(cullFace);
                }
                if (mesh.frontFace !== frontFace) {
                    frontFace = mesh.frontFace;
                    _gl.frontFace(frontFace);
                }
                if (mesh.culling !== culling) {
                    culling = mesh.culling;
                    culling ? _gl.enable(_gl.CULL_FACE) : _gl.disable(_gl.CULL_FACE)
                }
                var drawInfo = mesh.render(_gl, globalMaterial);
            }
        },

        disposeScene : function(scene) {
            this.disposeNode(scene);
            scene.lightNumber = {};
            scene.lightUniforms = {};
            scene.material = {};
            scene._nodeRepository = {};
        },

        disposeNode : function(root) {
            var materials = {};
            var _gl = this.gl;
            root.traverse(function(node) {
                if (node.geometry) {
                    node.geometry.dispose(_gl);
                }
                if (node.material) {
                    materials[node.material.__GUID__] = node.material;
                }
            });
            for (var guid in materials) {
                var mat = materials[guid];
                mat.shader.dispose(_gl);
                for (var name in mat.uniforms) {
                    var val = mat.uniforms[name].value;
                    if (!val ) {
                        continue;
                    }
                    if (val instanceof Texture) {
                        val.dispose(_gl);
                    }
                    else if (val instanceof Array) {
                        for (var i = 0; i < val.length; i++) {
                            if (val[i] instanceof Texture) {
                                val[i].dispose(_gl);
                            }
                        }
                    }
                }
                mat.dispose();
            }
            root._children = [];
        },

        _materialSortFunc : function(x, y) {
            if (x.material.shader === y.material.shader) {
                return x.material.__GUID__ - y.material.__GUID__;
            }
            return x.material.shader.__GUID__ - y.material.shader.__GUID__;
        },
        _depthSortFunc : function(x, y) {
            if (x._depth === y._depth) {
                if (x.material.shader === y.material.shader) {
                    return x.material.__GUID__ - y.material.__GUID__;
                }
                return x.material.shader.__GUID__ - y.material.shader.__GUID__;
            }
            // Depth is negative because of right hand coord
            // So farther object has smaller depth value
            return x._depth - y._depth
        }
    })


    var matrices = {
        'WORLD' : mat4.create(),
        'VIEW' : mat4.create(),
        'PROJECTION' : mat4.create(),
        'WORLDVIEW' : mat4.create(),
        'VIEWPROJECTION' : mat4.create(),
        'WORLDVIEWPROJECTION' : mat4.create(),

        'WORLDINVERSE' : mat4.create(),
        'VIEWINVERSE' : mat4.create(),
        'PROJECTIONINVERSE' : mat4.create(),
        'WORLDVIEWINVERSE' : mat4.create(),
        'VIEWPROJECTIONINVERSE' : mat4.create(),
        'WORLDVIEWPROJECTIONINVERSE' : mat4.create(),

        'WORLDTRANSPOSE' : mat4.create(),
        'VIEWTRANSPOSE' : mat4.create(),
        'PROJECTIONTRANSPOSE' : mat4.create(),
        'WORLDVIEWTRANSPOSE' : mat4.create(),
        'VIEWPROJECTIONTRANSPOSE' : mat4.create(),
        'WORLDVIEWPROJECTIONTRANSPOSE' : mat4.create(),
        'WORLDINVERSETRANSPOSE' : mat4.create(),
        'VIEWINVERSETRANSPOSE' : mat4.create(),
        'PROJECTIONINVERSETRANSPOSE' : mat4.create(),
        'WORLDVIEWINVERSETRANSPOSE' : mat4.create(),
        'VIEWPROJECTIONINVERSETRANSPOSE' : mat4.create(),
        'WORLDVIEWPROJECTIONINVERSETRANSPOSE' : mat4.create()
    };

    Renderer.COLOR_BUFFER_BIT = glenum.COLOR_BUFFER_BIT
    Renderer.DEPTH_BUFFER_BIT = glenum.DEPTH_BUFFER_BIT
    Renderer.STENCIL_BUFFER_BIT = glenum.STENCIL_BUFFER_BIT

    return Renderer;
});
define('3d/Scene',['require','./Node'],function(require){

    var Node = require('./Node');

    var Scene = Node.derive(function(){
        return {

            scene : null,

            // Global material of scene
            material : null,

            // Properties to save the light information in the scene
            // Will be set in the render function
            lightNumber : {},
            lightUniforms : {},

            _nodeRepository : {}

        }
    }, function() {
        this.scene = this;
    }, {

        addToScene : function(node) {
            if (node.name) {
                this._nodeRepository[node.name] = node;
            }
        },

        removeFromScene : function(node) {
            if (node.name) {
                this._nodeRepository[node.name] = null;
            }
        },

        getNode : function(name) {
            return this._nodeRepository[name];
        }
    });

    return Scene;
});
define('3d/Skeleton',['require','core/Base','core/Matrix4'],function(require) {

    var Base = require("core/Base");
    var Matrix4 = require("core/Matrix4");

    var Skeleton = Base.derive(function() {
        return {
            // Root joints
            roots : [],
            joints : [],
            // Poses stored in arrays

            // Matrix to joint space(inverse of indentity bone world matrix)
            _jointMatrices : [],

            // jointMatrix * currentPoseMatrix
            // worldTransform is relative to the root bone
            // still in model space not world space
            _invBindMatrices : [],

            _invBindMatricesArray : null,
            _subInvBindMatricesArray : {}
        }
    }, {

        updateHierarchy : function() {
            this.roots = [];
            var joints = this.joints;
            for (var i = 0; i < joints.length; i++) {
                var bone = joints[i];
                if (bone.parentIndex >= 0) {
                    var parent = joints[bone.parentIndex];
                    parent.add(bone);
                }else{
                    this.roots.push(bone);
                }
            }
        },

        updateJointMatrices : function() {
            for (var i = 0; i < this.roots.length; i++) {
                this.roots[i].update();
            }
            for (var i = 0; i < this.joints.length; i++) {
                var bone = this.joints[i];
                this._jointMatrices[i] = (new Matrix4()).copy(bone.worldTransform).invert();
                this._invBindMatrices[i] = new Matrix4();
            }
        },

        update : function() {
            for (var i = 0; i < this.roots.length; i++) {
                this.roots[i].update();
            }
            if (! this._invBindMatricesArray) {
                this._invBindMatricesArray = new Float32Array(this.joints.length * 16);
            }
            var cursor = 0;
            for (var i = 0; i < this.joints.length; i++) {
                var matrixCurrentPose = this.joints[i].worldTransform;
                this._invBindMatrices[i].copy(matrixCurrentPose).multiply(this._jointMatrices[i]);

                for (var j = 0; j < 16; j++) {
                    var array = this._invBindMatrices[i]._array;
                    this._invBindMatricesArray[cursor++] = array[j];
                }
            }
        },

        getSubInvBindMatrices : function(meshId, joints) {
            var subArray = this._subInvBindMatricesArray[meshId]
            if (!subArray) {
                subArray 
                    = this._subInvBindMatricesArray[meshId]
                    = new Float32Array(joints.length * 16);
            }
            var cursor = 0;
            for (var i = 0; i < joints.length; i++) {
                var idx = joints[i];
                for (var j = 0; j < 16; j++) {
                    subArray[cursor++] = this._invBindMatricesArray[idx * 16 + j];
                }
            }
            return subArray;
        },

        setPose : function(time) {
            for (var i = 0; i < this.joints.length; i++) {
                this.joints[i].setPose(time);
            }
            this.update();
        },

        getClipTime : function() {
            var poses = this.joints[0].poses;
            if (poses.length) {
                return poses[poses.length-1].time;
            }
        },
        
        getBoneNumber : function() {
            return this.joints.length;
        }
    });

    return Skeleton;
});
define('3d/camera/Orthographic',['require','../Camera'],function(require) {

    var Camera = require('../Camera');

    var Orthographic = Camera.derive(function() {
        return {
            left : -1,
            right : 1,
            near : 0,
            far : 1,
            top : 1,
            bottom : -1,
        }
    }, {
        
        updateProjectionMatrix : function() {
            this.projectionMatrix.ortho(this.left, this.right, this.bottom, this.top, this.near, this.far);
        }
    });

    return Orthographic;
} );
define('3d/camera/Perspective',['require','../Camera'],function(require) {

    var Camera = require('../Camera');

    var Perspective = Camera.derive(function() {
        return {

            fov : 50,
            
            aspect : 1,
            
            near : 0.1,
            
            far : 2000
        }
    }, {
        
        updateProjectionMatrix : function() {
            var rad = this.fov / 180 * Math.PI;
            this.projectionMatrix.perspective(rad, this.aspect, this.near, this.far);
        }
    });

    return Perspective;
} );
define('3d/compositor/Graph',['require','core/Base','_'], function( require ) {

    var Base = require("core/Base");
    var _ = require("_");

    var Graph = Base.derive( function() {
        return {
            nodes : []
        }
    }, {
        
        add : function(node) {

            this.nodes.push(node);

            this._dirty = true;
        },

        remove : function(node) {
            _.without(this.nodes, node);

            this._dirty = true;
        },

        findNode : function(name) {
            for (var i = 0; i < this.nodes.length; i++) {
                if (this.nodes[i].name === name) {
                    return this.nodes[i];
                }
            }
        },

        update : function() {
            for (var i = 0; i < this.nodes.length; i++) {
                this.nodes[i].clear();
            }
            // Traverse all the nodes and build the graph
            for (var i = 0; i < this.nodes.length; i++) {
                var node = this.nodes[i];

                if (!node.inputs) {
                    continue;
                }
                for (var inputName in node.inputs) {
                    var fromPinInfo = node.inputs[inputName];

                    var fromPin = this.findPin(fromPinInfo);
                    if (fromPin) {
                        node.link(inputName, fromPin.node, fromPin.pin);
                    }else{
                        console.warn("Pin of "+fromPinInfo.node+"."+fromPinInfo.pin+" not exist");
                    }
                }
            }

        },

        findPin : function(info) {
            var node;
            if (typeof(info.node) === 'string') {
                for (var i = 0; i < this.nodes.length; i++) {
                    var tmp = this.nodes[i];
                    if (tmp.name === info.node) {
                        node = tmp;
                    }
                }
            }else{
                node = info.node;
            }
            if (node) {
                if (node.outputs[info.pin]) {
                    return {
                        node : node,
                        pin : info.pin
                    }
                }
            }
        },

        fromJSON : function( json ) {

        }
    })
    
    return Graph;
});
define('3d/compositor/Compositor',['require','./Graph'],function(require){

    

    var Graph = require("./Graph");

    var Compositor = Graph.derive(function() {
        return {
            // Output node
            _outputs : []
        }
    }, {
        render : function(renderer) {
            if (this._dirty) {
                this.update();
                this._dirty = false;
            }
            for (var i = 0; i < this.nodes.length; i++) {
                var node = this.nodes[i];
                // Find output node
                if ( ! this._outputs.length) {
                    if( ! node.outputs){
                        node.render(renderer);
                    }
                }
                // Update the reference number of each output texture
                node.updateReference();
            }

            for (var i = 0; i < this._outputs.length; i++) {
                this._outputs[i].render(renderer);
            }
        },

        addOutput : function(node) {
            this._outputs.push(node);
        },

        removeOutput : function(node) {
            this._outputs.splice(this._outputs.indexOf(node), 1);
        }
    })

    return Compositor;
});
/*
 * From lightgl
 * https://github.com/evanw/lightgl.js/blob/master/src/mesh.js
 */
define('3d/geometry/Plane',['require','../Geometry'],function(require) {

	var Geometry = require('../Geometry');

	var Plane = Geometry.derive(function() {

		return {
			widthSegments : 1,
			heightSegments : 1
		}
	}, function() {

		var heightSegments = this.heightSegments,
			widthSegments = this.widthSegments,
			positions = this.attributes.position.value,
			texcoords = this.attributes.texcoord0.value,
			normals = this.attributes.normal.value,
			faces = this.faces;			

		for (var y = 0; y <= heightSegments; y++) {
			var t = y / heightSegments;
			for (var x = 0; x <= widthSegments; x++) {
				var s = x / widthSegments;

				positions.push([2 * s - 1, 2 * t - 1, 0]);
				if (texcoords) {
					texcoords.push([s, t]);
				}
				if (normals) {
					normals.push([0, 0, 1]);
				}
				if (x < widthSegments && y < heightSegments) {
					var i = x + y * (widthSegments + 1);
					faces.push([i, i + 1, i + widthSegments + 1]);
					faces.push([i + widthSegments + 1, i + 1, i + widthSegments + 2]);
				}
			}
		}

	})

	return Plane;
});
define('3d/compositor/shaders/vertex.essl',[],function () { return 'uniform mat4 worldViewProjection : WORLDVIEWPROJECTION;\n\nattribute vec3 position : POSITION;\nattribute vec2 texcoord : TEXCOORD_0;\n\nvarying vec2 v_Texcoord;\n\nvoid main(){\n\n    v_Texcoord = texcoord;\n    gl_Position = worldViewProjection * vec4(position, 1.0);\n}';});

define('3d/compositor/shaders/coloradjust.essl',[],function () { return '@export buildin.compositor.coloradjust\n\nvarying vec2 v_Texcoord;\nuniform sampler2D texture;\n\nuniform float brightness : 0.0;\nuniform float contrast : 1.0;\nuniform float exposure : 0.0;\nuniform float gamma : 1.0;\nuniform float saturation : 1.0;\n\n// Values from "Graphics Shaders: Theory and Practice" by Bailey and Cunningham\nconst vec3 w = vec3(0.2125, 0.7154, 0.0721);\n\nvoid main()\n{\n    vec4 tex = texture2D( texture, v_Texcoord);\n\n    // brightness\n    vec3 color = clamp(tex.rgb + vec3(brightness), 0.0, 1.0);\n    // contrast\n    color = clamp( (color-vec3(0.5))*contrast+vec3(0.5), 0.0, 1.0);\n    // exposure\n    color = clamp( color * pow(2.0, exposure), 0.0, 1.0);\n    // gamma\n    color = clamp( pow(color, vec3(gamma)), 0.0, 1.0);\n    // saturation\n    float luminance = dot( color, w );\n    color = mix(vec3(luminance), color, saturation);\n    \n    gl_FragColor = vec4(color, tex.a);\n}\n\n@end\n\n// Seperate shader for float texture\n@export buildin.compositor.brightness\nvarying vec2 v_Texcoord;\nuniform sampler2D texture;\n\nuniform float brightness : 0.0;\n\nvoid main() {\n    vec4 tex = texture2D( texture, v_Texcoord);\n    vec3 color = tex.rgb + vec3(brightness);\n    gl_FragColor = vec4(color, tex.a);\n}\n@end\n\n@export buildin.compositor.contrast\nvarying vec2 v_Texcoord;\nuniform sampler2D texture;\n\nuniform float contrast : 1.0;\n\nvoid main() {\n    vec4 tex = texture2D( texture, v_Texcoord);\n    vec3 color = (tex.rgb-vec3(0.5))*contrast+vec3(0.5);\n    gl_FragColor = vec4(color, tex.a);\n}\n@end\n\n@export buildin.compositor.exposure\nvarying vec2 v_Texcoord;\nuniform sampler2D texture;\n\nuniform float exposure : 0.0;\n\nvoid main() {\n    vec4 tex = texture2D(texture, v_Texcoord);\n    vec3 color = tex.rgb * pow(2.0, exposure);\n    gl_FragColor = vec4(color, tex.a);\n}\n@end\n\n@export buildin.compositor.gamma\nvarying vec2 v_Texcoord;\nuniform sampler2D texture;\n\nuniform float gamma : 1.0;\n\nvoid main() {\n    vec4 tex = texture2D(texture, v_Texcoord);\n    vec3 color = pow(tex.rgb, vec3(gamma));\n    gl_FragColor = vec4(color, tex.a);\n}\n@end\n\n@export buildin.compositor.saturation\nvarying vec2 v_Texcoord;\nuniform sampler2D texture;\n\nuniform float saturation : 1.0;\n\nconst vec3 w = vec3(0.2125, 0.7154, 0.0721);\n\nvoid main() {\n    vec4 tex = texture2D(texture, v_Texcoord);\n    vec3 color = tex.rgb;\n    float luminance = dot(color, w);\n    color = mix(vec3(luminance), color, saturation);\n    gl_FragColor = vec4(color, tex.a);\n}\n@end';});

define('3d/compositor/shaders/blur.essl',[],function () { return '@export buildin.compositor.gaussian_blur_v\n\nuniform sampler2D texture; // the texture with the scene you want to blur\nvarying vec2 v_Texcoord;\n \nuniform float blurSize : 3.0; \nuniform float imageWidth : 512.0;\n\nvoid main(void)\n{\n   vec4 sum = vec4(0.0);\n \n   // blur in y (vertical)\n   // take nine samples, with the distance blurSize between them\n   sum += texture2D(texture, vec2(v_Texcoord.x - 4.0*blurSize/imageWidth, v_Texcoord.y)) * 0.05;\n   sum += texture2D(texture, vec2(v_Texcoord.x - 3.0*blurSize/imageWidth, v_Texcoord.y)) * 0.09;\n   sum += texture2D(texture, vec2(v_Texcoord.x - 2.0*blurSize/imageWidth, v_Texcoord.y)) * 0.12;\n   sum += texture2D(texture, vec2(v_Texcoord.x - blurSize/imageWidth, v_Texcoord.y)) * 0.15;\n   sum += texture2D(texture, vec2(v_Texcoord.x, v_Texcoord.y)) * 0.18;\n   sum += texture2D(texture, vec2(v_Texcoord.x + blurSize/imageWidth, v_Texcoord.y)) * 0.15;\n   sum += texture2D(texture, vec2(v_Texcoord.x + 2.0*blurSize/imageWidth, v_Texcoord.y)) * 0.12;\n   sum += texture2D(texture, vec2(v_Texcoord.x + 3.0*blurSize/imageWidth, v_Texcoord.y)) * 0.09;\n   sum += texture2D(texture, vec2(v_Texcoord.x + 4.0*blurSize/imageWidth, v_Texcoord.y)) * 0.05;\n \n   gl_FragColor = sum;\n}\n\n@end\n\n@export buildin.compositor.gaussian_blur_h\n\nuniform sampler2D texture;\nvarying vec2 v_Texcoord;\n \nuniform float blurSize : 3.0;\nuniform float imageHeight : 512.0;\n \nvoid main(void)\n{\n   vec4 sum = vec4(0.0);\n \n   // blur in y (vertical)\n   // take nine samples, with the distance blurSize between them\n   sum += texture2D(texture, vec2(v_Texcoord.x, v_Texcoord.y - 4.0*blurSize/imageHeight)) * 0.05;\n   sum += texture2D(texture, vec2(v_Texcoord.x, v_Texcoord.y - 3.0*blurSize/imageHeight)) * 0.09;\n   sum += texture2D(texture, vec2(v_Texcoord.x, v_Texcoord.y - 2.0*blurSize/imageHeight)) * 0.12;\n   sum += texture2D(texture, vec2(v_Texcoord.x, v_Texcoord.y - blurSize/imageHeight)) * 0.15;\n   sum += texture2D(texture, vec2(v_Texcoord.x, v_Texcoord.y)) * 0.18;\n   sum += texture2D(texture, vec2(v_Texcoord.x, v_Texcoord.y + blurSize/imageHeight)) * 0.15;\n   sum += texture2D(texture, vec2(v_Texcoord.x, v_Texcoord.y + 2.0*blurSize/imageHeight)) * 0.12;\n   sum += texture2D(texture, vec2(v_Texcoord.x, v_Texcoord.y + 3.0*blurSize/imageHeight)) * 0.09;\n   sum += texture2D(texture, vec2(v_Texcoord.x, v_Texcoord.y + 4.0*blurSize/imageHeight)) * 0.05;\n \n   gl_FragColor = sum;\n}\n\n@end\n\n@export buildin.compositor.box_blur\n\nuniform sampler2D texture;\nvarying vec2 v_Texcoord;\n\nuniform float blurSize : 3.0;\nuniform float imageWidth : 512.0;\nuniform float imageHeight : 512.0;\n\nvoid main(void){\n\n   vec4 tex = texture2D(texture, v_Texcoord);\n   vec2 offset = vec2(blurSize/imageWidth, blurSize/imageHeight);\n\n   tex += texture2D(texture, v_Texcoord + vec2(offset.x, 0.0) );\n   tex += texture2D(texture, v_Texcoord + vec2(offset.x, offset.y) );\n   tex += texture2D(texture, v_Texcoord + vec2(-offset.x, offset.y) );\n   tex += texture2D(texture, v_Texcoord + vec2(0.0, offset.y) );\n   tex += texture2D(texture, v_Texcoord + vec2(-offset.x, 0.0) );\n   tex += texture2D(texture, v_Texcoord + vec2(-offset.x, -offset.y) );\n   tex += texture2D(texture, v_Texcoord + vec2(offset.x, -offset.y) );\n   tex += texture2D(texture, v_Texcoord + vec2(0.0, -offset.y) );\n\n   tex /= 9.0;\n\n   gl_FragColor = tex;\n}\n\n@end\n\n// http://www.slideshare.net/DICEStudio/five-rendering-ideas-from-battlefield-3-need-for-speed-the-run\n@export buildin.compositor.hexagonal_blur_mrt_1\n\n// MRT in chrome\n// https://www.khronos.org/registry/webgl/sdk/tests/conformance/extensions/ext-draw-buffers.html\n#extension GL_EXT_draw_buffers : require\n\nuniform sampler2D texture;\nvarying vec2 v_Texcoord;\n\nuniform float blurSize : 2.0;\n\nuniform float imageWidth : 512.0;\nuniform float imageHeight : 512.0;\n\nvoid main(void){\n   vec2 offset = vec2(blurSize/imageWidth, blurSize/imageHeight);\n\n   vec4 color = vec4(0.0);\n   // Top\n   for(int i = 0; i < 10; i++){\n      color += 1.0/10.0 * texture2D(texture, v_Texcoord + vec2(0.0, offset.y * float(i)) );\n   }\n   gl_FragData[0] = color;\n   vec4 color2 = vec4(0.0);\n   // Down left\n   for(int i = 0; i < 10; i++){\n      color2 += 1.0/10.0 * texture2D(texture, v_Texcoord - vec2(offset.x * float(i), offset.y * float(i)) );\n   }\n   gl_FragData[1] = (color + color2) / 2.0;\n}\n\n@end\n\n@export buildin.compositor.hexagonal_blur_mrt_2\n\nuniform sampler2D texture0;\nuniform sampler2D texture1;\n\nvarying vec2 v_Texcoord;\n\nuniform float blurSize : 2.0;\n\nuniform float imageWidth : 512.0;\nuniform float imageHeight : 512.0;\n\nvoid main(void){\n   vec2 offset = vec2(blurSize/imageWidth, blurSize/imageHeight);\n\n   vec4 color1 = vec4(0.0);\n   // Down left\n   for(int i = 0; i < 10; i++){\n      color1 += 1.0/10.0 * texture2D(texture0, v_Texcoord - vec2(offset.x * float(i), offset.y * float(i)) );\n   }\n   vec4 color2 = vec4(0.0);\n   // Down right\n   for(int i = 0; i < 10; i++){\n      color2 += 1.0/10.0 * texture2D(texture1, v_Texcoord + vec2(offset.x * float(i), -offset.y * float(i)) );\n   }\n\n   gl_FragColor = (color1 + color2) / 2.0;\n}\n\n@end\n\n\n@export buildin.compositor.hexagonal_blur_1\n\nuniform sampler2D texture;\nvarying vec2 v_Texcoord;\n\nuniform float blurSize : 1.0;\n\nuniform float imageWidth : 512.0;\nuniform float imageHeight : 512.0;\n\nvoid main(void){\n   vec2 offset = vec2(blurSize/imageWidth, blurSize/imageHeight);\n\n   vec4 color = vec4(0.0);\n   // Top\n   for(int i = 0; i < 10; i++){\n      color += 1.0/10.0 * texture2D(texture, v_Texcoord + vec2(0.0, offset.y * float(i)) );\n   }\n   gl_FragColor = color;\n}\n\n@end\n\n@export buildin.compositor.hexagonal_blur_2\n\nuniform sampler2D texture;\nvarying vec2 v_Texcoord;\n\nuniform float blurSize : 1.0;\n\nuniform float imageWidth : 512.0;\nuniform float imageHeight : 512.0;\n\nvoid main(void){\n   vec2 offset = vec2(blurSize/imageWidth, blurSize/imageHeight);\n\n   vec4 color = vec4(0.0);\n   // Down left\n   for(int i = 0; i < 10; i++){\n      color += 1.0/10.0 * texture2D(texture, v_Texcoord - vec2(offset.x * float(i), offset.y * float(i)) );\n   }\n   gl_FragColor = color;\n}\n@end\n\n@export buildin.compositor.hexagonal_blur_3\n\nuniform sampler2D texture1;\nuniform sampler2D texture2;\n\nvarying vec2 v_Texcoord;\n\nuniform float blurSize : 1.0;\n\nuniform float imageWidth : 512.0;\nuniform float imageHeight : 512.0;\n\nvoid main(void){\n   vec2 offset = vec2(blurSize/imageWidth, blurSize/imageHeight);\n\n   vec4 color1 = vec4(0.0);\n   // Down left\n   for(int i = 0; i < 10; i++){\n      color1 += 1.0/10.0 * texture2D(texture1, v_Texcoord - vec2(offset.x * float(i), offset.y * float(i)) );\n   }\n   vec4 color2 = vec4(0.0);\n   // Down right\n   for(int i = 0; i < 10; i++){\n      color2 += 1.0/10.0 * texture2D(texture1, v_Texcoord + vec2(offset.x * float(i), -offset.y * float(i)) );\n   }\n\n   vec4 color3 = vec4(0.0);\n   // Down right\n   for(int i = 0; i < 10; i++){\n      color3 += 1.0/10.0 * texture2D(texture2, v_Texcoord + vec2(offset.x * float(i), -offset.y * float(i)) );\n   }\n\n   gl_FragColor = (color1 + color2 + color3) / 3.0;\n}\n\n@end';});

define('3d/compositor/shaders/grayscale.essl',[],function () { return '\n@export buildin.compositor.grayscale\n\nvarying vec2 v_Texcoord;\n\nuniform sampler2D texture;\n\nconst vec3 w = vec3(0.2125, 0.7154, 0.0721);\n\nvoid main()\n{\n    vec4 tex = texture2D( texture, v_Texcoord );\n    float luminance = dot(tex.rgb, w);\n\n    gl_FragColor = vec4(vec3(luminance), tex.a);\n}\n\n@end';});

define('3d/compositor/shaders/lut.essl',[],function () { return '\n// https://github.com/BradLarson/GPUImage?source=c\n@export buildin.compositor.lut\n\nvarying vec2 v_Texcoord;\n\nuniform sampler2D texture;\nuniform sampler2D lookup;\n\nvoid main()\n{\n    vec4 tex = texture2D(texture, v_Texcoord);\n\n    float blueColor = tex.b * 63.0;\n    \n    vec2 quad1;\n    quad1.y = floor(floor(blueColor) / 8.0);\n    quad1.x = floor(blueColor) - (quad1.y * 8.0);\n    \n    vec2 quad2;\n    quad2.y = floor(ceil(blueColor) / 8.0);\n    quad2.x = ceil(blueColor) - (quad2.y * 8.0);\n    \n    vec2 texPos1;\n    texPos1.x = (quad1.x * 0.125) + 0.5/512.0 + ((0.125 - 1.0/512.0) * tex.r);\n    texPos1.y = (quad1.y * 0.125) + 0.5/512.0 + ((0.125 - 1.0/512.0) * tex.g);\n    \n    vec2 texPos2;\n    texPos2.x = (quad2.x * 0.125) + 0.5/512.0 + ((0.125 - 1.0/512.0) * tex.r);\n    texPos2.y = (quad2.y * 0.125) + 0.5/512.0 + ((0.125 - 1.0/512.0) * tex.g);\n    \n    vec4 newColor1 = texture2D(lookup, texPos1);\n    vec4 newColor2 = texture2D(lookup, texPos2);\n    \n    vec4 newColor = mix(newColor1, newColor2, fract(blueColor));\n    gl_FragColor = vec4(newColor.rgb, tex.w);\n}\n\n@end';});

define('3d/compositor/shaders/output.essl',[],function () { return '\n@export buildin.compositor.output\n\nvarying vec2 v_Texcoord;\n\nuniform sampler2D texture;\n\nvoid main()\n{\n    vec4 tex = texture2D( texture, v_Texcoord );\n\n    gl_FragColor = tex;\n}\n\n@end';});

define('3d/compositor/Pass',['require','core/Base','../Scene','../camera/Orthographic','../geometry/Plane','../Shader','../Material','../Mesh','../Scene','./shaders/vertex.essl','../Texture','../WebGLInfo','./shaders/coloradjust.essl','./shaders/blur.essl','./shaders/grayscale.essl','./shaders/lut.essl','./shaders/output.essl'],function(require) {

    var Base = require("core/Base");
    var Scene = require("../Scene");
    var OrthoCamera = require('../camera/Orthographic');
    var Plane = require('../geometry/Plane');
    var Shader = require('../Shader');
    var Material = require('../Material');
    var Mesh = require('../Mesh');
    var Scene = require('../Scene');
    var vertexShaderString = require('./shaders/vertex.essl');
    var Texture = require('../Texture');
    var WebGLInfo = require('../WebGLInfo');

    var planeGeo = new Plane();
    var mesh = new Mesh({
            geometry : planeGeo
        });
    var scene = new Scene();
    var camera = new OrthoCamera();
        
    scene.add(mesh);

    var Pass = Base.derive(function() {
        return {
            // Fragment shader string
            fragment : "",

            outputs : null,

            material : null

        }
    }, function() {

        var shader = new Shader({
            vertex : vertexShaderString,
            fragment : this.fragment
        })
        var material = new Material({
            shader : shader
        });
        shader.enableTexturesAll();

        this.material = material;

    }, {

        setUniform : function(name, value) {
            var uniform = this.material.uniforms[name];
            if (uniform) {
                uniform.value = value;
            }
        },

        getUniform : function(name) {
            var uniform = this.material.uniforms[name];
            if (uniform) {
                return uniform.value;
            }
        },

        bind : function(renderer, frameBuffer) {
            
            if (this.outputs) {
                for (var attachment in this.outputs) {
                    var texture = this.outputs[attachment];
                    frameBuffer.attach(renderer.gl, texture, attachment);
                }
                frameBuffer.bind(renderer);
            }
        },

        unbind : function(renderer, frameBuffer) {
            frameBuffer.unbind(renderer);
        },

        render : function(renderer, frameBuffer) {

            var _gl = renderer.gl;

            mesh.material = this.material;

            if (frameBuffer) {
                this.bind(renderer, frameBuffer);
            }

            // MRT Support in chrome
            // https://www.khronos.org/registry/webgl/sdk/tests/conformance/extensions/ext-draw-buffers.html
            var ext = WebGLInfo.getExtension(_gl, "EXT_draw_buffers");
            if (ext) {
                var bufs = [];
                for (var attachment in this.outputs) {
                    attachment = parseInt(attachment);
                    if (attachment >= _gl.COLOR_ATTACHMENT0 && attachment <= _gl.COLOR_ATTACHMENT0 + 8) {
                        bufs.push(attachment);
                    }
                }
                ext.drawBuffersEXT(bufs);
            }

            this.trigger("beforerender", this, renderer);
            renderer.render(scene, camera, true);
            this.trigger("afterrender", this, renderer);

            if (frameBuffer) {
                this.unbind(renderer, frameBuffer);
            }
        }
    })

    // Some build in shaders
    Shader.import(require('./shaders/coloradjust.essl'));
    Shader.import(require('./shaders/blur.essl'));
    Shader.import(require('./shaders/grayscale.essl'));
    Shader.import(require('./shaders/lut.essl'));
    Shader.import(require('./shaders/output.essl'));

    return Pass;
});
define('3d/compositor/texturePool',['require','../texture/Texture2D','../glenum','_'],function(require) {
    
    var Texture2D = require('../texture/Texture2D');
    var glenum = require('../glenum');
    var _ = require('_');

    var pool = {};

    var texturePool = {

        get : function(parameters) {
            var key = generateKey(parameters);
            if (!pool.hasOwnProperty(key)) {
                pool[key] = [];
            }
            var list = pool[key];
            if (!list.length) {
                var texture = new Texture2D(parameters);
                return texture;
            }
            return list.pop();
        },

        put : function(texture) {
            var key = generateKey(texture);
            if (!pool.hasOwnProperty(key)) {
                pool[key] = [];
            }
            var list = pool[key];
            list.push(texture);
        },

        clear : function(gl) {
            for (name in pool) {
                for (var i = 0; i < pool[name].length; i++) {
                    pool[name][i].dispose(gl);
                }
            }
            pool = {};
        }
    }

    var defaultParams = {
        width : 512,
        height : 512,
        type : glenum.UNSIGNED_BYTE,
        format : glenum.RGBA,
        wrapS : glenum.CLAMP_TO_EDGE,
        wrapT : glenum.CLAMP_TO_EDGE,
        minFilter : glenum.LINEAR_MIPMAP_LINEAR,
        magFilter : glenum.LINEAR,
        useMipmap : true,
        anisotropic : 1,
        flipY : true,
        unpackAlignment : 4,
        premultiplyAlpha : false
    }

    function generateKey(parameters) {
        _.defaults(parameters, defaultParams);
        fallBack(parameters);

        var key = '';
        for (var name in defaultParams) {
            var chunk = parameters[name].toString();
            key += chunk;
        }
        return key;
    }

    function fallBack(target) {

        var IPOT = isPowerOfTwo(target.width, target.height);

        if (target.format === glenum.DEPTH_COMPONENT) {
            target.useMipmap = false;
        }

        if (!IPOT || !target.useMipmap) {
            if (this.minFilter == glenum.NEAREST_MIPMAP_NEAREST ||
                this.minFilter == glenum.NEAREST_MIPMAP_LINEAR) {
                this.minFilter = glenum.NEAREST;
            } else if (
                this.minFilter == glenum.LINEAR_MIPMAP_LINEAR ||
                this.minFilter == glenum.LINEAR_MIPMAP_NEAREST
            ) {
                this.minFilter = glenum.LINEAR
            }

            target.wrapS = glenum.CLAMP_TO_EDGE;
            target.wrapT = glenum.CLAMP_TO_EDGE;
        }
    }

    function isPowerOfTwo(width, height) {
        return (width & (width-1)) === 0 &&
                (height & (height-1)) === 0;
    }

    return texturePool
});
/**
 * Example
 * {
 *  name : "xxx",
 *  shader : shader,
 *  inputs :{ 
 *      "texture" : {
 *          node : "xxx",
 *          pin : "diffuse"
        }
    },
    // Optional, only use for the node in group
    groupInputs : {
        // Group input pin name : node input pin name
        "texture" : "texture"
    },
    outputs : {
            diffuse : {
                attachment : FrameBuffer.COLOR_ATTACHMENT0
                parameters : {
                    format : Texture.RGBA,
                    width : 512,
                    height : 512
                }
            }
        }
    },
    // Optional, only use for the node in group
    groupOutputs : {
        // Node output pin name : group output pin name
        "diffuse" : "diffuse"
    }
 * Multiple outputs is reserved for MRT support in WebGL2.0
 *
 * TODO blending 
 */
define('3d/compositor/Node',['require','core/Base','./Pass','../FrameBuffer','../Shader','./texturePool'],function(require) {

    

    var Base = require("core/Base");
    var Pass = require("./Pass");
    var FrameBuffer = require("../FrameBuffer");
    var Shader = require("../Shader");
    var texturePool = require("./texturePool");

    var Node = Base.derive(function() {
        return {

            name : "",

            inputs : {},
            
            outputs : null,

            shader : '',
            /**
             * Input links, will be auto updated by the graph
             * Example:
             * inputName : {
             *     node : [Node],
             *     pin : 'xxxx'    
             * }
             * @type {Object}
             */
            inputLinks : {},
            /**
             * Output links, will be auto updated by the graph
             * Example:
             * outputName : {
             *     node : [Node],
             *     pin : 'xxxx'    
             * }
             * @type {Object}
             */
            outputLinks : {},
            /**
             * @type {qtek3d.compositor.Pass}
             */
            pass : null,

            // Save the output texture of previous frame
            // Will be used when there exist a circular reference
            _prevOutputTextures : {},
            _outputTextures : {},
            //{
            //  name : 2
            //}
            _outputReferences : {},

            _rendering : false,
            _circularReference : {}
        }
    }, function() {
        if (this.shader) {
            var pass = new Pass({
                fragment : this.shader
            });
            this.pass = pass;   
        }
        if (this.outputs) {
            this.frameBuffer = new FrameBuffer({
                depthBuffer : false
            })
        }
    }, {
        /**
         * Do rendering
         * @param  {qtek3d.Renderer} renderer
         */
        render : function(renderer) {
                        
            this._rendering = true;

            var _gl = renderer.gl;

            for (var inputName in this.inputLinks) {
                var link = this.inputLinks[inputName];
                var inputTexture = link.node.getOutput(renderer, link.pin);
                this.pass.setUniform(inputName, inputTexture);
            }
            // Output
            if (! this.outputs) {
                this.pass.outputs = null;
                this.pass.render(renderer);
            } else {
                this.pass.outputs = {};

                for (var name in this.outputs) {

                    var outputInfo = this.outputs[name];
                    var texture;
                    // It is special when handling circular reference
                    // Input will use the output texture of previous pass.
                    // So the texture of current pass and previous pass are both needed
                    // and be swapped each render pass
                    if (this._circularReference[name]) {
                        // Swap the texture
                        if (!this._outputTextures[name]) {
                            this._outputTextures[name] = texturePool.get(outputInfo.parameters || {});
                        }
                        var tmp = this._prevOutputTextures[name];
                        this._prevOutputTextures[name] = this._outputTextures[name];
                        this._outputTextures[name] = tmp;
                        texture = tmp;
                    } else {
                        texture = texturePool.get(outputInfo.parameters || {});
                        this._outputTextures[name] = texture;
                    }

                    var attachment = outputInfo.attachment || _gl.COLOR_ATTACHMENT0;
                    if (typeof(attachment) == "string") {
                        attachment = _gl[attachment];
                    }
                    this.pass.outputs[attachment] = texture;
                }

                this.pass.render(renderer, this.frameBuffer);
            }
            
            for (var inputName in this.inputLinks) {
                var link = this.inputLinks[inputName];
                link.node.removeReference(link.pin);
            }

            this._rendering = false;
        },

        setParameter : function(name, value) {
            this.pass.setUniform(name, value);
        },

        getParameter : function(name) {
            return this.pass.getUniform(name);
        },

        setParameters : function(obj) {
            for (var name in obj) {
                this.setParameter(name, obj[name]);
            }
        },


        getOutput : function(renderer /*optional*/, name) {
            if (name === undefined) {
                // Return the output texture without rendering
                name = renderer;
                return this._outputTextures[name];
            }
            
            var outputInfo = this.outputs[name];
            if (! outputInfo) {
                return ;
            }
            if (this._outputTextures[name]) {
                // Already been rendered in this frame
                return this._outputTextures[name];
            } else if(this._rendering) {
                if (!this._prevOutputTextures[name]) {
                    // Create a blank texture at first pass
                    this._prevOutputTextures[name] = texturePool.get(outputInfo.parameters || {});
                }
                this._circularReference[name] = true;
                // Solve circular reference
                return this._prevOutputTextures[name];
            }

            this.render(renderer);
            
            return this._outputTextures[name];
        },

        removeReference : function(name) {
            this._outputReferences[name]--;
            if (this._outputReferences[name] === 0) {
                // Output of this node have alreay been used by all other nodes
                // Put the texture back to the pool.
                if (!this._circularReference[name]) {
                    texturePool.put(this._outputTextures[name]);
                    this._outputTextures[name] = null;
                }
            }
        },

        link : function(inputPinName, fromNode, fromPinName) {

            // The relationship from output pin to input pin is one-on-multiple
            this.inputLinks[inputPinName] = {
                node : fromNode,
                pin : fromPinName
            }
            if (! fromNode.outputLinks[fromPinName]) {
                fromNode.outputLinks[fromPinName] = [];
            }
            fromNode.outputLinks[ fromPinName ].push({
                node : this,
                pin : inputPinName
            })
        },

        clear : function() {
            this.inputLinks = {};
            this.outputLinks = {};
        },

        updateReference : function() {
            for (var name in this.outputLinks) {
                this._outputReferences[name] = this.outputLinks[name].length;
            }
        }
    })

    return Node;
});
/**
 * Node Group
 */
define('3d/compositor/Group',['require','./Node','./Graph'],function(require) {

    var Node = require("./Node");
    var Graph = require("./Graph");

    var Group = Node.derive(function() {
        return {
            nodes : [],

            _outputTextures : {}
        }
    }, {
        add : function(node) {
            return Graph.prototype.add.call(this, node);
        },

        remove : function(node) {
            return Graph.prototype.remove.call(this, node);
        },

        update : function() {
            return Graph.prototype.update.call(this);
        },

        findNode : function(name) {
            return Graph.prototype.findNode.call(this);
        },

        findPin : function(info) {
            return Graph.prototype.findPin.call(this, info);
        },

        render : function(renderer) {
            if(this._dirty) {
                this.update();
                this._dirty = false;
            }
            
            var groupInputTextures = {};

            for (var inputName in this.inputLinks) {
                var link = this.inputLinks[inputName];
                var inputTexture = link.node.getOutput(renderer, link.pin);
                groupInputTextures[inputName] = inputTexture;
            }

            for (var i = 0; i < this.nodes.length; i++) {
                var node = this.nodes[i];
                // Update the reference number of each output texture
                node.updateReference();
                // Set the input texture to portal node of group
                if (node.groupInputs) {
                    this._updateGroupInputs(node, groupInputTextures);
                }
            }
            for (var i = 0; i < this.nodes.length; i++) {
                var node = this.nodes[i];
                if (node.groupOutputs) {
                    this._updateGroupOutputs(node, renderer);
                }
                // Direct output
                if ( ! node.outputs) {
                    node.render(renderer);
                }
            }
            for (var name in this.groupOutputs) {
                if ( ! this._outputTextures[name]) {
                    console.error('Group output pin "' + name + '" is not attached');
                }
            }

            for (var inputName in this.inputLinks) {
                var link = this.inputLinks[inputName];
                link.node.removeReference( link.pin );
            }
        },

        _updateGroupInputs : function(node, groupInputTextures) {
            for (var name in groupInputTextures) {
                var texture = groupInputTextures[name];
                if (node.groupInputs[name]) {
                    var pin  = node.groupInputs[name];
                    node.pass.setUniform(pin, texture);
                }
            }
        },

        _updateGroupOutputs : function(node, renderer) {
            for (var name in node.groupOutputs) {
                var groupOutputPinName = node.groupOutputs[name];
                var texture = node.getOutput(renderer, name);
                this._outputTextures[groupOutputPinName] = texture;
            }
        }
    });

    return Group;
});
define('3d/compositor/SceneNode',['require','./Node','./Pass','../FrameBuffer','./texturePool','../WebGLInfo'],function(require) {

    var Node = require("./Node");
    var Pass = require("./Pass");
    var FrameBuffer = require("../FrameBuffer");
    var texturePool = require("./texturePool");
    var WebGLInfo = require('../WebGLInfo');

    var SceneNode = Node.derive(function() {
        return {
            scene : null,
            camera : null,
            material : null
        }
    }, function() {
        if (this.frameBuffer) {
            this.frameBuffer.depthBuffer = true;
        }
    }, {
        render : function(renderer) {
            
            this._rendering = true;

            var _gl = renderer.gl;

            if (! this.outputs) {
                renderer.render(this.scene, this.camera);
            } else {
                
                var frameBuffer = this.frameBuffer;

                for (var name in this.outputs) {
                    var outputInfo = this.outputs[name];
                    var texture = texturePool.get(outputInfo.parameters || {});
                    this._outputTextures[name] = texture;

                    var attachment = outputInfo.attachment || _gl.COLOR_ATTACHMENT0;
                    if (typeof(attachment) == "string") {
                        attachment = _gl[attachment];
                    }
                    frameBuffer.attach(renderer.gl, texture, attachment);
                }
                frameBuffer.bind(renderer);

                // MRT Support in chrome
                // https://www.khronos.org/registry/webgl/sdk/tests/conformance/extensions/ext-draw-buffers.html
                var ext = WebGLInfo.getExtension(_gl, "EXT_draw_buffers");
                if (ext) {
                    var bufs = [];
                    for (var attachment in this.outputs) {
                        attachment = parseInt(attachment);
                        if (attachment >= _gl.COLOR_ATTACHMENT0 && attachment <= _gl.COLOR_ATTACHMENT0 + 8) {
                            bufs.push(attachment);
                        }
                    }
                    ext.drawBuffersEXT(bufs);
                }

                if (this.material) {
                    this.scene.material = this.material;
                }

                renderer.render(this.scene, this.camera);
                
                this.scene.material = null;

                frameBuffer.unbind(renderer);
            }

            this._rendering = false;
        }
    })

    return SceneNode;
});
define('3d/compositor/TextureNode',['require','./Node','../FrameBuffer','./texturePool','../Shader'],function(require) {

    var Node = require("./Node");
    var FrameBuffer = require("../FrameBuffer");
    var texturePool = require("./texturePool");
    var Shader = require("../Shader");

    var TextureNode = Node.derive(function() {
        return {
            
            shader : Shader.source("buildin.compositor.output"),

            texture : null
        }
    }, {
        render : function(renderer) {

            this._rendering = true;

            var _gl = renderer.gl;
            this.pass.setUniform("texture", this.texture);
            
            if (! this.outputs) {
                this.pass.outputs = null;
                this.pass.render(renderer);
            } else {
                
                this.pass.outputs = {};

                for (var name in this.outputs) {

                    var outputInfo = this.outputs[name];

                    var texture = texturePool.get(outputInfo.parameters || {});
                    this._outputTextures[name] = texture;

                    var attachment = outputInfo.attachment || _gl.COLOR_ATTACHMENT0;
                    if (typeof(attachment) == "string") {
                        attachment = _gl[attachment];
                    }
                    this.pass.outputs[ attachment ] = texture;

                }

                this.pass.render(renderer, this.frameBuffer);
            }

            this._rendering = false;
        }
    })

    return TextureNode;
});
;
define("3d/debug/PointLight", function(){});

define('3d/debug/RenderInfo',['require','core/Base'],function(require) {

    var Base = require("core/Base");

    var RenderInfo = Base.derive(function() {
        return {
            renderer : null,
            scene : null,
            shadowPass : null,

            _ctx2d : null,

            log : {
                vertexNumber : 0,
                faceNumber : 0,
                drawCallNumber : 0,
                meshNumber : 0,
                renderTime : 0,
                sceneUpdateTime : 0,
                shadowPassTime : 0
            },
            _shadowPassStartTime : 0,
            _sceneUpdateStartTime : 0,
            _renderStartTime : 0
        }
    }, {
        enable : function() {
            this.renderer.on("beforerender", this._beforeRender, this);
            this.renderer.on("afterrender", this._afterRender, this);
            this.renderer.on("afterrender:mesh", this._afterRenderMesh, this);

            if (this.scene) {
                this.scene.on("beforeupdate", this._beforeUpdateScene, this);
                this.scene.on("afterupdate", this._afterUpdateScene, this);
            }
            if (this.shadowPass) {
                this.shadowPass.on('beforerender', this._beforeShadowPass, this);
                this.shadowPass.on('afterrender', this._afterShadowPass, this);
            }
        },
        disable : function() {
            this.renderer.off("beforerender", this._beforeRender);
            this.renderer.off("afterrender", this._afterRender);
            this.renderer.off("afterrender:mesh", this._afterRenderMesh);
            if (this.scene) {
                this.scene.off("beforeupdate", this._beforeUpdateScene);
                this.scene.off("afterupdate", this._afterUpdateScene);
            }
            if (this.shadowPass) {
                this.shadowPass.off('beforerender', this._beforeShadowPass);
                this.shadowPass.off('afterrender', this._afterShadowPass);
            }
        },

        clear : function() {
            this.log.vertexNumber = 0;
            this.log.faceNumber = 0;
            this.log.drawCallNumber = 0;
            this.log.meshNumber = 0;
            this.log.renderTime = 0;
            this.log.sceneUpdateTime = 0;
            this.log.shadowPassTime = 0;
        },

        draw : function() {
            var ctx = this._ctx2d;
            if (!ctx) {
                return;
            }
            ctx.strokeStyle = 'white';
            ctx.font = '12px Arial';
            ctx.fillText('Vertices : ' + this.log.vertexNumber, 10, 10);
            ctx.fillText('Faces : ' + this.log.faceNumber, 10, 30);
            ctx.fillText('Meshes : ' + this.log.meshNumber, 10, 70);
            ctx.fillText('Draw Calls : ' + this.log.drawCallNumber, 10, 90);
            ctx.fillText('Render Time : ' + this.log.renderTime.toFixed(2) + 'ms', 10, 110);
            ctx.fillText('Scene Update Time : ' + this.log.sceneUpdateTime.toFixed(2) + 'ms', 10, 130);
            ctx.fillText('Shadow Pass Time : ' + this.log.shadowPassTime.toFixed(2) + 'ms', 10, 150);
        },

        _beforeRender : function() {
            this._renderStartTime = performance.now();
        },

        _afterRender : function() {
            var endTime = performance.now();
            this.log.renderTime += endTime - this._renderStartTime;
        },

        _beforeUpdateScene : function() {
            this._sceneUpdateStartTime = performance.now();
        },

        _afterUpdateScene : function() {
            var endTime = performance.now();
            this.log.sceneUpdateTime += endTime - this._sceneUpdateStartTime;
        },

        _beforeShadowPass : function() {
            this._shadowPassStartTime = performance.now();
        },

        _afterShadowPass : function() {
            var endTime = performance.now();
            this.log.shadowPassTime += endTime - this._shadowPassStartTime;
        },

        _afterRenderMesh : function(renderer, mesh, drawInfo) {
            this.log.vertexNumber += drawInfo.vertexNumber;
            this.log.faceNumber += drawInfo.faceNumber;
            this.log.drawCallNumber += drawInfo.drawCallNumber;
            this.log.meshNumber ++;
        }
    })

    return RenderInfo;
} );

define('3d/geometry/Cube',['require','../Geometry','./Plane','core/Matrix4','core/Vector3'],function(require) {

    var Geometry = require('../Geometry');
    var Plane = require('./Plane');
    var Matrix4 = require('core/Matrix4');
    var Vector3 = require('core/Vector3');

    var planeMatrix = new Matrix4();
    
    var Cube = Geometry.derive(function() {

        return {
            widthSegments : 1,
            heightSegments : 1,
            depthSegments : 1,
            // TODO double side material
            inside : false
        }
    }, function() {
        var planes = {
            "px" : createPlane("px", this.depthSegments, this.heightSegments),
            "nx" : createPlane("nx", this.depthSegments, this.heightSegments),
            "py" : createPlane("py", this.widthSegments, this.depthSegments),
            "ny" : createPlane("ny", this.widthSegments, this.depthSegments),
            "pz" : createPlane("pz", this.widthSegments, this.heightSegments),
            "nz" : createPlane("nz", this.widthSegments, this.heightSegments),
        };
        var cursor = 0;
        var self = this;
        for (var pos in planes) {
            ['position', 'texcoord0', 'normal'].forEach(function(attrName) {
                var attrArray = planes[pos].attributes[attrName].value;
                for (var i = 0; i < attrArray.length; i++) {
                    var value = attrArray[i];
                    if (this.inside && attrName === "normal") {
                        value[0] = -value[0];
                        value[1] = -value[1];
                        value[2] = -value[2];
                    }
                    self.attributes[attrName].value.push(value);
                }
                var plane = planes[pos];
                for (var i = 0; i < plane.faces.length; i++) {
                    var face = plane.faces[i];
                    self.faces.push([face[0]+cursor, face[1]+cursor, face[2]+cursor]);
                }
            });
            cursor += planes[pos].getVerticesNumber();
        }
    })

    function createPlane(pos, widthSegments, heightSegments) {

        planeMatrix.identity();

        var plane = new Plane({
            widthSegments : widthSegments,
            heightSegments : heightSegments
        })

        switch(pos) {
            case "px":
                planeMatrix.translate(new Vector3(1, 0, 0));
                planeMatrix.rotateY(Math.PI/2);
                break;
            case "nx":
                planeMatrix.translate(new Vector3(-1, 0, 0));
                planeMatrix.rotateY(-Math.PI/2);
                break;
            case "py":
                planeMatrix.translate(new Vector3(0, 1, 0));
                planeMatrix.rotateX(-Math.PI/2);
                break;
            case "ny":
                planeMatrix.translate(new Vector3(0, -1, 0));
                planeMatrix.rotateX(Math.PI/2);
                break;
            case "pz":
                planeMatrix.translate(new Vector3(0, 0, 1));
                break;
            case "nz":
                planeMatrix.translate(new Vector3(0, 0, -1));
                planeMatrix.rotateY(Math.PI);
                break;
        }
        plane.applyMatrix(planeMatrix);
        return plane;
    }

    return Cube;
});
define('3d/geometry/Sphere',['require','../Geometry','glmatrix'],function(require) {

	var Geometry = require('../Geometry');
    var glMatrix = require('glmatrix');
    var vec3 = glMatrix.vec3;
    var vec2 = glMatrix.vec2;

	// From three.js SphereGeometry
	var Sphere = Geometry.derive(function() {

		return {
            widthSegments : 20,
            heightSegments : 20,

            phiStart : 0,
            phiLength : Math.PI * 2,

            thetaStart : 0,
            thetaLength : Math.PI,

            radius : 1
		}
	}, function() {
        
        var positions = this.attributes.position.value;
        var texcoords = this.attributes.texcoord0.value;
        var normals = this.attributes.normal.value;

        var x, y, z,
            u, v,
            i, j;
        var normal;

        var heightSegments = this.heightSegments;
        var widthSegments = this.widthSegments;
        var radius = this.radius;
        var phiStart = this.phiStart;
        var phiLength = this.phiLength;
        var thetaStart = this.thetaStart;
        var thetaLength = this.thetaLength;
        var radius = this.radius;


        for (j = 0; j <= heightSegments; j ++) {
            for (i = 0; i <= widthSegments; i ++) {
                u = i / widthSegments;
                v = j / heightSegments;

                x = -radius * Math.cos(phiStart + u * phiLength) * Math.sin(thetaStart + v * thetaLength);
                y = radius * Math.cos(thetaStart + v * thetaLength);
                z = radius * Math.sin(phiStart + u * phiLength) * Math.sin(thetaStart + v * thetaLength);

                positions.push(vec3.fromValues(x, y, z));
                texcoords.push(vec2.fromValues(u, v));

                normal = vec3.fromValues(x, y, z);
                normals.push(vec3.normalize(normal, normal));
            }
        }

        var p1, p2, p3,
            i1, i2, i3, i4;
        var faces = this.faces;

        var len = widthSegments+1;

        for (j = 0; j < heightSegments; j ++) {
            for (i = 0; i < widthSegments; i ++) {
                i1 = j * len + i;
                i2 = j * len + i + 1;
                i3 = (j + 1) * len + i + 1;
                i4 = (j + 1) * len + i;

                faces.push(vec3.fromValues(i1, i2, i3));
                faces.push(vec3.fromValues(i3, i4, i1));
            }
        }
	})

    return Sphere;
});
define('3d/light/Ambient',['require','../Light','../Shader'],function(require) {

    var Light = require('../Light');
    var Shader = require('../Shader');

    var AmbientLight = Light.derive(function() {
        return {
            castShadow : false
        }
    }, {

        type : 'AMBIENT_LIGHT',

        uniformTemplates : {
            'ambientLightColor' : {
                type : '3f',
                value : function(instance) {
                    var color = instance.color,
                        intensity = instance.intensity;
                    return [color[0]*intensity, color[1]*intensity, color[1]*intensity];
                }
            }
        }
    })

    return AmbientLight;
});
define('3d/light/Directional',['require','../Light','../Shader','core/Vector3'],function(require) {

    var Light = require('../Light');
    var Shader = require('../Shader');
    var Vector3 = require('core/Vector3');

    var DirectionalLight = Light.derive(function() {

        return {
            // Config of orthographic camera for shadow mapping generate
            shadowCamera : {
                left : -20,
                right : 20,
                top : 20,
                bottom : -20,
                near : 0,
                far : 100
            },
            shadowBias : 0.0002
        }
    }, {

        type : 'DIRECTIONAL_LIGHT',

        uniformTemplates : {
            'directionalLightDirection' : {
                type : '3f',
                value : (function() {
                    var z = new Vector3();
                    return function(instance) {
                        // Direction is target to eye
                        return z.copy(instance.worldTransform.forward).negate()._array;
                    }
                })()
            },
            'directionalLightColor' : {
                type : '3f',
                value : function(instance) {
                    var color = instance.color;
                    var intensity = instance.intensity;
                    return [color[0]*intensity, color[1]*intensity, color[1]*intensity];
                }
            }
        }
    })

    return DirectionalLight;
} );
define('3d/light/Point',['require','../Light','../Shader'],function(require) {

    var Light = require('../Light');
    var Shader = require('../Shader');

    var PointLight = Light.derive(function() {

        return {
            range : 100,

            castShadow : false,
        }
    }, {

        type : 'POINT_LIGHT',

        uniformTemplates : {
            'pointLightPosition' : {
                type : '3f',
                value : function(instance) {
                    return instance.getWorldPosition()._array;
                }
            },
            'pointLightRange' : {
                type : '1f',
                value : function(instance) {
                    return instance.range;
                }
            },
            'pointLightColor' : {
                type : '3f',
                value : function(instance) {
                    var color = instance.color,
                        intensity = instance.intensity;
                    return [ color[0]*intensity, color[1]*intensity, color[1]*intensity ];
                }
            }
        }
    })

    return PointLight;
});
define('3d/light/Spot',['require','../Light','../Shader','core/Vector3'],function(require) {

    var Light = require('../Light');
    var Shader = require('../Shader');
    var Vector3 = require('core/Vector3');

    var SpotLight = Light.derive(function() {

        return {
            range : 20,
            umbraAngle : 30,
            penumbraAngle : 45,
            falloffFactor : 2.0,
            
            shadowBias : 0.0002
        }
    },{

        type : 'SPOT_LIGHT',

        uniformTemplates : {
            'spotLightPosition' : {
                type : '3f',
                value : function(instance) {
                    return instance.getWorldPosition()._array;
                }
            },
            'spotLightRange' : {
                type : '1f',
                value : function(instance) {
                    return instance.range;
                }
            },
            'spotLightUmbraAngleCosine' : {
                type : '1f',
                value : function(instance) {
                    return Math.cos(instance.umbraAngle * Math.PI / 180);
                }
            },
            'spotLightPenumbraAngleCosine' : {
                type : '1f',
                value : function(instance) {
                    return Math.cos(instance.penumbraAngle * Math.PI / 180);
                }
            },
            'spotLightFalloffFactor' : {
                type : '1f',
                value : function(instance) {
                    return instance.falloffFactor
                }
            },
            'spotLightDirection' : {
                type : '3f',
                value : (function() {
                    var z = new Vector3();
                    return function(instance) {
                        // Direction is target to eye
                        return z.copy(instance.worldTransform.forward).negate()._array;
                    }
                })()
            },
            'spotLightColor' : {
                type : '3f',
                value : function(instance) {
                    var color = instance.color,
                        intensity = instance.intensity;
                    return [ color[0]*intensity, color[1]*intensity, color[1]*intensity ];
                }
            }
        }
    })

    return SpotLight;
} );
;
define("3d/particleSystem/Particle", function(){});

define('3d/particleSystem/ParticleSystem',['require','../Node'],function(require) {

    var Node = require('../Node');
    
    var ParticleSystem = Node.derive(function() {
        return {
            emitter : null,

            sprite : null,

            
        }
    }, {

    });

    return ParticleSystem;
});
define('3d/plugin/FirstPersonControl',['require','core/Base','core/Vector3','core/Matrix4','core/Quaternion'],function(require) {

    var Base = require("core/Base");
    var Vector3 = require("core/Vector3");
    var Matrix4 = require("core/Matrix4");
    var Quaternion = require("core/Quaternion");

    var FirstPersonControl = Base.derive(function() {
        return {
            target : null,
            domElement : null,

            sensitivity : 1,
            speed : 0.4,

            up : new Vector3(0, 1, 0),

            _moveForward : false,
            _moveBackward : false,
            _moveLeft : false,
            _moveRight : false,

            _offsetPitch : 0,
            _offsetRoll : 0
        }
    }, {
        enable : function() {
            this.target.on("beforeupdate", this._beforeUpdateCamera, this);

            this.target.eulerOrder = ["Y", "X", "Z"];
            // Use pointer lock
            // http://www.html5rocks.com/en/tutorials/pointerlock/intro/
            var el = this.domElement;

            //Must request pointer lock after click event, can't not do it directly
            //Why ? ?
            el.addEventListener("click", this.requestPointerLock);

            document.addEventListener("pointerlockchange", bindOnce(this._lockChange, this), false);
            document.addEventListener("mozpointerlockchange", bindOnce(this._lockChange, this), false);
            document.addEventListener("webkitpointerlockchange", bindOnce(this._lockChange, this), false);

            document.addEventListener("keydown", bindOnce(this._keyDown, this), false);
            document.addEventListener("keyup", bindOnce(this._keyUp, this), false);
        },

        disable : function() {

            this.target.off('beforeupdate', this._beforeUpdateCamera);

            var el = this.domElement;

            el.exitPointerLock = el.exitPointerLock ||
                                    el.mozExitPointerLock ||
                                    el.webkitExitPointerLock

            if (el.exitPointerLock) {
                el.exitPointerLock();
            }
            document.removeEventListener("pointerlockchange", bindOnce(this._lockChange, this));
            document.removeEventListener("mozpointerlockchange", bindOnce(this._lockChange, this));
            document.removeEventListener("webkitpointerlockchange", bindOnce(this._lockChange, this));
        
        },

        requestPointerLock : function() {
            var el = this;
            el.requestPointerLock = el.requestPointerLock ||
                                    el.mozRequestPointerLock ||
                                    el.webkitRequestPointerLock;

            el.requestPointerLock();
        },

        _beforeUpdateCamera : (function() {

            var rotateQuat = new Quaternion();
            
            return function() {
                
                var target = this.target;

                var position = this.target.position,
                    xAxis = target.localTransform.right.normalize(),
                    zAxis = target.localTransform.forward.normalize();

                if (this._moveForward) {
                    // Opposite direction of z
                    position.scaleAndAdd(zAxis, -this.speed);
                }
                if (this._moveBackward) {
                    position.scaleAndAdd(zAxis, this.speed);
                }
                if (this._moveLeft) {
                    position.scaleAndAdd(xAxis, -this.speed/2);
                }
                if (this._moveRight) {
                    position.scaleAndAdd(xAxis, this.speed/2);
                }


                target.rotateAround(target.position, this.up, -this._offsetPitch * Math.PI / 180);
                var xAxis = target.localTransform.right;
                target.rotateAround(target.position, xAxis, -this._offsetRoll * Math.PI / 180);

                this._offsetRoll = this._offsetPitch = 0;
            }

        })(),

        _lockChange : function() {
            if (document.pointerlockElement === this.domElement ||
                document.mozPointerlockElement === this.domElement ||
                document.webkitPointerLockElement === this.domElement) {

                document.addEventListener('mousemove', bindOnce(this._mouseMove, this), false);
            }else{
                document.removeEventListener('mousemove', bindOnce(this._mouseMove, this), false);
            }
        },

        _mouseMove : function(e) {
            var dx = e.movementX || 
                    e.mozMovementX ||
                    e.webkitMovementX || 0;
            var dy = e.movementY ||
                    e.mozMovementY ||
                    e.webkitMovementY || 0;

            this._offsetPitch += dx * this.sensitivity / 10;
            this._offsetRoll += dy * this.sensitivity / 10;
            
        },

        _keyDown : function(e) {
            switch(e.keyCode) {
                case 87: //w
                case 37: //up arrow
                    this._moveForward = true;
                    break;
                case 83: //s
                case 40: //down arrow
                    this._moveBackward = true;
                    break;
                case 65: //a
                case 37: //left arrow
                    this._moveLeft = true;
                    break;
                case 68: //d
                case 39: //right arrow
                    this._moveRight = true;
                    break; 
            }
        },

        _keyUp : function(e) {
            switch(e.keyCode) {
                case 87: //w
                case 37: //up arrow
                    this._moveForward = false;
                    break;
                case 83: //s
                case 40: //down arrow
                    this._moveBackward = false;
                    break;
                case 65: //a
                case 37: //left arrow
                    this._moveLeft = false;
                    break;
                case 68: //d
                case 39: //right arrow
                    this._moveRight = false;
                    break; 
            }
        }
    })

    function bindOnce(func, context) {
        if (!func.__bindfuc__) {
            func.__bindfuc__ = function() {
                return func.apply(context, arguments); 
            }
        }
        return func.__bindfuc__;
    }

    return FirstPersonControl;
});
define('3d/plugin/OrbitControl',['require','core/Base','core/Vector3','core/Matrix4','core/Quaternion'],function(require) {

    var Base = require("core/Base");
    var Vector3 = require("core/Vector3");
    var Matrix4 = require("core/Matrix4");
    var Quaternion = require("core/Quaternion");

    var OrbitControl = Base.derive(function() {
        return {
            
            target : null,
            domElement : null,

            sensitivity : 1,

            origin : new Vector3(),

            up : new Vector3(0, 1, 0),
            // Rotate around origin
            _offsetPitch : 0,
            _offsetRoll : 0,

            // Pan the origin
            _panX : 0,
            _panY : 0,

            // Offset of mouse move
            _offsetX : 0,
            _offsetY : 0,

            // Zoom with mouse wheel
            _forward : 0,

            _op : 0  //0 : ROTATE, 1 : PAN
        }
    }, {

        enable : function() {
            this.target.on("beforeupdate", this._beforeUpdateCamera, this);
            this.domElement.addEventListener("mousedown", bindOnce(this._mouseDown, this), false);
            this.domElement.addEventListener("mousewheel", bindOnce(this._mouseWheel, this), false);
            this.domElement.addEventListener("DOMMouseScroll", bindOnce(this._mouseWheel, this), false);
        },

        disable : function() {
            this.target.off("beforeupdate", this._beforeUpdateCamera);
            this.domElement.removeEventListener("mousedown", bindOnce(this._mouseDown, this));
            this.domElement.removeEventListener("mousewheel", bindOnce(this._mouseWheel, this));
            this.domElement.removeEventListener("DOMMouseScroll", bindOnce(this._mouseWheel, this));
            this._mouseUp();
        },

        _mouseWheel : function(e) {
            e.preventDefault();
            var delta = e.wheelDelta // Webkit 
                        || -e.detail; // Firefox

            this._forward += delta * this.sensitivity;
        },

        _mouseDown : function(e) {
            document.addEventListener("mousemove", bindOnce(this._mouseMove, this), false);
            document.addEventListener("mouseup", bindOnce(this._mouseUp, this), false);
            document.addEventListener("mouseout", bindOnce(this._mouseOut, this), false);

            this._offsetX = e.pageX;
            this._offsetY = e.pageY;

            // Rotate
            if (e.button === 0) {
                this._op = 0;
            } else if (e.button === 1) {
                this._op = 1;
            }
        },

        _mouseMove : function(e) {
            var dx = e.pageX - this._offsetX,
                dy = e.pageY - this._offsetY;

            if (this._op === 0) {
                this._offsetPitch += dx * this.sensitivity / 100;
                this._offsetRoll += dy * this.sensitivity / 100;
            } else if (this._op === 1) {
                var len = this.origin.distance(this.target.position);
                var tmp = Math.sin(this.target.fov/2) / 100;
                this._panX -= dx * this.sensitivity * len * tmp;
                this._panY -= dy * this.sensitivity * len * tmp;
            }

            this._offsetX = e.pageX;
            this._offsetY = e.pageY;
        },

        _mouseUp : function() {

            document.removeEventListener("mousemove", bindOnce(this._mouseMove, this));
            document.removeEventListener("mouseup", bindOnce(this._mouseUp, this));
            document.removeEventListener("mouseout", bindOnce(this._mouseOut, this));

            this._op = -1;
        },

        _mouseOut : function() {
            this._mouseUp();
        },

        _beforeUpdateCamera : function() {

            var target = this.target;

            if (this._op === 0) {
                // Rotate
                target.rotateAround(this.origin, this.up, -this._offsetPitch);            
                var xAxis = target.localTransform.right;
                target.rotateAround(this.origin, xAxis, -this._offsetRoll);
                this._offsetRoll = this._offsetPitch = 0;
            } else if (this._op === 1) {
                // Pan
                var xAxis = target.localTransform.right.normalize().scale(-this._panX);
                var yAxis = target.localTransform.up.normalize().scale(this._panY);
                target.position.add(xAxis).add(yAxis);
                this.origin.add(xAxis).add(yAxis);
                this._panX = this._panY = 0;
            }
            
            // Zoom
            var zAxis = target.localTransform.forward.normalize();
            var distance = target.position.distance(this.origin);
            target.position.scaleAndAdd(zAxis, distance * this._forward / 2000);
            this._forward = 0;

        }
    });

    function bindOnce(func, context) {
        if (!func.__bindfuc__) {
            func.__bindfuc__ = function() {
                return func.apply(context, arguments); 
            }
        }
        return func.__bindfuc__;
    }

    return OrbitControl;
} );
define('3d/shader/source/basic.essl',[],function () { return '@export buildin.basic.vertex\n\nuniform mat4 worldViewProjection : WORLDVIEWPROJECTION;\n\nuniform vec2 uvRepeat : [1.0, 1.0];\n\nattribute vec2 texcoord : TEXCOORD_0;\nattribute vec3 position : POSITION;\n\nattribute vec3 barycentric;\n\nvarying vec2 v_Texcoord;\nvarying vec3 v_Barycentric;\n\nvoid main(){\n\n    gl_Position = worldViewProjection * vec4( position, 1.0 );\n\n    v_Texcoord = texcoord * uvRepeat;\n    v_Barycentric = barycentric;\n}\n\n@end\n\n\n\n\n@export buildin.basic.fragment\n\nvarying vec2 v_Texcoord;\nuniform sampler2D diffuseMap;\nuniform vec3 color : [1.0, 1.0, 1.0];\nuniform float alpha : 1.0;\n\n// Uniforms for wireframe\nuniform float lineWidth : 0.0;\nuniform vec3 lineColor : [0.0, 0.0, 0.0];\nvarying vec3 v_Barycentric;\n\n#extension GL_OES_standard_derivatives : enable\n@import buildin.util.edge_factor\n\nvoid main(){\n\n    gl_FragColor = vec4(color, alpha);\n    \n    #ifdef DIFFUSEMAP_ENABLED\n        vec4 tex = texture2D( diffuseMap, v_Texcoord );\n        gl_FragColor.rgb *= tex.rgb;\n    #endif\n    \n    if( lineWidth > 0.01){\n        gl_FragColor.xyz = gl_FragColor.xyz * mix(lineColor, vec3(1.0), edgeFactor(lineWidth));\n    }\n}\n\n@end';});

define('3d/shader/source/lambert.essl',[],function () { return '/**\n * http://en.wikipedia.org/wiki/Lambertian_reflectance\n */\n\n@export buildin.lambert.vertex\n\nuniform mat4 worldViewProjection : WORLDVIEWPROJECTION;\nuniform mat4 worldInverseTranspose : WORLDINVERSETRANSPOSE;\nuniform mat4 world : WORLD;\n\nuniform vec2 uvRepeat : [1.0, 1.0];\n\nattribute vec3 position : POSITION;\nattribute vec2 texcoord : TEXCOORD_0;\nattribute vec3 normal : NORMAL;\n\nattribute vec3 barycentric;\n\n#ifdef SKINNING\nattribute vec3 weight : WEIGHT;\nattribute vec4 joint : JOINT;\n\nuniform mat4 invBindMatrix[JOINT_NUMBER] : INV_BIND_MATRIX;\n#endif\n\nvarying vec2 v_Texcoord;\nvarying vec3 v_Normal;\nvarying vec3 v_WorldPosition;\nvarying vec3 v_Barycentric;\nvarying vec3 v_Weight;\n\nvoid main(){\n\n    vec3 skinnedPosition = position;\n    vec3 skinnedNormal = normal;\n\n    #ifdef SKINNING\n        mat4 skinMatrix;\n        if (joint.x >= 0.0){\n            skinMatrix = invBindMatrix[int(joint.x)] * weight.x;\n        }\n        if (joint.y >= 0.0){\n            skinMatrix += invBindMatrix[int(joint.y)] * weight.y;\n        }\n        if (joint.z >= 0.0){\n            skinMatrix += invBindMatrix[int(joint.z)] * weight.z;\n        }\n        if (joint.w >= 0.0){\n            skinMatrix += invBindMatrix[int(joint.w)] * (1.0-weight.x-weight.y-weight.z);\n        }\n        skinnedPosition = (skinMatrix * vec4(position, 1.0)).xyz;\n        // Normal matrix ???\n        skinnedNormal = (skinMatrix * vec4(normal, 0.0)).xyz;\n    #endif\n\n    gl_Position = worldViewProjection * vec4( skinnedPosition, 1.0 );\n\n    v_Texcoord = texcoord * uvRepeat;\n    v_Normal = normalize( ( worldInverseTranspose * vec4(skinnedNormal, 0.0) ).xyz );\n    v_WorldPosition = ( world * vec4( skinnedPosition, 1.0) ).xyz;\n\n    v_Barycentric = barycentric;\n    #ifdef SKINNING\n        v_Weight = weight;\n    #else\n        v_Weight = vec3(0.0);\n    #endif\n}\n\n@end\n\n\n\n\n@export buildin.lambert.fragment\n\nvarying vec2 v_Texcoord;\nvarying vec3 v_Normal;\nvarying vec3 v_WorldPosition;\nvarying vec3 v_Weight;\n\nuniform sampler2D diffuseMap;\nuniform sampler2D alphaMap;\n\nuniform vec3 color : [1.0, 1.0, 1.0];\nuniform float alpha : 1.0;\n\n// Uniforms for wireframe\nuniform float lineWidth : 0.0;\nuniform vec3 lineColor : [0.0, 0.0, 0.0];\nvarying vec3 v_Barycentric;\n\n#ifdef AMBIENT_LIGHT_NUMBER\n@import buildin.header.ambient_light\n#endif\n#ifdef POINT_LIGHT_NUMBER\n@import buildin.header.point_light\n#endif\n#ifdef DIRECTIONAL_LIGHT_NUMBER\n@import buildin.header.directional_light\n#endif\n#ifdef SPOT_LIGHT_NUMBER\n@import buildin.header.spot_light\n#endif\n\n#extension GL_OES_standard_derivatives : enable\n// Import util functions and uniforms needed\n@import buildin.util.calculate_attenuation\n\n@import buildin.util.edge_factor\n\n@import buildin.plugin.compute_shadow_map\n\nvoid main(){\n    \n    #ifdef RENDER_WEIGHT\n        gl_FragColor = vec4(v_Weight, 1.0);\n        return;\n    #endif\n    #ifdef RENDER_NORMAL\n        gl_FragColor = vec4(v_Normal, 1.0);\n        return;\n    #endif\n    #ifdef RENDER_TEXCOORD\n        gl_FragColor = vec4(v_Texcoord, 1.0, 1.0);\n        return;\n    #endif\n\n\n    gl_FragColor = vec4(color, alpha);\n\n    #ifdef DIFFUSEMAP_ENABLED\n        vec4 tex = texture2D( diffuseMap, v_Texcoord );\n        // http://freesdk.crydev.net/display/SDKDOC3/Specular+Maps\n        gl_FragColor.rgb *= tex.rgb;\n    #endif\n\n    vec3 diffuseColor = vec3(0.0, 0.0, 0.0);\n    \n    #ifdef AMBIENT_LIGHT_NUMBER\n        for(int i = 0; i < AMBIENT_LIGHT_NUMBER; i++){\n            diffuseColor += ambientLightColor[i];\n        }\n    #endif\n    // Compute point light color\n    #ifdef POINT_LIGHT_NUMBER\n        #if defined(POINT_LIGHT_SHADOWMAP_NUMBER)\n            float shadowContribs[POINT_LIGHT_NUMBER];\n            if( shadowEnabled ){\n                computeShadowOfPointLights( v_WorldPosition, shadowContribs );\n            }\n        #endif\n        for(int i = 0; i < POINT_LIGHT_NUMBER; i++){\n\n            vec3 lightPosition = pointLightPosition[i];\n            vec3 lightColor = pointLightColor[i];\n            float range = pointLightRange[i];\n\n            vec3 lightDirection = lightPosition - v_WorldPosition;\n\n            // Calculate point light attenuation\n            float dist = length(lightDirection);\n            float attenuation = calculateAttenuation(dist, range);\n\n            // Normalize vectors\n            lightDirection /= dist;\n\n            float ndl = dot( v_Normal, lightDirection );\n\n            float shadowContrib = 1.0;\n            #if defined(POINT_LIGHT_SHADOWMAP_NUMBER)\n                if( shadowEnabled ){\n                    shadowContrib = shadowContribs[i];\n                }\n            #endif\n\n            diffuseColor += lightColor * clamp(ndl, 0.0, 1.0) * attenuation * shadowContrib;\n        }\n    #endif\n    #ifdef DIRECTIONAL_LIGHT_NUMBER\n        #if defined(DIRECTIONAL_LIGHT_SHADOWMAP_NUMBER)\n            float shadowContribs[DIRECTIONAL_LIGHT_NUMBER];\n            if(shadowEnabled){\n                computeShadowOfDirectionalLights( v_WorldPosition, shadowContribs );\n            }\n        #endif\n        for(int i = 0; i < DIRECTIONAL_LIGHT_NUMBER; i++){\n            vec3 lightDirection = -directionalLightDirection[i];\n            vec3 lightColor = directionalLightColor[i];\n            \n            float ndl = dot( v_Normal, normalize( lightDirection ) );\n\n            float shadowContrib = 1.0;\n            #if defined(DIRECTIONAL_LIGHT_SHADOWMAP_NUMBER)\n                if( shadowEnabled ){\n                    shadowContrib = shadowContribs[i];\n                }\n            #endif\n\n            diffuseColor += lightColor * clamp(ndl, 0.0, 1.0) * shadowContrib;\n        }\n    #endif\n    \n    #ifdef SPOT_LIGHT_NUMBER\n        #if defined(SPOT_LIGHT_SHADOWMAP_NUMBER)\n            float shadowContribs[SPOT_LIGHT_NUMBER];\n            if( shadowEnabled ){\n                computeShadowOfSpotLights( v_WorldPosition, shadowContribs );\n            }\n        #endif\n        for(int i = 0; i < SPOT_LIGHT_NUMBER; i++){\n            vec3 lightPosition = -spotLightPosition[i];\n            vec3 spotLightDirection = -normalize( spotLightDirection[i] );\n            vec3 lightColor = spotLightColor[i];\n            float range = spotLightRange[i];\n            float umbraAngleCosine = spotLightUmbraAngleCosine[i];\n            float penumbraAngleCosine = spotLightPenumbraAngleCosine[i];\n            float falloffFactor = spotLightFalloffFactor[i];\n\n            vec3 lightDirection = lightPosition - v_WorldPosition;\n            // Calculate attenuation\n            float dist = length(lightDirection);\n            float attenuation = calculateAttenuation(dist, range); \n\n            // Normalize light direction\n            lightDirection /= dist;\n            // Calculate spot light fall off\n            float lightDirectCosine = dot(spotLightDirection, lightDirection);\n\n            float falloff;\n            falloff = clamp((lightDirectCosine-umbraAngleCosine)/(penumbraAngleCosine-umbraAngleCosine), 0.0, 1.0);\n            falloff = pow(falloff, falloffFactor);\n\n            float ndl = dot(v_Normal, lightDirection);\n            ndl = clamp(ndl, 0.0, 1.0);\n\n            float shadowContrib = 1.0;\n            #if defined(SPOT_LIGHT_SHADOWMAP_NUMBER)\n                if( shadowEnabled ){\n                    shadowContrib = shadowContribs[i];\n                }\n            #endif\n\n            diffuseColor += lightColor * ndl * attenuation * (1.0-falloff) * shadowContrib;\n\n        }\n    #endif\n\n    gl_FragColor.xyz *= diffuseColor;\n    if( lineWidth > 0.01){\n        gl_FragColor.xyz = gl_FragColor.xyz * mix(lineColor, vec3(1.0), edgeFactor(lineWidth));\n    }\n\n}\n\n@end';});

define('3d/shader/source/phong.essl',[],function () { return '\n// http://en.wikipedia.org/wiki/Blinn%E2%80%93Phong_shading_model\n\n@export buildin.phong.vertex\n\nuniform mat4 worldViewProjection : WORLDVIEWPROJECTION;\nuniform mat4 worldInverseTranspose : WORLDINVERSETRANSPOSE;\nuniform mat4 world : WORLD;\n\nuniform vec2 uvRepeat : [1.0, 1.0];\n\nattribute vec3 position : POSITION;\nattribute vec2 texcoord : TEXCOORD_0;\nattribute vec3 normal : NORMAL;\nattribute vec4 tangent : TANGENT;\n\nattribute vec3 barycentric;\n\n#ifdef SKINNING\nattribute vec3 weight : WEIGHT;\nattribute vec4 joint : JOINT;\n\nuniform mat4 invBindMatrix[JOINT_NUMBER] : INV_BIND_MATRIX;\n#endif\n\nvarying vec2 v_Texcoord;\nvarying vec3 v_Normal;\nvarying vec3 v_LocalNormal;\nvarying vec3 v_WorldPosition;\nvarying vec3 v_Barycentric;\n\nvarying vec3 v_Tangent;\nvarying vec3 v_Bitangent;\n\nvarying vec3 v_Weight;\n\nvoid main(){\n    \n    vec3 skinnedPosition = position;\n    vec3 skinnedNormal = normal;\n    vec3 skinnedTangent = tangent.xyz;\n    #ifdef SKINNING\n        mat4 skinMatrix;\n        if (joint.x >= 0.0){\n            skinMatrix = invBindMatrix[int(joint.x)] * weight.x;\n        }\n        if (joint.y >= 0.0){\n            skinMatrix += invBindMatrix[int(joint.y)] * weight.y;\n        }\n        if (joint.z >= 0.0){\n            skinMatrix += invBindMatrix[int(joint.z)] * weight.z;\n        }\n        if (joint.w >= 0.0){\n            skinMatrix += invBindMatrix[int(joint.w)] * (1.0-weight.x-weight.y-weight.z);\n        }\n        skinnedPosition = (skinMatrix * vec4(position, 1.0)).xyz;\n        // Normal matrix ???\n        skinnedNormal = (skinMatrix * vec4(normal, 0.0)).xyz;\n        skinnedTangent = (skinMatrix * vec4(tangent.xyz, 0.0)).xyz;\n    #endif\n\n    gl_Position = worldViewProjection * vec4(skinnedPosition, 1.0);\n\n    v_Texcoord = texcoord * uvRepeat;\n    v_WorldPosition = (world * vec4(skinnedPosition, 1.0)).xyz;\n    v_Barycentric = barycentric;\n\n    v_LocalNormal = skinnedNormal;\n    v_Normal = normalize((worldInverseTranspose * vec4(skinnedNormal, 0.0)).xyz);\n    v_Tangent = normalize((worldInverseTranspose * vec4(skinnedTangent, 0.0)).xyz);\n    v_Bitangent = normalize(cross(v_Normal, v_Tangent) * tangent.w);\n\n    #ifdef SKINNING\n        v_Weight = weight;\n    #else\n        v_Weight = vec3(1.0);\n    #endif\n}\n\n@end\n\n\n@export buildin.phong.fragment\n\nuniform mat4 viewInverse : VIEWINVERSE;\n\nvarying vec2 v_Texcoord;\nvarying vec3 v_LocalNormal;\nvarying vec3 v_Normal;\nvarying vec3 v_WorldPosition;\nvarying vec3 v_Tangent;\nvarying vec3 v_Bitangent;\nvarying vec3 v_Weight;\n\nuniform sampler2D diffuseMap;\nuniform sampler2D alphaMap;\nuniform sampler2D normalMap;\nuniform sampler2D specularMap;\n\n#ifdef SPHERE_ENVIRONMENT_MAPPING\nuniform sampler2D environmentMap;\n#else\nuniform samplerCube environmentMap;\n#endif\n\nuniform vec3 color : [1.0, 1.0, 1.0];\nuniform float alpha : 1.0;\n\nuniform float shininess : 30;\n\nuniform vec3 specular : [1.0, 1.0, 1.0];\n\nuniform float reflectivity : 0.5;\n// Uniforms for wireframe\nuniform float lineWidth : 0.0;\nuniform vec3 lineColor : [0.0, 0.0, 0.0];\nvarying vec3 v_Barycentric;\n\n#ifdef AMBIENT_LIGHT_NUMBER\n@import buildin.header.ambient_light\n#endif\n#ifdef POINT_LIGHT_NUMBER\n@import buildin.header.point_light\n#endif\n#ifdef DIRECTIONAL_LIGHT_NUMBER\n@import buildin.header.directional_light\n#endif\n#ifdef SPOT_LIGHT_NUMBER\n@import buildin.header.spot_light\n#endif\n\n#extension GL_OES_standard_derivatives : enable\n// Import util functions and uniforms needed\n@import buildin.util.calculate_attenuation\n\n@import buildin.util.edge_factor\n\n@import buildin.plugin.compute_shadow_map\n\nvoid main(){\n    \n    #ifdef RENDER_WEIGHT\n        gl_FragColor = vec4(v_Weight.xyz, 1.0);\n        return;\n    #endif\n    #ifdef RENDER_TEXCOORD\n        gl_FragColor = vec4(v_Texcoord, 1.0, 1.0);\n        return;\n    #endif\n\n    vec4 finalColor = vec4(color, alpha);\n\n    vec3 eyePos = viewInverse[3].xyz;\n    vec3 viewDirection = normalize(eyePos - v_WorldPosition);\n\n    #ifdef DIFFUSEMAP_ENABLED\n        vec4 tex = texture2D(diffuseMap, v_Texcoord);\n        finalColor.rgb *= tex.rgb;\n    #endif\n\n    vec3 normal = v_Normal;\n    #ifdef NORMALMAP_ENABLED\n        normal = texture2D(normalMap, v_Texcoord).xyz * 2.0 - 1.0;\n        mat3 tbn = mat3(v_Tangent, v_Bitangent, v_Normal);\n        normal = normalize(tbn * normal);\n    #endif\n\n    #ifdef RENDER_NORMAL\n        gl_FragColor = vec4(normal, 1.0);\n        return;\n    #endif\n\n    // Diffuse part of all lights\n    vec3 diffuseItem = vec3(0.0, 0.0, 0.0);\n    // Specular part of all lights\n    vec3 specularItem = vec3(0.0, 0.0, 0.0);\n    \n    #ifdef AMBIENT_LIGHT_NUMBER\n        for(int i = 0; i < AMBIENT_LIGHT_NUMBER; i++){\n            diffuseItem += ambientLightColor[i];\n        }\n    #endif\n    #ifdef POINT_LIGHT_NUMBER\n        #if defined(POINT_LIGHT_SHADOWMAP_NUMBER)\n            float shadowContribs[POINT_LIGHT_NUMBER];\n            if(shadowEnabled){\n                computeShadowOfPointLights(v_WorldPosition, shadowContribs);\n            }\n        #endif\n        for(int i = 0; i < POINT_LIGHT_NUMBER; i++){\n\n            vec3 lightPosition = pointLightPosition[i];\n            vec3 lightColor = pointLightColor[i];\n            float range = pointLightRange[i];\n\n            vec3 lightDirection = lightPosition - v_WorldPosition;\n\n            // Calculate point light attenuation\n            float dist = length(lightDirection);\n            float attenuation = calculateAttenuation(dist, range); \n\n            // Normalize vectors\n            lightDirection /= dist;\n            vec3 halfVector = normalize(lightDirection + viewDirection);\n\n            float ndh = dot(normal, halfVector);\n            ndh = clamp(ndh, 0.0, 1.0);\n\n            float ndl = dot(normal,  lightDirection);\n            ndl = clamp(ndl, 0.0, 1.0);\n\n            float shadowContrib = 1.0;\n            #if defined(POINT_LIGHT_SHADOWMAP_NUMBER)\n                if(shadowEnabled){\n                    shadowContrib = shadowContribs[i];\n                }\n            #endif\n\n            diffuseItem += lightColor * ndl * attenuation * shadowContrib;\n\n            if (shininess > 0.0) {\n                specularItem += lightColor * ndl * pow(ndh, shininess) * attenuation * shadowContrib;\n            }\n\n        }\n    #endif\n\n    #ifdef DIRECTIONAL_LIGHT_NUMBER\n        #if defined(DIRECTIONAL_LIGHT_SHADOWMAP_NUMBER)\n            float shadowContribs[DIRECTIONAL_LIGHT_NUMBER];\n            if(shadowEnabled){\n                computeShadowOfDirectionalLights(v_WorldPosition, shadowContribs);\n            }\n        #endif\n        for(int i = 0; i < DIRECTIONAL_LIGHT_NUMBER; i++){\n\n            vec3 lightDirection = -normalize(directionalLightDirection[i]);\n            vec3 lightColor = directionalLightColor[i];\n\n            vec3 halfVector = normalize(lightDirection + viewDirection);\n\n            float ndh = dot(normal, halfVector);\n            ndh = clamp(ndh, 0.0, 1.0);\n\n            float ndl = dot(normal, lightDirection);\n            ndl = clamp(ndl, 0.0, 1.0);\n\n            float shadowContrib = 1.0;\n            #if defined(DIRECTIONAL_LIGHT_SHADOWMAP_NUMBER)\n                if(shadowEnabled){\n                    shadowContrib = shadowContribs[i];\n                }\n            #endif\n\n            diffuseItem += lightColor * ndl * shadowContrib;\n\n            if (shininess > 0.0) {\n                specularItem += lightColor * ndl * pow(ndh, shininess) * shadowContrib;\n            }\n        }\n    #endif\n\n    #ifdef SPOT_LIGHT_NUMBER\n        #if defined(SPOT_LIGHT_SHADOWMAP_NUMBER)\n            float shadowContribs[SPOT_LIGHT_NUMBER];\n            if(shadowEnabled){\n                computeShadowOfSpotLights(v_WorldPosition, shadowContribs);\n            }\n        #endif\n        for(int i = 0; i < SPOT_LIGHT_NUMBER; i++){\n            vec3 lightPosition = spotLightPosition[i];\n            vec3 spotLightDirection = -normalize(spotLightDirection[i]);\n            vec3 lightColor = spotLightColor[i];\n            float range = spotLightRange[i];\n            float umbraAngleCosine = spotLightUmbraAngleCosine[i];\n            float penumbraAngleCosine = spotLightPenumbraAngleCosine[i];\n            float falloffFactor = spotLightFalloffFactor[i];\n\n            vec3 lightDirection = lightPosition - v_WorldPosition;\n            // Calculate attenuation\n            float dist = length(lightDirection);\n            float attenuation = calculateAttenuation(dist, range); \n\n            // Normalize light direction\n            lightDirection /= dist;\n            // Calculate spot light fall off\n            float lightDirectCosine = dot(spotLightDirection, lightDirection);\n\n            float falloff;\n            // Fomular from real-time-rendering\n            falloff = clamp((lightDirectCosine-umbraAngleCosine)/(penumbraAngleCosine-umbraAngleCosine), 0.0, 1.0);\n            falloff = pow(falloff, falloffFactor);\n\n            vec3 halfVector = normalize(lightDirection + viewDirection);\n\n            float ndh = dot(normal, halfVector);\n            ndh = clamp(ndh, 0.0, 1.0);\n\n            float ndl = dot(normal, lightDirection);\n            ndl = clamp(ndl, 0.0, 1.0);\n\n            float shadowContrib = 1.0;\n            #if defined(SPOT_LIGHT_SHADOWMAP_NUMBER)\n                if(shadowEnabled){\n                    shadowContrib = shadowContribs[i];\n                }\n            #endif\n\n            diffuseItem += lightColor * ndl * attenuation * (1.0-falloff) * shadowContrib;\n\n            if (shininess > 0.0) {\n                specularItem += lightColor * ndl * pow(ndh, shininess) * attenuation * (1.0-falloff) * shadowContrib;\n            }\n        }\n    #endif\n\n    finalColor.rgb *= diffuseItem;\n    finalColor.rgb += specularItem * specular;\n\n    #ifdef ENVIRONMENTMAP_ENABLED\n        #ifdef SPHERE_ENVIRONMENT_MAPPING\n            // Blinn and Newell\'s Method\n        #else\n            vec3 envTex = textureCube(environmentMap, reflect(-viewDirection, normal)).xyz;\n            finalColor.rgb = finalColor.rgb + envTex * reflectivity;\n        #endif\n    #endif\n\n    if(lineWidth > 0.01){\n        finalColor.rgb = finalColor.rgb * mix(lineColor, vec3(1.0), edgeFactor(lineWidth));\n    }\n\n    gl_FragColor = finalColor;\n}\n\n@end';});

define('3d/shader/source/wireframe.essl',[],function () { return '@export buildin.wireframe.vertex\n\nuniform mat4 worldViewProjection : WORLDVIEWPROJECTION;\nuniform mat4 world : WORLD;\n\nattribute vec3 position : POSITION;\nattribute vec3 barycentric;\n\n#ifdef SKINNING\nattribute vec3 weight : WEIGHT;\nattribute vec4 joint : JOINT;\n\nuniform mat4 invBindMatrix[JOINT_NUMBER] : INV_BIND_MATRIX;\n#endif\n\nvarying vec3 v_Barycentric;\n\nvoid main(){\n\n    vec3 skinnedPosition = position;\n    #ifdef SKINNING\n        mat4 skinMatrix;\n        if (joint.x >= 0.0){\n            skinMatrix = invBindMatrix[int(joint.x)] * weight.x;\n        }\n        if (joint.y >= 0.0){\n            skinMatrix += invBindMatrix[int(joint.y)] * weight.y;\n        }\n        if (joint.z >= 0.0){\n            skinMatrix += invBindMatrix[int(joint.z)] * weight.z;\n        }\n        if (joint.w >= 0.0){\n            skinMatrix += invBindMatrix[int(joint.w)] * (1.0-weight.x-weight.y-weight.z);\n        }\n        skinnedPosition = (skinMatrix * vec4(position, 1.0)).xyz;\n    #endif\n\n    gl_Position = worldViewProjection * vec4(skinnedPosition, 1.0 );\n\n    v_Barycentric = barycentric;\n}\n\n@end\n\n\n@export buildin.wireframe.fragment\n\nuniform vec3 color : [0.0, 0.0, 0.0];\n\nuniform float alpha : 1.0;\nuniform float lineWidth : 1.0;\n\nvarying vec3 v_Barycentric;\n\n#extension GL_OES_standard_derivatives : enable\n\n@import buildin.util.edge_factor\n\nvoid main(){\n\n    gl_FragColor.rgb = color;\n    gl_FragColor.a = ( 1.0-edgeFactor(lineWidth) ) * alpha;\n}\n\n@end';});

define('3d/shader/source/skybox.essl',[],function () { return '@export buildin.skybox.vertex\n\nuniform mat4 world : WORLD;\nuniform mat4 worldViewProjection : WORLDVIEWPROJECTION;\n\nattribute vec3 position : POSITION;\n\nvarying vec3 v_WorldPosition;\n\nvoid main(){\n    v_WorldPosition = (world * vec4(position, 1.0)).xyz;\n    gl_Position = worldViewProjection * vec4(position, 1.0);\n}\n\n@end\n\n@export buildin.skybox.fragment\n\nuniform mat4 viewInverse : VIEWINVERSE;\nuniform samplerCube environmentMap;\n\nvarying vec3 v_WorldPosition;\n\nvoid main(){\n    \n    vec3 eyePos = viewInverse[3].xyz;\n    vec3 viewDirection = normalize(v_WorldPosition - eyePos);\n\n    vec3 color = textureCube(environmentMap, viewDirection).xyz;\n\n    gl_FragColor = vec4(color, 1.0);\n}\n@end';});

define('3d/shader/source/util.essl',[],function () { return '// Use light attenuation formula in\n// http://blog.slindev.com/2011/01/10/natural-light-attenuation/\n@export buildin.util.calculate_attenuation\n\nuniform float attenuationFactor : 5.0;\n\nfloat calculateAttenuation(float dist, float range){\n    float attenuation = 1.0;\n    if( range > 0.0){\n        attenuation = dist*dist/(range*range);\n        float att_s = attenuationFactor;\n        attenuation = 1.0/(attenuation*att_s+1.0);\n        att_s = 1.0/(att_s+1.0);\n        attenuation = attenuation - att_s;\n        attenuation /= 1.0 - att_s;\n    }\n    return attenuation;\n}\n\n@end\n\n//http://codeflow.org/entries/2012/aug/02/easy-wireframe-display-with-barycentric-coordinates/\n@export buildin.util.edge_factor\n\nfloat edgeFactor(float width){\n    vec3 d = fwidth(v_Barycentric);\n    vec3 a3 = smoothstep(vec3(0.0), d * width, v_Barycentric);\n    return min(min(a3.x, a3.y), a3.z);\n}\n\n@end\n\n// Pack depth\n// Float value can only be 0.0 - 1.0 ?\n@export buildin.util.pack_depth\nvec4 packDepth( const in float depth ){\n\n    const vec4 bitShifts = vec4( 256.0 * 256.0 * 256.0, 256.0 * 256.0, 256.0, 1.0 );\n\n    const vec4 bit_mask  = vec4( 0.0, 1.0 / 256.0, 1.0 / 256.0, 1.0 / 256.0 );\n    vec4 res = fract( depth * bitShifts );\n    res -= res.xxyz * bit_mask;\n\n    return res;\n}\n@end\n\n@export buildin.util.unpack_depth\nfloat unpackDepth( const in vec4 colour ){\n    const vec4 bitShifts = vec4( 1.0 / ( 256.0 * 256.0 * 256.0 ), 1.0 / ( 256.0 * 256.0 ), 1.0 / 256.0, 1.0 );\n    return dot(colour, bitShifts);\n}\n@end\n\n@export buildin.util.pack_depth_half\nvec2 packDepthHalf( const in float depth ){\n    const vec2 bitShifts = vec2(256.0, 1.0);\n    const vec4 bitMask = vec4(0.0, 1.0/256.0);\n\n    vec2 rg = fract(depth*bitShifts);\n    rg -= rg.xx * bitMask;\n\n    return rg;\n}\n@end\n\n@export buildin.util.unpack_depth_half\nfloat unpackDepthHalf( const in vec2 rg ){\n    const vec4 bitShifts = vec2(1.0/256.0, 1.0);\n    return dot(rg, bitShifts);\n}\n@end';});

/**
 * @export{object} library
 */
define('3d/shader/library',['require','../Shader','_','./source/basic.essl','./source/lambert.essl','./source/phong.essl','./source/wireframe.essl','./source/skybox.essl','./source/util.essl'],function(require) {

    var Shader = require("../Shader");
    var _ = require("_");

    _library = {};

    _pool = {};

    // Example
    // ShaderLibrary.get("buildin.phong", "diffuseMap", "normalMap");
    // Or
    // ShaderLibrary.get("buildin.phong", ["diffuseMap", "normalMap"]);
    // Or
    // ShaderLibrary.get("buildin.phong", {
    //      textures : ["diffuseMap"],
    //      vertexDefines : {},
    //      fragmentDefines : {}
    // })
    function get(name, config) {
        var enabledTextures = [];
        var vertexDefines = {};
        var fragmentDefines = {};
        if (typeof(config) === "string") {
            enabledTextures = Array.prototype.slice.call(arguments, 1);
        }
        else if (toString.call(config) == '[object Object]') {
            enabledTextures = config.textures || [];
            vertexDefines = config.vertexDefines || {};
            fragmentDefines = config.fragmentDefines || {};
        } 
        else if(config instanceof Array) {
            enabledTextures = config;
        }
        var vertexDefineKeys = Object.keys(vertexDefines);
        var fragmentDefineKeys = Object.keys(fragmentDefines);
        enabledTextures.sort(); 
        vertexDefineKeys.sort();
        fragmentDefineKeys.sort();

        var keyArr = [];
        keyArr = keyArr.concat(enabledTextures);
        for (var i = 0; i < vertexDefineKeys.length; i++) {
            keyArr.push(vertexDefines[vertexDefineKeys[i]]);
        }
        for (var i = 0; i < fragmentDefineKeys.length; i++) {
            keyArr.push(fragmentDefines[fragmentDefineKeys[i]]);
        }
        var key = keyArr.join('_');

        if (_pool[key]) {
            return _pool[key];
        } else {
            var source = _library[name];
            if (!source) {
                console.error('Shader "'+name+'"'+' is not in the library');
                return;
            }
            var shader = new Shader({
                "vertex" : source.vertex,
                "fragment" : source.fragment
            })
            _.each(enabledTextures, function(symbol) {
                shader.enableTexture(symbol);
            });
            for (var name in vertexDefines) {
                shader.define('vertex', name, vertexDefines[name]);
            }
            for (var name in fragmentDefines) {
                shader.define('fragment', name, fragmentDefines[name]);
            }
            _pool[key] = shader;
            return shader;
        }
    }

    function put(name, vertex, fragment) {
        _library[name] = {
            vertex : vertex,
            fragment : fragment
        }
    }

    // Some build in shaders
    Shader.import(require('./source/basic.essl'));
    Shader.import(require('./source/lambert.essl'));
    Shader.import(require('./source/phong.essl'));
    Shader.import(require('./source/wireframe.essl'));
    Shader.import(require('./source/skybox.essl'));
    Shader.import(require('./source/util.essl'));
    // Shader.import(require('3d/shader/source/depth.essl'));

    put("buildin.basic", Shader.source("buildin.basic.vertex"), Shader.source("buildin.basic.fragment"));
    put("buildin.lambert", Shader.source("buildin.lambert.vertex"), Shader.source("buildin.lambert.fragment"));
    put("buildin.phong", Shader.source("buildin.phong.vertex"), Shader.source("buildin.phong.fragment"));
    put("buildin.wireframe", Shader.source("buildin.wireframe.vertex"), Shader.source("buildin.wireframe.fragment"));
    put("buildin.skybox", Shader.source("buildin.skybox.vertex"), Shader.source("buildin.skybox.fragment"));
    // put("buildin.depth", Shader.source("buildin.depth.vertex"), Shader.source("buildin.depth.fragment"));

    return {
        get : get,
        put : put
    }
});
define('3d/plugin/Skybox',['require','../Mesh','../geometry/Cube','../Shader','../Material','../shader/library'],function(require) {

    var Mesh = require('../Mesh');
    var CubeGeometry = require('../geometry/Cube');
    var Shader = require('../Shader');
    var Material = require('../Material');
    var shaderLibrary = require('../shader/library');

    var skyboxShader = new Shader({
        vertex : Shader.source("buildin.skybox.vertex"), 
        fragment : Shader.source("buildin.skybox.fragment")
    });

    var Skybox = Mesh.derive(function() {

        var material = new Material({
            shader : skyboxShader,
            depthMask : false
        });
        
        return {
            geometry : new CubeGeometry(),
            material : material,

            renderer : null,
            camera : null,

            culling : false
        }
    }, function() {
        var camera = this.camera;
        var renderer = this.renderer;
        if (renderer) {
            this.attachRenderer(renderer);
        }
        if (camera) {
            this.attachCamera(camera);
        }
    }, {
        attachRenderer : function(renderer) {
            renderer.on("beforerender:opaque", this._beforeRenderOpaque, this);
        },

        detachRenderer : function(renderer) {
            renderer.off("beforerender:opaque", this._beforeRenderOpaque, this);  
        },

        attachCamera : function(camera) {
            camera.on('afterupdate', this._afterUpdateCamera, this);
        },

        detachCamera : function(camera) {
            camera.off('afterupdate', this._afterUpdateCamera, this);
        },

        _beforeRenderOpaque : function(renderer, opaque) {
            renderer.renderQueue([this], this.camera, null, true);
        },

        _afterUpdateCamera : function(camera) {
            this.position.copy(camera.getWorldPosition());
            this.update();
        }
    });

    return Skybox;
});
define('3d/plugin/Skydome',['require','../Mesh','../geometry/Sphere','../Shader','../Material','../shader/library'],function(require) {

    var Mesh = require('../Mesh');
    var SphereGeometry = require('../geometry/Sphere');
    var Shader = require('../Shader');
    var Material = require('../Material');
    var shaderLibrary = require('../shader/library');

    var skydomeShader = new Shader({
        vertex : Shader.source("buildin.basic.vertex"),
        fragment : Shader.source("buildin.basic.fragment")
    });
    skydomeShader.enableTexture("diffuseMap");

    var Skydome = Mesh.derive(function() {

        var material = new Material({
            shader : skydomeShader,
            depthMask : false
        });
        
        return {
            geometry : new SphereGeometry({
                widthSegments : 30,
                heightSegments : 30,
                // thetaLength : Math.PI / 2
            }),
            material : material,

            renderer : null,
            camera : null
        }
    }, function() {
        var camera = this.camera;
        var renderer = this.renderer;
        if (renderer) {
            this.attachRenderer(renderer);
        }
        if (camera) {
            this.attachCamera(camera);
        }
    }, {
        attachRenderer : function(renderer) {
            renderer.on("beforerender:opaque", this._beforeRenderOpaque, this);
        },

        detachRenderer : function(renderer) {
            renderer.off("beforerender:opaque", this._beforeRenderOpaque, this);  
        },

        attachCamera : function(camera) {
            camera.on('afterupdate', this._afterUpdateCamera, this);
        },

        detachCamera : function(camera) {
            camera.off('afterupdate', this._afterUpdateCamera, this);
        },

        _beforeRenderOpaque : function(renderer, opaque) {
            renderer.renderQueue([this], this.camera, null, true);
        },

        _afterUpdateCamera : function(camera) {
            this.position.copy(camera.getWorldPosition());
            this.update();
        }
    });

    return Skydome;
});
define('core/Vector4',['require','glmatrix'], function(require) {

    

    var glMatrix = require("glmatrix");
    var vec4 = glMatrix.vec4;

    var Vector4 = function(x, y, z, w) {
        
        x = x || 0;
        y = y || 0;
        z = z || 0;
        w = w || 0;

        this._array = vec4.fromValues(x, y, z, w);
        // Dirty flag is used by the Node to determine
        // if the matrix is updated to latest
        this._dirty = true;
    }

    Vector4.prototype = {

        constructor : Vector4,

        get x() {
            return this._array[0];
        },

        set x(value) {
            this._array[0] = value;
            this._dirty = true;
        },

        get y() {
            this._array[1] = value;
            this._dirty = true;
        },

        set y(value) {
            return this._array[1];
        },

        get z() {
            return this._array[2];
        },

        set z(value) {
            this._array[2] = value;
            this._dirty = true;
        },

        get w() {
            return this._array[3];
        },

        set w(value) {
            this._array[3] = value;
            this._dirty = true;
        },

        add : function(b) {
            vec4.add( this._array, this._array, b._array );
            this._dirty = true;
            return this;
        },

        set : function(x, y, z, w) {
            this._array[0] = x;
            this._array[1] = y;
            this._array[2] = z;
            this._array[3] = w;
            this._dirty = true;
            return this;
        },

        clone : function() {
            return new Vector4( this.x, this.y, this.z, this.w);
        },

        copy : function(b) {
            vec4.copy( this._array, b._array );
            this._dirty = true;
            return this;
        },

        cross : function(out, b) {
            vec4.cross(out._array, this._array, b._array);
            return this;
        },

        dist : function(b) {
            return vec4.dist(this._array, b._array);
        },

        distance : function(b) {
            return vec4.distance(this._array, b._array);
        },

        div : function(b) {
            vec4.div(this._array, this._array, b._array);
            this._dirty = true;
            return this;
        },

        divide : function(b) {
            vec4.divide(this._array, this._array, b._array);
            this._dirty = true;
            return this;
        },

        dot : function(b) {
            return vec4.dot(this._array, b._array);
        },

        len : function() {
            return vec4.len(this._array);
        },

        length : function() {
            return vec4.length(this._array);
        },
        /**
         * Perform linear interpolation between a and b
         */
        lerp : function(a, b, t) {
            vec4.lerp(this._array, a._array, b._array, t);
            this._dirty = true;
            return this;
        },

        min : function(b) {
            vec2.min(this._array, this._array, b._array);
            this._dirty = true;
            return this;
        },

        max : function(b) {
            vec2.max(this._array, this._array, b._array);
            this._dirty = true;
            return this;
        },

        mul : function(b) {
            vec4.mul(this._array, this._array, b._array);
            this._dirty = true;
            return this;
        },

        multiply : function(b) {
            vec4.multiply(this._array, this._array, b._array);
            this._dirty = true;
            return this;
        },

        negate : function() {
            vec4.negate(this._array, this._array);
            this._dirty = true;
            return this;
        },

        normalize : function() {
            vec4.normalize(this._array, this._array);
            this._dirty = true;
            return this;
        },

        random : function(scale) {
            vec4.random(this._array, scale);
            this._dirty = true;
            return this;
        },

        scale : function(s) {
            vec4.scale(this._array, this._array, s);
            this._dirty = true;
            return this;
        },
        /**
         * add b by a scaled factor
         */
        scaleAndAdd : function(b, s) {
            vec4.scaleAndAdd(this._array, this._array, b._array, s);
            this._dirty = true;
            return this;
        },

        sqrDist : function(b) {
            return vec4.sqrDist(this._array, b._array);
        },

        squaredDistance : function(b) {
            return vec4.squaredDistance(this._array, b._array);
        },

        sqrLen : function() {
            return vec4.sqrLen(this._array);
        },

        squaredLength : function() {
            return vec4.squaredLength(this._array);
        },

        sub : function(b) {
            vec4.sub(this._array, this._array, b._array);
            this._dirty = true;
            return this;
        },

        subtract : function(b) {
            vec4.subtract(this._array, this._array, b._array);
            this._dirty = true;
            return this;
        },

        transformMat4 : function(m) {
            vec4.transformMat4(this._array, this._array, m._array);
            this._dirty = true;
            return this;
        },

        transformQuat : function(q) {
            vec4.transformQuat(this._array, this._array, q._array);
            this._dirty = true;
            return this;
        },     

        toString : function() {
            return "[" + Array.prototype.join.call(this._array, ",") + "]";
        }
    }

    return Vector4;
} );
define('3d/prePass/Reflection',['require','core/Base','core/Vector4'],function(require) {

    var Base = require("core/Base");
    var Vector4 = require("core/Vector4");

    var ReflectionPass = Base.derive(function() {
        // Vector4
        plane : new Vector4(0, 1, 0, 0)
    }, {
        render : function(renderer, scene, camera) {

        }
    });

    return ReflectionPass;
});
define('3d/prePass/shadowmap.essl',[],function () { return '\n@export buildin.sm.depth.vertex\n\nuniform mat4 worldViewProjection : WORLDVIEWPROJECTION;\n\nattribute vec3 position : POSITION;\n\n#ifdef SKINNING\nattribute vec3 weight : WEIGHT;\nattribute vec4 joint : JOINT;\n\nuniform mat4 invBindMatrix[JOINT_NUMBER] : INV_BIND_MATRIX;\n#endif\n\nvarying vec4 v_ViewPosition;\nvoid main(){\n    \n    vec3 skinnedPosition = position;\n    \n    #ifdef SKINNING\n        mat4 skinMatrix;\n        if (joint.x >= 0.0){\n            skinMatrix = invBindMatrix[int(joint.x)] * weight.x;\n        }\n        if (joint.y >= 0.0){\n            skinMatrix += invBindMatrix[int(joint.y)] * weight.y;\n        }\n        if (joint.z >= 0.0){\n            skinMatrix += invBindMatrix[int(joint.z)] * weight.z;\n        }\n        if (joint.w >= 0.0){\n            skinMatrix += invBindMatrix[int(joint.w)] * (1.0-weight.x-weight.y-weight.z);\n        }\n        skinnedPosition = (skinMatrix * vec4(position, 1.0)).xyz;\n    #endif\n\n    v_ViewPosition = worldViewProjection * vec4(skinnedPosition, 1.0);\n    gl_Position = v_ViewPosition;\n\n}\n@end\n\n@export buildin.sm.depth.fragment\n\nvarying vec4 v_ViewPosition;\n\n#ifdef USE_VSM\n#extension GL_OES_standard_derivatives : enable\n#endif\n\n@import buildin.util.pack_depth\n\nvoid main(){\n    // Whats the difference between gl_FragCoord.z and this v_ViewPosition\n    // gl_FragCoord consider the polygon offset ?\n    float depth = v_ViewPosition.z / v_ViewPosition.w;\n    // float depth = gl_FragCoord.z / gl_FragCoord.w;\n\n    #ifdef USE_VSM\n        depth = depth * 0.5 + 0.5;\n        float moment1 = depth;\n        float moment2 = depth * depth;\n\n        // Adjusting moments using partial derivative\n        float dx = dFdx(depth);\n        float dy = dFdy(depth);\n        moment2 += 0.25*(dx*dx+dy*dy);\n\n        gl_FragColor = vec4(moment1, moment2, 0.0, 1.0);\n    #else\n        gl_FragColor = packDepth(depth * 0.5 + 0.5);\n    #endif\n}\n@end\n\n@export buildin.sm.debug_depth\n\nuniform sampler2D depthMap;\nvarying vec2 v_Texcoord;\n\n@import buildin.util.unpack_depth\n\nvoid main() {\n    vec4 tex = texture2D(depthMap, v_Texcoord);\n    #ifdef USE_VSM\n        gl_FragColor = vec4(tex.rgb, 1.0);\n    #else\n        float depth = unpackDepth(tex);\n        gl_FragColor = vec4(depth, depth, depth, 1.0);\n    #endif\n}\n\n@end\n\n\n@export buildin.sm.distance.vertex\n\nuniform mat4 worldViewProjection : WORLDVIEWPROJECTION;\nuniform mat4 world : WORLD;\n\nattribute vec3 position : POSITION;\n\n#ifdef SKINNING\nattribute vec3 boneWeight;\nattribute vec4 boneIndex;\n\nuniform mat4 boneMatrices[BONE_MATRICES_NUMBER];\n#endif\n\nvarying vec3 v_WorldPosition;\n\nvoid main(){\n\n    vec3 skinnedPosition = position;\n    #ifdef SKINNING\n        mat4 skinMatrix;\n        if(boneIndex.x >= 0.0){\n            skinMatrix = boneMatrices[int(boneIndex.x)] * boneWeight.x;\n        }\n        if(boneIndex.y >= 0.0){\n            skinMatrix += boneMatrices[int(boneIndex.y)] * boneWeight.y;\n        }\n        if(boneIndex.z >= 0.0){\n            skinMatrix += boneMatrices[int(boneIndex.z)] * boneWeight.z;\n        }\n        if(boneIndex.w >= 0.0){\n            skinMatrix += boneMatrices[int(boneIndex.w)] * (1.0-boneWeight.x-boneWeight.y-boneWeight.z);\n        }\n        skinnedPosition = (skinMatrix * vec4(position, 1.0)).xyz;\n    #endif\n\n    gl_Position = worldViewProjection * vec4( skinnedPosition , 1.0 );\n    v_WorldPosition = ( world * vec4(skinnedPosition, 1.0) ).xyz;\n}\n\n@end\n\n@export buildin.sm.distance.fragment\n\nuniform vec3 lightPosition;\nuniform float range : 100;\n\nvarying vec3 v_WorldPosition;\n\n@import buildin.util.pack_depth\n\nvoid main(){\n    float dist = distance(lightPosition, v_WorldPosition);\n    #ifdef USE_VSM\n        gl_FragColor = vec4(dist, dist * dist, 0.0, 0.0);\n    #else\n        dist = dist / range;\n        gl_FragColor = packDepth(dist);\n    #endif\n}\n@end\n\n@export buildin.plugin.compute_shadow_map\n\n#if defined(SPOT_LIGHT_SHADOWMAP_NUMBER) || defined(DIRECTIONAL_LIGHT_SHADOWMAP_NUMBER) || defined(POINT_LIGHT_SHADOWMAP_NUMBER)\n\n#ifdef SPOT_LIGHT_SHADOWMAP_NUMBER\nuniform sampler2D spotLightShadowMaps[SPOT_LIGHT_SHADOWMAP_NUMBER];\nuniform mat4 spotLightMatrices[SPOT_LIGHT_SHADOWMAP_NUMBER];\nuniform float spotLightBiases[SPOT_LIGHT_SHADOWMAP_NUMBER];\n#endif\n\n#ifdef DIRECTIONAL_LIGHT_SHADOWMAP_NUMBER\nuniform sampler2D directionalLightShadowMaps[DIRECTIONAL_LIGHT_SHADOWMAP_NUMBER];\nuniform mat4 directionalLightMatrices[DIRECTIONAL_LIGHT_SHADOWMAP_NUMBER];\nuniform float directionalLightBiases[DIRECTIONAL_LIGHT_SHADOWMAP_NUMBER];\n#endif\n\n#ifdef POINT_LIGHT_SHADOWMAP_NUMBER\nuniform samplerCube pointLightShadowMaps[POINT_LIGHT_SHADOWMAP_NUMBER];\nuniform float pointLightRanges[POINT_LIGHT_SHADOWMAP_NUMBER];\n#endif\n\nuniform bool shadowEnabled : true;\n\n@import buildin.util.unpack_depth\n\n#if defined(DIRECTIONAL_LIGHT_NUMBER) || defined(SPOT_LIGHT_SHADOWMAP_NUMBER)\n\nfloat tapShadowMap(sampler2D map, vec2 uv, float z, float bias){\n    vec4 tex = texture2D(map, uv);\n    return (unpackDepth(tex) * 2.0 - 1.0) + bias < z ? 0.0 : 1.0;\n}\n\nfloat pcf(sampler2D map, vec2 uv, float z, float bias){\n\n    float shadowContrib = tapShadowMap(map, uv, z, bias);\n    float offset = 1.0/1024.0;\n    shadowContrib += tapShadowMap(map, uv+vec2(offset, 0.0), z, bias);\n    shadowContrib += tapShadowMap(map, uv+vec2(offset, offset), z, bias);\n    shadowContrib += tapShadowMap(map, uv+vec2(-offset, offset), z, bias);\n    shadowContrib += tapShadowMap(map, uv+vec2(0.0, offset), z, bias);\n    shadowContrib += tapShadowMap(map, uv+vec2(-offset, 0.0), z, bias);\n    shadowContrib += tapShadowMap(map, uv+vec2(-offset, -offset), z, bias);\n    shadowContrib += tapShadowMap(map, uv+vec2(offset, -offset), z, bias);\n    shadowContrib += tapShadowMap(map, uv+vec2(0.0, -offset), z, bias);\n\n    return shadowContrib / 9.0;\n}\nfloat chebyshevUpperBound(vec2 moments, float z){\n    float p = 0.0;\n    z = z * 0.5 + 0.5;\n    if (z <= moments.x) {\n        p = 1.0;\n    }\n    float variance = moments.y - moments.x * moments.x;\n    // http://fabiensanglard.net/shadowmappingVSM/\n    variance = max(variance, 0.0000001);\n    // Compute probabilistic upper bound. \n    float mD = moments.x - z;\n    float pMax = variance / (variance + mD * mD);\n    // Now reduce light-bleeding by removing the [0, x] tail and linearly rescaling (x, 1]\n    // TODO : bleedBias parameter ?\n    pMax = clamp((pMax-0.5)/(1.0-0.5), 0.0, 1.0);\n    return max(p, pMax);\n}\nfloat computeShadowContrib(sampler2D map, mat4 lightVPM, vec3 position, float bias){\n    \n    vec4 posInLightSpace = lightVPM * vec4(v_WorldPosition, 1.0);\n    posInLightSpace.xyz /= posInLightSpace.w;\n    float z = posInLightSpace.z;\n    // In frustum\n    if(all(greaterThan(posInLightSpace.xyz, vec3(-1.0))) &&\n        all(lessThan(posInLightSpace.xyz, vec3(1.0)))){\n        // To texture uv\n        vec2 uv = (posInLightSpace.xy+1.0) / 2.0;\n\n        #ifdef USE_VSM\n            vec2 moments = texture2D(map, uv).xy;\n            return chebyshevUpperBound(moments, z);\n        #else\n            return pcf(map, uv, z, bias);\n        #endif\n    }\n    return 1.0;\n}\n\n#endif\n\n#ifdef POINT_LIGHT_SHADOWMAP_NUMBER\n\nfloat computeShadowOfCube(samplerCube map, vec3 direction, float range){\n    vec4 shadowTex = textureCube(map, direction);\n    float dist = length(direction);\n\n    #ifdef USE_VSM\n        vec2 moments = shadowTex.xy;\n        float variance = moments.y - moments.x * moments.x;\n        float mD = moments.x - dist;\n        float p = variance / (variance + mD * mD);\n        if(moments.x + 0.001 < dist){\n            return clamp(p, 0.0, 1.0);\n        }else{\n            return 1.0;\n        }\n    #else\n        if(unpackDepth(shadowTex) * range + 0.002 < dist){\n            return 0.0;\n        }else{\n            return 1.0;\n        }\n    #endif\n}\n#endif\n\n#if defined(SPOT_LIGHT_SHADOWMAP_NUMBER)\n\nvoid computeShadowOfSpotLights( vec3 position, inout float shadowContribs[SPOT_LIGHT_NUMBER]  ){\n    for( int i = 0; i < SPOT_LIGHT_SHADOWMAP_NUMBER; i++){\n        float shadowContrib = computeShadowContrib( spotLightShadowMaps[i], spotLightMatrices[i], position, spotLightBiases[i] );\n        shadowContribs[i] = shadowContrib;\n    }\n    // set default fallof of rest lights\n    for( int i = SPOT_LIGHT_SHADOWMAP_NUMBER; i < SPOT_LIGHT_NUMBER; i++){\n        shadowContribs[i] = 1.0;\n    }\n}\n\n#endif\n\n\n#if defined(DIRECTIONAL_LIGHT_SHADOWMAP_NUMBER)\n\nvoid computeShadowOfDirectionalLights( vec3 position, inout float shadowContribs[DIRECTIONAL_LIGHT_NUMBER] ){\n    for( int i = 0; i < DIRECTIONAL_LIGHT_SHADOWMAP_NUMBER; i++){\n        float shadowContrib = computeShadowContrib(directionalLightShadowMaps[i], directionalLightMatrices[i], position, directionalLightBiases[i]);\n        shadowContribs[i] = shadowContrib;\n    }\n    // set default fallof of rest lights\n    for( int i = DIRECTIONAL_LIGHT_SHADOWMAP_NUMBER; i < DIRECTIONAL_LIGHT_NUMBER; i++){\n        shadowContribs[i] = 1.0;\n    }\n}\n\n#endif\n\n\n#if defined(POINT_LIGHT_SHADOWMAP_NUMBER)\n\nvoid computeShadowOfPointLights( vec3 position, inout float shadowContribs[POINT_LIGHT_NUMBER]  ){\n    for( int i = 0; i < POINT_LIGHT_SHADOWMAP_NUMBER; i++){\n        vec3 lightPosition = pointLightPosition[i];\n        vec3 direction = position - lightPosition;\n        shadowContribs[i] = computeShadowOfCube(pointLightShadowMaps[i], direction, pointLightRanges[i]);\n    }\n    for( int i = POINT_LIGHT_SHADOWMAP_NUMBER; i < POINT_LIGHT_NUMBER; i++){\n        shadowContribs[i] = 1.0;\n    }\n}\n\n#endif\n\n#endif\n\n@end';});

define('3d/prePass/ShadowMap',['require','core/Base','core/Vector3','../Shader','../Light','../Mesh','../light/Spot','../light/Directional','../light/Point','../shader/library','../Material','../FrameBuffer','../texture/Texture2D','../texture/TextureCube','../glenum','../camera/Perspective','../camera/Orthographic','../compositor/Pass','../compositor/texturePool','core/Matrix4','_','./shadowmap.essl'],function(require) {

    var Base = require("core/Base");
    var Vector3 = require("core/Vector3");
    var Shader = require("../Shader");
    var Light = require("../Light");
    var Mesh = require("../Mesh");
    var SpotLight = require("../light/Spot");
    var DirectionalLight = require("../light/Directional");
    var PointLight = require("../light/Point");
    var shaderLibrary = require("../shader/library");
    var Material = require("../Material");
    var FrameBuffer = require("../FrameBuffer");
    var Texture2D = require("../texture/Texture2D");
    var TextureCube = require("../texture/TextureCube");
    var glenum = require("../glenum");
    var PerspectiveCamera = require("../camera/Perspective");
    var OrthoCamera = require("../camera/Orthographic");

    var Pass = require("../compositor/Pass");
    var texturePool = require("../compositor/texturePool");

    var Matrix4 = require("core/Matrix4");

    var _ = require("_");

    var frameBuffer = new FrameBuffer();

    Shader.import(require('./shadowmap.essl'));

    var ShadowMapPlugin = Base.derive(function() {
        return {
            useVSM : false,

            _textures : {},

            _cameras : {},

            _shadowMapNumber : {
                'POINT_LIGHT' : 0,
                'DIRECTIONAL_LIGHT' : 0,
                'SPOT_LIGHT' : 0
            },

            _meshMaterials : {},
            _depthMaterials : {},
            _distanceMaterials : {},

            _meshCastShadow : [],
            _lightCastShadow : [],
            _meshReceiveShadow : []

        }
    }, function() {
        // Gaussian filter pass for VSM
        this._gaussianPassH = new Pass({
            fragment : Shader.source('buildin.compositor.gaussian_blur_h')
        });
        this._gaussianPassV = new Pass({
            fragment : Shader.source('buildin.compositor.gaussian_blur_v')
        });
        this._gaussianPassH.setUniform("blurSize", 0.5);
        this._gaussianPassV.setUniform("blurSize", 0.5);

        this._outputDepthPass = new Pass({
            fragment : Shader.source('buildin.sm.debug_depth')
        });
        if (this.useVSM) {
            this._outputDepthPass.material.shader.define("fragment", "USE_VSM");
        }
    }, {

        render : function(renderer, scene) {
            this.trigger('beforerender', this, renderer, scene);
            this._renderShadowPass(renderer, scene);
            this.trigger('afterrender', this, renderer, scene);
        },

        renderDebug : function(renderer) {
            var viewportInfo = renderer.viewportInfo;
            var x = 0, y = 0;
            var width = viewportInfo.width / 4;
            var height = width;
            for (var name in this._textures) {
                renderer.setViewport(x, y, width, height);
                this._outputDepthPass.setUniform('depthMap', this._textures[name]);
                this._outputDepthPass.render(renderer);
                x += width;
            }
            renderer.setViewport(viewportInfo);
        },

        _bindDepthMaterial : function(renderQueue) {
            for (var i = 0; i < renderQueue.length; i++) {
                var mesh = renderQueue[i];
                var depthMaterial = this._depthMaterials[mesh.joints.length];
                if (mesh.material !== depthMaterial) {
                    if (!depthMaterial) {
                        // Skinned mesh
                        depthMaterial = new Material({
                            shader : new Shader({
                                vertex : Shader.source("buildin.sm.depth.vertex"),
                                fragment : Shader.source("buildin.sm.depth.fragment")
                            })
                        });
                        if (mesh.skeleton) {
                            depthMaterial.shader.define('vertex', 'SKINNING');
                            depthMaterial.shader.define('vertex', 'JOINT_NUMBER', mesh.joints.length);   
                        }
                        this._depthMaterials[mesh.joints.length] = depthMaterial;
                    }

                    this._meshMaterials[mesh.__GUID__] = mesh.material;
                    mesh.material = depthMaterial;

                    if (this.useVSM) {
                        depthMaterial.shader.define("fragment", "USE_VSM");
                    } else {
                        depthMaterial.shader.unDefine("fragment", "USE_VSM");
                    }
                }
            }
        },

        _bindDistanceMaterial : function(renderQueue, light) {
            for (var i = 0; i < renderQueue.length; i++) {
                var mesh = renderQueue[i];
                var distanceMaterial = this._distanceMaterials[mesh.joints.length];
                if (mesh.material !== distanceMaterial) {
                    if (!distanceMaterial) {
                        // Skinned mesh
                        distanceMaterial = new Material({
                            shader : new Shader({
                                vertex : Shader.source("buildin.sm.distance.vertex"),
                                fragment : Shader.source("buildin.sm.distance.fragment")
                            })
                        });
                        if (mesh.skeleton) {
                            distanceMaterial.shader.define('vertex', 'SKINNING');
                            distanceMaterial.shader.define('vertex', 'JOINT_NUMBER', mesh.joints.length);   
                        }
                        this._distanceMaterials[mesh.joints.length] = distanceMaterial;
                    }

                    this._meshMaterials[mesh.__GUID__] = mesh.material;
                    mesh.material = distanceMaterial;

                    if (this.useVSM) {
                        distanceMaterial.shader.define("fragment", "USE_VSM");
                    } else {
                        distanceMaterial.shader.unDefine("fragment", "USE_VSM");
                    }
                    distanceMaterial.set("lightPosition", light.position._array);
                    distanceMaterial.set("range", light.range * 5);
                }
            }
        },

        _restoreMaterial : function(renderQueue) {
            for (var i = 0; i < renderQueue.length; i++) {
                var mesh = renderQueue[i];
                mesh.material = this._meshMaterials[mesh.__GUID__];
            }
        },

        _update : function(parent) {
            for (var i = 0; i < parent._children.length; i++) {
                var child = parent._children[i];
                if (!child.visible) {
                    continue;
                }
                if (child.material && child.material.shader) {
                    if (child.castShadow) {
                        this._meshCastShadow.push(child);
                    }
                    if (child.receiveShadow) {
                        this._meshReceiveShadow.push(child);
                        child.material.set('shadowEnabled', 1);
                    } else {
                        child.material.set('shadowEnabled', 0);
                    }
                    if (this.useVSM) {
                        child.material.shader.define('fragment', 'USE_VSM');
                    } else {
                        child.material.shader.unDefine('fragment', 'USE_VSM');
                    }
                } else if (child instanceof Light) {
                    if (child.castShadow) {
                        this._lightCastShadow.push(child);
                    }
                }

                if (child._children.length > 0) {
                    this._update(child);
                }
            }
        },

        _renderShadowPass : function(renderer, scene) {
            var self = this;

            // reset
            for (var name in this._shadowMapNumber) {
                this._shadowMapNumber[name] = 0;
            }
            this._lightCastShadow.length = 0;
            this._meshCastShadow.length = 0;
            this._meshReceiveShadow.length = 0;
            var renderQueue = this._meshCastShadow;

            var _gl = renderer.gl;

            scene.update();

            this._update(scene);

            _gl.enable(_gl.DEPTH_TEST);
            _gl.depthMask(true);
            _gl.disable(_gl.BLEND);

            _gl.clearColor(0.0, 0.0, 0.0, 0.0);
            _gl.clear(_gl.COLOR_BUFFER_BIT | _gl.DEPTH_BUFFER_BIT);

            var targets = ['px', 'nx', 'py', 'ny', 'pz', 'nz'];
            var targetMap = {
                'px' : _gl.TEXTURE_CUBE_MAP_POSITIVE_X,
                'py' : _gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
                'pz' : _gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
                'nx' : _gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
                'ny' : _gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
                'nz' : _gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
            }
            var cursor = 0;

            // Shadow uniforms
            var spotLightShadowMaps = [];
            var spotLightMatrices = [];
            var spotLightBiases = [];
            var directionalLightShadowMaps = [];
            var directionalLightMatrices = [];
            var directionalLightBiases = [];
            var pointLightShadowMaps = [];
            var pointLightRanges = [];

            // Create textures for shadow map
            for (var i = 0; i < this._lightCastShadow.length; i++) {
                var light = this._lightCastShadow[i];
                if (light instanceof SpotLight ||
                    light instanceof DirectionalLight) {
                    
                    this._bindDepthMaterial(renderQueue);

                    var texture = this._getTexture(light.__GUID__, light);
                    var camera = this._getCamera(light.__GUID__, light);

                    frameBuffer.attach(renderer.gl, texture);
                    frameBuffer.bind(renderer);

                    _gl.clear(_gl.COLOR_BUFFER_BIT | _gl.DEPTH_BUFFER_BIT);

                    renderer._scene = scene;
                    renderer.renderQueue(renderQueue, camera, null, true);

                    frameBuffer.unbind(renderer);

                    // Filter for VSM
                    if (this.useVSM) {
                        this._gaussianFilter(renderer, texture, 512);
                    }
        
                    var matrix = new Matrix4();
                    matrix.copy(camera.worldTransform)
                        .invert()
                        .multiplyLeft(camera.projectionMatrix);

                    if (light instanceof SpotLight) {
                        spotLightShadowMaps.push(texture);
                        spotLightMatrices.push(matrix._array);
                        spotLightBiases.push(light.shadowBias);
                    } else {
                        directionalLightShadowMaps.push(texture);
                        directionalLightMatrices.push(matrix._array);
                        directionalLightBiases.push(light.shadowBias);
                    }

                } else if (light instanceof PointLight) {
                    
                    var texture = this._getTexture(light.__GUID__, light);
                    pointLightShadowMaps.push(texture);
                    pointLightRanges.push(light.range * 5);

                    this._bindDistanceMaterial(renderQueue, light);
                    for (var i = 0; i < 6; i++) {
                        var target = targets[i];
                        var camera = this._getCamera(light.__GUID__, light, target);

                        frameBuffer.attach(renderer.gl, texture, _gl.COLOR_ATTACHMENT0, targetMap[target]);
                        frameBuffer.bind(renderer);

                        _gl.clear(_gl.COLOR_BUFFER_BIT | _gl.DEPTH_BUFFER_BIT);

                        renderer._scene = scene;

                        renderer.renderQueue(renderQueue, camera, null, true);

                        frameBuffer.unbind(renderer);
                    }

                }

                this._shadowMapNumber[light.type]++;
            };

            this._restoreMaterial(renderQueue);

            for (var i = 0; i < this._meshReceiveShadow.length; i++) {
                var mesh = this._meshReceiveShadow[i];
                var material = mesh.material;

                var shader = material.shader;

                var shaderNeedsUpdate = false;
                for (var name in this._shadowMapNumber) {
                    var number = this._shadowMapNumber[name];
                    var key = name + "_SHADOWMAP_NUMBER";

                    if (shader.fragmentDefines[key] !== number &&
                        number > 0) {
                        shader.fragmentDefines[key] = number;
                        shaderNeedsUpdate = true;
                    }
                }
                if (shaderNeedsUpdate) {
                    shader.dirty();
                }

                material.set({
                    "spotLightShadowMaps" : spotLightShadowMaps,
                    "spotLightMatrices" : spotLightMatrices,
                    "spotLightBiases" : spotLightBiases,
                    "directionalLightShadowMaps" : directionalLightShadowMaps,
                    "directionalLightBiases" : directionalLightBiases,
                    "directionalLightMatrices" : directionalLightMatrices,
                    "pointLightShadowMaps" : pointLightShadowMaps,
                    "pointLightRanges" : pointLightRanges
                });
            }
        },

        _gaussianFilter : function(renderer, texture, size) {
            var parameter = {
                width : size,
                height : size,
                type : glenum.FLOAT,
                wrapS : glenum.MIRRORED_REPEAT,
                wrapT : glenum.MIRRORED_REPEAT
            };
            var _gl = renderer.gl;
            var tmpTexture = texturePool.get(parameter);
            
            frameBuffer.attach(_gl, tmpTexture);
            frameBuffer.bind(renderer);
            this._gaussianPassH.setUniform("texture", texture);
            this._gaussianPassH.setUniform("imageHeight", size);
            this._gaussianPassH.render(renderer);
            frameBuffer.unbind(renderer);

            frameBuffer.attach(_gl, texture);
            frameBuffer.bind(renderer);
            this._gaussianPassV.setUniform("texture", tmpTexture);
            this._gaussianPassV.setUniform("imageWidth", size);
            this._gaussianPassV.render(renderer);
            frameBuffer.unbind(renderer);

            texturePool.put(tmpTexture);
        },

        _getTexture : function(key, light) {
            var texture = this._textures[key];
            var resolution = light.shadowResolution || 512;
            var needsUpdate = false;
            if (texture) {
                if (texture.width !== resolution) {
                    texture.dispose();
                    needsUpdate = true;
                }
            } else{
                needsUpdate = true;
            }
            if (needsUpdate) {
                if (light instanceof PointLight) {
                    texture = new TextureCube();
                } else {
                    texture = new Texture2D();
                }
                texture.width = resolution;
                texture.height = resolution;
                if (this.useVSM) {
                    texture.wrapT = glenum.MIRRORED_REPEAT;
                    texture.wrapS = glenum.MIRRORED_REPEAT;
                    texture.type = glenum.FLOAT;
                } else {
                    texture.minFilter = glenum.NEAREST;
                    texture.magFilter = glenum.NEAREST;
                    texture.useMipmap = false;
                }
                this._textures[key] = texture;
            }

            return texture;
        },

        _getCamera : function(key, light, target) {
            var camera = this._cameras[key];
            if (target && !camera) {
                camera = this._cameras[key] = {};
            }
            if (target) {
                camera = camera[target];   
            }
            if (!camera) {
                if (light instanceof SpotLight ||
                    light instanceof PointLight) {
                    camera = new PerspectiveCamera({
                        near : 0.1
                    });
                } else if (light instanceof DirectionalLight) {
                    camera = new OrthoCamera(light.shadowCamera);
                }
                if (target) {
                    this._cameras[key][target] = camera;
                } else {
                    this._cameras[key] = camera;
                }
            }
            if (light instanceof SpotLight) {
                // Update properties
                camera.fov = light.penumbraAngle * 2;
                camera.far = light.range;
            }
            if (light instanceof PointLight) {
                camera.far = light.range;
                camera.fov = 90;

                camera.position.set(0, 0, 0);
                switch (target) {
                    case 'px':
                        camera.lookAt(px, ny);
                        break;
                    case 'nx':
                        camera.lookAt(nx, ny);
                        break;
                    case 'py':
                        camera.lookAt(py, pz);
                        break;
                    case 'ny':
                        camera.lookAt(ny, nz);
                        break;
                    case 'pz':
                        camera.lookAt(pz, ny);
                        break;
                    case 'nz':
                        camera.lookAt(nz, ny);
                        break;
                }
                camera.position.copy(light.position);
                camera.update();

            }else{
                camera.worldTransform.copy(light.worldTransform);
            }
            camera.updateProjectionMatrix();

            return camera;
        },

        dispose : function(renderer) {
            var _gl = renderer;
    
            for (var guid in this._depthMaterials) {
                var mat = this._depthMaterials[guid];
                mat.dispose();
            }
            for (var guid in this._distanceMaterials) {
                var mat = this._distanceMaterials[guid];
                mat.dispose();
            }

            for (var name in this._textures) {
                this._textures[name].dispose(_gl);
            }

            this._depthMaterials = {};
            this._distanceMaterials = {};
            this._textures = {};
            this._cameras = {};
            this._shadowMapNumber = {
                'POINT_LIGHT' : 0,
                'DIRECTIONAL_LIGHT' : 0,
                'SPOT_LIGHT' : 0
            };
            this._meshMaterials = {};

        }
    });
    
    var px = new Vector3(1, 0, 0);
    var nx = new Vector3(-1, 0, 0);
    var py = new Vector3(0, 1, 0);
    var ny = new Vector3(0, -1, 0);
    var pz = new Vector3(0, 0, 1);
    var nz = new Vector3(0, 0, -1);

    return ShadowMapPlugin;
});
/**
 *
 * @export{object} mesh
 */
define('3d/util/mesh',['require','../Geometry','../Mesh','../Node','../Material','../Shader','glmatrix','_'],function(require) {
    
    var Geometry = require("../Geometry");
    var Mesh = require("../Mesh");
    var Node = require("../Node");
    var Material = require("../Material");
    var Shader = require("../Shader");
    var glMatrix = require("glmatrix");
    var _ = require("_");
    var mat4 = glMatrix.mat4;
    var vec3 = glMatrix.vec3;

    var arraySlice = Array.prototype.slice;

    var ret = {
        /**
         * Merge multiple meshes to one.
         * Note that these meshes must have the same material
         */
        merge : function(meshes, clone) {

            if (! meshes.length) {
                return;
            }
            var clone = typeof(clone) === "undefined" ? true : clone;

            var templateMesh = meshes[0];
            var templateGeo = templateMesh.geometry;
            var material = templateMesh.material;

            if (_.any(meshes, function(mesh) {
                return mesh.material !== material;  
            })) {
                console.warn("Material of meshes to merge is not the same, program will use the material of first mesh by default");
            }

            var geometry = new Geometry,
                faces = geometry.faces;

            for (var name in templateGeo.attributes) {
                var attr = templateGeo.attributes[name];
                // Extend custom attributes
                if (! geometry.attributes[name]) {
                    geometry.attributes[name] = {
                        value : [],
                        type : attr.type
                    }
                }
            }


            var faceOffset = 0;
            var useFaces = templateGeo.faces.length !== 0;
                
            for (var k = 0; k < meshes.length; k++) {
                var mesh = meshes[k];  
                var currentGeo = mesh.geometry;

                mesh.updateLocalTransform();
                var vertexCount = currentGeo.getVerticesNumber();

                for (var name in currentGeo.attributes) {

                    var currentAttr = currentGeo.attributes[name];
                    var targetAttr = geometry.attributes[name];
                    // Skip the unused attributes;
                    if (!currentAttr.value.length) {
                        continue;
                    }
                    for (var i = 0; i < vertexCount; i++) {

                        // Transform position, normal and tangent
                        if (name === "position") {
                            var newValue = cloneValue(currentAttr.value[i]);
                            vec3.transformMat4(newValue, newValue, mesh.localTransform._array);
                            targetAttr.value.push(newValue);   
                        }
                        else if (name === "normal") {
                            var newValue = cloneValue(currentAttr.value[i]);
                            targetAttr.value.push(newValue);
                        }
                        else if (name === "tangent") {
                            var newValue = cloneValue(currentAttr.value[i]);
                            targetAttr.value.push(newValue);
                        }else{
                            targetAttr.value.push(cloneValue(currentAttr.value[i]));
                        }

                    }
                }

                if (useFaces) {
                    var len = currentGeo.faces.length;
                    for (i =0; i < len; i++) {
                        var newFace = [];
                        var face = currentGeo.faces[i];
                        newFace[0] = face[0] + faceOffset;
                        newFace[1] = face[1] + faceOffset;
                        newFace[2] = face[2] + faceOffset;

                        faces.push(newFace);
                    }
                }

                faceOffset += vertexCount;
            }

            function cloneValue(val) {
                if (! clone) {
                    return val;
                }
                return val && Array.prototype.slice.call(val);
            }

            return new Mesh({
                material : material,
                geometry : geometry
            });
        },

        splitByJoints : function(mesh, maxJointNumber, inPlace) {
            var geometry = mesh.geometry;
            var skeleton = mesh.skeleton;
            var material = mesh.material;
            var shader = material.shader;
            var joints = mesh.joints;
            if (!geometry || !skeleton || !joints.length) {
                return;
            }
            if (joints.length < maxJointNumber) {
                return mesh;
            }
            var shaders = {};

            var faces = geometry.faces;
            
            var meshNumber = Math.ceil(joints.length / maxJointNumber);
            var faceLen = geometry.faces.length;
            var rest = faceLen;
            var isFaceAdded = [];
            var jointValues = geometry.attributes.joint.value;
            for (var i = 0; i < faceLen; i++) {
                isFaceAdded[i] = false;
            }
            var addedJointIdxPerFace = [];

            var buckets = [];
            while(rest > 0) {
                var bucketFaces = [];
                var bucketJointReverseMap = [];
                var bucketJoints = [];
                var subJointNumber = 0;
                for (var i = 0; i < joints.length; i++) {
                    bucketJointReverseMap[i] = -1;
                }
                for (var f = 0; f < faceLen; f++) {
                    if (isFaceAdded[f]) {
                        continue;
                    }
                    var face = faces[f];

                    var canAddToBucket = true;
                    var addedNumber = 0;
                    for (var i = 0; i < 3; i++) {
                        var idx = face[i];
                        for (var j = 0; j < 4; j++) {
                            var jointIdx = jointValues[idx][j];
                            if (jointIdx >= 0) {
                                if (bucketJointReverseMap[jointIdx] === -1) {
                                    if (subJointNumber < maxJointNumber) {
                                        bucketJointReverseMap[jointIdx] = subJointNumber;
                                        bucketJoints[subJointNumber++] = jointIdx;
                                        addedJointIdxPerFace[addedNumber++] = jointIdx;
                                    } else {
                                        canAddToBucket = false;
                                    }
                                }
                            }
                        }
                    }
                    if (!canAddToBucket) {
                        // Reverse operation
                        for (var i = 0; i < addedNumber; i++) {
                            bucketJointReverseMap[addedJointIdxPerFace[i]] = -1;
                            bucketJoints.pop();
                            subJointNumber--;
                        }
                    } else {
                        bucketFaces.push(face);
                        isFaceAdded[f] = true;
                        rest--;
                    }
                }
                buckets.push({
                    faces : bucketFaces,
                    joints : bucketJoints.map(function(idx){return joints[idx];}),
                    jointReverseMap : bucketJointReverseMap
                });
            }

            var root = new Node({
                name : mesh.name
            });
            var attribNames = Object.keys(geometry.getEnabledAttributes());
            attribNames.splice(attribNames.indexOf('joint'), 1);
            // Map from old vertex index to new vertex index
            var newIndices = [];
            for (var b = 0; b < buckets.length; b++) {
                var bucket = buckets[b];
                var jointReverseMap = bucket.jointReverseMap;
                var subJointNumber = bucket.joints.length;
                var subShader = shaders[subJointNumber];
                if (!subShader) {
                    subShader = shader.clone();
                    subShader.define('vertex', 'JOINT_NUMBER', subJointNumber);
                    shaders[subJointNumber] = subShader;
                }
                var subMat = new Material({
                    name : [material.name, b].join('-'),
                    shader : subShader,
                    transparent : material.transparent,
                    depthTest : material.depthTest,
                    depthMask : material.depthMask,
                    blend : material.blend
                });
                for (var name in material.uniforms) {
                    var uniform = material.uniforms[name];
                    subMat.set(name, uniform.value);
                }
                var subGeo = new Geometry();
                var subMesh = new Mesh({
                    name : [mesh.name, i].join('-'),
                    material : subMat,
                    geometry : subGeo,
                    skeleton : skeleton,
                    joints : bucket.joints.slice()
                });
                var vertexNumber = 0;
                for (var i = 0; i < geometry.getVerticesNumber(); i++) {
                    newIndices[i] = -1;
                }
                for (var f = 0; f < bucket.faces.length; f++) {
                    var face = bucket.faces[f];
                    var newFace = [];
                    for (var i = 0; i < 3; i++) {
                        var idx = face[i];
                        if (newIndices[idx] === -1) {
                            newIndices[idx] = vertexNumber;
                            for (var a = 0; a < attribNames.length; a++) {
                                var attribName = attribNames[a];
                                var attrib = geometry.attributes[attribName];
                                var subAttrib = subGeo.attributes[attribName];
                                if (attrib.size === 1) {
                                    subAttrib.value[vertexNumber] = attrib.value[idx];
                                } else {
                                    subAttrib.value[vertexNumber] = arraySlice.call(attrib.value[idx]);
                                }
                            }
                            var newJoints = subGeo.attributes.joint.value[vertexNumber] = [-1, -1, -1, -1];
                            // joints
                            for (var j = 0; j < 4; j++) {
                                var jointIdx = geometry.attributes.joint.value[idx][j];
                                if (jointIdx >= 0) {
                                    newJoints[j] = jointReverseMap[jointIdx];
                                }
                            }
                            vertexNumber++;
                        }
                        newFace.push(newIndices[idx]);
                    }
                    subGeo.faces.push(newFace);
                }

                root.add(subMesh);
            }
            var children = mesh.children();
            for (var i = 0; i < children.length; i++) {
                root.add(children[i]);
            }
            root.position.copy(mesh.position);
            root.rotation.copy(mesh.rotation);
            root.scale.copy(mesh.scale);

            material.dispose();
            if (inPlace) {
                if (mesh.parent) {
                    var parent = mesh.parent;
                    parent.remove(mesh);
                    parent.add(root);
                }
            }
            return root;
        }
    }

    return ret;
});
/**
 * 缓动代码来自 https://github.com/sole/tween.js/blob/master/src/Tween.js
 * author: lang(shenyi01@baidu.com)
 */
define('animation/easing',[],function() {
    var Easing = {
        Linear: function(k) {
            return k;
        },

        QuadraticIn: function(k) {
            return k * k;
        },
        QuadraticOut: function(k) {
            return k * (2 - k);
        },
        QuadraticInOut: function(k) {
            if ((k *= 2) < 1) {
                return 0.5 * k * k;
            }
            return - 0.5 * (--k * (k - 2) - 1);
        },

        CubicIn: function(k) {
            return k * k * k;
        },
        CubicOut: function(k) {
            return --k * k * k + 1;
        },
        CubicInOut: function(k) {
            if ((k *= 2) < 1) {
                return 0.5 * k * k * k;
            }
            return 0.5 * ((k -= 2) * k * k + 2);
        },

        QuarticIn: function(k) {
            return k * k * k * k;
        },
        QuarticOut: function(k) {
            return 1 - (--k * k * k * k);
        },
        QuarticInOut: function(k) {
            if ((k *= 2) < 1) {
                return 0.5 * k * k * k * k;
            }
            return - 0.5 * ((k -= 2) * k * k * k - 2);
        },

        QuinticIn: function(k) {
            return k * k * k * k * k;
        },

        QuinticOut: function(k) {
            return --k * k * k * k * k + 1;
        },
        QuinticInOut: function(k) {
            if ((k *= 2) < 1) {
                return 0.5 * k * k * k * k * k;
            }
            return 0.5 * ((k -= 2) * k * k * k * k + 2);
        },

        SinusoidalIn: function(k) {
            return 1 - Math.cos(k * Math.PI / 2);
        },
        SinusoidalOut: function(k) {
            return Math.sin(k * Math.PI / 2);
        },
        SinusoidalInOut: function(k) {
            return 0.5 * (1 - Math.cos(Math.PI * k));
        },

        ExponentialIn: function(k) {
            return k === 0 ? 0 : Math.pow(1024, k - 1);
        },
        ExponentialOut: function(k) {
            return k === 1 ? 1 : 1 - Math.pow(2, - 10 * k);
        },
        ExponentialInOut: function(k) {
            if (k === 0) {
                return 0;
            }
            if (k === 1) {
                return 1;
            }
            if ((k *= 2) < 1) {
                return 0.5 * Math.pow(1024, k - 1);
            }
            return 0.5 * (- Math.pow(2, - 10 * (k - 1)) + 2);
        },

        CircularIn: function(k) {
            return 1 - Math.sqrt(1 - k * k);
        },
        CircularOut: function(k) {
            return Math.sqrt(1 - (--k * k));
        },
        CircularInOut: function(k) {
            if ((k *= 2) < 1) {
                return - 0.5 * (Math.sqrt(1 - k * k) - 1);
            }
            return 0.5 * (Math.sqrt(1 - (k -= 2) * k) + 1);
        },

        ElasticIn: function(k) {
            var s, a = 0.1, p = 0.4;
            if (k === 0) {
                return 0;
            }
            if (k === 1) {
                return 1;
            }
            if (!a || a < 1) {
                a = 1; s = p / 4;
            }else{
                s = p * Math.asin(1 / a) / (2 * Math.PI);
            }
            return - (a * Math.pow(2, 10 * (k -= 1)) *
                        Math.sin((k - s) * (2 * Math.PI) / p));
        },
        ElasticOut: function(k) {
            var s, a = 0.1, p = 0.4;
            if (k === 0) {
                return 0;
            }
            if (k === 1) {
                return 1;
            }
            if (!a || a < 1) {
                a = 1; s = p / 4;
            }
            else{
                s = p * Math.asin(1 / a) / (2 * Math.PI);
            }
            return (a * Math.pow(2, - 10 * k) *
                    Math.sin((k - s) * (2 * Math.PI) / p) + 1);
        },
        ElasticInOut: function(k) {
            var s, a = 0.1, p = 0.4;
            if (k === 0) {
                return 0;
            }
            if (k === 1) {
                return 1;
            }
            if (!a || a < 1) {
                a = 1; s = p / 4;
            }
            else{
                s = p * Math.asin(1 / a) / (2 * Math.PI);
            }
            if ((k *= 2) < 1) {
                return - 0.5 * (a * Math.pow(2, 10 * (k -= 1))
                    * Math.sin((k - s) * (2 * Math.PI) / p));
            }
            return a * Math.pow(2, -10 * (k -= 1))
                    * Math.sin((k - s) * (2 * Math.PI) / p) * 0.5 + 1;

        },

        BackIn: function(k) {
            var s = 1.70158;
            return k * k * ((s + 1) * k - s);
        },
        BackOut: function(k) {
            var s = 1.70158;
            return --k * k * ((s + 1) * k + s) + 1;
        },
        BackInOut: function(k) {
            var s = 1.70158 * 1.525;
            if ((k *= 2) < 1) {
                return 0.5 * (k * k * ((s + 1) * k - s));
            }
            return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2);
        },

        BounceIn: function(k) {
            return 1 - Easing.BounceOut(1 - k);
        },
        BounceOut: function(k) {
            if (k < (1 / 2.75)) {
                return 7.5625 * k * k;
            }
            else if (k < (2 / 2.75)) {
                return 7.5625 * (k -= (1.5 / 2.75)) * k + 0.75;
            } else if (k < (2.5 / 2.75)) {
                return 7.5625 * (k -= (2.25 / 2.75)) * k + 0.9375;
            } else {
                return 7.5625 * (k -= (2.625 / 2.75)) * k + 0.984375;
            }
        },
        BounceInOut: function(k) {
            if (k < 0.5) {
                return Easing.BounceIn(k * 2) * 0.5;
            }
            return Easing.BounceOut(k * 2 - 1) * 0.5 + 0.5;
        }
    };

    return Easing;
});


define('animation/Clip',['require','./easing'],function(require) {

    var Easing = require('./easing');

    var Clip = function(options) {

        this._targetPool = options.target || {};
        if (this._targetPool.constructor != Array) {
            this._targetPool = [this._targetPool];
        }

        this._life = options.life || 1000;

        this._delay = options.delay || 0;
        
        this._startTime = new Date().getTime() + this._delay;

        this._endTime = this._startTime + this._life*1000;
        this._needsRemove = false;

        this.loop = typeof(options.loop) == 'undefined'
                    ? false : options.loop;

        if (this.loop) {
            if (typeof(this.loop) == 'number') {
                this._currentLoop = this.loop;
            } else {
                this._currentLoop = 9999999;
            }
        }

        this.gap = options.gap || 0;

        this.easing = options.easing || 'Linear';

        this.onframe = options.onframe || null;

        this.ondestroy = options.ondestroy || null;

        this.onrestart = options.onrestart || null;
    };

    Clip.prototype = {
        step : function(time) {
            var percent = (time - this._startTime) / this._life;

            if (percent < 0) {
                return;
            }

            percent = Math.min(percent, 1);

            var easingFunc = typeof(this.easing) == 'string'
                             ? Easing[this.easing]
                             : this.easing;
            var schedule;
            if (typeof easingFunc === 'function') {
                schedule = easingFunc(percent);
            }else{
                schedule = percent;
            }
            this.fire('frame', schedule);

            if (percent == 1) {
                if (this.loop && this._currentLoop) {
                    this.restart();
                    this._currentLoop--;
                    return 'restart';
                }else{
                    // Mark this clip to be deleted
                    // In the animation.update
                    this._needsRemove = true;

                    return 'destroy';
                }
            }else{
                return null;
            }
        },
        restart : function() {
            this._startTime = new Date().getTime() + this.gap;
        },
        fire : function(eventType, arg) {
            var eventName = 'on' + eventType;
            for(var i = 0, len = this._targetPool.length; i < len; i++) {
                if (this[eventName]) {
                    this[eventName](this._targetPool[i], arg);
                }
            }
        }
    };
    Clip.prototype.constructor = Clip;

    return Clip;
});
define('animation/Animation',['require','./Clip','_'],function(require) {
    
    

    var Clip = require('./Clip');
    var _ = require("_");

    var requrestAnimationFrame = window.requrestAnimationFrame
                                || window.msRequestAnimationFrame
                                || window.mozRequestAnimationFrame
                                || window.webkitRequestAnimationFrame
                                || function(func){setTimeout(func, 16)};

    var arraySlice = Array.prototype.slice;

    var Animation = function(options) {

        options = options || {};

        this.stage = options.stage || {};

        this.onframe = options.onframe || function() {};

        // private properties
        this._clips = [];

        this._running = false;

        this._time = 0;
    };

    Animation.prototype = {
        add : function(clip) {
            this._clips.push(clip);
        },
        remove : function(clip) {
            var idx = this._clips.indexOf(clip);
            if (idx >= 0) {
                this._clips.splice(idx, 1);
            }
        },
        update : function() {
            var time = new Date().getTime();
            var delta = time - this._time;
            var clips = this._clips;
            var len = clips.length;

            var deferredEvents = [];
            var deferredClips = [];
            for (var i = 0; i < len; i++) {
                var clip = clips[i];
                var e = clip.step(time);
                // Throw out the events need to be called after
                // stage.render, like destroy
                if (e) {
                    deferredEvents.push(e);
                    deferredClips.push(clip);
                }
            }
            if (this.stage
                && this.stage.render
                && this._clips.length
            ) {
                this.stage.render();
            }

            // Remove the finished clip
            var newArray = [];
            for (var i = 0; i < len; i++) {
                if (!clips[i]._needsRemove) {
                    newArray.push(clips[i]);
                }
            }
            this._clips = newArray;

            len = deferredEvents.length;
            for (var i = 0; i < len; i++) {
                deferredClips[i].fire(deferredEvents[i]);
            }

            this.onframe(delta);
            this._time = time;
        },
        start : function() {
            var self = this;

            this._running = true;
            this._time = new Date().getTime();

            function step() {
                if (self._running) {
                    self.update();
                    requrestAnimationFrame(step);
                }
            }

            requrestAnimationFrame(step);
        },
        stop : function() {
            this._running = false;
        },
        clear : function() {
            this._clips = [];
        },
        animate : function(target, options) {
            options = options || {};
            var deferred = new Deferred(
                target,
                options.loop,
                options.getter, 
                options.setter
            );
            deferred.animation = this;
            return deferred;
        }
    };
    Animation.prototype.constructor = Animation;

    function _defaultGetter(target, key) {
        return target[key];
    }
    function _defaultSetter(target, key, value) {
        target[key] = value;
    }

    function _interpolateNumber(p0, p1, percent) {
        return (p1 - p0) * percent + p0;
    }

    function _interpolateArray(p0, p1, percent, out, arrDim) {
        var len = p0.length;
        if (arrDim == 1) {
            for (var i = 0; i < len; i++) {
                out[i] = _interpolateNumber(p0[i], p1[i], percent); 
            }
        } else {
            var len2 = p0[0].length;
            for (var i = 0; i < len; i++) {
                for (var j = 0; j < len2; j++) {
                    out[i][j] = _interpolateNumber(
                        p0[i][j], p1[i][j], percent
                    );
                }
            }
        }
    }

    function _isArrayLike(data) {
        if (data === undefined) {
            return false;
        } else if (typeof(data) == 'string') {
            return false;
        } else {
            return data.length !== undefined;
        }
    }

    function _catmullRomInterpolateArray(
        p0, p1, p2, p3, t, t2, t3, out, arrDim
    ) {
        var len = p0.length;
        if (arrDim == 1) {
            for (var i = 0; i < len; i++) {
                out[i] = _catmullRomInterpolate(
                    p0[i], p1[i], p2[i], p3[i], t, t2, t3
                );
            }
        } else {
            var len2 = p0[0].length;
            for (var i = 0; i < len; i++) {
                for (var j = 0; j < len2; j++) {
                    out[i][j] = _catmullRomInterpolate(
                        p0[i][j], p1[i][j], p2[i][j], p3[i][j],
                        t, t2, t3
                    );
                }
            }
        }
    }
    
    function _catmullRomInterpolate(p0, p1, p2, p3, t, t2, t3) {
        var v0 = (p2 - p0) * 0.5;
        var v1 = (p3 - p1) * 0.5;
        return (2 * (p1 - p2) + v0 + v1) * t3 
                + (- 3 * (p1 - p2) - 2 * v0 - v1) * t2
                + v0 * t + p1;
    };
    
    function Deferred(target, loop, getter, setter) {
        this._tracks = {};
        this._target = target;

        this._loop = loop || false;

        this._getter = getter || _defaultGetter;
        this._setter = setter || _defaultSetter;

        this._clipCount = 0;

        this._delay = 0;

        this._doneList = [];

        this._onframeList = [];

        this._clipList = [];
    }

    Deferred.prototype = {
        when : function(time /* ms */, props) {
            for (var propName in props) {
                if (! this._tracks[propName]) {
                    this._tracks[propName] = [];
                    // Initialize value
                    this._tracks[propName].push({
                        time : 0,
                        value : this._getter(this._target, propName)
                    });
                }
                this._tracks[propName].push({
                    time : parseInt(time),
                    value : props[propName]
                });
            }
            return this;
        },
        during : function(callback) {
            this._onframeList.push(callback);
            return this;
        },
        start : function(easing) {

            var self = this;
            var setter = this._setter;
            var getter = this._getter;
            var onFrameListLen = self._onframeList.length;
            var useSpline = easing === 'spline';

            var ondestroy = function() {
                self._clipCount--;
                if (self._clipCount === 0) {
                    // Clear all tracks
                    self._tracks = {};

                    var len = self._doneList.length;
                    for (var i = 0; i < len; i++) {
                        self._doneList[i].call(self);
                    }
                }
            }

            var createTrackClip = function(keyframes, propName) {
                var trackLen = keyframes.length;
                if (!trackLen) {
                    return;
                }
                // Guess data type
                var firstVal = keyframes[0].value;
                var isValueArray = _isArrayLike(firstVal);

                // For vertices morphing
                var arrDim = (
                        isValueArray 
                        && _isArrayLike(firstVal[0])
                    )
                    ? 2 : 1;
                // Sort keyframe as ascending
                keyframes.sort(function(a, b) {
                    return a.time - b.time;
                });
                if (trackLen) {
                    var trackMaxTime = keyframes[trackLen-1].time;
                }else{
                    return;
                }
                // Percents of each keyframe
                var kfPercents = [];
                // Value of each keyframe
                var kfValues = [];
                for (var i = 0; i < trackLen; i++) {
                    kfPercents.push(keyframes[i].time / trackMaxTime);
                    if (isValueArray) {
                        if (arrDim == 2) {
                            kfValues[i] = [];
                            for (var j = 0; j < firstVal.length; j++) {
                                kfValues[i].push(arraySlice.call(keyframes[i].value[j]));
                            }
                        } else {
                            kfValues.push(arraySlice.call(keyframes[i].value));
                        }
                    } else {
                        kfValues.push(keyframes[i].value);
                    }
                }

                // Cache the key of last frame to speed up when 
                // animation playback is sequency
                var cacheKey = 0;
                var cachePercent = 0;
                var start;
                var i, w;
                var p0, p1, p2, p3;

                var onframe = function(target, percent) {
                    // Find the range keyframes
                    // kf1-----kf2---------current--------kf3
                    // find kf2(i) and kf3(i+1) and do interpolation
                    if (percent < cachePercent) {
                        // Start from next key
                        start = Math.min(cacheKey + 1, trackLen - 1);
                        for (i = start; i >= 0; i--) {
                            if (kfPercents[i] <= percent) {
                                break;
                            }
                        }
                        i = Math.min(i, trackLen-2);
                    } else {
                        for (i = cacheKey; i < trackLen; i++) {
                            if (kfPercents[i] > percent) {
                                break;
                            }
                        }
                        i = Math.min(i-1, trackLen-2);
                    }
                    cacheKey = i;
                    cachePercent = percent;

                    var range = (kfPercents[i+1] - kfPercents[i]);
                    if (range == 0) {
                        return;
                    } else {
                        w = (percent - kfPercents[i]) / range;
                    }
                    if (useSpline) {
                        p1 = kfValues[i];
                        p0 = kfValues[i == 0 ? i : i - 1];
                        p2 = kfValues[i > trackLen - 2 ? trackLen - 1 : i + 1];
                        p3 = kfValues[i > trackLen - 3 ? trackLen - 1 : i + 2];
                        if (isValueArray) {
                            _catmullRomInterpolateArray(
                                p0, p1, p2, p3, w, w*w, w*w*w,
                                getter(target, propName),
                                arrDim
                            );
                        } else {
                            setter(
                                target,
                                propName,
                                _catmullRomInterpolate(p0, p1, p2, p3, w, w*w, w*w*w)
                            );
                        }
                    } else {
                        if (isValueArray) {
                            _interpolateArray(
                                kfValues[i], kfValues[i+1], w,
                                getter(target, propName),
                                arrDim
                            );
                        } else {
                            setter(
                                target,
                                propName,
                                _interpolateNumber(kfValues[i], kfValues[i+1], w)
                            );
                        }
                    }

                    for (i = 0; i < onFrameListLen; i++) {
                        self._onframeList[i](target, percent);
                    }
                };

                var clip = new Clip({
                    target : self._target,
                    life : trackMaxTime,
                    loop : self._loop,
                    delay : self._delay,
                    onframe : onframe,
                    ondestroy : ondestroy
                });

                if (easing && easing !== 'spline') {
                    clip.easing = easing;
                }
                self._clipList.push(clip);
                self._clipCount++;
                self.animation.add(clip);
            }


            for (var propName in this._tracks) {
                createTrackClip(this._tracks[propName], propName);
            }
            return this;
        },
        stop : function() {
            for (var i = 0; i < this._clipList.length; i++) {
                var clip = this._clipList[i];
                this.animation.remove(clip);
            }
            this._clipList = [];
        },
        delay : function(time){
            this._delay = time;
            return this;
        },
        done : function(func) {
            this._doneList.push(func);
            return this;
        }
    };

    return Animation;
});

define('core/Matrix2',['require','glmatrix'],function(require) {

    

    var glMatrix = require("glmatrix");
    var mat2 = glMatrix.mat2;

    function makeProperty(n) {
        return {
            configurable : false,
            set : function(value) {
                this._array[n] = value;
                this._dirty = true;
            },
            get : function() {
                return this._array[n];
            }
        }
    }

    var Matrix2 = function() {

        this._array = mat2.create();
    };

    var Matrix2Proto = {

        constructor : Matrix2,

        clone : function() {
            return (new Matrix2()).copy(this);
        },
        copy : function(b) {
            mat2.copy(this._array, b._array);
            return this;
        },
        adjoint : function() {
            mat2.adjoint(this._array, this._array);
            return this;
        },
        determinant : function() {
            return mat2.determinant(this._array);
        },
        identity : function() {
            mat2.identity(this._array);
            return this;
        },
        invert : function() {
            mat2.invert(this._array, this._array);
            return this;
        },
        mul : function(b) {
            mat2.mul(this._array, this._array, b._array);
            return this;
        },
        mulLeft : function(b) {
            mat2.mul(this._array, b._array, this._array);
            return this;
        },
        multiply : function(b) {
            mat2.multiply(this._array, this._array, b._array);
            return this;
        },
        multiplyLeft : function(b) {
            mat2.multiply(this._array, b._array, this._array);
            return this;
        },
        rotate : function(rad) {
            mat2.rotate(this._array, this._array, rad);
            return this;
        },
        scale : function(s) {
            mat2.scale(this._array, this._array, s);
        },
        toString : function() {
            return "[" + Array.prototype.join.call(this._array, ",") + "]";
        }
    }

    return Matrix2;
});
/**
 *  @export{object} request
 */
define('core/request',['require'],function(require) {

    function get(options) {

        var xhr = new XMLHttpRequest();

        xhr.open("get", options.url);
        // With response type set browser can get and put binary data
        // https://developer.mozilla.org/en-US/docs/DOM/XMLHttpRequest/Sending_and_Receiving_Binary_Data
        // Default is text, and it can be set
        // arraybuffer, blob, document, json, text
        xhr.responseType = options.responseType || "text";

        if (options.onprogress) {
            //https://developer.mozilla.org/en-US/docs/DOM/XMLHttpRequest/Using_XMLHttpRequest
            xhr.onprogress = function(e) {
                if (e.lengthComputable) {
                    var percent = e.loaded / e.total;
                    options.onprogress(percent, e.loaded, e.total);
                } else {
                    options.onprogress(null);
                }
            }
        }
        xhr.onload = function(e) {
            options.onload && options.onload(xhr.response);
        }
        if (options.onerror) {
            xhr.onerror = options.onerror;
        }
        xhr.send(null);
    }

    function put(options) {

    }

    return {
        get : get,
        put : put
    }
});
define('loader/FX',['require','core/Base','core/request','3d/compositor/Compositor','3d/compositor/Node','3d/compositor/Group','3d/compositor/SceneNode','3d/compositor/TextureNode','3d/Shader','3d/Texture','3d/texture/Texture2D','3d/texture/TextureCube','_'],function(require) {
    
    

    var Base = require('core/Base');
    var request = require('core/request');
    var Compositor = require('3d/compositor/Compositor');
    var CompoNode = require('3d/compositor/Node');
    var CompoGroup = require('3d/compositor/Group');
    var CompoSceneNode = require('3d/compositor/SceneNode');
    var CompoTextureNode = require('3d/compositor/TextureNode');
    var Shader = require('3d/Shader');
    var Texture = require('3d/Texture');
    var Texture2D = require('3d/texture/Texture2D');
    var TextureCube = require('3d/texture/TextureCube');
    var _ = require('_');

    var shaderSourceReg = /#source\((.*?)\)/;
    var urlReg = /#url\((.*?)\)/;

    var FXLoader = Base.derive(function() {
        return {
            rootPath : "",
            textureRootPath : "",
            shaderRootPath : ""
        }
    }, {
        load : function(url) {
            var self = this;

            if (!this.rootPath) {
                this.rootPath = url.slice(0, url.lastIndexOf("/"));
            }

            request.get({
                url : url,
                onprogress : function(percent, loaded, total) {
                    self.trigger("progress", percent, loaded, total);
                },
                onerror : function(e) {
                    self.trigger("error", e);
                },
                responseType : "text",
                onload : function(data) {
                    self.parse(JSON.parse(data), function(compositor) {
                        self.trigger("load", compositor);
                    });
                }
            });
        },

        parse : function(json, callback) {
            var self = this;
            var compositor = new Compositor();
            var lib = {
                textures : {},
                shaders : {},
                parameters : {}
            }
            var afterLoad = function(shaderLib, textureLib) {
                for (var i = 0; i < json.nodes.length; i++) {
                    var nodeInfo = json.nodes[i];
                    var node = self._createNode(nodeInfo, lib);
                    if (node) {
                        compositor.add(node);
                    }
                    if (nodeInfo.output) {
                        compositor.addOutput(node);
                    }
                }

                callback(compositor);
            }

            for (var name in json.parameters) {
                var paramInfo = json.parameters[name];
                lib.parameters[name] = this._convertParameter(paramInfo);
            }
            this._loadShaders(json, function(shaderLib) {
                self._loadTextures(json, lib, function(textureLib) {
                    lib.textures = textureLib;
                    lib.shaders = shaderLib;
                    afterLoad();
                });
            });
        },

        _createNode : function(nodeInfo, lib) {
            if (!nodeInfo.shader) {
                return;
            }
            var type = nodeInfo.type || 'processor';
            var shaderSource;
            var inputs;
            var outputs;

            if (type === 'processor') {
                var shaderExp = nodeInfo.shader.trim();
                var res = shaderSourceReg.exec(shaderExp);
                if (res) {
                    shaderSource = Shader.source(res[1].trim());
                } else if (shaderExp.charAt(0) === '#') {
                    shaderSource = lib.shaders[shaderExp.substr(1)];
                }
                if (!shaderSource) {
                    shaderSource = shaderExp;
                }
                if (!shaderSource) {
                    return;
                }
            }

            if (nodeInfo.inputs) {
                inputs = {};      
                for (var name in nodeInfo.inputs) {
                    inputs[name] = {
                        node : nodeInfo.inputs[name].node,
                        pin : nodeInfo.inputs[name].pin
                    }
                }
            }
            if (nodeInfo.outputs) {
                outputs = {};
                for (var name in nodeInfo.outputs) {
                    var outputInfo = nodeInfo.outputs[name];
                    outputs[name] = {};
                    if (outputInfo.attachment !== undefined) {
                        outputs[name].attachment = outputInfo.attachment;
                    }
                    if (typeof(outputInfo.parameters) === 'string') {
                        var paramExp = outputInfo.parameters;
                        if (paramExp.charAt(0) === '#') {
                            outputs[name].parameters = lib.parameters[paramExp.substr(1)];
                        }
                    } else if (outputInfo.parameters) {
                        outputs[name].parameters = this._convertParameter(outputInfo.parameters);
                    }
                }   
            }
            var node;
            if (type === 'processor') {
                node = new CompoNode({
                    name : nodeInfo.name,
                    shader : shaderSource,
                    inputs : inputs,
                    outputs : outputs
                });
            }
            if (node) {
                if (nodeInfo.parameters) {
                    for (var name in nodeInfo.parameters) {
                        var val = nodeInfo.parameters[name];
                        if (typeof(val) === 'string') {
                            val = val.trim();
                            if (val.charAt(0) === '#'){
                                val = lib.textures[val.substr(1)];
                            }
                        }
                        node.setParameter(name, val);
                    }
                }
            }
            return node;
        },
        _convertParameter : function(paramInfo) {
            var param = {};
            if (!paramInfo) {
                return param;
            }
            ['type', 'minFilter', 'magFilter', 'wrapS', 'wrapT']
                .forEach(function(name) {
                    if (paramInfo[name] !== undefined) {
                        param[name] = Texture[paramInfo[name]];
                    }
                });
            ['width', 'height', 'useMipmap']
                .forEach(function(name) {
                    if (paramInfo[name] !== undefined) {
                        param[name] = paramInfo[name];
                    }
                });
            return param;
        },
        
        _loadShaders : function(json, callback) {
            if (!json.shaders) {
                return {};
            }
            var shaders = {};
            var loading = 0;
            _.each(json.shaders, function(shaderExp, name) {
                var res = urlReg.exec(shaderExp);
                if (res) {
                    var path = res[1];
                    path = this.shaderRootPath || this.rootPath + '/' + path;
                    loading++;
                    request.get({
                        url : path,
                        onload : function(shaderSource) {
                            shaders[name] = shaderSource;
                            Shader.import(shaderSource);
                            loading--;
                            if (loading === 0) {
                                callback(shaders);
                            }
                        }
                    })
                } else {
                    shaders[name] = shaderExp;
                    Shader.import(shaderSource);
                }
            }, this);
            if (loading === 0) {
                callback(shaders);
            }
        },

        _loadTextures : function(json, lib, callback) {
            if (!json.textures) {
                return {};
            }
            var textures = {};
            var loading = 0;

            _.each(json.textures, function(textureInfo, name) {
                var texture;
                var path = textureInfo.path;
                var parameters = this._convertParameter(textureInfo.parameters);
                if (typeof(path) === 'array' && path.length === 6) {
                    texture = new TextureCube();
                } else if(typeof(path) === 'string') {
                    texture = new Texture2D();
                } else {
                    return;
                }

                texture.load(path);
                loading++;
                texture.on('load', function() {
                    textures[name] = texture;
                    loading--;
                    if (loading === 0) {
                        callback(textures);
                    }
                });
            }, this);

            if (loading === 0) {
                callback(textures);
            }
        }
    });

    return FXLoader;
});
/**
 * InstantGeometry can not be changed once they've been setup
 * PENDING : Remove it ?
 */
define('loader/InstantGeometry',['require','core/Base','util/util','3d/BoundingBox','3d/Geometry','glmatrix'],function(require) {

    

    var Base = require("core/Base");
    var util = require("util/util");
    var BoundingBox = require("3d/BoundingBox");
    var Geometry = require("3d/Geometry");
    var glMatrix = require("glmatrix");
    var vec3 = glMatrix.vec3;

    var InstantGeometry = Base.derive(function() {
        return {
            __GUID__ : util.genGUID(),
            
            boundingBox : new BoundingBox(),

            useFace : true,

            _normalType : 'vertex',

            // Typed Array of each geometry chunk
            // schema
            // [{
            //     attributes:{
            //          position : {
            //              size : 0,
            //              type : '',
            //              semantic : '',
            //              array : ''
            //          }
            //      },
            //     indices : array
            // }]
            _arrayChunks : [],
            _verticesNumber : 0
        }
    }, {
        addChunk : function(chunk) {
            this._verticesNumber += chunk.attributes.position.array.length / 3;
            this._arrayChunks.push(chunk);
        },
        dirty : function() {
            this.cache.dirtyAll("chunks");
        },
        getBufferChunks : function(_gl) {
            this.cache.use(_gl.__GUID__);
            if (this.cache.isDirty("chunks")) {
                this._updateBuffer(_gl);
                this.cache.fresh("chunks");
            }
            return this.cache.get("chunks");
        },
        getVerticesNumber : function() {
            return this._verticesNumber;
        },
        isUseFace : function() {
            return this.useFace;
        },
        _updateBuffer : function(_gl) {
            var chunks = this.cache.get("chunks");
            if (! chunks) {
                chunks = [];
                // Intialize
                for (var i = 0; i < this._arrayChunks.length; i++) {
                    chunks[i] = {
                        attributeBuffers : {},
                        indicesBuffer : null
                    }
                }
                this.cache.put("chunks", chunks);
            }
            for (var i = 0; i < chunks.length; i++) {
                var chunk = chunks[i];
                if (! chunk) {
                    chunk = chunks[i] = {
                        attributeBuffers : {},
                        indicesBuffer : null
                    }
                }
                var attributeBuffers = chunk.attributeBuffers;
                var indicesBuffer = chunk.indicesBuffer;
                var arrayChunk = this._arrayChunks[i];
                var indicesArray = arrayChunk.indices;

                for (var name in arrayChunk.attributes) {
                    var attribute = arrayChunk.attributes[name];

                    var bufferInfo = attributeBuffers[name],
                        buffer;
                    if (bufferInfo) {
                        buffer = bufferInfo.buffer
                    } else {
                        buffer = _gl.createBuffer();
                    }
                    //TODO: Use BufferSubData?
                    _gl.bindBuffer(_gl.ARRAY_BUFFER, buffer);
                    _gl.bufferData(_gl.ARRAY_BUFFER, attribute.array, _gl.STATIC_DRAW);

                    attributeBuffers[name] = {
                        type : attribute.type,
                        buffer : buffer,
                        size : attribute.size,
                        semantic : attribute.semantic,
                    }
                }
                if (! indicesBuffer) {
                    indicesBuffer = chunk.indicesBuffer = {
                        buffer : _gl.createBuffer(),
                        count : indicesArray.length
                    }
                }
                _gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, indicesBuffer.buffer);
                _gl.bufferData(_gl.ELEMENT_ARRAY_BUFFER, indicesArray, _gl.STATIC_DRAW);
            }
        },
        convertToGeometry : function() {
            var geometry = new Geometry();

            var offset = 0;
            for (var c = 0; c < this._arrayChunks.length; c++) {
                var chunk = this._arrayChunks[c],
                    indicesArr = chunk.indices;

                for (var i = 0; i < indicesArr.length; i+=3) {
                    geometry.faces.push(
                        [
                            indicesArr[i] + offset,
                            indicesArr[i+1] + offset, 
                            indicesArr[i+2] + offset
                        ]
                    );
                }

                for (var name in chunk.attributes) {
                    var attrib = chunk.attributes[name];
                    var geoAttrib;
                    for (var n in geometry.attributes) {
                        if (geometry.attributes[n].semantic === attrib.semantic) {
                            geoAttrib = geometry.attributes[n];
                        }
                    }
                    if (geoAttrib) {
                        for (var i = 0; i < attrib.array.length; i+= attrib.size) {
                            if (attrib.size === 1) {
                                geoAttrib.value.push(attrib.array[i]);
                            } else {
                                var item = [];
                                for (var j = 0; j < attrib.size; j++) {
                                    item[j] = attrib.array[i+j];
                                }
                                geoAttrib.value.push(item);
                            }
                        }
                    }
                }
                offset += chunk.attributes.position.length / 3;
            }

            return geometry;
        },
        dispose : function(_gl) {
            this.cache.use(_gl.__GUID__);
            var chunks = this.cache.get('chunks');
            if (chunks) {
                for (var c = 0; c < chunks.length; c++) {
                    var chunk = chunks[c];

                    for (var name in chunk.attributeBuffers) {
                        var attribs = chunk.attributeBuffers[name];
                        _gl.deleteBuffer(attribs.buffer);
                    }
                }
            }
            this.cache.deleteContext(_gl.__GUID__);
        }
    });

    return InstantGeometry;
});
/**
 * glTF Loader
 * Specification : https://github.com/KhronosGroup/glTF/blob/master/specification/README.md
 */
define('loader/GLTF',['require','core/Base','core/request','3d/Scene','3d/Shader','3d/Material','3d/Mesh','3d/Node','3d/texture/Texture2D','3d/texture/TextureCube','3d/shader/library','3d/Skeleton','3d/Joint','3d/camera/Perspective','3d/camera/Orthographic','3d/light/Point','3d/light/Spot','3d/light/Directional','3d/glenum','core/Vector3','core/Quaternion','_','./InstantGeometry','glmatrix'],function(require) {

    var Base = require('core/Base');

    var request = require("core/request");
    var Scene = require('3d/Scene');
    var Shader = require("3d/Shader");
    var Material = require("3d/Material");
    var Mesh = require("3d/Mesh");
    var Node = require("3d/Node");
    var Texture2D = require("3d/texture/Texture2D");
    var TextureCube = require("3d/texture/TextureCube");
    var shaderLibrary = require("3d/shader/library");
    var Skeleton = require("3d/Skeleton");
    var Joint = require("3d/Joint");
    var PerspectiveCamera = require("3d/camera/Perspective");
    var OrthographicCamera = require("3d/camera/Orthographic");
    var PointLight = require("3d/light/Point");
    var SpotLight = require("3d/light/Spot");
    var DirectionalLight = require("3d/light/Directional");
    var glenum = require("3d/glenum");

    var Vector3 = require("core/Vector3");
    var Quaternion = require("core/Quaternion");
    
    var _ = require("_");

    var InstantGeometry = require("./InstantGeometry");

    var glMatrix = require("glmatrix");
    var vec4 = glMatrix.vec4;
    var vec3 = glMatrix.vec3;
    var vec2 = glMatrix.vec2;

    var semanticAttributeMap = {
        'NORMAL' : 'normal',
        'POSITION' : 'position',
        'TEXCOORD_0' : 'texcoord0',
        'WEIGHT' : 'weight',
        'JOINT' : 'joint'
    }

    var Loader = Base.derive(function() {
        return {
            rootPath : "",
            textureRootPath : "",
            bufferRootPath : ""
        };
    }, {
        load : function(url) {
            var self = this;

            if (!this.rootPath) {
                this.rootPath = url.slice(0, url.lastIndexOf("/"));
            }

            request.get({
                url : url,
                onprogress : function(percent, loaded, total) {
                    self.trigger("progress", percent, loaded, total);
                },
                onerror : function(e) {
                    self.trigger("error", e);
                },
                responseType : "text",
                onload : function(data) {
                    self.parse(JSON.parse(data), function(scene, cameras, skeleton) {
                        self.trigger("load", scene, cameras, skeleton);
                    });
                }
            });
        },
        parse : function(json, callback) {
            var self = this;
            var loading = 0;

            var lib = {
                buffers : {},
                materials : {},
                textures : {},
                meshes : {},
                joints : {},
                skins : {},
                skeleton : null,
                cameras : {},
                nodes : {}
            };
            // Load buffers
            _.each(json.buffers, function(bufferInfo, name) {
                loading++;
                self._loadBuffer(bufferInfo.path, function(buffer) {
                    lib.buffers[name] = buffer;
                    loading--;
                    if (loading === 0) {
                        afterLoadBuffer();
                    }
                }, function() {
                    loading--;
                    if (loading === 0) {
                        afterLoadBuffer();
                    }
                });
            });

            function afterLoadBuffer() {
                self._parseSkins(json, lib);
                self._parseTextures(json, lib);
                self._parseMaterials(json, lib);
                self._parseMeshes(json, lib);
                self._parseNodes(json, lib);

                // Build scene
                var scene = new Scene();
                var sceneInfo = json.scenes[json.scene];
                for (var i = 0; i < sceneInfo.nodes.length; i++) {
                    if (lib.joints[sceneInfo.nodes[i]]) {
                        // Skip joint node
                        continue;
                    }
                    var node = lib.nodes[sceneInfo.nodes[i]];
                    scene.add(node);
                }

                callback && callback(scene, lib.cameras, lib.skeleton);
            }
        },

        _loadBuffer : function(path, onsuccess, onerror) {
            var root = this.bufferRootPath || this.rootPath;
            if (root) {
                path = root + "/" + path;
            }
            request.get({
                url : path,
                responseType : "arraybuffer",
                onload : function(buffer) {
                    onsuccess && onsuccess(buffer);
                },
                onerror : function(buffer) {
                    onerror && onerror(buffer);
                }
            });
        },

         _parseSkins : function(json, lib) {
            var self = this;
            // Build skeleton
            var skeleton = new Skeleton();
            var rootJoints = {};

            var createJoint = function(nodeName, parentIndex) {
                // Have been created
                if (lib.joints[nodeName]) {
                    return;
                }
                var nodeInfo = json.nodes[nodeName];
                nodeInfo._isJoint = true;
                // Cast node to joint
                var joint = new Joint();
                joint.name = nodeName;
                if (nodeInfo.matrix) {
                    for (var i = 0; i < 16; i++) {
                        joint.localTransform._array[i] = nodeInfo.matrix[i];
                    }
                    joint.decomposeMatrix();
                }

                joint.index = skeleton.joints.length;
                if (parentIndex !== undefined) {
                    joint.parentIndex = parentIndex;
                }
                
                skeleton.joints.push(joint);
                lib.joints[nodeName] = joint;
                
                for (var i = 0; i < nodeInfo.children.length; i++) {
                    var child = createJoint(nodeInfo.children[i], joint.index);
                    if (child) {
                        joint.add(child);
                    }
                }
                return joint;
            }

            for (var name in json.skins) {
                var skinInfo = json.skins[name]
                for (var i = 0; i < skinInfo.roots.length; i++) {
                    var rootJointName = skinInfo.roots[i];
                    var rootJoint = createJoint(rootJointName);
                    if (rootJoint) {
                        skeleton.roots.push(rootJoint);
                    }
                }
            }

            for (var name in json.skins) {
                var skinInfo = json.skins[name];
                var jointIndices = [];
                for (var i = 0; i < skinInfo.joints.length; i++) {
                    var joint = lib.joints[skinInfo.joints[i]];
                    jointIndices.push(joint.index);
                }
                lib.skins[name] = {
                    joints : jointIndices
                }
            }
            skeleton.updateJointMatrices();
            skeleton.update();
            lib.skeleton = skeleton;
        },

        _parseTextures : function(json, lib) {
            _.each(json.textures, function(textureInfo, name){
                var samplerInfo = json.samplers[textureInfo.sampler];
                var parameters = {
                    format : glenum[textureInfo.format || 'RGBA'],
                    wrapS : glenum[samplerInfo.wrapS || 'REPEAT'],
                    wrapT : glenum[samplerInfo.wrapT || 'REPEAT'],
                    magFilter : glenum[samplerInfo.magFilter || 'LINEAR'],
                    minFilter : glenum[samplerInfo.minFilter || 'LINEAR_MIPMAP_LINEAR'],
                }

                if (textureInfo.target === "TEXTURE_2D") {
                    var texture = new Texture2D(parameters);
                    var imageInfo = json.images[textureInfo.source];
                    texture.image = this._loadImage(imageInfo.path, function() {
                        texture.dirty();
                    });
                    lib.textures[name] = texture;
                } else if(textureInfo.target === "TEXTURE_CUBE_MAP") {
                    // TODO
                }
            }, this);
        },

        _loadImage : function(path, onsuccess) {
            var root = this.textureRootPath || this.rootPath;
            if (root) {
                path = root + "/" + path;
            }
            var img = new Image();
            img.onload = function() {
                onsuccess && onsuccess(img);
                img.onload = null;
            }
            img.src = path;
            return img;
        },
        // Only phong material is support yet
        // TODO : support custom material
        _parseMaterials : function(json, lib) {
            var self = this;
            var techniques = {};
            // Parse techniques
            for (var name in json.techniques) {
                var techniqueInfo = json.techniques[name];
                // Default phong shader
                // var shader = new Shader({
                //     vertex : Shader.source("buildin.phong.vertex"),
                //     fragment : Shader.source("buildin.phong.fragment")
                // });
                techniques[name] = {
                    // shader : shader,
                    pass : techniqueInfo.passes[techniqueInfo.pass]
                }
            }
            for (var name in json.materials) {
                var materialInfo = json.materials[name];

                var instanceTechniqueInfo = materialInfo.instanceTechnique;
                var technique = techniques[instanceTechniqueInfo.technique];
                var pass = technique.pass;
                var uniforms = {};
                instanceTechniqueInfo.values.forEach(function(item){
                    if (typeof(item.value) === "string" &&
                        lib.textures[item.value]) {
                        var value = lib.textures[item.value]
                    } else {
                        var value = item.value;
                    }
                    uniforms[item.parameter] = value;
                });
                var material = new Material({
                    name : materialInfo.name,
                    // shader : technique.shader
                    // Techniques of glTF is not classified well
                    // So here use a shader per material
                    shader : new Shader({
                        vertex : Shader.source("buildin.phong.vertex"),
                        fragment : Shader.source("buildin.phong.fragment")
                    })
                });
                if (pass.states.depthMask !== undefined) {
                    material.depthMask = pass.states.depthMask;
                }
                if (pass.states.depthTestEnable !== undefined) {
                    material.depthTest = pass.states.depthTestEnable;
                }
                material.cullFace = pass.states.cullFaceEnable || false;
                if (pass.states.blendEnable) {
                    material.transparent = true;
                    // TODO blend Func and blend Equation
                }

                if (uniforms['diffuse']) {
                    // Color
                    if (uniforms['diffuse'] instanceof Array) {
                        material.set("color", uniforms['diffuse'].slice(0, 3));
                    } else { // Texture
                        material.shader.enableTexture("diffuseMap");
                        material.set("diffuseMap", uniforms["diffuse"]);
                    }
                }
                if (uniforms['normalMap']) {
                    material.shader.enableTexture("normalMap");
                    material.set("normalMap", uniforms["normalMap"]);
                }
                if (uniforms['emission']) {
                    var diffuseColor = material.get('color');
                    vec4.add(diffuseColor, diffuseColor, uniforms['emission']);
                }
                if (uniforms['shininess']) {
                    material.set("shininess", uniforms["shininess"]);
                } else {
                    material.set("shininess", 0);
                }
                if (uniforms["specular"]) {
                    material.set("specular", uniforms["specular"].slice(0, 3));
                }
                if (uniforms["transparency"]) {
                    material.set("alpha", uniforms["transparency"]);
                }

                lib.materials[name] = material;
            }
        },

        _parseMeshes : function(json, lib) {
            var self = this;

            for (var name in json.meshes) {
                var meshInfo = json.meshes[name];

                lib.meshes[name] = [];
                // Geometry
                for (var i = 0; i < meshInfo.primitives.length; i++) {
                    var geometry = new InstantGeometry();
                    var chunk = {
                        attributes : {},
                        indices : null
                    };
                    var primitiveInfo = meshInfo.primitives[i];
                    // Parse indices
                    var indicesInfo = json.indices[primitiveInfo.indices];
                    var bufferViewInfo = json.bufferViews[indicesInfo.bufferView];
                    var buffer = lib.buffers[bufferViewInfo.buffer];
                    var byteOffset = bufferViewInfo.byteOffset + indicesInfo.byteOffset;

                    var byteLength = indicesInfo.count * 2; //two byte each index
                    chunk.indices = new Uint16Array(buffer.slice(byteOffset, byteOffset+byteLength));

                    // Parse attributes
                    for (var semantic in primitiveInfo.semantics) {
                        var attributeInfo = json.attributes[primitiveInfo.semantics[semantic]];
                        var attributeName = semanticAttributeMap[semantic];
                        var bufferViewInfo = json.bufferViews[attributeInfo.bufferView];
                        var buffer = lib.buffers[bufferViewInfo.buffer];
                        var byteOffset = bufferViewInfo.byteOffset + attributeInfo.byteOffset;
                        var byteLength = attributeInfo.count * attributeInfo.byteStride;
                        // TODO : Support more types
                        switch(attributeInfo.type) {
                            case "FLOAT_VEC2":
                                var size = 2;
                                var type = 'float';
                                var arrayConstructor = Float32Array;
                                break;
                            case "FLOAT_VEC3":
                                var size = 3;
                                var type = 'float';
                                var arrayConstructor = Float32Array;
                                break;
                            case "FLOAT_VEC4":
                                var size = 4;
                                var type = 'float';
                                var arrayConstructor = Float32Array;
                                break;
                            case "FLOAT":
                                var size = 1;
                                var type = 'float';
                                var arrayConstructor = Float32Array;
                                break;
                            default:
                                console.warn("Attribute type "+attributeInfo.type+" not support yet");
                                break;
                        }
                        chunk.attributes[attributeName] = {
                            type : type,
                            size : size,
                            semantic : semantic,
                            array : new arrayConstructor(buffer.slice(byteOffset, byteOffset+byteLength))
                        };
                    }
                    geometry.addChunk(chunk);

                    var material = lib.materials[primitiveInfo.material];
                    var mesh = new Mesh({
                        geometry : geometry,
                        material : material
                    });

                    var skinName = primitiveInfo.skin;
                    if (skinName) {
                        mesh.joints = lib.skins[skinName].joints;
                        mesh.skeleton = lib.skeleton;
                        material.shader = material.shader.clone();
                        material.shader.define('vertex', 'SKINNING');
                        material.shader.define('vertex', 'JOINT_NUMBER', mesh.joints.length);
                    }

                    if (meshInfo.name) {
                        mesh.name = [meshInfo.name, i].join('-');
                    }

                    lib.meshes[name].push(mesh);
                }
            }
        },

        _parseNodes : function(json, lib) {
            for (var name in json.nodes) {
                var nodeInfo = json.nodes[name];
                if (nodeInfo._isJoint) {
                    // Skip joint node
                    continue;
                }
                var node;
                if (nodeInfo.camera) {
                    var cameraInfo = json.cameras[nodeInfo.camera];

                    if (cameraInfo.projection === "perspective") {
                        node = new PerspectiveCamera({
                            name : nodeInfo.name,
                            aspect : cameraInfo.aspect_ratio,
                            fov : cameraInfo.xfov,
                            far : cameraInfo.zfar,
                            near : cameraInfo.znear
                        });
                    } else {
                        // TODO
                        node = new OrthographicCamera();
                        console.warn("TODO:Orthographic camera")
                    }
                    lib.cameras[nodeInfo.name] = node;
                } else {
                    node = new Node({
                        name : nodeInfo.name
                    });
                }
                if (nodeInfo.lights) {
                    for (var i = 0; i < nodeInfo.lights.length; i++) {
                        var lightInfo = json.lights[nodeInfo.lights[i]];
                        var light = this._parseLight(lightInfo);
                        if (light) {
                            node.add(light);
                        }
                    }
                }
                if (nodeInfo.meshes) {
                    for (var i = 0; i < nodeInfo.meshes.length; i++) {
                        var primitives = lib.meshes[nodeInfo.meshes[i]];
                        if (primitives) {
                            for (var j = 0; j < primitives.length; j++) {                            
                                node.add(primitives[j]);
                            }
                        }
                    }
                }
                if (nodeInfo.matrix) {
                    for (var i = 0; i < 16; i++) {
                        node.localTransform._array[i] = nodeInfo.matrix[i];
                    }
                    node.decomposeMatrix();
                }

                lib.nodes[name] = node;
            }

            // Build hierarchy
            for (var name in json.nodes) {
                var nodeInfo = json.nodes[name];
                if (nodeInfo._isJoint) {
                    // Skip joint node
                    continue;
                }
                var node = lib.nodes[name];
                if (nodeInfo.children) {
                    for (var i = 0; i < nodeInfo.children.length; i++) {
                        var childName = nodeInfo.children[i];
                        var child = lib.nodes[childName];
                        node.add(child);
                    }
                }
            }
         },

        _parseLight : function(lightInfo) {
            // TODO : Light parameters
            switch(lightInfo.type) {
                case "point":
                    var light = new PointLight({
                        name : lightInfo.id,
                        color : lightInfo.point.color,
                    });
                    break;
                case "spot":
                    var light = new SpotLight({
                        name : lightInfo.id,
                        color : lightInfo.spot.color
                    });
                    break;
                case "directional":
                    var light = new DirectionalLight({
                        name : lightInfo.id,
                        color : lightInfo.directional.color
                    });
                    break;
                default:
                    console.warn("Light " + lightInfo.type + " not support yet");
            }

            return light;
        },
    });

    return Loader;
});
/**
 * shapes : circle, line, polygon, rect, polyline, ellipse, path
 */
define('loader/SVG',['require','core/Base','core/request','2d/Node','2d/shape/Circle','2d/shape/Rectangle','2d/shape/Ellipse','2d/shape/Line','2d/shape/Path','2d/shape/Polygon','2d/shape/TextBox','2d/shape/SVGPath','2d/LinearGradient','2d/RadialGradient','2d/Pattern','2d/Style','core/Vector2','_'],function(require) {

    var Base = require("core/Base");

    var request = require("core/request");

    var Node = require("2d/Node");
    var Circle = require("2d/shape/Circle");
    var Rectangle = require("2d/shape/Rectangle");
    var Ellipse = require("2d/shape/Ellipse");
    var Line = require("2d/shape/Line");
    var Path = require("2d/shape/Path");
    var Polygon = require("2d/shape/Polygon");
    var TextBox = require("2d/shape/TextBox");
    var SVGPath = require("2d/shape/SVGPath");
    var LinearGradient = require("2d/LinearGradient");
    var RadialGradient = require("2d/RadialGradient");
    var Pattern = require("2d/Pattern");
    var Style = require("2d/Style");
    var Vector2 = require("core/Vector2");
    var _ = require("_");

    var Loader = Base.derive(function() {
        return {
            defs : {},
            root : null
        };
    }, {
        load : function(url) {

            var self = this;
            this.defs = {};

            request.get({
                url : url,
                onprogress : function(percent, loaded, total) {
                    self.trigger("progress", percent, loaded, total);
                },
                onerror : function(e) {
                    self.trigger("error", e);
                },
                responseType : "text",
                onload : function(xmlString) {
                    self.parse(xmlString, function(root){
                        self.trigger('load', root);
                    });
                }
            })
        },
        parse : function(xml, callback) {
            if (typeof(xml) === "string") {
                var parser = new DOMParser();
                var doc = parser.parseFromString(xml, 'text/xml');
                var svg = doc.firstChild;
                while (svg.nodeName.toLowerCase() !== 'svg') {
                    svg = svg.nextSibling;
                }
            } else {
                var svg = xml;
            }
            var root = new Node();
            this.root = root;
            // parse view port
            var viewBox = svg.getAttribute("viewBox") || '';
            var viewBoxArr = viewBox.split(/\s+/);

            var width = parseFloat(svg.getAttribute("width") || 0);
            var height = parseFloat(svg.getAttribute("height") || 0);

            var x = parseFloat(viewBoxArr[0] || 0);
            var y = parseFloat(viewBoxArr[1] || 0);
            var vWidth = parseFloat(viewBoxArr[2]);
            var vHeight = parseFloat(viewBoxArr[3]);

            root.position.set(x, y);

            var child = svg.firstChild;
            while (child) {
                this._parseNode(child, root);
                child = child.nextSibling;
            }

            callback && callback(root);

            return root;
        },

        _parseNode : function(xmlNode, parent) {
            var nodeName = xmlNode.nodeName.toLowerCase();

            if (nodeName === 'defs') {
                // define flag
                this._isDefine = true;
            }

            if (this._isDefine) {
                var parser = defineParsers[nodeName];
                if (parser) {
                    var def = parser.call(this, xmlNode);
                    var id = xmlNode.getAttribute("id");
                    if (id) {
                        this.defs[id] = def;
                    }
                }
            } else {
                var parser = nodeParsers[nodeName];
                if (parser) {
                    var node = parser.call(this, xmlNode, parent);
                    parent.add(node);
                }
            }

            var child = xmlNode.firstChild;
            while (child) {
                if (child.nodeType === 1){
                    this._parseNode(child, node);
                }
                child = child.nextSibling;
            }

            // Quit define
            if (nodeName === 'defs') {
                this._isDefine = false;
            }
        }
    });
    
    var nodeParsers = {
        "g" : function(xmlNode, parentNode) {
            var node = new Node();
            if (parentNode) {
                _inheritStyle(parentNode, node);
            }
            _parseAttributes(xmlNode, node, this.defs);
            return node;
        },
        "rect" : function(xmlNode, parentNode) {
            var rect = new Rectangle();
            if (parentNode) {
                _inheritStyle(parentNode, rect);
            }
            _parseAttributes(xmlNode, rect, this.defs);

            var x = parseFloat(xmlNode.getAttribute("x") || 0);
            var y = parseFloat(xmlNode.getAttribute("y") || 0);
            var width = parseFloat(xmlNode.getAttribute("width") || 0);
            var height = parseFloat(xmlNode.getAttribute("height") || 0);
            rect.start.set(x, y);
            rect.size.set(x, y);

            return rect;
        },
        "circle" : function(xmlNode, parentNode) {
            var circle = new Circle();
            if (parentNode) {
                _inheritStyle(parentNode, circle);
            }
            _parseAttributes(xmlNode, circle, this.defs);

            var cx = parseFloat(xmlNode.getAttribute("cx") || 0);
            var cy = parseFloat(xmlNode.getAttribute("cy") || 0);
            var r = parseFloat(xmlNode.getAttribute("r") || 0);
            circle.center.set(cx, cy);
            circle.radius = r;

            return circle;
        },
        'line' : function(xmlNode, parentNode){
            var line = new Line();
            if (parentNode) {
                _inheritStyle(parentNode, line);
            }
            _parseAttributes(xmlNode, line, this.defs);

            var x1 = parseFloat(xmlNode.getAttribute("x1") || 0);
            var y1 = parseFloat(xmlNode.getAttribute("y1") || 0);
            var x2 = parseFloat(xmlNode.getAttribute("x2") || 0);
            var y2 = parseFloat(xmlNode.getAttribute("y2") || 0);
            line.start.set(x1, y1);
            line.end.set(x2, y2);

            return line;
        },
        "ellipse" : function(xmlNode, parentNode) {
            var ellipse = new Ellipse();
            if (parentNode) {
                _inheritStyle(parentNode, ellipse);
            }
            _parseAttributes(xmlNode, ellipse, this.defs);

            var cx = parseFloat(xmlNode.getAttribute("cx") || 0);
            var cy = parseFloat(xmlNode.getAttribute("cy") || 0);
            var rx = parseFloat(xmlNode.getAttribute("rx") || 0);
            var ry = parseFloat(xmlNode.getAttribute("ry") || 0);

            ellipse.center.set(cx, cy);
            ellipse.radius.set(rx, ry);
            return ellipse;
        },
        'polygon' : function(xmlNode, parentNode) {
            var points = xmlNode.getAttribute("points");
            if (points) {
                points = _parsePoints(points);
            }
            var polygon = new Polygon({
                points : points
            });
            if (parentNode) {
                _inheritStyle(parentNode, polygon);
            }
            _parseAttributes(xmlNode, polygon, this.defs);

            return polygon;
        },
        'polyline' : function(xmlNode, parentNode) {
            var path = new Path();
            if (parentNode) {
                _inheritStyle(parentNode, path);
            }
            _parseAttributes(xmlNode, path, this.defs);

            var points = xmlNode.getAttribute("points");
            if (points) {
                points = _parsePoints(points);
                path.pushPoints(points);
            }

            return path;
        },
        'image' : function(xmlNode, parentNode) {

        },
        'text' : function(xmlNode, parentNode) {
            
        },
        "path" : function(xmlNode, parentNode) {
            var path = new SVGPath();
            if (parentNode) {
                _inheritStyle(parentNode, path);
            }
            _parseAttributes(xmlNode, path, this.defs);

            // TODO svg fill rule
            // https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/fill-rule
            // path.style.globalCompositeOperation = 'xor';

            var d = xmlNode.getAttribute("d") || "";
            path.description = d;

            return path;
        }
    }

    var defineParsers = {

        'lineargradient' : function(xmlNode) {
            var x1 = parseInt(xmlNode.getAttribute("x1") || 0);
            var y1 = parseInt(xmlNode.getAttribute("y1") || 0);
            var x2 = parseInt(xmlNode.getAttribute("x2") || 10);
            var y2 = parseInt(xmlNode.getAttribute("y2") || 0);

            var gradient = new LinearGradient();
            gradient.start.set(x1, y1);
            gradient.end.set(x2, y2);

            _parseGradientColorStops(xmlNode, gradient);

            return gradient;
        },

        'radialgradient' : function(xmlNode) {

        }
    }

    function _parseGradientColorStops(xmlNode, gradient){

        var stop = xmlNode.firstChild;

        while (stop) {
            if (stop.nodeType === 1) {
                var offset = stop.getAttribute("offset");
                if (offset.indexOf("%") > 0) {  // percentage
                    offset = parseInt(offset) / 100;
                } else if(offset) {    // number from 0 to 1
                    offset = parseFloat(offset);
                } else {
                    offset = 0;
                }

                var stopColor = stop.getAttribute("stop-color") || '#000000';

                gradient.addColorStop(offset, stopColor);
            }
            stop = stop.nextSibling;
        }
    }

    function _inheritStyle(parent, child) {
        child.stroke = parent.stroke;
        child.fill = parent.fill;
    }

    function _parsePoints(pointsString) {
        var list = pointsString.trim().replace(/,/g, " ").split(/\s+/);
        var points = [];

        for (var i = 0; i < list.length; i+=2) {
            var x = parseFloat(list[i]);
            var y = parseFloat(list[i+1]);
            points.push(new Vector2(x, y));
        }
        return points;
    }

    function _parseAttributes(xmlNode, node, defs) {
        _parseTransformAttribute(xmlNode, node);

        var styleList = {
            fill : xmlNode.getAttribute('fill'),
            stroke : xmlNode.getAttribute("stroke"),
            lineWidth : xmlNode.getAttribute("stroke-width"),
            opacity : xmlNode.getAttribute('opacity'),
            lineDash : xmlNode.getAttribute('stroke-dasharray'),
            lineDashOffset : xmlNode.getAttribute('stroke-dashoffset'),
            lineCap : xmlNode.getAttribute('stroke-linecap'),
            lineJoin : xmlNode.getAttribute('stroke-linjoin'),
            miterLimit : xmlNode.getAttribute("stroke-miterlimit")
        }

        _.extend(styleList, _parseStyleAttribute(xmlNode));

        node.style = new Style({
            fill : _getPaint(styleList.fill, defs),
            stroke : _getPaint(styleList.stroke, defs),
            lineWidth : parseFloat(styleList.lineWidth),
            opacity : parseFloat(styleList.opacity),
            lineDashOffset : styleList.lineDashOffset,
            lineCap : styleList.lineCap,
            lineJoin : styleList.lineJoin,
            miterLimit : parseFloat(styleList.miterLimit)
        });
        if (styleList.lineDash) {
            node.style.lineDash = styleList.lineDash.trim().split(/\s*,\s*/);
        }

        if (styleList.stroke && styleList.stroke !== "none") {
            // enable stroke
            node.stroke = true;
        }
    }


    var urlRegex = /url\(\s*#(.*?)\)/;
    function _getPaint(str, defs) {
        // if (str === 'none') {
        //     return;
        // }
        var urlMatch = urlRegex.exec(str);
        if (urlMatch) {
            var url = urlMatch[1].trim();
            var def = defs[url];
            return def;
        }
        return str;
    }

    var transformRegex = /(translate|scale|rotate|skewX|skewY|matrix)\(([\-\s0-9\.,]*)\)/g;

    function _parseTransformAttribute(xmlNode, node) {
        var transform = xmlNode.getAttribute("transform");
        if (transform) {
            var m = node.transform;
            m.identity();
            var transformOps = [];
            transform.replace(transformRegex, function(str, type, value){
                transformOps.push(type, value);
            })
            for(var i = transformOps.length-1; i > 0; i-=2){
                var value = transformOps[i];
                var type = transformOps[i-1];
                switch(type) {
                    case "translate":
                        value = value.trim().split(/\s+/);
                        m.translate(new Vector2(parseFloat(value[0]), parseFloat(value[1] || 0)));
                        break;
                    case "scale":
                        value = value.trim().split(/\s+/);
                        m.scale(new Vector2(parseFloat(value[0]), parseFloat(value[1] || value[0])));
                        break;
                    case "rotate":
                        value = value.trim().split(/\s*/);
                        m.rotate(parseFloat(value[0]));
                        break;
                    case "skew":
                        value = value.trim().split(/\s*/);
                        console.warn("Skew transform is not supported yet");
                        break;
                    case "matrix":
                        var value = value.trim().split(/\s*,\s*/);
                        var arr = m._array;
                        arr[0] = parseFloat(value[0]);
                        arr[1] = parseFloat(value[1]);
                        arr[2] = parseFloat(value[2]);
                        arr[3] = parseFloat(value[3]);
                        arr[4] = parseFloat(value[4]);
                        arr[5] = parseFloat(value[5]);
                        break;
                }
            }
        }
        node.autoUpdate = false;
    }

    var styleRegex = /(\S*?):(.*?);/g;
    function _parseStyleAttribute(xmlNode) {
        var style = xmlNode.getAttribute("style");

        if (style) {
            var styleList = {};
            style = style.replace(/\s*([;:])\s*/g, "$1");
            style.replace(styleRegex, function(str, key, val){
                styleList[key] = val;
            });

            return {
                fill : styleList['fill'],
                stroke : styleList['stroke'],
                lineWidth : styleList['stroke-width'],
                opacity : styleList['opacity'],
                lineDash : styleList['stroke-dasharray'],
                lineDashOffset : styleList['stroke-dashoffset'],
                lineCap : styleList['stroke-linecap'],
                lineJoin : styleList['stroke-linjoin'],
                miterLimit : styleList['stroke-miterlimit']
            }
        }
        return {};
    }

    function _parseCSSRules(doc) {

    }


    return Loader
});
/**
 * Load three.js JSON Format model
 *
 * Format specification : https://github.com/mrdoob/three.js/wiki/JSON-Model-format-3.1
 * @export{class} Model
 */
define('loader/three/Model',['require','core/Base','core/request','3d/Shader','3d/Material','3d/Geometry','3d/Mesh','3d/Node','3d/texture/Texture2D','3d/texture/TextureCube','3d/shader/library','3d/Skeleton','3d/Joint','core/Vector3','core/Quaternion','3d/glenum','_','glmatrix'],function(require) {

    var Base = require('core/Base');

    var request = require("core/request");
    var Shader = require("3d/Shader");
    var Material = require("3d/Material");
    var Geometry = require("3d/Geometry");
    var Mesh = require("3d/Mesh");
    var Node = require("3d/Node");
    var Texture2D = require("3d/texture/Texture2D");
    var TextureCube = require("3d/texture/TextureCube");
    var shaderLibrary = require("3d/shader/library");
    var Skeleton = require("3d/Skeleton");
    var Joint = require("3d/Joint");
    var Vector3 = require("core/Vector3");
    var Quaternion = require("core/Quaternion");
    var glenum = require('3d/glenum');
    var _ = require("_");

    var glMatrix = require("glmatrix");
    var vec3 = glMatrix.vec3;
    var vec2 = glMatrix.vec2;

    var Loader = Base.derive(function() {
        return {
            rootPath : "",
            textureRootPath : "",
            textureNumber : 0
        };
    }, {
        load : function(url) {
            var self = this;
            this.textureNumber = 0;

            if (!this.rootPath) {
                this.rootPath = url.slice(0, url.lastIndexOf("/"));
            }

            request.get({
                url : url,
                onprogress : function(percent, loaded, total) {
                    self.trigger("progress", percent, loaded, total);
                },
                onerror : function(e) {
                    self.trigger("error", e);
                },
                responseType : "text",
                onload : function(data) {
                    self.parse(JSON.parse(data))
                }
            })
        },
        parse : function(data) {
            
            var geometryList = this.parseGeometry(data);

            var dSkinIndices = data.skinIndices,
                dSkinWeights = data.skinWeights;
            var skinned = dSkinIndices && dSkinIndices.length
                        && dSkinWeights && dSkinWeights.length;

            if (skinned) {
                var skeleton = this.parseSkeleton(data);
                var jointNumber = skeleton.joints.length;
            }else{
                var jointNumber = 0;
            }

            if (skinned) {
                var skeleton = this.parseSkeleton(data);
                var jointNumber = skeleton.joints.length;
            }else{
                var jointNumber = 0;
            }

            var meshList = [];
            for (var i = 0; i < data.materials.length; i++) {
                var geometry = geometryList[i];
                if (geometry 
                    && geometry.faces.length 
                    && geometry.attributes.position.value.length) {

                    var material = this.parseMaterial(data.materials[i], jointNumber);
                    var mesh = new Mesh({
                        geometry : geometryList[i],
                        material : material
                    }) ;
                    if (skinned) {
                        mesh.skeleton = skeleton;
                        for (var i = 0; i < skeleton.joints.length; i++) {
                            // Use all the joints of skeleton
                            mesh.joints[i] = i;
                        }
                    }
                    meshList.push(mesh);
                }
            }
            
            this.trigger('load', meshList);
            return meshList;
        },

        parseGeometry : function(data) {

            var geometryList = [];
            var cursorList = [];
            
            for (var i = 0; i < data.materials.length; i++) {
                geometryList[i] = null;
                cursorList[i] = 0;
            }
            geometryList[0] = new Geometry;

            var faceMaterial = data.materials && data.materials.length > 1;

            var dFaces = data.faces,
                dVertices = data.vertices,
                dNormals = data.normals,
                dColors = data.colors,
                dSkinIndices = data.skinIndices,
                dSkinWeights = data.skinWeights,
                dUvs = data.uvs;

            var skinned = dSkinIndices && dSkinIndices.length
                        && dSkinWeights && dSkinWeights.length;

            var geometry = geometryList[0],
                attributes = geometry.attributes,
                positions = attributes.position.value,
                normals = attributes.normal.value,
                texcoords = [attributes.texcoord0.value,
                            attributes.texcoord1.value],
                colors = attributes.color.value,
                jointIndices = attributes.joint.value,
                jointWeights = attributes.weight.value,
                faces = geometry.faces;

            var nUvLayers = 0;
            if (dUvs[0] && dUvs[0].length) {
                nUvLayers++;
            }
            if (dUvs[1] && dUvs[1].length) {
                nUvLayers++;
            }

            var offset = 0;
            var len = dFaces.length;

            // Cache the reorganized index
            var newIndexMap = [];
            var geoIndexMap = [];
            for (var i = 0; i < dVertices.length; i++) {
                newIndexMap[i] = -1;
                geoIndexMap[i] = -1;
            }

            var currentGeometryIndex = 0;
            var isNew = [];
            function getNewIndex(oi, faceIndex) {
                if ( newIndexMap[oi] >= 0) {
                    // Switch to the geometry of existed index 
                    currentGeometryIndex = geoIndexMap[oi];
                    geometry = geometryList[currentGeometryIndex];
                    attributes = geometry.attributes;
                    positions = attributes.position.value;
                    normals = attributes.normal.value;
                    texcoords = [attributes.texcoord0.value,
                                attributes.texcoord1.value];
                    colors = attributes.color.value;
                    jointWeights = attributes.weight.value;
                    jointIndices = attributes.joint.value;

                    isNew[faceIndex] = false;
                    return newIndexMap[oi];
                }else{

                    positions.push([dVertices[oi*3], dVertices[oi*3+1], dVertices[oi*3+2]]);
                    //Skin data
                    if (skinned) {
                        jointWeights.push([dSkinWeights[oi*2], dSkinWeights[oi*2+1], 0]);
                        jointIndices.push([dSkinIndices[oi*2], dSkinIndices[oi*2+1], -1, -1]);
                    }

                    newIndexMap[oi] = cursorList[materialIndex];
                    geoIndexMap[oi] = materialIndex;

                    isNew[faceIndex] = true;
                    return cursorList[materialIndex]++;
                }
            }
            // Put the vertex data of one face here
            // Incase the program create amount of tmp arrays and cause
            // GC bottleneck
            var faceUvs = [];
            var faceNormals = [];
            var faceColors = [];
            for (var i =0; i < 4; i++) {
                faceUvs[i] = [0, 0];
                faceNormals[i] = [0, 0, 0];
                faceColors[i] = [0, 0, 0];
            }
            var materialIndex = 0;

            while (offset < len) {
                var type = dFaces[offset++];
                var isQuad = isBitSet(type, 0),
                    hasMaterial = isBitSet(type, 1),
                    hasFaceUv = isBitSet(type, 2),
                    hasFaceVertexUv = isBitSet(type, 3),
                    hasFaceNormal = isBitSet(type, 4),
                    hasFaceVertexNormal = isBitSet(type, 5),
                    hasFaceColor = isBitSet(type, 6),
                    hasFaceVertexColor = isBitSet(type, 7);

                var nVertices = isQuad ? 4 : 3;

                if (hasMaterial) {
                    materialIndex = dFaces[ offset+ (isQuad ? 4 : 3) ];
                    if ( ! geometryList[materialIndex] ) {
                        geometryList[materialIndex] = new Geometry;
                    }
                    geometry = geometryList[materialIndex];
                    attributes = geometry.attributes;
                    positions = attributes.position.value;
                    normals = attributes.normal.value;
                    texcoords = [attributes.texcoord0.value,
                                attributes.texcoord1.value];
                    colors = attributes.color.value;
                    jointWeights = attributes.weight.value;
                    jointIndices = attributes.joint.value;
                    faces = geometry.faces;
                }
                if (isQuad) {
                    // Split into two triangle faces, 1-2-4 and 2-3-4
                    var i1o = dFaces[offset++],
                        i2o = dFaces[offset++],
                        i3o = dFaces[offset++],
                        i4o = dFaces[offset++];
                    // Face1
                    var i1 = getNewIndex(i1o, 0),
                        i2 = getNewIndex(i2o, 1),
                        i3 = getNewIndex(i4o, 2),
                    // Face2
                        i4 = getNewIndex(i2o, 3),
                        i5 = getNewIndex(i3o, 4),
                        i6 = getNewIndex(i4o, 5);
                    faces.push([i1, i2, i3], [i4, i5, i6]);
                } else {
                    var i1 = dFaces[offset++],
                        i2 = dFaces[offset++],
                        i3 = dFaces[offset++];
                    i1 = getNewIndex(i1, 0);
                    i2 = getNewIndex(i2, 1);
                    i3 = getNewIndex(i3, 2);
                    faces.push([i1, i2, i3]);
                }
                if (hasMaterial) {
                    offset++;
                }
                if (hasFaceUv) {
                    for (var i = 0; i < nUvLayers; i++) {
                        var uvLayer = dUvs[i];
                        var uvIndex = faces[offset++];
                        var u = uvLayer[uvIndex*2];
                        var v = uvLayer[uvIndex*2+1];
                        if (isQuad) {
                            // Random write of array seems not slow
                            // http://jsperf.com/random-vs-sequence-array-set
                            isNew[0] && (texcoords[i][i1] = [u, v]);
                            isNew[1] && (texcoords[i][i2] = [u, v]);
                            isNew[2] && (texcoords[i][i3] = [u, v]);
                            isNew[3] && (texcoords[i][i4] = [u, v]);
                            isNew[4] && (texcoords[i][i5] = [u, v]);
                            isNew[5] && (texcoords[i][i6] = [u, v]);
                        } else {
                            isNew[0] && (texcoords[i][i1] = [u, v]);
                            isNew[1] && (texcoords[i][i2] = [u, v]);
                            isNew[2] && (texcoords[i][i3] = [u, v]);
                        }
                    }
                }
                if (hasFaceVertexUv) {
                    for (var i = 0; i < nUvLayers; i++) {
                        var uvLayer = dUvs[i];
                        for (var j = 0; j < nVertices; j++) {
                            var uvIndex = dFaces[offset++];
                            faceUvs[j][0] = uvLayer[uvIndex*2];
                            faceUvs[j][1] = uvLayer[uvIndex*2+1];
                        }
                        if (isQuad) {
                            // Use array slice to clone array is incredibly faster than 
                            // Construct from Float32Array
                            // http://jsperf.com/typedarray-v-s-array-clone/2
                            isNew[0] && (texcoords[i][i1] = faceUvs[0].slice());
                            isNew[1] && (texcoords[i][i2] = faceUvs[1].slice());
                            isNew[2] && (texcoords[i][i3] = faceUvs[3].slice());
                            isNew[3] && (texcoords[i][i4] = faceUvs[1].slice());
                            isNew[4] && (texcoords[i][i5] = faceUvs[2].slice());
                            isNew[5] && (texcoords[i][i6] = faceUvs[3].slice());
                        } else {
                            isNew[0] && (texcoords[i][i1] = faceUvs[0].slice());
                            isNew[1] && (texcoords[i][i2] = faceUvs[1].slice());
                            isNew[2] && (texcoords[i][i3] = faceUvs[2].slice());
                        }
                    }
                }
                if (hasFaceNormal) {
                    var normalIndex = dFaces[offset++]*3;
                    var x = dNormals[normalIndex++];
                    var y = dNormals[normalIndex++];
                    var z = dNormals[normalIndex];
                    if (isQuad) {
                        isNew[0] && (normals[i1] = [x, y, z]);
                        isNew[1] && (normals[i2] = [x, y, z]);
                        isNew[2] && (normals[i3] = [x, y, z]);
                        isNew[3] && (normals[i4] = [x, y, z]);
                        isNew[4] && (normals[i5] = [x, y, z]);
                        isNew[5] && (normals[i6] = [x, y, z]);
                    }else{
                        isNew[0] && (normals[i1] = [x, y, z]);
                        isNew[1] && (normals[i2] = [x, y, z]);
                        isNew[2] && (normals[i3] = [x, y, z]);
                    }
                }
                if (hasFaceVertexNormal) {
                    for (var i = 0; i < nVertices; i++) {
                        var normalIndex = dFaces[offset++]*3;
                        faceNormals[i][0] = dNormals[normalIndex++];
                        faceNormals[i][1] = dNormals[normalIndex++];
                        faceNormals[i][2] = dNormals[normalIndex];
                    }
                    if (isQuad) {
                        isNew[0] && (normals[i1] = faceNormals[0].slice());
                        isNew[1] && (normals[i2] = faceNormals[1].slice());
                        isNew[2] && (normals[i3] = faceNormals[3].slice());
                        isNew[3] && (normals[i4] = faceNormals[1].slice());
                        isNew[4] && (normals[i5] = faceNormals[2].slice());
                        isNew[5] && (normals[i6] = faceNormals[3].slice());
                    } else {
                        isNew[0] && (normals[i1] = faceNormals[0].slice());
                        isNew[1] && (normals[i2] = faceNormals[1].slice());
                        isNew[2] && (normals[i3] = faceNormals[2].slice());
                    }
                }
                if (hasFaceColor) {
                    var colorIndex = dFaces[offset++];
                    var color = hex2rgb(dColors[colorIndex]);
                    if (isQuad) {
                        // Does't clone the color here
                        isNew[0] && (colors[i1] = color);
                        isNew[1] && (colors[i2] = color);
                        isNew[2] && (colors[i3] = color);
                        isNew[3] && (colors[i4] = color);
                        isNew[4] && (colors[i5] = color);
                        isNew[5] && (colors[i6] = color);
                    } else {
                        isNew[0] && (colors[i1] = color);
                        isNew[1] && (colors[i2] = color);
                        isNew[2] && (colors[i3] = color);
                    }
                }
                if (hasFaceVertexColor) {
                    for (var i = 0; i < nVertices; i++) {
                        var colorIndex = dFaces[offset++];
                        faceColors[i] = hex2rgb(dColors[colorIndex]);
                    }
                    if (isQuad) {
                        isNew[0] && (colors[i1] = faceColors[0].slice());
                        isNew[1] && (colors[i2] = faceColors[1].slice());
                        isNew[2] && (colors[i3] = faceColors[3].slice());
                        isNew[3] && (colors[i4] = faceColors[1].slice());
                        isNew[4] && (colors[i5] = faceColors[2].slice());
                        isNew[5] && (colors[i6] = faceColors[3].slice());
                    } else {
                        isNew[0] && (colors[i1] = faceColors[0].slice());
                        isNew[1] && (colors[i2] = faceColors[1].slice());
                        isNew[2] && (colors[i3] = faceColors[2].slice());
                    }
                }
            }

            return geometryList;
        },

        parseSkeleton : function(data) {
            var joints = [];
            var dBones = data.bones;
            for ( var i = 0; i < dBones.length; i++) {
                var dBone = dBones[i];
                var joint = new Joint({
                    parentIndex : dBone.parent,
                    name : dBone.name,
                    position : new Vector3(dBone.pos[0], dBone.pos[1], dBone.pos[2]),
                    rotation : new Quaternion(dBone.rotq[0], dBone.rotq[1], dBone.rotq[2], dBone.rotq[3]),
                    scale : new Vector3(dBone.scl[0], dBone.scl[1], dBone.scl[2])
                });
                joints.push(joint);
            }

            var skeleton = new Skeleton({
                joints : joints
            });
            skeleton.updateHierarchy();
            skeleton.updateJointMatrices();
            skeleton.update();

            if (data.animation) {
                var dFrames = data.animation.hierarchy;

                // Parse Animations
                for (var i = 0; i < dFrames.length; i++) {
                    var channel = dFrames[i];
                    var joint = joints[i];
                    for (var j = 0; j < channel.keys.length; j++) {
                        var key = channel.keys[j];
                        joint.poses[j] = {};
                        var pose = joint.poses[j];
                        pose.time = parseFloat(key.time);
                        if (key.pos) {
                            pose.position = new Vector3(key.pos[0], key.pos[1], key.pos[2]);
                        }
                        if (key.rot) {
                            pose.rotation = new Quaternion(key.rot[0], key.rot[1], key.rot[2], key.rot[3]);
                        }
                        if (key.scl) {
                            pose.scale = new Vector3(key.scl[0], key.scl[1], key.scl[2]);
                        }
                    }
                }
            }

            return skeleton;
        },

        parseMaterial : function(mConfig, jointNumber) {
            var shaderName = "buildin.lambert";
            var shading = mConfig.shading && mConfig.shading.toLowerCase();
            if (shading === "phong" || shading === "lambert") {
                shaderName = "buildin." + shading;
            }
            var enabledTextures = [];
            if (mConfig.mapDiffuse) {
                enabledTextures.push("diffuseMap");
            }
            if (mConfig.mapNormal || mConfig.mapBump) {
                enabledTextures.push('normalMap');
            }
            if (jointNumber == 0) {
                var shader = shaderLibrary.get(shaderName, enabledTextures);
            } else {
                // Shader for skinned mesh
                var shader = new Shader({
                    vertex : Shader.source(shaderName+".vertex"),
                    fragment : Shader.source(shaderName+".fragment")
                })
                for (var i = 0; i < enabledTextures; i++) {
                    shader.enableTexture(enabledTextures[i]);
                }
                shader.define('vertex', "SKINNING");
                shader.define('vertex', "JOINT_NUMBER", jointNumber);
            }

            var material = new Material({
                shader : shader
            });
            if (mConfig.colorDiffuse) {
                material.set("color", mConfig.colorDiffuse );
            } else if (mConfig.DbgColor) {
                material.set("color", hex2rgb(mConfig.DbgColor));
            }
            if (mConfig.colorSpecular) {
                material.set("specular", mConfig.colorSpecular );
            }
            if (mConfig.transparent !== undefined && mConfig.transparent) {
                material.transparent = true;
            }
            if ( ! _.isUndefined(mConfig.depthTest)) {
                material.depthTest = mConfig.depthTest;
            }
            if ( ! _.isUndefined(mConfig.depthWrite)) {
                material.depthMask = mConfig.depthWrite;
            }
            
            if (mConfig.transparency && mConfig.transparency < 1) {
                material.set("opacity", mConfig.transparency);
            }
            if (mConfig.specularCoef) {
                material.set("shininess", mConfig.specularCoef);
            }

            // Textures
            if (mConfig.mapDiffuse) {
                material.set("diffuseMap", this.loadTexture(mConfig.mapDiffuse, mConfig.mapDiffuseWrap) );
            }
            if (mConfig.mapBump) {
                material.set("normalMap", this.loadTexture(mConfig.mapBump, mConfig.mapBumpWrap) );
            }
            if (mConfig.mapNormal) {
                material.set("normalMap", this.loadTexture(mConfig.mapNormal, mConfig.mapBumpWrap) );
            }

            return material;
        },

        loadTexture : function(path, wrap) {
            var self = this;

            var img = new Image();
            var texture = new Texture2D();
            texture.image = img;

            this.textureNumber++;

            if (wrap && wrap.length) {
                texture.wrapS = glenum[wrap[0].toUpperCase()];
                texture.wrapT = glenum[wrap[1].toUpperCase()];
            }
            img.onload = function() {
                self.trigger("load:texture", texture);
                texture.dirty();
            }
            var root = this.textureRootPath || this.rootPath
            if (root) {
                path = root + "/" + path;
            }
            img.src = path;

            return texture;
        }
    })


    function isBitSet(value, position) {
        return value & ( 1 << position );
    }


    function hex2rgb(hex) {
        var r = (hex >> 16) & 0xff,
            g = (hex >> 8) & 0xff,
            b = hex & 0xff;
        return [r/255, g/255, b/255];
    }

    function translateColor(color) {
        return [color[0]/255, color[1]/255, color[2]/255];
    }

    return Loader
} );
define('util/color',['require'],function(require){

	
});
define('qtek',['require','2d/Gradient','2d/Layer','2d/LinearGradient','2d/Node','2d/Pattern','2d/RadialGradient','2d/Stage','2d/Style','2d/picking/Box','2d/picking/Pixel','2d/shape/Arc','2d/shape/Circle','2d/shape/Ellipse','2d/shape/HTML','2d/shape/Image','2d/shape/Line','2d/shape/Path','2d/shape/Polygon','2d/shape/Rectangle','2d/shape/RoundedRectangle','2d/shape/SVGPath','2d/shape/Sector','2d/shape/Text','2d/shape/TextBox','2d/util','3d/BoundingBox','3d/Camera','3d/FrameBuffer','3d/Geometry','3d/Joint','3d/Light','3d/Material','3d/Mesh','3d/Node','3d/Renderer','3d/Scene','3d/Shader','3d/Skeleton','3d/Texture','3d/WebGLInfo','3d/camera/Orthographic','3d/camera/Perspective','3d/compositor/Compositor','3d/compositor/Graph','3d/compositor/Group','3d/compositor/Node','3d/compositor/Pass','3d/compositor/SceneNode','3d/compositor/TextureNode','3d/compositor/texturePool','3d/debug/PointLight','3d/debug/RenderInfo','3d/geometry/Cube','3d/geometry/Plane','3d/geometry/Sphere','3d/glenum','3d/light/Ambient','3d/light/Directional','3d/light/Point','3d/light/Spot','3d/particleSystem/Particle','3d/particleSystem/ParticleSystem','3d/plugin/FirstPersonControl','3d/plugin/OrbitControl','3d/plugin/Skybox','3d/plugin/Skydome','3d/prePass/Reflection','3d/prePass/ShadowMap','3d/shader/library','3d/texture/Texture2D','3d/texture/TextureCube','3d/util/mesh','animation/Animation','animation/Clip','animation/easing','core/Base','core/Cache','core/Event','core/Matrix2','core/Matrix2d','core/Matrix3','core/Matrix4','core/Quaternion','core/Vector2','core/Vector3','core/Vector4','core/mixin/derive','core/mixin/notifier','core/request','loader/FX','loader/GLTF','loader/InstantGeometry','loader/SVG','loader/three/Model','util/color','util/util','glmatrix'], function(require){
	
	var exportsObject =  {
	"2d": {
		"Gradient": require('2d/Gradient'),
		"Layer": require('2d/Layer'),
		"LinearGradient": require('2d/LinearGradient'),
		"Node": require('2d/Node'),
		"Pattern": require('2d/Pattern'),
		"RadialGradient": require('2d/RadialGradient'),
		"Stage": require('2d/Stage'),
		"Style": require('2d/Style'),
		"picking": {
			"Box": require('2d/picking/Box'),
			"Pixel": require('2d/picking/Pixel')
		},
		"shape": {
			"Arc": require('2d/shape/Arc'),
			"Circle": require('2d/shape/Circle'),
			"Ellipse": require('2d/shape/Ellipse'),
			"HTML": require('2d/shape/HTML'),
			"Image": require('2d/shape/Image'),
			"Line": require('2d/shape/Line'),
			"Path": require('2d/shape/Path'),
			"Polygon": require('2d/shape/Polygon'),
			"Rectangle": require('2d/shape/Rectangle'),
			"RoundedRectangle": require('2d/shape/RoundedRectangle'),
			"SVGPath": require('2d/shape/SVGPath'),
			"Sector": require('2d/shape/Sector'),
			"Text": require('2d/shape/Text'),
			"TextBox": require('2d/shape/TextBox')
		},
		"util": require('2d/util')
	},
	"3d": {
		"BoundingBox": require('3d/BoundingBox'),
		"Camera": require('3d/Camera'),
		"FrameBuffer": require('3d/FrameBuffer'),
		"Geometry": require('3d/Geometry'),
		"Joint": require('3d/Joint'),
		"Light": require('3d/Light'),
		"Material": require('3d/Material'),
		"Mesh": require('3d/Mesh'),
		"Node": require('3d/Node'),
		"Renderer": require('3d/Renderer'),
		"Scene": require('3d/Scene'),
		"Shader": require('3d/Shader'),
		"Skeleton": require('3d/Skeleton'),
		"Texture": require('3d/Texture'),
		"WebGLInfo": require('3d/WebGLInfo'),
		"camera": {
			"Orthographic": require('3d/camera/Orthographic'),
			"Perspective": require('3d/camera/Perspective')
		},
		"compositor": {
			"Compositor": require('3d/compositor/Compositor'),
			"Graph": require('3d/compositor/Graph'),
			"Group": require('3d/compositor/Group'),
			"Node": require('3d/compositor/Node'),
			"Pass": require('3d/compositor/Pass'),
			"SceneNode": require('3d/compositor/SceneNode'),
			"TextureNode": require('3d/compositor/TextureNode'),
			"texturePool": require('3d/compositor/texturePool')
		},
		"debug": {
			"PointLight": require('3d/debug/PointLight'),
			"RenderInfo": require('3d/debug/RenderInfo')
		},
		"geometry": {
			"Cube": require('3d/geometry/Cube'),
			"Plane": require('3d/geometry/Plane'),
			"Sphere": require('3d/geometry/Sphere')
		},
		"glenum": require('3d/glenum'),
		"light": {
			"Ambient": require('3d/light/Ambient'),
			"Directional": require('3d/light/Directional'),
			"Point": require('3d/light/Point'),
			"Spot": require('3d/light/Spot')
		},
		"particleSystem": {
			"Particle": require('3d/particleSystem/Particle'),
			"ParticleSystem": require('3d/particleSystem/ParticleSystem')
		},
		"plugin": {
			"FirstPersonControl": require('3d/plugin/FirstPersonControl'),
			"OrbitControl": require('3d/plugin/OrbitControl'),
			"Skybox": require('3d/plugin/Skybox'),
			"Skydome": require('3d/plugin/Skydome')
		},
		"prePass": {
			"Reflection": require('3d/prePass/Reflection'),
			"ShadowMap": require('3d/prePass/ShadowMap')
		},
		"shader": {
			"library": require('3d/shader/library')
		},
		"texture": {
			"Texture2D": require('3d/texture/Texture2D'),
			"TextureCube": require('3d/texture/TextureCube')
		},
		"util": {
			"mesh": require('3d/util/mesh')
		}
	},
	"animation": {
		"Animation": require('animation/Animation'),
		"Clip": require('animation/Clip'),
		"easing": require('animation/easing')
	},
	"core": {
		"Base": require('core/Base'),
		"Cache": require('core/Cache'),
		"Event": require('core/Event'),
		"Matrix2": require('core/Matrix2'),
		"Matrix2d": require('core/Matrix2d'),
		"Matrix3": require('core/Matrix3'),
		"Matrix4": require('core/Matrix4'),
		"Quaternion": require('core/Quaternion'),
		"Vector2": require('core/Vector2'),
		"Vector3": require('core/Vector3'),
		"Vector4": require('core/Vector4'),
		"mixin": {
			"derive": require('core/mixin/derive'),
			"notifier": require('core/mixin/notifier')
		},
		"request": require('core/request')
	},
	"loader": {
		"FX": require('loader/FX'),
		"GLTF": require('loader/GLTF'),
		"InstantGeometry": require('loader/InstantGeometry'),
		"SVG": require('loader/SVG'),
		"three": {
			"Model": require('loader/three/Model')
		}
	},
	"util": {
		"color": require('util/color'),
		"util": require('util/util')
	}
};

    var glMatrix = require('glmatrix');
    exportsObject.math = glMatrix;
    
    return exportsObject;
});
var qtek = require("qtek");

for(var name in qtek){
	_exports[name] = qtek[name];
}

})