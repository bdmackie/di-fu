'use strict';
/**
 * @file Binding wrapper.
 * @copyright Ben Mackie 2015
 * @license MIT
 */

var di = require('./depfile');
var debug = di.debuglogger('binding');
var _ = require('underscore');
var s = require('underscore.string');
var VError = require('verror');
var helper = di.helper;
var glob = require('glob');
var path = require('path');

var DEFAULT_GLOB_OPTIONS = {};
var DEFAULT_BIND_OPTIONS = {
  importer:null
};

function Binding(container, key, force) {
  var _this = this;
  var _private = {};

  var _container = container;
  var _key = key;
  if (!_key || s.isBlank(_key))
    _key = '*';
  var _force = _.isUndefined(force) ? false : force;

  /**
   * Binds to a specified object component.
   */
  _this.to = function(component) {
    if (_.isUndefined(component))
      throw new VError('Component not defined.');
    _container.set(_key, component, _force);
  }

  /**
   * Binds to a single module.
   */
  _this.file = function(filename, bindOptions) {
    if (_.isUndefined(filename))
      throw new VError('Module filename not defined.');
    var key = _key;
    if (key.indexOf('*') >= 0)
      key = key.replace('*', helper.stem(filename));
    var ref = new di.Reference(_container, key, filename);
    ref.bindOptions = _private.initBindOptions(bindOptions);
    _container.set(key, ref, _force);
    return new FileBinding(_container, ref);
  }

  /**
   * Binds to a collection of modules loaded from a pattern.
   */
  _this.path = function(pattern, globOptions, bindOptions) {
    if (!_.isString(pattern))
      throw new VError('Module pattern not defined.');
    debug('Binding path [%s]', pattern);

    globOptions = _.extend(DEFAULT_GLOB_OPTIONS, globOptions || {});
    if (!globOptions.cwd && _container.getOptions().basedir)
      globOptions.cwd = _container.getOptions().basedir;
    debug('..globOptions: %s', globOptions);

    bindOptions = _private.initBindOptions(bindOptions);
    debug('..bindOptions: %s', bindOptions);

    // get refs for pattern.
    var filenames = glob.sync(pattern, globOptions);
    debug('..found %s files: %s', filenames.length, filenames);
    var refs = _.map(filenames, function(filename) {
      var key = _key.replace('*', helper.stem(filename));
      var ref = new di.Reference(_container, key, filename);
      ref.bindOptions = bindOptions;
      debug('..registering reference [%s]->[%s]', key, filename);
      _container.set(key, ref, _force);
      return ref;
    });

    return new PathBinding(_container, refs);
  }

  _private.initBindOptions = function(bindOptions) {
    if (_.isString(bindOptions))
      bindOptions = {importer:bindOptions};
    return _.extend(DEFAULT_BIND_OPTIONS, bindOptions || {});
  }
}

function FileBinding(container, ref) {
  var _this = this;  

  /**
   * Loads the file binding just registered.
   */  
  _this.load = function() {
    return container.load(ref, true);
  }
}

function PathBinding(container, refs) {
  var _this = this;  

  /**
   * Loads the path binding just registered.
   */  
  _this.load = function() {
    return _.map(refs, function(ref) { return container.load(ref, true); });
  }
}

module.exports = Binding;