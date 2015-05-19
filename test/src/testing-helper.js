'use strict'

var fs = require('fs');
var del = require('del');
var mf = require('module-fu');
mf.setResolver(function(moduleName) { return require.resolve(moduleName); });

module.exports.removeModule = function(path) {
	mf.remove(path);
}

module.exports.resetTarget = function(dir) {
	del.sync(dir);
    fs.mkdirSync(dir);
	return dir;
}

module.exports.delTarget = function(dir) {
	del.sync(dir);
}

module.exports.getFiles = function(dir) {
	return fs.readdirSync(dir);
}

module.exports.writeTextFile = function(path, text) {
	return fs.writeFileSync(path, text);
}

module.exports.readTextFile = function(path) {
	return fs.readFileSync(path, {encoding: 'utf8'});
}

module.exports.readJsonFile = function(path) {
	return JSON.parse(fs.readFileSync(path, {encoding: 'utf8'}));
}