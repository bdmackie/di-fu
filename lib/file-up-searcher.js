'use strict';

var di = require('./depfile');
var dahelper = di.helper;
var path = require('path');
var debug = di.debuglogger('file-up-searcher');
var VError = require('verror');
var fs = require('fs');

var FileUpSearcher = function FileUpSearcher(filename) {
    var _this = this;
    var _private = {};

    var _searchDirs = new di.Set();
    var _filename = filename;

    this.clear = function() {
    	_searchDirs.clear();
    }

	this.find = function(basedir) {
        debug('finding [%s] up from [%s]', _filename, basedir);
        var dir = path.resolve(basedir);
        debug('..resolved dir is [%s]', dir);
        var filenames = [];
        while (dir != null && !_searchDirs.has(dir)) {
            var filename = path.join(dir, _filename);
            debug('..testing for file [%s]', filename);
            if (_private.fileExists(filename)) {
                debug('....found!');
	            filenames.push(filename)
            }
	        _searchDirs.add(dir);
            dir = path.resolve(path.join(dir, '..'));
            debug('..checking for [%s]..', dir);
        }
        if (debug.enabled) {
            if (dir == null)
                debug('..reached root');
            if (_searchDirs.has(dir))
                debug('..found previously searched directory [%s]', dir);
        }
        filenames.reverse();
        debug('..Filenames [%s]', filenames);
        return filenames;
	}

    _private.fileExists = function(filepath) {
        try {
            var stats = fs.lstatSync(filepath);
            return stats.isFile();
        } catch (e) {
            return false;
        }
    }
}

module.exports.FileUpSearcher = FileUpSearcher;