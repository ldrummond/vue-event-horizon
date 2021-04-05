/*!
  * vue-event-horizon v0.0.0-development
  * (c) 2021 Lucas Drummond & Matt Wiggins
  * @license MIT
  */
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

function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return _arrayLikeToArray(arr);
}

function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
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

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

function throttle(callback, delay) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var timeout;
  var lastState;
  var currentArgs;

  var throttled = function throttled(state) {
    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    currentArgs = args;
    if (timeout && state === lastState) return;
    var leading = options.leading;

    if (typeof leading === "function") {
      leading = leading(state, lastState);
    }

    if ((!timeout || state !== lastState) && leading) {
      callback.apply(void 0, [state].concat(_toConsumableArray(currentArgs)));
    }

    lastState = state;
    clearTimeout(timeout);
    timeout = setTimeout(function () {
      callback.apply(void 0, [state].concat(_toConsumableArray(currentArgs)));
      timeout = 0;
    }, delay);
  };

  throttled._clear = function () {
    clearTimeout(timeout);
    timeout = null;
  };

  return throttled;
}
/**
 * 
 * @param {*} val1 
 * @param {*} val2 
 */

function deepEqual(val1, val2) {
  if (val1 === val2) return true;

  if (_typeof(val1) === "object") {
    for (var key in val1) {
      if (!deepEqual(val1[key], val2[key])) {
        return false;
      }
    }

    return true;
  }

  return false;
}
/**
 * Detect if "event passive" is supported
 */

var supports_passive = false;

try {
  window.addEventListener("test", null, Object.defineProperty({}, "passive", {
    /* eslint-disable-next-line getter-return */
    get: function get() {
      supports_passive = {
        passive: true
      };
    }
  }));
  /* eslint-disable-next-line no-empty */
} catch (err) {}

var passiveIfSupported = supports_passive;

var EventHorizonTrigger = /*#__PURE__*/function () {
  function EventHorizonTrigger() {
    _classCallCheck(this, EventHorizonTrigger);

    // privates
    this._nodes = {}; // Object to prioritize lookup time

    this._event_horizons = 5;
    this._thresholds = [];
    this._observers = []; // bindings

    this.constructObservers = this.constructObservers.bind(this);
    this.onNodeVisibilityChange = this.onNodeVisibilityChange.bind(this);
    this.observeNode = this.observeNode.bind(this);
    this.unobserveNode = this.unobserveNode.bind(this); //

    this.constructObservers();
  }

  _createClass(EventHorizonTrigger, [{
    key: "constructObservers",
    value: function constructObservers() {
      var _this = this;

      var observer;

      var _loop = function _loop(i) {
        var threshold = 1 / (_this._event_horizons - 1) * i * 100;

        _this._thresholds.push(threshold);

        observer = new IntersectionObserver(function (entries, observer) {
          return _this.onNodeVisibilityChange(entries, observer, threshold);
        }, {
          rootMargin: "0px 0px -".concat(threshold, "% 0px")
        });

        _this._observers.push(observer);
      };

      for (var i = 0; i < this._event_horizons; i++) {
        _loop(i);
      }
    }
  }, {
    key: "observeNode",
    value: function observeNode(_node) {
      this._nodes[_node.uid] = _node;

      this._observers.forEach(function (observer) {
        observer.observe(_node.el);
      });
    }
  }, {
    key: "onNodeVisibilityChange",
    value: function onNodeVisibilityChange(entries, observer, threshold) {
      var _this2 = this;

      entries.forEach(function (entry) {
        // Ignore if element is past the viewport
        // if (entry.boundingClientRect.bottom <= 0) return // (why do we have this again? TODO: Make this optional)
        var _uid = entry.target.getAttribute("data-event-horizon-uid");

        var _node = _this2._nodes[_uid];

        if (entry.isIntersecting) {
          entry.target.classList.add("trigger-".concat(threshold)); //
          // If modifier once, remove target from observer.

          if (_node && _node.modifiers.once) {
            observer.unobserve(entry.target);
          } //
          // Execute callback only on window visibility change.


          if (_node && _node.callback && threshold === _node.callback_threshold) {
            _node.callback(_node.el, true);
          }
        } else {
          entry.target.classList.remove("trigger-".concat(threshold)); // if has callback, call it on leave with false

          if (_node && _node.callback && threshold === 0) {
            _node.callback(_node.el, false);
          }
        }
      });
    }
  }, {
    key: "unobserveNode",
    value: function unobserveNode(_uid) {
      var _node = this._nodes[_uid];

      if (_node) {
        this._observers.forEach(function (observer) {
          observer.unobserve(_node.el);
        }); // Don't remove these, because it removes transition before 'destroy' happens
        // _node.el.classList.remove(
        //   ...this._thresholds.map(percent => `trigger-${percent}`)
        // )


        delete this._nodes[_uid];
      }
    }
  }]);

  return EventHorizonTrigger;
}();

/**
 *
 */

var EventHorizonParallax = /*#__PURE__*/function () {
  function EventHorizonParallax() {
    _classCallCheck(this, EventHorizonParallax);

    //  privates
    this._nodes = []; // uses an Array to prioritize iteration time

    this._has_nodes = false; //  waits to start loop and listeners until has nodes.
    //  bindings

    this.onResize = throttle(this.onResize.bind(this), 100);
    this.onScroll = this.onScroll.bind(this);
    this.throttledUpdateProgress = this.updateProgress.bind(this); //  debounce(this.updateParallaxed.bind(this), 10);

    this.startEvents = this.startEvents.bind(this);
    this.updateAllRanges = this.updateAllRanges.bind(this);
    this.updateRange = this.updateRange.bind(this);
    this.updateParallaxCallbacks = this.updateParallaxCallbacks.bind(this);
    this.updateProgress = this.updateProgress.bind(this);
    this.observeNode = this.observeNode.bind(this);
    this.unobserveNode = this.unobserveNode.bind(this);
    this.onRAF = this.onRAF.bind(this);
  }

  _createClass(EventHorizonParallax, [{
    key: "startEvents",
    value: function startEvents() {
      this._frame = requestAnimationFrame(this.onRAF);
      window.addEventListener("resize", this.onResize, passiveIfSupported);
      window.addEventListener("scroll", this.onScroll, passiveIfSupported);
    }
  }, {
    key: "stopEvents",
    value: function stopEvents() {
      cancelAnimationFrame(this._frame);
      window.removeEventListener("resize", this.onResize, passiveIfSupported);
      window.removeEventListener("scroll", this.onScroll, passiveIfSupported);
    }
  }, {
    key: "onScroll",
    value: function onScroll() {
      var scroll = window.pageYOffset;
      this.throttledUpdateProgress(scroll);
    }
  }, {
    key: "onResize",
    value: function onResize() {
      this.updateAllRanges();
    }
  }, {
    key: "observeNode",
    value: function observeNode(_node) {
      if (!this._has_nodes) {
        this._has_nodes = true;
        this.startEvents();
      }

      _node.el.style.willChange = "transform";
      this.updateRange(_node);
      this.updateParallaxCallbacks(_node);

      this._nodes.push(_node); // Needs initial state 


      this.onScroll();
    }
  }, {
    key: "updateParallaxCallbacks",
    value: function updateParallaxCallbacks(_node) {
      var _callback;

      for (var prop_type in _node.opts) {
        switch (prop_type) {
          case "x":
            _callback = function _callback(fxs, prop_vals) {
              fxs.transform += "translateX(".concat(Math.round(prop_vals.at), "px)");
            };

            break;

          case "y":
            _callback = function _callback(fxs, prop_vals) {
              fxs.transform += "translateY(".concat(Math.round(prop_vals.at), "px)");
            };

            break;

          case "r":
            _callback = function _callback(fxs, prop_vals) {
              fxs.transform += "rotateZ(".concat(Math.round(prop_vals.at), "deg)");
            };

            break;

          case "rx":
            _callback = function _callback(fxs, prop_vals) {
              fxs.transform += "perspective(800px) rotateX(".concat(Math.round(prop_vals.at), "deg)");
            };

            break;

          case "ry":
            _callback = function _callback(fxs, prop_vals) {
              fxs.transform += "perspective(800px) rotateY(".concat(Math.round(prop_vals.at), "deg)");
            };

            break;

          case "s":
            _callback = function _callback(fxs, prop_vals) {
              fxs.transform += "scale(".concat(prop_vals.at, ")");
            };

            break;

          case "o":
            _callback = function _callback(fxs, prop_vals) {
              fxs.opacity = prop_vals.at;
            };

            break;
        }

        _node.opts[prop_type].callback = _callback;
      }
    }
  }, {
    key: "updateAllRanges",
    value: function updateAllRanges() {
      this._nodes.forEach(this.updateRange);
    }
  }, {
    key: "updateRange",
    value: function updateRange(_node) {
      var range_offset,
          from_dy = 0,
          to_dy = 0;

      var rect = _node.el.getBoundingClientRect();

      if (_node.opts.fx_range_end) {
        range_offset = _node.opts.fx_range_end * window.innerHeight;
      } else {
        range_offset = 0;
      }

      if (_node.opts.y) {
        from_dy = _node.opts.y.from;
        to_dy = _node.opts.y.to;
      }

      _node.from = rect.top + from_dy - window.innerHeight + window.pageYOffset;
      _node.to = rect.bottom + to_dy + window.pageYOffset - range_offset;
    }
  }, {
    key: "updateProgress",
    value: function updateProgress(scroll) {
      this._nodes.forEach(function (_node) {
        var percent = 0;

        if (scroll > _node.from && scroll < _node.to) {
          percent = (scroll - _node.from) / (_node.to - _node.from);
        } else if (scroll > _node.to) {
          percent = 1;
        }

        for (var prop_type in _node.opts) {
          var prop = _node.opts[prop_type];
          prop.at = prop.from + (prop.to - prop.from) * percent;
        }
      });
    }
  }, {
    key: "onRAF",
    value: function onRAF() {
      this._frame = requestAnimationFrame(this.onRAF);

      this._nodes.forEach(function (_node) {
        var fxs = {
          transform: "",
          opacity: ""
        };

        for (var prop_type in _node.opts) {
          var prop_vals = _node.opts[prop_type];

          _node.opts[prop_type].callback(fxs, prop_vals);
        }

        if (fxs.transform.length > 0) {
          _node.el.style.transform = fxs.transform;
        }

        if (fxs.opacity.length > 0) {
          _node.el.style.opacity = fxs.opacity;
        }
      });
    }
  }, {
    key: "unobserveNode",
    value: function unobserveNode(_uid) {
      this._nodes = this._nodes.filter(function (obj) {
        return obj.uid !== _uid;
      });

      if (this._nodes.length === 0) {
        this._has_nodes = false;
        this.stopEvents();
      }
    }
  }]);

  return EventHorizonParallax;
}();

/**
 *
 * This is an implementation of Matt Wiggins Event Horizon Plugin,
 * modified to use Interserction Observer API, and to export functions to
 * bind to the dom as a Vue directive
 *
 * It builds off the IO and directive structure of the vue Observe Visiblity plugin,
 * but creates a global IO instance rather than one for each element.
 *
 */

var needs_io_polyfill = !("IntersectionObserver" in window) || !("IntersectionObserverEntry" in window) || !("intersectionRatio" in window.IntersectionObserverEntry.prototype);
var io_load_promise;

if (needs_io_polyfill) {
  io_load_promise = import('./intersection-observer-0905e8c5.js');
} else {
  io_load_promise = Promise.resolve();
}

var eventHorizonTriggerController;
var eventHorizonParallaxController;
/**
 * 
 * @param {*} el 
 * @param {*} param1 
 * @param {*} vnode 
 */

function bind(el, _ref, vnode) {
  var _ref$arg = _ref.arg,
      arg = _ref$arg === void 0 ? "" : _ref$arg,
      _ref$modifiers = _ref.modifiers,
      modifiers = _ref$modifiers === void 0 ? {} : _ref$modifiers,
      _ref$value = _ref.value,
      opts = _ref$value === void 0 ? {} : _ref$value;

  var _uid, _node, _callback;
  /**
   * Generates a unique identifier for each dom node that has not already been stored in the
   * controller dom cache. Then stores the element in the cache.
   */


  _uid = (Date.now() + Math.round(Math.random() * 1000) + Math.round(Math.random() * 1000) + Math.round(Math.random() * 1000)).toString(); // Register callback

  _callback = typeof opts === "function" ? opts : opts.callback; // Settings

  _node = {
    uid: _uid,
    el: el,
    type: arg,
    callback: _callback,
    callback_threshold: opts.callback_threshold || 0,
    modifiers: modifiers,
    opts: opts,
    top: undefined,
    is_intersecting: undefined,
    from: undefined,
    to: undefined,
    offset: undefined
  };
  /**
   * Use directive attrs to set observers.
   * Wait until IO polyfill has loaded, if necessary.
   */

  io_load_promise.then(function () {
    eventHorizonTriggerController = new EventHorizonTrigger();
    eventHorizonParallaxController = new EventHorizonParallax();
    vnode.context.$nextTick(function () {
      switch (arg) {
        default:
        case "trigger":
          el.setAttribute("data-event-horizon-uid", _uid);
          eventHorizonTriggerController.observeNode(_node);
          break;

        case "parallax":
          eventHorizonParallaxController.observeNode(_node);
          break;
      }
    });
  })["catch"](function (e) {
    console.log("Error polyfilling IO", e);
  });
}
/**
 * 
 * @param {*} el 
 * @param {*} param1 
 */


function update(el, _ref2) {
  var value = _ref2.value,
      oldValue = _ref2.oldValue;
  if (deepEqual(value, oldValue)) return;
  if (!value) unbind(el);
}
/**
 * 
 * @param {*} el 
 * @param {*} param1 
 */


function unbind(el, _ref3) {
  var arg = _ref3.arg;
  io_load_promise.then(function () {
    var _uid = el.getAttribute("data-event-horizon-uid");

    switch (arg) {
      default:
      case "trigger":
        eventHorizonTriggerController.unobserveNode(_uid);
        break;

      case "parallax":
        eventHorizonParallaxController.unobserveNode(_uid);
        break;
    }
  });
}

var EventHorizon = {
  bind: bind,
  update: update,
  unbind: unbind
};

var install = function install(Vue) {
  Vue.directive("event-horizon", EventHorizon);
};

if (typeof window !== 'undefined' && window.Vue) {
  window.EventHorizon = EventHorizon;
  if (window.Vue.use) window.Vue.use(install);
}

EventHorizon.install = install;

export default EventHorizon;
