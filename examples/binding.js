var di = require('../index').container();
//var di = require('di-fu').container();
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
