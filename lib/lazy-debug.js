'use strict';
/**
 * @file A lazy wrapper for debug.
 * @copyright Ben Mackie 2015
 * @license MIT
 */

var _ = require('underscore');
var debugfactory = require('debug');

var lazydebug = function(logname) {
	var debuglog = null;
	var opt = lazydebug.lazyoptions;
	if (opt.prefix)
		debuglog = debugfactory(opt.prefix + (logname ? ':' + logname : ''));
	else if (logname)
		debuglog = debugfactory(logname);
	else
		debuglog = debugfactory();
	var fn = function(msg) {
		if (!debuglog.enabled)
			return;
		var args = Array.prototype.slice.call(arguments);
		if (opt.formatter) {
			for (var i = 1; i < args.length; i++)
				args[i] = opt.formatter(args[i]);
		}
		return debuglog.apply(this, args);
	}
	fn = _.extend(fn, debuglog);
	return fn;
};

lazydebug.lazyoptions = {
	prefix: '',
	formatter : function(arg) {
		if (_.isFunction(arg))
			return arg();
		else if (_.isObject(arg)) // also matches arrays.
			return JSON.stringify(arg);
		else
			return arg;
	}
};

lazydebug = _.extend(lazydebug, debugfactory);

module.exports = lazydebug;