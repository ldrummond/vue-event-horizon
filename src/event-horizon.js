import { throttle, find } from "lodash";

class EventHorizon {
  constructor() {
    // bindings
    this.init = throttle(this.init, 250).bind(this);
    this.constructObservers = this.constructObservers.bind(this);
    this.resetObservers = this.resetObservers.bind(this);
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

    // events
    window.addEventListener("resize", this.onResize);
    window.addEventListener("scroll", this.onScroll);

    // mutation observer
    new MutationObserver(this.init).observe(document, {
      attributes: false,
      childList: true,
      subtree: true
    });

    // frame
    this._frame = requestAnimationFrame(this.onRAF);

    if (this.hasIO) {
      console.log("[event-horizon] Using Intersection Observer");
      this.constructObservers();
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
    this._triggered = document.querySelectorAll('[data-scroll="trigger"]');
    this._parallaxed = document.querySelectorAll('[data-scroll="parallax"]');

    this.onResize();
    this.onScroll();
    if (this.hasIO) {
      this.resetObservers();
    }
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
   * Destroy observers
   */
  resetObservers() {
    this._observers.forEach(observer => {
      observer.disconnect();
      this._triggered.forEach(el => {
        observer.observe(el);
      });
    });
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

    // parallaxed
    this.cacheParallaxedRanges();
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
   * Cache triggered offsets.
   */
  cacheTriggeredOffsets() {
    this._triggered_offsets = Array.from(this._triggered).map(
      t => t.getBoundingClientRect().top + window.pageYOffset
    );
  }

  /**
   * Cache parallaxed ranges.
   */
  cacheParallaxedRanges() {
    this._parallaxed_ranges = Array.from(this._parallaxed).map(t => {
      let rect = t.getBoundingClientRect(),
        fx = JSON.parse(t.getAttribute("data-fx")),
        range_offset =
          typeof t.getAttribute("data-fx_range_end") === "undefined"
            ? 0
            : t.getAttribute("data-fx_range_end") * window.innerHeight,
        py = find(fx, { prop: "y" }),
        dy = 0;

      if (typeof py !== "undefined") {
        dy = py.to - py.from - rect.height;
      }

      return {
        from: rect.top - window.innerHeight + window.pageYOffset,
        to: rect.bottom + dy + window.pageYOffset - range_offset,
        fx: fx
      };
    });
  }

  /**
   * Update classes for triggered elements.
   */
  updateTriggered(scroll) {
    //this.cacheTriggeredOffsets()

    this._triggered_offsets.forEach((offset, i) => {
      let add = [],
        remove = [];

      this._window_segments.forEach((segment, j) => {
        let c = `trigger-${Math.floor((1 - j / this._event_horizons) * 100)}`;

        if (scroll + segment > offset) add.push(c);
        else remove.push(c);
      });

      this._triggered[i].classList.remove(...remove);
      this._triggered[i].classList.add(...add);
    });
  }

  /**
   * Update classes for triggered elements with IO.
   */
  onTriggerVisibilityChange(entries, observer, threshold) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add(`trigger-${threshold}`);
      } else {
        entry.target.classList.remove(`trigger-${threshold}`);
      }
    });
  }

  /**
   * Update parallaxed elements.
   */
  updateParallaxed(scroll) {
    //this.cacheParallaxedRanges()

    this._parallaxed_ranges.forEach((range, i) => {
      let percent = 0;

      if (scroll > range.from && scroll < range.to) {
        percent = (scroll - range.from) / (range.to - range.from);
      } else if (scroll > range.to) {
        percent = 1;
      }

      range.fx.forEach(prop => {
        prop.at = prop.from + (prop.to - prop.from) * percent;
      });
    });
  }

  /**
   * RAF.
   */
  onRAF() {
    this._frame = requestAnimationFrame(this.onRAF);

    Array.from(this._parallaxed).forEach((el, i) => {
      let transform = "",
        opacity = el.style.opacity;

      this._parallaxed_ranges[i].fx.forEach(fx => {
        switch (fx.prop) {
          case "x":
            transform += `translateX(${Math.round(fx.at)}px) `;
            break;
          case "y":
            transform += `translateY(${Math.round(fx.at)}px) `;
            break;
          case "r":
            transform += `rotateZ(${Math.round(fx.at)}deg) `;
            break;
          case "rx":
            transform += `perspective(800px) rotateX(${Math.round(fx.at)}deg) `;
            break;
          case "ry":
            transform += `perspective(800px) rotateY(${Math.round(fx.at)}deg) `;
            break;
          case "s":
            transform += `scale(${fx.at}) `;
            break;
          case "o":
            opacity = fx.at;
            break;
        }
      });

      el.style.transform = transform;
      el.style.opacity = opacity;
    });
  }
}

export default () => new EventHorizon();
