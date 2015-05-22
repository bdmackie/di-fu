'use strict';

var di = require('./depfile');
var debug = di.debuglogger('config');
var _ = require('underscore');
var s = require('underscore.string');
var VError = require('verror');
var helper = di.helper;
var path = require('path');

var status = {pending:0, running:1, finished:2};

function FileUpSearcher(filename) {
    var _this = this;
    var _private = {};

    var _searchDirs = new di.Set();
    var _filename = filename;

    this.clear = function() {
    	_searchDirs.clear();
    }

	this.find = function(basedir) {
        var dir = path.resolve(basedir);
        var filenames = [];
        while (dir != null && !_searchDirs.has(dir)) {
            var filename = path.join(dir, filename);
            if (helper.fileExists(filename))
	            filenames.push(filename)
	        _searchDirs.add(dir);
            dir = path.resolve(path.join(dir, '..'));
        }
        filenames.reverse();
        return filenames;
	}
}

function Config(_options) {
    var _this = this;
    var _private = {};

    var _upSearcher = new FileUpSearcher('difile.js');
    var _status = status.pending;

    _this.load = function(basedir) {
        if (_status != status.pending)
            return;
        _status = status.running;

        // Search from basedir.
        var filenames = _upSearcher.find(basedir);
        filenames.forEach(function(filename) {
        	require(filename);
        });

        _autoConfigStatus = status.finished;
    }
}