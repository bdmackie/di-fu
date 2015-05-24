'use strict';
/**
 * @file Stack utilities.
 * @copyright Ben Mackie 2015
 * @license MIT
 */

var VError = require('verror');
var path = require('path');
var _ = require('underscore');
var di = require('./depfile');
var debug = di.debuglogger('stack-fu');
var stacktrace = require('stack-trace');
var minimatch = require('minimatch');

function StackFu() {
    var _this = this;

    _this.callingDir = function(skipPatterns) {
        debug('finding calling dir while skipping: %s', skipPatterns);

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

        // Get caller to this method as a start.
        var p = 1;
        var filename = path.resolve(stack[p].getFileName());
        debug('..file: [%s].', filename);

        // Sort out skip function based on patterns passed (if any).
        var skip = function() { return false; };
        if (skipPatterns) {
            if (_.isString(skipPatterns))
                skipPatterns = [skipPatterns];
            // Convert any relative path patterns to absolute ones.
            var basedir = path.dirname(filename);
            skipPatterns = _.map(skipPatterns, function (pattern) {
                return (!path.isAbsolute(pattern) ? path.join(basedir, pattern) : pattern);
            });
            skip = function(filename) {
                return _.some(skipPatterns, 
                    function(pattern) { return minimatch(filename, pattern ); }
                    );
            }
        }

        // Do any skipping.
        while (skip(filename) && p < stack.length) {
            debug('..skipping [%s]', filename);
            filename = path.resolve(stack[++p].getFileName());
        }

        // Get the directory.
        var dir = path.dirname(filename);
        debug('..final file: [%s], dir: [%s]', filename, dir);
        return dir;
    }

    return _this;
}

module.exports = new StackFu();