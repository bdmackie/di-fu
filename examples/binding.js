var di = require('../index').container();
//var di = require('di-fu').container();
console.log(di.has('foo')); // false

di.bind('foo').to({
	hello: function() { return "hello world"; }
});
console.log(di.has('foo')); // true

var foo = di.get('foo');
console.log(foo.hello()); // hello world

di.rebind('foo').to({
	hello: function() { return "goodbye"; }
});
var foo = di.get('foo');
console.log(foo.hello()); // goodbye

di.unbind('foo');
console.log(di.has('foo')); // false
