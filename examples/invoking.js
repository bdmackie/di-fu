var di = require('../index').container();
//var di = require('di-fu').container();
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

