const assert = require('assert');
const Pek = require('../index');
const PathEmitter = require('../PathEmitter');

describe('PathEmitter', function() {
  function test(pattern, path, expect) {
    it(`pathMatch([${pattern}], [${path}]) == ${expect}`, function() {
      assert.equal(PathEmitter.pathMatch(pattern, path), expect);
    });
  }

  test([1], [1], true);
  test([1, 2, 3], [1, 2, 3], true);
  test([], [], false);
  test([], [1], false);
  test([1], [], false);
  test([1], [2], false);
  test([1, 2], [1, 2, 3], false);
  test([1, 2, 3], [1, 2], false);

  test(['*'], [1], true);
  test([1, '*', 3], [1, 2, 3], true);
  test([1, '*', 3, '*', 5], [1, 2, 3, 4, 5], true);
  test(['*', '*'], [1], false);

  test(['**'], [1], true);
  test(['**'], [1, 2, 3], true);
  test([1, '**', 3], [1, 2, 3], true);
  test([1, '**', 5], [1, 2, 3, 4, 5], true);
  test([1, '**'], [1, 2], true);

  test([1, '**'], [1], false);
  test([2, '**', 5], [1, 2, 3, 4, 5], false);
  test([1, '**', 6], [1, 2, 3, 4, 5], false);

  test([1, '*', '**', 5], [1, 2, 3, 4, 5], true);
  test([1, '**', 5, '*'], [1, 2, 3, 4, 5], false);
});

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
    cb = (...args) => {
      calls.push(args);
    };
    cb.calledWith = (...args) => {
      assert.deepEqual(args, calls.shift());
    };
    cb.notCalled = () => assert(calls.length == 0, 'Called more than expected');
    cb.calls = calls;

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
    assert.equal(pek._listeners.length, 0);

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

    cb.notCalled();

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

    setTimeout(()  => {
      cb.calledWith(['*']);
      cb.notCalled();
      done();
    }, 0);

    done();
  });

  it('Proxy behavior', function(done) {
    const pek = start([]);

    model.$isProxy = false;
    assert(model.$isProxy, '$isProxy should not be settable');

    assert(!('$isProxy' in model), '$isProxy "in" model');

    assert.deepEqual(Object.keys(model), [], 'Empty model has keys');

    done();
  });

  it('Deep proxy', function(done) {
    const pek = start({
      a: {
        b: {c: 1},
        bb: [0, {c: 1}, 2]
      }
    });

    pek.on('*.*.*', cb);
    pek.on('*.*.*.*', cb);

    pek.model.a.b.c = 3
    cb.calledWith(['a', 'b', 'c'], 3);

    pek.model.a.bb[1].c = 4
    cb.calledWith(['a', 'bb', '1', 'c'], 4);

    done();
  });

  it('Debounce', function(done) {
    const pek = start([1,5,3,2,4]);
    pek.onDebounce('**', cb);
    pek.model.sort();
    setTimeout(()  => {
      cb.calledWith(['**']);
      cb.notCalled();
      done();
    }, 0);
  });
});
