"use strict"

/**
 * 
 * @param {*} callback 
 * @param {*} delay 
 * @param {*} options 
 */
export function throttle (callback, delay, options = {}) {
  let timeout
  let lastState
  let currentArgs
  const throttled = (state, ...args) => {
    currentArgs = args
    if (timeout && state === lastState) return
    let leading = options.leading
    if (typeof leading === "function") {
      leading = leading(state, lastState)
    }
    if ((!timeout || state !== lastState) && leading) {
      callback(state, ...currentArgs)
    }
    lastState = state
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      callback(state, ...currentArgs)
      timeout = 0
    }, delay)
  }
  throttled._clear = () => {
    clearTimeout(timeout)
    timeout = null
  }
  return throttled
}

/**
 * 
 * @param {*} val1 
 * @param {*} val2 
 */
export function deepEqual (val1, val2) {
  if (val1 === val2) return true
  if (typeof val1 === "object") {
    for (const key in val1) {
      if (!deepEqual(val1[key], val2[key])) {
        return false
      }
    }
    return true
  }
  return false
}

/**
 * Detect if "event passive" is supported
 */
 let supports_passive = false;
 try {
   window.addEventListener("test", null,
     Object.defineProperty(
       {},
       "passive",
       {
         /* eslint-disable-next-line getter-return */ 
         get: function() { supports_passive = { passive: true }; }
       }
     )
   );
   /* eslint-disable-next-line no-empty */ 
 } catch(err) {}
 export const passiveIfSupported = supports_passive;