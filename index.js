const assert = require('assert');

function pathSplit(path) {
  return (typeof(path) == 'string') ? path.split('.') : path;
}

function pathMatch(pattern, path) {
  if (path.length != pattern.length) return;
  for (let i = 0, l = path.length; i < l; i++) {
    if (pattern[i] != '*' && pattern[i] != path[i]) return false;
  }
  return true;
}

class PathEmitter {
  constructor() {
    this.listeners = [];
  }

  on(...args) {
    let listeners = [];
    while (args.length) {
      let path = args.shift();
      const callback = args.shift();

      if (path.$isProxy) {
        path = path.$path.concat('*');
      } else {
        path = pathSplit(path);
      }
      const listener = [path, callback];
      listeners.push(listener);
      this.listeners.push(listener);
    }

    // Return a function to unsubscribe
    return function off() {
      if (listeners) listeners.forEach(listener => listener[1] = null);
      listeners = null;
    }
  }

  emit(path, ...args) {
    let j = 0;
    for (let i = 0; i < this.listeners.length; i++) {
      const [pattern, callback] = this.listeners[i];
      if (!callback) continue;

      this.listeners[j++] = this.listeners[i];
      if (pathMatch(pattern, path)) {
        callback(path, ...args);
      }
    }
    this.listeners.length = j;
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
      path = pathSplit(path);

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
