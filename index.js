const assert = require('assert');

function canPekify(obj) {
  return obj && (Array.isArray(obj) || obj && obj.constructor.defineProperty);
}

function pek(obj, parent, key) {
  assert(canPekify(obj), 'obj must be an Array or Object');

  if (obj.__) return obj;

  const proxyHandler = {
    top: function() {
      return parent ? parent.top() : this;
    },

    clean: null,

    dirty: true,

    dirtied: parent ? parent.dirtied : [],

    listeners: [],

    getPath: function() {
      return parent ? parent.getPath() + '.' + key : 'top';
    },

    markClean: function() {
      if (!this.dirty) return this.clean;
      let copy;
      if (Array.isArray(obj)) {
        copy = [];
        for (let o of obj) copy.push(o && o.__ ? o.__.markClean() : o);
      } else if (obj.constructor.defineProperty) {
        copy = {};
        for (let k in obj) {
          const o = obj[k];
          copy[k] = o && o.__ ? o.__.markClean() : o;
        }
      }
      this.clean = Object.freeze(copy);
      this.dirty = false;

      return this.clean;
    },

    markDirty: function() {
      if (this.dirty) return;
      const top = this.top();
      this.dirty = true;
      if (!this.dirtied.length) setTimeout(top.flush.bind(top), 0);
      this.dirtied.push(this);

      if (parent) parent.markDirty();
    },

    flush: function() {
      const dirtied = Array.apply(null, this.dirtied);
      this.dirtied.length = 0;
      for (let pHandler of dirtied) {
        pHandler.emit(pHandler.markClean());
      }
    },

    on: function(callback) {
      assert(typeof(callback), 'function');
      const listener = {callback, path: this.getPath()};
      this.listeners.push(listener);
      return function off() {listener._off = true}
    },

    emit: function(...args) {
      this.listeners = this.listeners.filter(listener => {
        if (listener._off) return false;
        listener.callback(...args);
        return true;
      });
    },

    get: function(target, k) {
      if (k === '__') return this;
      return target[k];
    },
  };

  const proxy = new Proxy(obj, proxyHandler);

  if (Array.isArray(obj)) {
    for (var i = 0, l = obj.length; i < l; i++) {
      if (canPekify(obj[i])) obj[i] = pek(obj[i], proxyHandler, i);
    }
  } else {
    // Plain JS object
    for (const k  in obj) {
      if (canPekify(obj[k])) obj[k] = pek(obj[k], proxyHandler, k);
    }
  }

  // Mark clean so we get a fresh copy of the clean state
  proxyHandler.markClean();

  // Flesh out proxyHandler after we've proxified all the children, and after
  // we've created the proxyHandler object.
  // Adding the mutate methods here, after we've proxified `obj`, avoids marking
  // stuff as dirty

  proxyHandler.set = function(target, k, v) {
    if (target[k] !== v) {
      target[k] = canPekify(v) ? pek(v) : v;
      this.markDirty();
    }

    return true;
  };

  proxyHandler.deleteProperty = function(target, k) {
    delete target[k];
    this.markDirty();
    return true;
  };

  return proxy;
}

module.exports = pek;
