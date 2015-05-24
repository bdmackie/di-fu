var di = require('../../index').container();

di.bind().file('../dummy-service');
di.bind().path('../sub/dummy-*');