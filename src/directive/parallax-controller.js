"use strict"
import { throttle, passiveIfSupported } from "./utils";

/**
 *
 */
export class EventHorizonParallax {
  constructor () {
    //  privates
    this._nodes = [] // uses an Array to prioritize iteration time
    this._has_nodes = false //  waits to start loop and listeners until has nodes.

    //  bindings
    this.onResize = throttle(this.onResize.bind(this), 100)
    this.onScroll = this.onScroll.bind(this)
    this.throttledUpdateProgress = this.updateProgress.bind(this) //  debounce(this.updateParallaxed.bind(this), 10);
    this.startEvents = this.startEvents.bind(this)
    this.updateAllRanges = this.updateAllRanges.bind(this)
    this.updateRange = this.updateRange.bind(this)
    this.updateParallaxCallbacks = this.updateParallaxCallbacks.bind(this)
    this.updateProgress = this.updateProgress.bind(this)
    this.observeNode = this.observeNode.bind(this)
    this.unobserveNode = this.unobserveNode.bind(this)
    this.onRAF = this.onRAF.bind(this)
  }

  startEvents () {
    this._frame = requestAnimationFrame(this.onRAF)
    window.addEventListener("resize", this.onResize, passiveIfSupported)
    window.addEventListener("scroll", this.onScroll, passiveIfSupported)
  }

  stopEvents () {
    cancelAnimationFrame(this._frame)
    window.removeEventListener("resize", this.onResize, passiveIfSupported)
    window.removeEventListener("scroll", this.onScroll, passiveIfSupported)
  }

  onScroll () {
    const scroll = window.pageYOffset
    this.throttledUpdateProgress(scroll)
  }

  onResize () {
    this.updateAllRanges()
  }

  observeNode (_node) {
    if (!this._has_nodes) {
      this._has_nodes = true
      this.startEvents()
    }
    _node.el.style.willChange = "transform"
    this.updateRange(_node)
    this.updateParallaxCallbacks(_node)
    this._nodes.push(_node)
    // Needs initial state 
    this.onScroll();
  }

  updateParallaxCallbacks (_node) {
    let _callback

    for (const prop_type in _node.opts) {
      switch (prop_type) {
        case "x":
          _callback = (fxs, prop_vals) => { fxs.transform += `translateX(${Math.round(prop_vals.at)}px)` }
          break
        case "y":
          _callback = (fxs, prop_vals) => { fxs.transform += `translateY(${Math.round(prop_vals.at)}px)` }
          break
        case "r":
          _callback = (fxs, prop_vals) => { fxs.transform += `rotateZ(${Math.round(prop_vals.at)}deg)` }
          break
        case "rx":
          _callback = (fxs, prop_vals) => { fxs.transform += `perspective(800px) rotateX(${Math.round(prop_vals.at)}deg)` }
          break
        case "ry":
          _callback = (fxs, prop_vals) => { fxs.transform += `perspective(800px) rotateY(${Math.round(prop_vals.at)}deg)` }
          break
        case "s":
          _callback = (fxs, prop_vals) => { fxs.transform += `scale(${prop_vals.at})` }
          break
        case "o":
          _callback = (fxs, prop_vals) => { fxs.opacity = prop_vals.at }
          break
      }
      _node.opts[prop_type].callback = _callback
    }
  }

  updateAllRanges () {
    this._nodes.forEach(this.updateRange)
  }

  updateRange (_node) {
    let range_offset, from_dy = 0, to_dy = 0
    const rect = _node.el.getBoundingClientRect()

    if (_node.opts.fx_range_end) {
      range_offset = _node.opts.fx_range_end * window.innerHeight
    } else {
      range_offset = 0
    }

    if (_node.opts.y) {
      from_dy = _node.opts.y.from
      to_dy = _node.opts.y.to
    }

    _node.from = rect.top + from_dy - window.innerHeight + window.pageYOffset
    _node.to = rect.bottom + to_dy + window.pageYOffset - range_offset
  }

  updateProgress (scroll) {
    this._nodes.forEach((_node) => {
      let percent = 0
      if (scroll > _node.from && scroll < _node.to) {
        percent = (scroll - _node.from) / (_node.to - _node.from)
      } else if (scroll > _node.to) {
        percent = 1
      }

      for (const prop_type in _node.opts) {
        const prop = _node.opts[prop_type]
        prop.at = prop.from + (prop.to - prop.from) * percent
      }
    })
  }

  onRAF () {
    this._frame = requestAnimationFrame(this.onRAF)
    
    this._nodes.forEach((_node) => {
      const fxs = { transform: "", opacity: "" }

      for (const prop_type in _node.opts) {
        const prop_vals = _node.opts[prop_type]
        _node.opts[prop_type].callback(fxs, prop_vals)
      }

      if (fxs.transform.length > 0) {
        _node.el.style.transform = fxs.transform
      }
      if (fxs.opacity.length > 0) {
        _node.el.style.opacity = fxs.opacity
      }
    })
  }

  unobserveNode (_uid) {
    this._nodes = this._nodes.filter(obj => obj.uid !== _uid)

    if (this._nodes.length === 0) {
      this._has_nodes = false
      this.stopEvents()
    }
  }
}

