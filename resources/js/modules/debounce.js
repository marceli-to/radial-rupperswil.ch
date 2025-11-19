/**
 * Creates a debounced function that delays invoking the provided function
 * until after the specified delay has elapsed since the last invocation.
 *
 * @param {Function} func - The function to debounce
 * @param {number} delay - The delay in milliseconds
 * @param {Object} options - Optional configuration
 * @param {boolean} options.leading - Invoke on the leading edge (default: false)
 * @param {boolean} options.trailing - Invoke on the trailing edge (default: true)
 * @returns {Function & { cancel: () => void, flush: () => void }} The debounced function with cancel and flush methods
 */
export default function debounce(func, delay, { leading = false, trailing = true } = {}) {
  let timeoutId = null;
  let lastArgs = null;
  let lastThis = null;
  let lastCallTime = null;
  let result = null;

  function invokeFunc(time) {
    const args = lastArgs;
    const thisArg = lastThis;
    lastArgs = null;
    lastThis = null;
    lastCallTime = time;
    result = func.apply(thisArg, args);
    return result;
  }

  function shouldInvoke(time) {
    const timeSinceLastCall = lastCallTime === null ? delay : time - lastCallTime;
    return lastCallTime === null || timeSinceLastCall >= delay;
  }

  function trailingEdge(time) {
    timeoutId = null;
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = null;
    lastThis = null;
    return result;
  }

  function timerExpired() {
    const time = Date.now();
    return trailingEdge(time);
  }

  function debounced(...args) {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);

    lastArgs = args;
    lastThis = this;

    if (isInvoking) {
      if (timeoutId === null && leading) {
        lastCallTime = time;
        timeoutId = setTimeout(timerExpired, delay);
        return invokeFunc(time);
      }
    }

    if (timeoutId === null) {
      timeoutId = setTimeout(timerExpired, delay);
    }

    return result;
  }

  debounced.cancel = function () {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    lastArgs = null;
    lastThis = null;
    lastCallTime = null;
    timeoutId = null;
  };

  debounced.flush = function () {
    if (timeoutId !== null) {
      return trailingEdge(Date.now());
    }
    return result;
  };

  debounced.pending = function () {
    return timeoutId !== null;
  };

  return debounced;
}
