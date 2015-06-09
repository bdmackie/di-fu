var di = require('../../index')();

di.bind('log').file('./dummy-log');
di.bind('foo').file('./sub/dummy-foo');

var foo = di('foo');

di.bind('bar').file('./sub/dummy-bar');