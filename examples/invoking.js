var di = require('../index').container();
//var di = require('di-fu').container();
console.log(di.has('foo')); // false

di.bind('foo').to(function() { return "hello world"; });
console.log(di.has('foo')); // true

console.log(di.call('foo')); // hello world