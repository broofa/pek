const assert = require('assert');
const Pek = require('..');

describe('main test', function() {
  var STATE = {a: 1, b: [1,2]};
  const model = Pek(STATE);

  it('Creation', function() {
    assert(!model.__.dirty, 'Dirty init');
    assert.deepEqual(model.__.clean, STATE);
    assert.equal(model.b.__.getPath(), 'top.b');

    return Promise.resolve();
  })

  it('Dirty / clean', function() {
    model.a = 1;
    assert.equal(model.__.dirty, false, 'Setting same val should not dirty');

    model.a = 2;
    assert.equal(model.__.dirty, true, 'Setting different val should dirty');

    return Promise.resolve();
  })

  it('Event emitting', function() {
    model.a = 3;
    assert(model.__.dirty);

    return new Promise(resolve => {
      // Events are async
      const off = model.__.on(state => {
        assert.deepEqual(state,{a: 3, b:[1,2]})

        off();
        model.__.emit(); // (force listener removal)
        assert.equal(model.__.listeners.length, 0);

        resolve();
      });
    })
  });

  it('Listener.off', function() {
    return new Promise(resolve => {
      model.b[2] = 123;

      // Events are async
      const off = model.__.on(state => {
        assert.deepEqual(state,{a:3, b:[1,2,123]})
        off();
        resolve();
      });

      assert(model.__.dirty, 'Not dirtied');
    })
  });

  it('Deep proxy-ification', function() {
      return new Promise(resolve => {
        const off = model.__.on(state => {
          off();
          resolve();
        });

        model.b[2] = {def: ['a', 'b']};
        assert(model.b[2].def.__, 'Not proxied');

        model.b[2].def.unshift('zed');
        assert(model.__.dirty, 'Not dirtied');
      });
  });
});
