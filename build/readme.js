/**
 * A cool(?) hack to generate the README.md file with actual code output
 */

const path = require('path');
const ReadmeGen = require('./ReadmeGen');

// START
(`
![Pek Logo](http://i.imgur.com/4ZQuhmQ.png)

An elegant, modern, observable, data model

## About

1. It's pronounced "peek"
2. It's spelled "Pｅk".  Only pretentious jerks spell it "P&emacr;k".

Pek is an observable data model similar in spirit to Backbone or Redux, but
simpler. Much simpler.  Pek models looks and behaves just like regular
JavaScript data structures... with one important difference:

***Pek models are observable***

Read on for a quick overview of how this works, or check out the [React example](react-example)

### Browser Support

Pek is powered by the [ES6 Proxy
API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
, so don't even think about asking if it works for legacy browsers.  It doesn't.
That's the bad news.  The good news is that for most modern desktop and mobile
browsers, Pek works just fine.

## Getting Started
### Install

\`npm install pek\`

\`import Pek from 'pek'\`

... or ...

\`const Pek = require('pek')\`

### Create a Pek Model

By way of example, let's create a Pek model for a simple todo list app:
`)
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
(`
### Subscribing to Events

Once we have our model, \`pek\`, we can now listen for changes.

For example, let's listen in on the top-level object:
`)
let off = pek.on('*', (path, val) => ReadmeGen.log(`Changed ${path[0]} to ${val}`));

pek.model.appName = 'Pek is awesome!';
ReadmeGen.dump();
(`
*Did you see that?!?*

Go back and take another look.   Notice that by simply assigning a property to
our model, we've triggered the listener function!

The entire model works this way.

BTW, Pek listener's are called with two arguments:
  1. \`path\` - (Array[String]) Path to the property that changed
  2. \`value\` - (any) New value of the property

### Unsubscribing

When you call \`Pek.on()\` to subscribe to an event, the return value is an unsubscriber function.  Simply call the function to unsubscribe your listener: (We'll do this after each of our examples to keep things from getting confusing)
`)
off();

pek.model.appName = 'Pek is still awesome!';
ReadmeGen.dump();
(`
Got it?  Okay, let's see what else we can do ...

### Subscribing to Events (Continued)
Listen for \`name\` changes on any list:
`)
off = pek.on('lists.*.name', ReadmeGen.log);

pek.model.lists[1].name = 'Honey Do';
ReadmeGen.dump();

off();
(`
Listen for changes to any property, on any item, in any list:
`)
off = pek.on('lists.*.items.*.*', ReadmeGen.log);

pek.model.lists[1].items[1].name = 'Cook dinner';
ReadmeGen.dump();

pek.model.lists[0].items[0].done = true;
ReadmeGen.dump();

off();
(`
Listen for changes on state before it exists(!):
`)
off = pek.on('users.*', ReadmeGen.log);

pek.model.users = [{email: 'ann@example.com'}];
ReadmeGen.dump();

pek.model.users.push({email: 'bob@example.com'});
ReadmeGen.dump();

off();
(`
Subscribe to changes on specific objects:
`)
off = pek.on('lists.1.items.0.name', ReadmeGen.log);

pek.model.lists[1].items[1].name = 'Dave';
ReadmeGen.dump();

pek.model.lists[1].items[0].name = 'Drew';
ReadmeGen.dump();

off();
(`
## Pek Paths

Paths in Pek take two forms.  Both forms provide the keys needed to navigate to
a particular point in the model.  In the string form, these keys are delimited
with a ".".  The array form is simply the result of calling \`split('.')\` on the string form.

Path patterns passed to \`Pek.on()\` may contain a "*" wildcard for any key, in
which case the pattern will match paths with any key at that level.  You may
also pass a model object, in which case Pek will use the current path at which that object resides.

Note: At this time, path keys may not contain a "." character.

## A Word About Pek Models

As alluded to in the Overview, Pek works by wrapping the model you pass into
the constructor in ES6 Proxy objects.  What this means is that *you are reading and writing state in that model structure*.

For example, if we look at our original model, \`APP_DATA\`, we'll see that it's been getting modified:
`)
ReadmeGen.log(APP_DATA.appName);
ReadmeGen.dump();

ReadmeGen.log(APP_DATA.users);
ReadmeGen.dump();

ReadmeGen.log(APP_DATA.lists[1].items[1].name);
ReadmeGen.dump();
(`
Note that Pek expects to "own" the model you give it.  Once you've created a Pek model you're free to pass around references to the model and any objects inside of it - Pek will happily emit events as you make changes.  However if you maintain a reference to the original model (outside of Pek) and operate on that, there are some cases where events will not be emitted.
`)
ReadmeGen.compile(__filename, path.join(__dirname, '../README.md'));
