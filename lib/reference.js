'use strict';
/**
 * @file A component reference.
 * @copyright Ben Mackie 2015
 * @license MIT
 */

var di = require('./depfile');
var _ = require('underscore');
var s = require('underscore.string');
var VError = require('verror');
var debug = di.debuglogger('reference');
var path = require('path');

function Reference(container, key, filename) {
    var _this = this;

    if (!container)
        throw new VError('Dependency injection container not specified.');
    if (!_.isString(key) || s.isBlank(key))
        throw new VError('String key not specified.');
    _this.key = key;
    _this.filename = filename;
    _this.binding = null;
    _this.container = container;
    debug('Reference [%s] has filename [%s]', key, filename);

    _this.inspect = function(depth) {
        return {
            key: _this.key, 
            filename: _this.filename,
            binding: _this.binding
        };
    }

    _this.resolveFilename = function() {
        return _this.container.resolveFilename(_this.filename);
    }

    return _this;
};

module.exports = Reference;