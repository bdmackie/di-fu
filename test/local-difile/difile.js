var di = require('../../index').configure({resolver: require.resolve, basedir: __dirname});

di.bind().file('../dummy-service');
di.bind().path('../sub/dummy-*');