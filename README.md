DI Fu
=====

A small dependency injection framework.

## Features
- Simple fluent interface for binding to objects, modules and 'glob' paths of modules.
- Loads configuration from a 'difile.js' module in the current folder or higher. Cascades from higher level files down.
- Paths are relative to where the container is accessed.
- 'get' components (also module default), 'invoke' functions or 'create' object instances.
- 'rebind' calls can be used for overriding bindings for use cases such as mocking.
- A 'require' method provides a get-or-require mode for an injection style closer to require.
- Detects circular dependencies.

## Installation

  npm install di-fu

## Example 1 - Bind to object

```javascript
// in difile.js
var di = require('di-fu')();

di.bind('hello').to({
	hello: function() { return "hello world"; }
});

// in module
var di = require('di-fu')();

var hello = di('hello');
console.log(hello.hello()); // hello world
```

## Example 2 - bind to file.

```javascript
// in difile.js
var di = require('di-fu')();

di.bind('hello').file('./lib/hello-service', 'service'); // chain .load() after this to load it here.

// in module
var di = require('di-fu')();

var hello = di('hello');
console.log(hello.hello());
```

## Example 3 - bind to path.

```javascript
// in difile.js
var di = require('di-fu')();

di.bind('model:*').path('./model/model-*.js'); // chain .load() after this to load them here.

// in module
var di = require('di-fu')();

var user = di.create('model:user');
```

## Example 4 - bind, rebind and unbind

```javascript
var di = require('di-fu')();
console.log(di.has('foo')); // false

// A basic bind call to register a component.
di.bind('foo').to({
	hello: function() { return "hello world"; }
});
console.log(di.has('foo')); // true

// The module defaults to a 'get' function. You can 
// call di.get explicitly if you prefer.
var foo = di('foo');
console.log(foo.hello()); // hello world

// Call rebind to register a component without
// causing an error - e.g. for mocking.
di.rebind('foo').to({
	hello: function() { return "goodbye"; }
});
var foo = di.get('foo');
console.log(foo.hello()); // goodbye

// Components can be unbound if desired.
di.unbind('foo');
console.log(di.has('foo')); // false
```

## Example 5 - invoking

```javascript
var di = require('di-fu')();
console.log(di.has('foo')); // false

// Bind a simple function.
di.bind('foo').to(function(name) {
	return "Hello " + name; 
});
console.log(di.has('foo')); // true

// Invoke the function.
console.log(di.invoke('foo', ['Bob'])); // Hello Bob

// Bind a simple class.
di.bind('Bar').to(function(name) {
	var _this = this;
	var _name = name;

	_this.hello = function() {
		return "Hello " + _name;
	}
});
console.log(di.has('Bar')); // true

// Create an instance of the class and call it.
var bar = di.create('Bar', ['Bob']);
console.log(bar.hello()); // Hello Bob
```

## Example 5 - require

```javascript
var di = require('di-fu')();

// Use the require method to get a component if a binding
// is found but fallback to loading a module if it is not.
var svc = di.require('./foo').service;
console.log(svc.hello()); // hello world

// If you have a binding, it is returned instead of loading
// a module. This is a slightly lighter way of using the 
// dependency injector, however it requires using module
// paths as keys.
di.bind('./foo').to({
    service : {
        hello : function() { return 'hello interceptor'; }
    }
});
var svc = di.require('./foo').service;
console.log(svc.hello()); // hello interceptor
```

## Example 6 - pre-configure required modules.

```javascript
// in difile.js
var di = require('di-fu')();

// Initialise promises (bluebird).
var Promise = require('bluebird');
Promise.longStackTraces();
di.bind('bluebird').to(Promise);

// Initialise mongoose (MongoDB).
var mongoose = require('mongoose');
Promise.promisifyAll(mongoose);
di.bind('mongoose').to(mongoose);


// in some module...
var di = require('di-fu')();

var Promise = di('bluebird');

// away we go...
```

## Tests

  npm test