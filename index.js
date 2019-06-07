`use strict`; // So setting state on a frozen object will throw

class Pek {
  constructor(mutable) {
    this.mutable = proxify(mutable, this._onChange.bind(this));
    this._watchers = new Set;
  }

  _onChange(currentState, previousState) {
    for (const [resolver, callback] of this._watchers) {
      const current = resolver(currentState);
      const previous = resolver(previousState);
      if (current !== previous) callback(current, previous, currentState, resolver._string || resolver);
    }
  }

  /**
   * Watch for changes in the model.
   *
   * @param {String|Function(root)} resolver Function that takes a top-level
   *                                state object and returns the property to
   *                                watch for changes
   * @param {Function(currentState, previousState, immutable, resolver)} Callback
   * @return {Function} Function to remove the watcher
   */
  watch(resolver, callback) {
    if (typeof(resolver) == 'string') {
      const _string = resolver;
      const path = _string.split('.');
      resolver = function(root) {
        let state = root;
        for (const prop of path) {
          state = state[prop];
          if (state == null) return;
        }

        return state;
      }
      resolver._string = _string;
    }

    const watcher = {statePath, callback};
    this._watchers.add(watcher);
    return () => this._watchers.delete(watcher);
  }

  /**
   * Stop watching for model state changes
   *
   * @param {String | Function} resolver See #watch()
   * @param {Function} [callback] See #watch.  If omitted, removes all callbacks
   *                              associated with `resolver`
   */
  unwatch(resolver, callback) {
    for (const watcher of this._watchers) {
      const [res, cb] = watcher;
      if ((res === resolver || res._string === res) && (!callback || cb === callback)) {
        this._watchers.delete(watcher);
      }
    }
  }
}

module.exports = Pek;

//-------------------------------------

/**
 * Check to see if an object can/should be proxied.  Currently we only work with
 * plain JS objects.
 *
 * TODO: Handle other built-in types like Date, Map, Set, other collection
 * types, and typed arrays
 */
function isProxyable(obj) {
  return obj && (Array.isArray(obj) || obj && obj.constructor.defineProperty);
}

/**
 * Create a model object proxy that tracks changes to the object and that
 * [lazily] emits events when state changes.
 *
 * @param obj [Object|Array]
 * @param _parent (private) Parent container object
 * @param _key (private) Key on parent container that holds this `obj`
 *
 */
function proxify(obj, _parent, _key) {
  if (!isProxyable(obj)) throw TypeError('obj must be an Array or Object');

  if (obj.__) return obj;

  const proxyHandler = {
    // The "clean" (and immutable!) model state
    clean: null,

    // True if state has changed for this object or any of it's children
    dirty: true,

    // Cache of all pek proxies that have dirty flag set
    dirtied: _parent ? _parent.dirtied : [],

    // Yup
    listeners: [],

    // Proxy traps. See https://goo.gl/4faHVB
    get: function(target, k) {
      if (k === '__') return this;
      return target[k];
    },

    set: function(target, k, v) {
      if (target[k] !== v) {
        target[k] = isProxyable(v) ? proxify(v, proxyHandler, k) : v;
        this.markDirty();
      }

      return true;
    },

    deleteProperty: function(target, k) {
      delete target[k];
      this.markDirty();

      return true;
    },

    /**
     * Get top-most parent
     */
    top: function() {
      return _parent ? _parent.top() : this;
    },

    /**
     * Get string that describes path to this object from top parent
     */
    getPath: function() {
      return _parent ? _parent.getPath() + '.' + _key : 'top';
    },

    // "Clean" this object.  Causes
    markClean: function() {
      if (!this.dirty) return this.clean;

      // Reset dirty bit here, before walking the object members, prevents
      // infinite recursive loop if there are circular references
      this.dirty = false;

      // Make a clean copy of the object state
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

      // Make it immutable
      this.clean = Object.freeze(copy);

      return this.clean;
    },

    /**
     * Add handler to cache of dirty objects
     */
    _cacheDirty: function(handler) {
      // Schedule a flush()
      if (!this.dirtied.length) setTimeout(this.flush.bind(this), 0);

      this.dirtied.push(handler);
    },

    /**
     * Mark object as having changed state
     */
    markDirty: function() {
      if (this.dirty) return;

      this.dirty = true;
      this.top()._cacheDirty(this);
      if (_parent) _parent.markDirty();
    },

    /**
     * Flush the queue of dirty objects.  This updates the clean state and
     * invokes the listeners on the dirty objects
     */
    flush: function() {
      const dirtied = Array.apply(null, this.dirtied);
      this.dirtied.length = 0;

      for (let pHandler of dirtied) {
        pHandler.emit(pHandler.markClean());
      }
    },

    /**
     * Add a listener callback to be notified when state changes for this object
     * or any children objects
     */
    on: function(callback) {
      if (typeof(callback) != 'function') throw TypeError('callback must be a Function');

      const listener = {callback, path: this.getPath()};
      this.listeners.push(listener);
      return function off() {listener._off = true}
    },

    /**
     * Call all listeners
     */
    emit: function(...args) {
      this.listeners = this.listeners.filter(listener => {
        if (listener._off) return false;
        listener.callback(...args);
        return true;
      });
    },
  };

  const proxy = new Proxy(obj, proxyHandler);

  // Proxy-ify all child state
  if (Array.isArray(obj)) {
    for (var i = 0, l = obj.length; i < l; i++) {
      if (isProxyable(obj[i])) obj[i] = proxify(obj[i], proxyHandler, i);
    }
  } else {
    // Plain JS object
    for (const k  in obj) {
      if (isProxyable(obj[k])) obj[k] = proxify(obj[k], proxyHandler, k);
    }
  }

  // Capture clean state, reset dirty bit
  proxyHandler.markClean();

  return proxy;
}

module.exports = proxify;
