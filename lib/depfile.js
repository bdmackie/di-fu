'use strict';

var _ = require('underscore');
var debugfactory = require('./lazy-debug');
debugfactory.lazyoptions.prefix = 'di-fu';

exports.debuglogger = debugfactory;

exports.Map = require('harmony-enumerables').Map;
exports.Set = require('harmony-enumerables').Set;
exports.FileUpSearcher = require('./file-up-searcher').FileUpSearcher;

exports.helper = require('./helper');
exports.stackFu = require('./stack-fu');
exports.Reference = require('./reference');
exports.Binding = require('./binding');

exports.container = require('./container').container;
