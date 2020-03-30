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
import { throttle, deepEqual } from "../utils";

class EventHorizon {
  constructor() {
    // bindings
    this.init = throttle(this.init.bind(this), 250);
    this.constructObservers = this.constructObservers.bind(this);
    this.onResize = this.onResize.bind(this);
    this.onScroll = this.onScroll.bind(this);
    this.onRAF = this.onRAF.bind(this);

    // privates
    this._event_horizons = 4;
    this._window_segments = [];
    this._triggered_offsets = [];
    this._parallaxed_ranges = [];
    this._observers = [];
    this._thresholds = [];
    this._target_nodes = [];

    // events
    window.addEventListener("resize", this.onResize);
    window.addEventListener("scroll", this.onScroll);

    // frame
    this._frame = requestAnimationFrame(this.onRAF);

    // use intersection observer
    if (this.hasIO) {
      console.log("[event-horizon] Using Intersection Observer");
      this.constructObservers();
    } else {
      this.init();
    }
  }

  /**
   * Checks if current browser supports intersection observer
   */
  get hasIO() {
    return !!window.IntersectionObserver;
  }

  /**
   * Init.
   */
  init() {
    this.onResize();
    this.onScroll();
  }

  /**
   * Handle resize.
   */
  onResize() {
    if (!this.hasIO) {
      let scroll = window.pageYOffset,
        view_h = window.innerHeight,
        segment = view_h / this._event_horizons;

      // triggered
      for (var i = 0; i < this._event_horizons; i++) {
        this._window_segments[i] = segment * i;
      }
      this._window_segments[this._event_horizons] = view_h;
      this.cacheTriggeredOffsets();
    }

    this.updateAllNodeParallaxRanges();
  }

  /**
   * Handle scroll.
   */
  onScroll() {
    let scroll = window.pageYOffset;

    if (!this.hasIO) {
      this.updateTriggered(scroll);
    }
    this.updateParallaxed(scroll);
  }

  /**
   * Init Observers
   */
  constructObservers() {
    let observer;

    for (let i = 0; i < this._event_horizons; i++) {
      let threshold = (1 / this._event_horizons) * i * 100;
      this._thresholds.push(threshold);

      observer = new IntersectionObserver(
        (entries, observer) =>
          this.onTriggerVisibilityChange(entries, observer, threshold),
        {
          rootMargin: `0px 0px -${threshold}% 0px`
        }
      );
      this._observers.push(observer);
    }
  }

  /**
   * Add DOM element to intersection observers
   */
  observeTriggerElement(_node) {
    this._observers.forEach(observer => {
      observer.observe(_node.el);
    });
  }

  /**
   *
   */
  onTriggerVisibilityChange(entries, observer, threshold) {
    entries.forEach(entry => {
      let _uid = entry.target.getAttribute("data-event-horizon-uid");
      let _node = _uid && this._target_nodes[_uid];

      if (entry.isIntersecting) {
        //
        //
        entry.target.classList.add(`trigger-${threshold}`);

        //
        // If modifier once, target from observer.
        //
        if (_node && _node.modifiers.once) {
          observer.unobserve(entry.target);
        }

        //
        // Execute callback only on window visibility change.
        //
        if (_node && _node.callback && threshold == 0) {
          _node.callback(_node.el, true);
        }
      } else {
        //
        //
        entry.target.classList.remove(`trigger-${threshold}`);
        if (_node && _node.callback && threshold == 0) {
          _node.callback(_node.el, false);
        }
      }
    });
  }

  /**
   *
   * Stop tracking events for the DOM element
   * because it is no longer being rendered
   *
   */
  unobserveTriggerElement(el) {
    this._observers.forEach(observer => {
      observer.unobserve(el);
    });

    el.classList.remove(
      ...this._thresholds.map(percent => `trigger-${percent}`)
    );
  }

  /**
   *
   */
  observeParallaxElement(_node) {
    // this.parallaxObserver && this.parallaxObserver.observe(_node.el);
    this.updateNodeParallaxRanges(_node);
  }

  /**
   *
   * Stop tracking events for the DOM element
   * because it is no longer being rendered
   *
   */
  unobserveParallaxElement(el) {
    // this.parallaxObserver && this.parallaxObserver.unobserve(el);
  }

  /**
   * Cache triggered offsets.
   */
  cacheTriggeredOffsets() {
    Object.values(this._target_nodes).forEach(_node => {
      if (!_node || _node.type !== "trigger") return;
      _node.offset = _node.el.getBoundingClientRect().top + window.pageYOffset;
    });
  }

  /**
   * Update classes for triggered elements.
   */
  updateTriggered(scroll) {
    Object.values(this._target_nodes).forEach(_node => {
      if (!_node || _node.type !== "trigger") return;

      let add = [],
        remove = [];

      this._window_segments.forEach((segment, j) => {
        let c = `trigger-${Math.floor((1 - j / this._event_horizons) * 100)}`;

        if (scroll + segment > _node.offset) add.push(c);
        else remove.push(c);
      });

      _node.el.classList.remove(...remove);
      _node.el.classList.add(...add);
    });
  }

  /**
   *
   * @param {*} _node
   */
  updateNodeParallaxRanges(_node) {
    let rect, range_offset, dy;

    rect = _node.el.getBoundingClientRect();
    range_offset =
      typeof _node.opts.fx_range_end === "undefined"
        ? 0
        : _node.opts.fx_range_end * window.innerHeight;

    dy = 0;
    if (_node.opts.y) {
      dy = _node.opts.y.top - _node.opts.y.from - rect.height;
    }

    _node.from = rect.top - window.innerHeight + window.pageYOffset;
    _node.to = rect.bottom + dy + window.pageYOffset - range_offset;
  }

  /**
   * Cache parallaxed ranges.
   */
  updateAllNodeParallaxRanges() {
    Object.values(this._target_nodes).forEach(_node => {
      if (!_node || _node.type !== "parallax") return;
      this.updateNodeParallaxRanges(_node);
    });
  }

  /**
   * Update parallaxed elements.
   */
  updateParallaxed(scroll) {
    Object.values(this._target_nodes).forEach(_node => {
      if (!_node || _node.type !== "parallax") return;

      let percent = 0;
      if (scroll > _node.from && scroll < _node.to) {
        percent = (scroll - _node.from) / (_node.to - _node.from);
      } else if (scroll > _node.to) {
        percent = 1;
      }

      Object.values(_node.opts).forEach(prop => {
        prop.at = prop.from + (prop.to - prop.from) * percent;
      });
    });
  }

  /**
   * RAF.
   */
  onRAF() {
    this._frame = requestAnimationFrame(this.onRAF);

    Object.values(this._target_nodes).forEach(_node => {
      if (!_node || _node.type !== "parallax") return;
      let _el = _node.el;
      let transform = "",
        opacity = _el.style.opacity;

      Object.entries(_node.opts).map(([prop_type, prop_vals]) => {
        switch (prop_type) {
          case "x":
            transform += `translateX(${Math.round(prop_vals.at)}px) `;
            break;
          case "y":
            transform += `translateY(${Math.round(prop_vals.at)}px) `;
            break;
          case "r":
            transform += `rotateZ(${Math.round(prop_vals.at)}deg) `;
            break;
          case "rx":
            transform += `perspective(800px) rotateX(${Math.round(
              prop_vals.at
            )}deg) `;
            break;
          case "ry":
            transform += `perspective(800px) rotateY(${Math.round(
              prop_vals.at
            )}deg) `;
            break;
          case "s":
            transform += `scale(${prop_vals.at}) `;
            break;
          case "o":
            opacity = prop_vals.at;
            break;
        }
      });

      _el.style.transform = transform;
      _el.style.opacity = opacity;
    });
  }
}

/**
 * Generate an id unique from
 * the current uid-keyed object
 * @param {*} uid_set
 */
function generateUID(uid_keyed_object) {
  let _uid;
  let index = 0;
  while (
    (typeof _uid === "undefined" ||
      Object.prototype.hasOwnProperty.call(uid_keyed_object, _uid)) &&
    index < 1000
  ) {
    index++;
    _uid = Math.round(Math.random() * 1000);
  }
  return _uid;
}

/**
 *
 *
 */
const eventHorizonController = new EventHorizon();

/**
 *
 */
function bind(el, { arg = "", modifiers = {}, value: opts = {} }, vnode) {
  let _uid = el.getAttribute("data-event-horizon-uid");
  let _node, _callback;

  /**
   * Generates a unique identifier for each dom node
   * that has not already been stored in the
   * controller dom cache. Then stores the element
   * in the cache.
   */
  if (!_uid) {
    _uid = generateUID(eventHorizonController._target_nodes);
    el.setAttribute("data-event-horizon-uid", _uid);

    _callback = typeof opts === "function" ? opts : opts.callback;

    _node = {
      el: el,
      type: arg,
      callback: _callback,
      modifiers: modifiers,
      opts: opts,
      top: undefined,
      is_intersecting: undefined,
      from: undefined,
      to: undefined,
      offset: undefined
    };

    eventHorizonController._target_nodes[_uid] = _node;
  } else {
    _node = eventHorizonController._target_nodes[_uid];
  }

  /**
   * Use directive attrs to set observers
   */
  vnode.context.$nextTick(() => {
    if (arg === "trigger") {
      eventHorizonController.observeTriggerElement(_node);
    } else if (arg === "parallax" && opts) {
      eventHorizonController.observeParallaxElement(_node);
    }
  });
}

/**
 *
 */
function update(el, { value, oldValue }) {
  if (deepEqual(value, oldValue)) return;

  if (!value) {
    unbind(el);
    return;
  }
}

/**
 *
 */
function unbind(el, { arg }) {
  let _uid = el.getAttribute("data-event-horizon-uid");

  // unset _uid and dom cache
  if (_uid) {
    eventHorizonController._target_nodes[_uid] = undefined;
  }

  // unobserve based on attrs
  if (arg === "trigger") {
    eventHorizonController.unobserveTriggerElement(el);
  } else if (arg === "parallax") {
    eventHorizonController.unobserveParallaxElement(el);
  }
}

export default {
  bind,
  update,
  unbind
};
