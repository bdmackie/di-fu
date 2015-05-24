// note: this is not actually used by this module but is here as a part of the test for supporting this file.

var di = require('./index').container();

di.bind('hello').file('./test/dummy-hello');

//throw new Error('test');