// note: this is not actually used by this module but is here as a part of the test for supporting this file.

var di = require('../../index').configure();

di.bind('parent').file('./dummy-parent');
di.bind('foo').file('./dummy-foo');
di.bind('bar').file('./dummy-bar');