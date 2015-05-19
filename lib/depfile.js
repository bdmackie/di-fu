var _ = require('underscore');
var debugfactory = require('./lazy-debug');
debugfactory.lazyoptions.prefix = 'di-fu';

exports.debuglogger = debugfactory;

exports.Map = require('harmony-enumerables').Map;

exports.helper = require('./helper');
exports.Container = require('./container');
exports.Reference = require('./reference');
exports.Binding = require('./binding');