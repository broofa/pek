const assert = require('assert');

class PathEmitter {
  static pathSplit(path) {
    return (typeof(path) == 'string') ? path.split('.') : path;
  }

  static pathMatch(pattern, path) {
    if (!pattern || !pattern.length) return false;
    // Current algorithm is an "outside-in" approach.  We do head and tail
    // pattern matches (permitting '*' wildcard).  If/when there's a mismatch in
    // the middle, we only allow it if it's the globstar ('**')
    const pathl = path.length, patl = pattern.length;

    // Head match
    let headi = 0;
    while (true) {
      const pat = pattern[headi];
      if (headi >= patl-1 || pat != '*' && pat != path[headi]) break;
      headi++;
    }

    // Tail match
    let taili = pathl - 1, pati = patl - 1;
    while (true) {
      const pat = pattern[pati];
      if (taili <= headi || pat != '*' && pat != path[taili]) break;
      pati--;
      taili--;
    }

    const pat = pattern[headi];
    if (pat == '**') return true;
    return taili == headi && (pat == path[headi] || pat == '*');
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

class Pek extends PathEmitter {
  constructor(root) {
    super();

    const emitter = this;

    let proxify;
    const proxyHandler = {
      get: function(target, k) {
        if (k === '$isProxy') return true;
        if (k === '$path') return this.path;
        return target[k];
      },

      set: function(target, k, v) {
        if (k === '$path') {
          this.path = v;
          return true;
        }

        const path = this.path.concat(k);

        if (v) {
          if (v.$isProxy) {
            v.$path = path;
          } else {
            // Proxy Arrays and Objects
            if (Array.isArray(v) || v.constructor === Object) v = proxify(v, path);
          }
        }

        target[k] = v;

        emitter.emit(path, v);

        return true;
      },

      deleteProperty: function(target, k) {
        const path = this.path.concat(k);
        emitter.emit(path);
        delete target[k];
        return true;
      }
    }

    proxify = function(val, path = []) {
      path = PathEmitter.pathSplit(path);

      if (val && Array.isArray(val)) {
        for (var i = 0, l = val.length; i < l; i++)
          val[i] = proxify(val[i], path.concat(i));
      } else if (val && val.constructor == Object) {
        for (const k  in val) val[k] = proxify(val[k], path.concat(k));
      } else {
        return val;
      }

      return new Proxy(val, Object.assign({path}, proxyHandler));
    }

    this.model = proxify(root);
  }
}

module.exports = Pek;
