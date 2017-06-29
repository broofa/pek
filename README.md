
![Pek Logo](http://i.imgur.com/4ZQuhmQ.png)

An observable data model for JavaScript

## About

*Pronounced "peek", spelled "Pek" (no accent, unless you feel like putting on airs).*

P&emacr;k is an observable data model similar in spirit to Backbone or Redux, but
[hopefully] much simpler to understand and work with.  A pek model is, for all
intents and purposes, a regular JavaScript object (or array) ... with one
important difference: ***You can listen for changes***.

Read on for details, or check out the [React example](react-example)

### Browser Support

P&emacr;k supports most modern desktop and mobile browsers.  However, it relies on the [ES6 Proxy
  API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy).
so legacy platforms are not supported.

## Getting Started
### Install

`npm install pek`

`import Pek from 'pek'`

... or ...

`const Pek = require('pek')`

### Create a Model

By way of example, let's create a P&emacr;k model for a simple todo list app:
```javascript
const Pek = require('../index.js');

const APP_MODEL = {
  appName: 'Example App',
  lists: [
    {
      name: 'Groceries',
      items: [
        {name: 'Milk', done: false},
        {name: 'Eggs', done: false},
        {name: 'Bacon', done: true},
      ]
    },
    {
      name: 'Chores',
      items: [
        {name: 'Laundry', done: false},
        {name: 'Weed garden', done: true},
      ]
    }
  ]
};

const pek = new Pek(APP_MODEL);

const model = pek.model;

```
### Subscribe to Events

Once we have our model, `pek`, we can now listen for changes.

For example, let's listen in on the top-level object:

```javascript
let off = pek.on('appName', (path, val) => console.log(`Changed ${path} to ${val}`));

model.appName = 'Pek is awesome!';
off();

⇒ Changed appName to Pek is awesome!
```

*See that?!?*  Our listener function was called when the model value was set!
  but   The entire model works this way.

Let's try something a bit fancier - listening for a `name` changes on any
list:

```javascript
off = pek.on('lists.*.name', console.log);

model.lists[1].name = 'Honey Do';

off();

⇒ [ 'lists', 1, 'name' ] Honey Do
```

*Cool, right?*  The whole model works this way, so you can listen for changes to any object, any property within your model.  See [More Examples](#more-examples), for more advanced usage patterns.

### Listener functions

P&emacr;k listener's are called with two arguments:

  1. `path` - (Array[String]) Path to the property that changed
  2. `value` - (any) New value of the property

Going one step further, we can listen for `name` change

### Unsubscribing Listeners

`pek.on()` and `pek.onDebounce()` return an unsubscriber function.  Invoke this function to remove
your listener.  (We'll be doing this after each of our examples here and below
to keep things from getting confusing.)

```javascript
off();

model.appName = 'Pek is still awesome!';

// (nothing logged)

```
Got it?  Okay, let's see what else we can do ...

### P&emacr;k Paths & Patterns

In P&emacr;k, a "path" is how a particular property in your model is identified. Each
component of the path identifies how you navigate to the next component.  For
example, a path of `'abc.123.def'` refers to the model property at `pek.model['abc'][123]['def']`.

P&emacr;k paths may take the form of a String, where components are '.'-delimited, or
an Array of component items.  Converting between the two forms is simple:
`path.split('.')` a path String to get the Array form, and `path.join('.')`
a path Array to get the String form.

P&emacr;k patterns are just like paths, except they may contain "wildcard" or
"globstar" components.  When matching a path to a pattern, wildcards (`'*'`)
will match any component at that level.  A globstar (`'**'`) will match all
components at all levels at or below the level of the globstar.  *Currently
a pattern may only contain a single globstar*.

Check out the [PathMatch tests](blob/master/src/test.js#L5) for pattern matching
examples.

### More Examples

Listen for `name` changes on any list:

```javascript
off = pek.on('lists.*.name', console.log);

model.lists[1].name = 'Honey Do';
off();

⇒ [ 'lists', 1, 'name' ] Honey Do
```

Listen for changes to anything contained in `lists`:

```javascript
off = pek.on('lists.**', console.log);

model.lists[1].items[1].name = 'Cook dinner';
model.lists[0].items[0].done = true;
off();

⇒ [ 'lists', 1, 'items', 1, 'name' ] Cook dinner
⇒ [ 'lists', 0, 'items', 0, 'done' ] true
```

Listen as arrays are mutated:

```javascript
off = pek.on('lists.*.items.*', console.log)
model.lists[0].items.push(model.lists[1].items.shift())
off();

⇒ [ 'lists', 1, 'items', '0' ] { name: 'Cook dinner', done: true }
⇒ [ 'lists', 1, 'items', '1' ]
⇒ [ 'lists', 1, 'items', 'length' ] 1
⇒ [ 'lists', 0, 'items', '3' ] { name: 'Laundry', done: false }
⇒ [ 'lists', 0, 'items', 'length' ] 4
```

Add subscriber before model state exists:

```javascript
off = pek.on('users.*', console.log);

model.users = [{email: 'ann@example.com'}];
model.users.push({email: 'bob@example.com'});
off();

⇒ [ 'users', '1' ] { email: 'bob@example.com' }
⇒ [ 'users', 'length' ] 2
```

Subscribe to changes on specific objects:

```javascript
off = pek.on('lists.0.items.0.name', console.log);

model.lists[0].items[1].name = 'Dave';
model.lists[0].items[0].name = 'Drew';
off();

⇒ [ 'lists', 0, 'items', 0, 'name' ] Drew
```

## A Word About P&emacr;k Models

As alluded to in the Overview, P&emacr;k works by taking the model object you pass
into the constructor and wrapping it in ES6 Proxy objects.  These proxies are how
P&emacr;k intercepts changes to your model. *It's important to note that P&emacr;k continues to write to, and
read from, this model object*.

For example, if we look at our original model, `APP_MODEL`, we'll see that it's been getting modified:

```javascript
console.log(APP_MODEL.appName);
console.log(APP_MODEL.users);
console.log(APP_MODEL.lists[0].items[1].name);

⇒ Pek is still awesome!
⇒ [ { email: 'ann@example.com' }, { email: 'bob@example.com' } ]
⇒ Dave
```

In practical terms, it's best to treat the model structure you provide as being "owned" by P&emacr;k.  Once you've created a P&emacr;k model you're free to pass around references to the model and any objects inside of it - P&emacr;k will happily emit events as changes get made.  However, if you maintain a reference to the original model (outside of P&emacr;k) and operate on that, there are some cases where events will not be emitted.

----
Markdown generated from [src/README_js.md](src/README_js.md) by [![RunMD Logo](http://i.imgur.com/h0FVyzU.png)](https://github.com/broofa/runmd)