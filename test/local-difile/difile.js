var di = require('../../index').configure();

di.bind().file('../dummy-service');
di.bind().path('../sub/dummy-*');