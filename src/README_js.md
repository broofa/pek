```javascript --hide
runmd.onRequire = path => path.replace(/^pek/, '..');

runmd.onOutputLine = (line, isRunning) => {
  if (!isRunning) line = line.replace(/(^|.?)Pek/g, (a,b) => b == '\\' ? 'Pek' : b + 'P&emacr;k');
  return line;
};
```

![\Pek Logo](http://i.imgur.com/4ZQuhmQ.png)

JavaScript data structures with immutable state events.

## Install

    npm install pek

Then:

```javascript --run default
const pek = require('pek');
```

## Quick Start

To get started, create a data model for your application using the same data
types as you would with JSON (`String`, `Number`, `Boolean`, `Object`, `Array`, and `null`):

```javascript --run default
const APP_STATE = {
  name: 'Todo List',
  lists: [
    {name: 'Shopping', items: ['Milk', 'Bananas']},
  ]
};
```

Next, create a Pek model by passing this data model to `pek()`:

```javascript --run default
const model = pek(APP_STATE); // RESULT
```

That's pretty much all there is to it.  Your Pek model looks and feels just like the original:

```javascript --run default
model.lists[0].name = 'Zoo Supplies';
model.lists[0].items.push('Monkeys');

model.lists[0]; // RESULT
```

... with one important difference - *you can subscribe to state changes*:

```javascript
const unsubscribe = model.__.on(state => console.log(state));

model.name = '\Pek Example';
```

Anytime your Pek model changes, all listeners are notified.  Moreover, the `state` listeners receive is immutable:

```javascript --run default
model.__.on(state => {
  state.name = 'Nopity nope nope';
  state.name; // RESULT
});

model.name = '\Pek Example 2';
```
```javascript --run default --hide
model.__.listeners = []; // Clean up
```

In non-strict mode, changing the state will fail silently, as above.  In strict
mode, changing the state will throw an exception:

```javascript --run default
model.__.on(state => {
  'use strict';
  try {
    state.name = 'Nopity nope nope';
  } catch (err) {
    console.log(err.message);
  }
});

model.name = '\Pek Example 3';
```
```javascript --run default --hide
model.__.listeners = []; // Clean up
```

## API
```javascript --run api --hide
const pek = require('pek');
```

### pek(initialState)

Creates a new Pek model

* `initialState` - Object or Array holding your initial model state
* Returns a Pek model (a Proxy-wrapped version of `initialState`)

E.g.

```javascript --run api
const model = pek({a: 'hello', b: ['world']}); // RESULT
```

### model. ... __.on(callback)

Listen for changes to model state.

* `callback` - Function to call any time the target object *or any of it's
subordinate objects* change state.  This function takes the following arguments:
  * `state` - An *immutable* copy of the object state.  Attempting to modify
* Returns unsubscriber `Function`.

```javascript --run api
const unsubscribe = model.__.on(immutableState => console.log(immutableState));

model.a = 'Hello';
```

To unsubscribe, call the returned unsubscriber `Function`:

```javascript --run api
unsubscribe();
```
