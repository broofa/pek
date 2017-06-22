```javascript --hide
// `runmd` hook to add accent to "Pek" spelling
setLineTransformer((line, isRunning) => {
  if (!isRunning) line = line.replace(/(^|.?)Pek/g, (a,b) => b == '\\' ? 'Pek' : b + 'P&emacr;k');
  return line;
});
```

![\Pek Logo](http://i.imgur.com/4ZQuhmQ.png)

An elegant, modern, observable, data model for JavaScript

## About

It's pronounced "peek", but spelled "\pek"
2. It's spelled "\Pek", not "Pek" (unless you're a pretentious twat like the author &#x263A;)

Pek is an observable data model similar in spirit to Backbone or Redux, but
simpler. Much simpler.  Pek models look and behave just like regular
JavaScript data structures... with one important difference:

***Pek models are observable***

Read on for a quick overview of how this works, or check out the [React example](react-example)

### Browser Support

Pek relies on the [ES6 Proxy
API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) API. Thus, no real attempt has been made to support legacy systems.
It runs on most modern mobile and desktop JS platforms (latest versions of
Node/Chrome/Firefox/Safari/Edge, etc.)

## Getting Started
### Install

`npm install pek`

`import \Pek from 'pek'`

... or ...

`const \Pek = require('pek')`

### Create a Pek Model

By way of example, let's create a Pek model for a simple todo list app:
```javascript --context
const Pek = require('../index.js');

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

pek; // RESULT
```
### Subscribing to Events

Once we have our model, `pek`, we can now listen for changes.

For example, let's listen in on the top-level object:

```javascript --context
let off = pek.on('*', (path, val) => console.log(`Changed ${path[0]} to ${val}`));

pek.model.appName = 'Pek is awesome!';
```
*Did you see that?!?*

Go back and take another look.   Notice that by simply assigning a property to
our model, we've triggered the listener function!

The entire model works this way.

BTW, Pek listener's are called with two arguments:
  1. `path` - (Array[String]) Path to the property that changed
  2. `value` - (any) New value of the property

### Unsubscribing



`pek.on()` returns an unsubscriber function.  Simply call this function to remove your listener.
(We'll be doing this after each of our examples here and below to keep things from getting confusing)
```javascript --context
off();

pek.model.appName = 'Pek is still awesome!';

// (nothing logged)
```
Got it?  Okay, let's see what else we can do ...

### Subscribing to Events (Continued)
Listen for `name` changes on any list:
```javascript --context
off = pek.on('lists.*.name', console.log);
pek.model.lists[1].name = 'Honey Do';
off();
```
Listen for changes to any property, on any item, in any list:
```javascript --context
off = pek.on('lists.*.items.*.*', console.log);
pek.model.lists[1].items[1].name = 'Cook dinner';
pek.model.lists[0].items[0].done = true;
off();
```
Listen for changes on state before it exists(!):
```javascript --context
off = pek.on('users.*', console.log);
pek.model.users = [{email: 'ann@example.com'}];
pek.model.users.push({email: 'bob@example.com'});
off();
```
Subscribe to changes on specific objects:
```javascript --context
off = pek.on('lists.1.items.0.name', console.log);

pek.model.lists[1].items[1].name = 'Dave';
pek.model.lists[1].items[0].name = 'Drew';

off();
```
## Pek Paths

Paths in Pek take two forms.  Both forms provide the keys needed to navigate to
a particular point in the model.  In the string form, these keys are delimited
with a ".".  The array form is simply the result of calling `split('.')` on the string form.

Path patterns passed to `Pek.on()` may contain a `*` wildcard for any key, in
which case the pattern will match paths with any key at that level.  You may
also pass a model object, in which case Pek will use the current path at which that object resides.

Note: At this time, path keys may not contain a "." character.

## A Word About Pek Models

As alluded to in the Overview, Pek works by wrapping the model you pass into
the constructor in ES6 Proxy objects.  What this means is that *you are reading and writing state in that model structure*.

For example, if we look at our original model, `APP_DATA`, we'll see that it's been getting modified:
```javascript --context
console.log(APP_DATA.appName);
console.log(APP_DATA.users);
console.log(APP_DATA.lists[1].items[1].name);
```
Note that Pek expects to "own" the model you give it.  Once you've created a Pek model you're free to pass around references to the model and any objects inside of it - Pek will happily emit events as you make changes.  However if you maintain a reference to the original model (outside of Pek) and operate on that, there are some cases where events will not be emitted.
