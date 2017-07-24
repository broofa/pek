`use strict`;

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
    this._deferred = new Set();
    this._emitDeferred = () => {
      const deferred = this._deferred;
      this._deferred = new Set();
      for (let listener of deferred) {
        const [pattern, callback] = listener;
        callback(pattern);
      }
    }
  }

  _on(debounce, path, callback) {
    if (path.$isProxy) {
      path = path.$path.concat('*');
    } else {
      path = PathEmitter.pathSplit(path);
    }
    const listener = [path, callback];
    listener._debounce = !!debounce;
    this._listeners.push(listener);

    // Return a function to unsubscribe
    return function off() {listener._off = true}
  }

  on(...args) {
    return this._on(false, ...args);
  }

  onDebounce(...args) {
    return this._on(true, ...args);
  }

  emit(path, ...args) {
    let j = 0;
    for (let listener of this._listeners) {
      const [pattern, callback] = listener;
      if (listener._off) continue;

      this._listeners[j++] = listener;

      if (PathEmitter.pathMatch(pattern, path)) {
        const last = pattern[pattern.length - 1];
        if (listener._debounce) {
          this._deferred.add(listener);
          if (!this._deferTimeout) this._deferTimeout = setTimeout(this._emitDeferred, 0);
        } else {
          callback(path, ...args);
        }
      }
    }

    this._listeners.length = j;
  }
}

module.exports = PathEmitter;
