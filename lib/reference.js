'use strict';

var di = require('./depfile');
var _ = require('underscore');
var s = require('underscore.string');
var VError = require('verror');

function Reference(container, key, filename) {
    var _this = this;

    if (!container)
        throw new VError('Dependency injection container not specified.');
    if (!_.isString(key) || s.isBlank(key))
        throw new VError('String key not specified.');
    _this.key = key;
    _this.filename = filename;
    _this.bindOptions = null;
    _this.containerOptions = container.getOptions();

    _this.inspect = function(depth) {
        return {
            key: _this.key, 
            filename: _this.filename,
            importName: _this.importName
        };
    }

    _this.resolveFilename = function() {
        return _this.containerOptions.resolver(_this.filename);
    }

    return _this;
};

module.exports = Reference;