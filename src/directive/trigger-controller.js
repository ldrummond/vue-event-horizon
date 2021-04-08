"use strict";

/**
 * 
 */
 export class EventHorizonTrigger {
  constructor () {
    // privates
    this._nodes = {} // Object to prioritize lookup time
    this._event_horizons = 5
    this._thresholds = []
    this._observers = []

    // bindings
    this.constructObservers = this.constructObservers.bind(this)
    this.onNodeVisibilityChange = this.onNodeVisibilityChange.bind(this)
    this.observeNode = this.observeNode.bind(this)
    this.unobserveNode = this.unobserveNode.bind(this)

    //
    this.constructObservers()
  }

  constructObservers () {
    let observer

    for (let i = 0; i < this._event_horizons; i++) {
      const threshold = (1 / (this._event_horizons - 1)) * i * 100
      this._thresholds.push(threshold)

      observer = new IntersectionObserver(
        (entries, observer) =>
          this.onNodeVisibilityChange(entries, observer, threshold),
        {
          rootMargin: `0px 0px -${threshold}% 0px`
        }
      )
      this._observers.push(observer)
    }
  }

  observeNode (_node) {
    this._nodes[_node.uid] = _node

    this._observers.forEach((observer) => {
      observer.observe(_node.el)
    })
  }

  onNodeVisibilityChange (entries, observer, threshold) {
    entries.forEach((entry) => {
      // Ignore if element is past the viewport
      if(_node && !_node.modifiers.cleanup) {
        if (entry.boundingClientRect.bottom <= 0) return // (why do we have this again? TODO: Make this optional)
      }

      const _uid = entry.target.getAttribute("data-event-horizon-uid")
      const _node = this._nodes[_uid]

      if (entry.isIntersecting) {
        entry.target.classList.add(`trigger-${threshold}`)

        //
        // If modifier once, remove target from observer.
        if (_node && _node.modifiers.once) {
          observer.unobserve(entry.target)
        }

        //
        // Execute callback only on window visibility change.
        if (_node && _node.callback && threshold === _node.callback_threshold) {
          _node.callback(_node.el, true)
        }
      } else {
        entry.target.classList.remove(`trigger-${threshold}`);
        
        // if has callback, call it on leave with false
        if (_node && _node.callback && threshold === 0) {
          _node.callback(_node.el, false)
        }
      }
    })
  }

  unobserveNode (_uid) {
    const _node = this._nodes[_uid]
    if (_node) {
      this._observers.forEach((observer) => {
        observer.unobserve(_node.el)
      })

      // Don't remove these, because it removes transition before 'destroy' happens
      // _node.el.classList.remove(
      //   ...this._thresholds.map(percent => `trigger-${percent}`)
      // )

      delete this._nodes[_uid]
    }
  }
}
