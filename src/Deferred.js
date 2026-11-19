/**
 * Small idempotent deferred helper.
 */
export default class Deferred {
  constructor() {
    this.settled = false;
    this.promise = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
  }

  resolve(value) {
    if (this.settled) {
      return;
    }
    this.settled = true;
    this._resolve(value);
  }

  reject(error) {
    if (this.settled) {
      return;
    }
    this.settled = true;
    this._reject(error);
  }
}

/**
 * Exclusively for test purposes.
 */
var g = typeof window !== 'undefined' ? window
    : typeof global !== 'undefined' ? global
    : typeof self !== 'undefined' ? self : {};
g.FlowDeferred = Deferred;
