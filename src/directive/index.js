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
"use strict"
import { deepEqual } from "./utils";
import { EventHorizonTrigger } from "./trigger-controller"; 
import { EventHorizonParallax } from "./parallax-controller"; 

// Polyfill IntersectionObserver
const needs_io_polyfill = (
  !("IntersectionObserver" in window) ||
  !("IntersectionObserverEntry" in window) ||
  !("intersectionRatio" in window.IntersectionObserverEntry.prototype)
);

let io_load_promise; 
if(needs_io_polyfill) {
  io_load_promise = import("intersection-observer");
} else {
  io_load_promise = Promise.resolve(); 
}

let eventHorizonTriggerController;
let eventHorizonParallaxController;

/**
 * 
 * @param {*} el 
 * @param {*} param1 
 * @param {*} vnode 
 */
function bind (el, { arg = "", modifiers = {}, value: opts = {} }, vnode) {
  let _uid, _node, _callback

  /**
   * Generates a unique identifier for each dom node that has not already been stored in the
   * controller dom cache. Then stores the element in the cache.
   */
  _uid = (
    Date.now() +
    Math.round(Math.random() * 1000) +
    Math.round(Math.random() * 1000) +
    Math.round(Math.random() * 1000)
  ).toString()

  // Register callback
  _callback = typeof opts === "function" ? opts : opts.callback

  // Settings
  _node = {
    uid: _uid,
    el,
    type: arg,
    callback: _callback,
    callback_threshold: opts.callback_threshold || 0,
    modifiers,
    opts,
    top: undefined,
    is_intersecting: undefined,
    from: undefined,
    to: undefined,
    offset: undefined
  }

  /**
   * Use directive attrs to set observers.
   * Wait until IO polyfill has loaded, if necessary.
   */
  io_load_promise.then(() => {
    eventHorizonTriggerController = new EventHorizonTrigger();
    eventHorizonParallaxController = new EventHorizonParallax();

    vnode.context.$nextTick(() => {
      switch (arg) {
        default:
        case "trigger":
          el.setAttribute("data-event-horizon-uid", _uid)
          eventHorizonTriggerController.observeNode(_node)
          break
  
        case "parallax":
          eventHorizonParallaxController.observeNode(_node)
          break
      }
    })
  }).catch(e => {
    console.log("Error polyfilling IO", e);
  })
}

/**
 * 
 * @param {*} el 
 * @param {*} param1 
 */
function update (el, { value, oldValue }) {
  if (deepEqual(value, oldValue)) return
  if (!value) unbind(el)
}

/**
 * 
 * @param {*} el 
 * @param {*} param1 
 */
function unbind (el, { arg }) {
  io_load_promise.then(() => {
    let _uid = el.getAttribute("data-event-horizon-uid")

    switch (arg) {
      default:
      case "trigger":
        eventHorizonTriggerController.unobserveNode(_uid)
        break

      case "parallax":
        eventHorizonParallaxController.unobserveNode(_uid)
        break
    }
  })
}

export default {
  bind,
  update,
  unbind
}