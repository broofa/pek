
![Pek Logo](http://i.imgur.com/4ZQuhmQ.png)

JavaScript data structures with immutable state events.

## Install

    npm install pek

Then:

```javascript
const pek = require('pek');

```

## Quick Start

Start by using `pek()` to create your application state:

```javascript
// Data structure can have any schema, as long as it consists of native JS types (String, Number, Object, Array, null)
const APP_STATE = {
  name: 'Todo List',
  lists: [
    {name: 'Shopping', items: ['Milk', 'Bananas']},
  ]
}

const model = pek(APP_STATE); // ⇨ { name: 'Todo List', lists: [ { name: 'Shopping', items: [Object] } ] }

```

The returned `model` looks and feels just like the original. For example:

```javascript
model.lists[0].name = 'Zoo Supplies';
model.lists[0].items.push('Monkeys');
model.lists[0]; // ⇨ { name: 'Zoo Supplies', items: [ 'Milk', 'Bananas', 'Monkeys' ] }

```

With one small difference - you can subscribe to state changes...

```javascript
const unsubscribe = model.__.on(state => console.log(state));

model.name = 'Pek Example';

⇒ { name: 'Pek Example',
⇒   lists: [ { name: 'Zoo Supplies', items: [Object] } ] }
```

Of even greater interest is that `state` is immutable:

```javascript
`use strict`;
model.__.on(state => {
  try {
    state.name = 'Monkey Poo';
  } catch (err) {
    console.log('FDSAFDSA');
  }
});

model.name = 'Pek Example 2';

⇒ { name: 'Pek Example 2',
⇒   lists: [ { name: 'Zoo Supplies', items: [Object] } ] }
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
subordinate objects* changes state.  This function takes the following arguments:
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