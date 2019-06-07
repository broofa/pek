<!--
  -- This file is auto-generated from src/README_js.md. Changes should be made there.
  -->

![Pek Logo](http://i.imgur.com/4ZQuhmQ.png)

JavaScript data structures with immutable state events.

## Install

    npm install pek

Then:

```javascript
const pek = require('pek');

```

## Quick Start

To get started, create a data model for your application using the same data
types as you would with JSON (`String`, `Number`, `Boolean`, `Object`, `Array`, and `null`):

```javascript
const APP_STATE = {
  name: 'Todo List',
  lists: [
    {name: 'Shopping', items: ['Milk', 'Bananas']},
  ]
};

```

Next, create a P&emacr;k model by passing this data model to `pek()`:

```javascript
const model = pek(APP_STATE); // ⇨ { name: 'Todo List', lists: [ { name: 'Shopping', items: [ 'Milk', 'Bananas' ] } ] }

```

That's pretty much all there is to it.  Your P&emacr;k model looks and feels just like the original:

```javascript
model.lists[0].name = 'Zoo Supplies';
model.lists[0].items.push('Monkeys');

model.lists[0]; // ⇨ { name: 'Zoo Supplies', items: [ 'Milk', 'Bananas', 'Monkeys' ] }

```

... with one important difference - *you can subscribe to state changes*:

```javascript
const unsubscribe = model.__.on(state => console.log(state));

model.name = 'Pek Example';
```

Anytime your P&emacr;k model changes, all listeners are notified.  Moreover, the `state` listeners receive is immutable:

```javascript
model.__.on(state => {
  state.name = 'Nopity nope nope';
  state.name; // ⇨ 'Pek Example 2'
});

model.name = '\Pek Example 2';

```

In non-strict mode, changing the state will fail silently, as above.  In strict
mode, changing the state will throw an exception:

```javascript
model.__.on(state => {
  'use strict';
  try {
    state.name = 'Nopity nope nope';
  } catch (err) {
    console.log(err.message);
  }
});

model.name = '\Pek Example 3';

⇒ Cannot assign to read only property 'name' of object '[object Object]'
```

## API

### pek(initialState)

Creates a new P&emacr;k model

* `initialState` - Object or Array holding your initial model state
* Returns a P&emacr;k model (a Proxy-wrapped version of `initialState`)

E.g.

```javascript
const model = pek({a: 'hello', b: ['world']}); // ⇨ { a: 'hello', b: [ 'world' ] }

```

### model. ... __.on(callback)

Listen for changes to model state.

* `callback` - Function to call any time the target object *or any of it's
subordinate objects* change state.  This function takes the following arguments:
  * `state` - An *immutable* copy of the object state.  Attempting to modify
* Returns unsubscriber `Function`.

```javascript
const unsubscribe = model.__.on(immutableState => console.log(immutableState));

model.a = 'Hello';

⇒ { a: 'Hello', b: [ 'world' ] }
```

To unsubscribe, call the returned unsubscriber `Function`:

```javascript
unsubscribe();

```

----
Markdown generated from [src/README_js.md](src/README_js.md) by [![RunMD Logo](http://i.imgur.com/h0FVyzU.png)](https://github.com/broofa/runmd)