const assert = require('assert');
const PathEmitter = require('./PathEmitter');

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
