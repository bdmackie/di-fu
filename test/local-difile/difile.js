var di = require('../../index')();

di.bind().file('../dummy-service');
di.bind().path('../sub/dummy-*');