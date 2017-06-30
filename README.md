
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

`import \pek from 'pek'`

... or ...

`const \pek = require('pek')`

----
Markdown generated from [src/README_js.md](src/README_js.md) by [![RunMD Logo](http://i.imgur.com/h0FVyzU.png)](https://github.com/broofa/runmd)