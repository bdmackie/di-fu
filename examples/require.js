var di = require('../index').container();
//var di = require('di-fu').container();

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