'use strict';
/**
 * @file Misc utilities.
 * @copyright Ben Mackie 2015
 * @license MIT
 */

var VError = require('verror');
var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var di = require('./depfile');
var debug = di.debuglogger('helper');
var stacktrace = require('stack-trace');
var minimatch = require('minimatch');

function Helper() {
    var _this = this;

    _this.splitAt = function(text, delim, leftDefault, rightDefault) {
        if (_.isUndefined(text))
            throw new VError('splitAt: text not defined.')
        if (_.isUndefined(delim))
            throw new VError('splitAt: delim not defined.')
        if (_.isUndefined(leftDefault))
            leftDefault = '';
        if (_.isUndefined(rightDefault))
            rightDefault = text;
        var i = text.indexOf(delim);

        if (i < 0)
            return {
                left: leftDefault,
                right: rightDefault
            };
        else
            return {
                left: text.substr(0, i),
                right: text.substr(i + delim.length)
            };
    }

    _this.stem = function(p) {
        var s = path.basename(p);
        var e = path.extname(p);
        if (e.length > 0)
            s = s.substr(0, s.length - e.length);
        return s;
    }

    _this.fileExists = function(filepath) {
        try {
            stats = fs.lstatSync(filepath);
            return stats.isFile();
        } catch (e) {
            return false;
        }
    }

    return _this;
}

module.exports = new Helper();