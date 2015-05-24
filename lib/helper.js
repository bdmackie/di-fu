'use strict';

var VError = require('verror');
var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var di = require('./depfile');
var debug = di.debuglogger('helper');
var stacktrace = require('stack-trace');

function Helper() {
    var _this = this;

    _this.getCallingDir = function() {
        var debug = di.debuglogger('get-calling-dir');

        // Go back 2 calls because of index.js
        var stack = stacktrace.get();
        if (debug.enabled) {
            debug('stack:');
            stack.forEach(function(item) {
                debug('..stack: %s:%s [%s]', 
                    item.getFileName(),
                    item.getMethodName(),
                    item.getLineNumber());
            });
        }

        // Get stack for call two methods back.
        var filename = path.resolve(stack[2].getFileName());
        debug('..file: [%s].', filename);

        // If it came via the index file, go back one further.
        if (filename == path.resolve(path.join(__dirname, '../index.js'))) {
            debug('..is index file');
            filename = path.resolve(stack[3].getFileName());
        }

        // Get the directory.
        var dir = path.dirname(filename);
        debug('..final file: [%s], dir: [%s]', filename, dir);
        return dir;
    }

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