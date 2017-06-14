![P&emacr;k Logo](http://i.imgur.com/4ZQuhmQ.png)

An elegant, modern, observable, data model

## About

1. It's pronounced "peek"
2. It's spelled "Pｅk".  Only pretentious jerks spell it "P&emacr;k".

P&emacr;k is an observable data model similar in spirit to Backbone or Redux, but
simpler. Much simpler.  P&emacr;k models looks and behaves just like regular
JavaScript data structures... with one important difference:

***P&emacr;k models are observable***

Read on for a quick overview of how this works, or check out the [React example](react-example)

### Browser Support

P&emacr;k is powered by the [ES6 Proxy
API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
, so don't even think about asking if it works for legacy browsers.  It doesn't.
That's the bad news.  The good news is that for most modern desktop and mobile
browsers, P&emacr;k works just fine.

## Getting Started
### Install

`npm install pek`

`import Pek from 'pek'`

... or ...

`const Pek = require('pek')`

### Create a P&emacr;k Model

By way of example, let's create a P&emacr;k model for a simple todo list app:
```javascript
const Pek = require('../index');

const APP_DATA = {
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

const pek = new Pek(APP_DATA);
```
### Subscribing to Events

Once we have our model, `pek`, we can now listen for changes.

For example, let's listen in on the top-level object:
```javascript
let off = pek.on('*', (path, val) => console.log(`Changed ${path[0]} to ${val}`));

pek.model.appName = 'Pek is awesome!';
⋖ 'Changed appName to Pek is awesome!'
```
*Did you see that?!?*

Go back and take another look.   Notice that by simply assigning a property to
our model, we've triggered the listener function!

The entire model works this way.

BTW, P&emacr;k listener's are called with two arguments:
  1. `path` - (Array[String]) Path to the property that changed
  2. `value` - (any) New value of the property

### Unsubscribing

When you call `Pek.on()` to subscribe to an event, the return value is an unsubscriber function.  Simply call the function to unsubscribe your listener: (We'll do this after each of our examples to keep things from getting confusing)
```javascript
off();

pek.model.appName = 'Pek is still awesome!';
« nothing logged »
```
Got it?  Okay, let's see what else we can do ...

### Subscribing to Events (Continued)
Listen for `name` changes on any list:
```javascript
off = pek.on('lists.*.name', console.log);

pek.model.lists[1].name = 'Honey Do';
⋖ [ 'lists', 1, 'name' ] 'Honey Do'

off();
```
Listen for changes to any property, on any item, in any list:
```javascript
off = pek.on('lists.*.items.*.*', console.log);

pek.model.lists[1].items[1].name = 'Cook dinner';
⋖ [ 'lists', 1, 'items', 1, 'name' ] 'Cook dinner'

pek.model.lists[0].items[0].done = true;
⋖ [ 'lists', 0, 'items', 0, 'done' ] true

off();
```
Listen for changes on state before it exists(!):
```javascript
off = pek.on('users.*', console.log);

pek.model.users = [{email: 'ann@example.com'}];
« nothing logged »

pek.model.users.push({email: 'bob@example.com'});
⋖ [ 'users', '1' ] { email: 'bob@example.com' }
⋖ [ 'users', 'length' ] 2

off();
```
Subscribe to changes on specific objects:
```javascript
off = pek.on('lists.1.items.0.name', console.log);

pek.model.lists[1].items[1].name = 'Dave';
« nothing logged »

pek.model.lists[1].items[0].name = 'Drew';
⋖ [ 'lists', 1, 'items', 0, 'name' ] 'Drew'

off();
```
## P&emacr;k Paths

Paths in P&emacr;k take two forms.  Both forms provide the keys needed to navigate to
a particular point in the model.  In the string form, these keys are delimited
with a ".".  The array form is simply the result of calling `split('.')` on the string form.

Path patterns passed to `Pek.on()` may contain a "*" wildcard for any key, in
which case the pattern will match paths with any key at that level.  You may
also pass a model object, in which case P&emacr;k will use the current path at which that object resides.

Note: At this time, path keys may not contain a "." character.

## A Word About P&emacr;k Models

As alluded to in the Overview, P&emacr;k works by wrapping the model you pass into
the constructor in ES6 Proxy objects.  What this means is that *you are reading and writing state in that model structure*.

For example, if we look at our original model, `APP_DATA`, we'll see that it's been getting modified:
```javascript
console.log(APP_DATA.appName);
⋖ 'Pek is still awesome!'

console.log(APP_DATA.users);
⋖ [ { email: 'ann@example.com' }, { email: 'bob@example.com' } ]

console.log(APP_DATA.lists[1].items[1].name);
⋖ 'Dave'
```
Note that P&emacr;k expects to "own" the model you give it.  Once you've created a P&emacr;k model you're free to pass around references to the model and any objects inside of it - P&emacr;k will happily emit events as you make changes.  However if you maintain a reference to the original model (outside of P&emacr;k) and operate on that, there are some cases where events will not be emitted.
```