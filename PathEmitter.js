const assert = require('assert');

class PathEmitter {
  static pathSplit(path) {
    return (typeof(path) == 'string') ? path.split('.') : path;
  }

  static pathMatch(pattern, path, reverse) {
    if (!path || !pattern || !pattern.length || !path.length) return false;

    const patl = pattern.length - 1;
    const pathl = path.length - 1;

    let i, j;
    for (i = 0, j = 0; i <= patl && j <= pathl; i++, j++) {
      const p = pattern[i];
      // Globstar = skip any middle items, check the tail of the pattern
      if (p == '**') {
        j = pathl - (patl - i);
        continue;
      }
      if (p != path[j] && p != '*') return false;
    }

    return i > patl && j > pathl;
  }

  constructor() {
    this._listeners = [];
  }

  on(...args) {
    let listeners = [];
    while (args.length) {
      let path = args.shift();
      const callback = args.shift();

      if (path.$isProxy) {
        path = path.$path.concat('*');
      } else {
        path = PathEmitter.pathSplit(path);
      }
      const listener = [path, callback];
      listeners.push(listener);
      this._listeners.push(listener);
    }

    // Return a function to unsubscribe
    return function off() {
      if (listeners) listeners.forEach(listener => listener[1] = null);
      listeners = null;
    }
  }

  emit(path, ...args) {
    let j = 0;
    for (let i = 0; i < this._listeners.length; i++) {
      const [pattern, callback] = this._listeners[i];
      if (!callback) continue;

      this._listeners[j++] = this._listeners[i];
      if (PathEmitter.pathMatch(pattern, path)) {
        callback(path, ...args);
      }
    }
    this._listeners.length = j;
  }
}

module.exports = PathEmitter;
