DI Fu
=====

A small dependency injection framework.

## Features
- Simple fluent interface.
- Binds direct to objects, file modules and a 'glob' path returning several file modules.
- Loads configuration from a 'difile.js' module in the current folder or higher. Bind modules in this file and they will be available everywhere you require di-fu.
- Dedicated 'get' function or pass through 'resolve' when a component isn't registered. the default function will act as 'resolve' and if the component is not registered with the container it will be passed on to node's require method. If .get is explicitly called, it will raise an error if the component is not registered.

Intercept file resolutions (e.g. for mocking).
- Detects circular dependencies.

## Installation

  npm install di-fu

## Example 1 - Bind to object

```javascript
var di = require('di-fu').container();

di.bind('hello').to({
	hello: function() { return "hello world"; }
});

var hello = di('hello');
console.log(hello.hello());
```

## Example 2 - bind to file.

```javascript
var di = require('di-fu').container();

di.bind('hello').file('./lib/hello-service', 'service'); // chain .load() after this to load it here.

var hello = di('hello');
console.log(hello.hello());
```

## Example 3 - bind to file.

```javascript
var di = require('di-fu').container();

di.bind('model:*').path('./model/model-*.js'); // chain .load() after this to load them here.

var User = di('model:user');
```

## Tests

  npm test