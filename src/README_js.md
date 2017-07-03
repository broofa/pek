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

```javascript --context
const pek = require('pek');
```

## Quick Start

Start by using `pek()` to create your application state:

```javascript --context
// Data structure can have any schema, as long as it consists of native JS types (String, Number, Object, Array, null)
const APP_STATE = {
  name: 'Todo List',
  lists: [
    {name: 'Shopping', items: ['Milk', 'Bananas']},
  ]
}

const model = pek(APP_STATE); // RESULT
```

The returned `model` looks and feels just like the original. For example:

```javascript --context
model.lists[0].name = 'Zoo Supplies';
model.lists[0].items.push('Monkeys');
model.lists[0]; // RESULT
```

With one small difference - you can subscribe to state changes...

```javascript --context
const unsubscribe = model.__.on(state => console.log(state));

model.name = 'Pek Example';
```

Of even greater interest is that `state` is immutable:

```javascript --context
`use strict`;
model.__.on(state => {
  try {
    state.name = 'Monkey Poo';
  } catch (err) {
    console.log('FDSAFDSA');
  }
});

model.name = 'Pek Example 2';
```

## API
```javascript --context=api --hide
const pek = require('pek');
```

### pek(initialState)

Creates a new Pek model

* `initialState` - Object or Array holding your initial model state
* Returns a Pek model (a Proxy-wrapped version of `initialState`)

E.g.

```javascript --context=api
const model = pek({a: 'hello', b: ['world']}); // RESULT
```

### model. ... __.on(callback)

Listen for changes to model state.

* `callback` - Function to call any time the target object *or any of it's
subordinate objects* changes state.  This function takes the following arguments:
  * `state` - An *immutable* copy of the object state.  Attempting to modify
* Returns unsubscriber `Function`.

```javascript --context=api
const unsubscribe = model.__.on(immutableState => console.log(immutableState));

model.a = 'Hello';
```

To unsubscribe, call the returned unsubscriber `Function`:

```javascript --context=api
unsubscribe();
```
