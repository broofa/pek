const assert = require('assert');
const Pek = require('../index');

describe('main test', function() {
  /**
   * Test setup helper.  Creates the following:
   *
   * model: pek.model
   *    cb: Emitter callback function that collects arguments when called
   * reset: Function to reset model and callback
   */
  let model, cb, reset;
  function start(root) {
    const pek = new Pek(root);
    model = pek.model;

    const calls = [];
    cb = (...args) => calls.push(args);
    cb.calledWith = (...args) => assert.deepEqual(args, calls.shift());
    cb.notCalled = () => assert(calls.length == 0, 'Called more than expected');

    pek.reset = function() {
      pek.listeners = [];
      if (Array.isArray(pek.model)) {
        pek.model.length = 0;
      } else {
        for (const k in pek.model) delete pek.model[k];
      }
    }

    return pek;
  }

  it('Emitter operation', function(done) {
    const pek = start({});

    // Listener gets called?
    const off = pek.on('x', cb);
    model.x = 8;
    cb.calledWith(['x'], 8);

    // Remove listener
    // (Listeners are cleared lazily the next time an event is emitted, so set
    // a value to allow that to happen)
    off();
    model.x = 9;
    assert.equal(pek.listeners.length, 0);

    model.y = 8;
    done();
  });

  it('Object root', function(done) {
    const pek = start({});

    pek.on('*', cb);

    pek.model['abc'] = 8;
    cb.calledWith(['abc'], 8);

    pek.model.abc = 8;
    cb.calledWith(['abc'], 8);

    delete pek.model.abc;
    cb.calledWith(['abc']);

    done();
  });

  it('Array root', function(done) {
    const pek = start([]);

    pek.on('*', cb);

    pek.model[0] = 8;
    cb.calledWith(['0'], 8);

    pek.model.push(9);
    cb.calledWith(['1'], 9);
    cb.calledWith(['length'], 2);

    pek.model.unshift(10);
    cb.calledWith(['2'], 9);
    cb.calledWith(['1'], 8);
    cb.calledWith(['0'], 10);
    cb.calledWith(['length'], 3);

    done();
  });

  it('Deep proxy', function(done) {
    debugger;
    const pek = start({
      a: {
        b: {c: 1},
        bb: [0, {c: 1}, 2]
      }
    });

    pek.on('*.*.*', cb);
    pek.on('*.*.*.*', cb);

    pek.model.a.b.c = 2
    cb.calledWith(['a', 'b', 'c'], 2);

    pek.model.a.bb[1].c = 2
    cb.calledWith(['a', 'bb', '1', 'c'], 2);

    done();
  });
});
