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
  _this.file = function(filename, binding) {
    if (_.isUndefined(filename))
      throw new VError('Module filename not defined.');
    var binding = _private.initBinding(binding);
    var key = _container.resolveWildcard(_key, filename, binding);
    var ref = new di.Reference(_container, key, filename);
    ref.binding = binding;
    _container.set(key, ref, _force);
    return new FileBinding(_container, ref);
  }

  /**
   * Binds to a collection of modules loaded from a pattern.
   */
  _this.path = function(pattern, globOptions, binding) {
    if (!_.isString(pattern))
      throw new VError('Module pattern not defined.');
    debug('Binding path [%s]', pattern);

    globOptions = _.extend(_.clone(DEFAULT_GLOB_OPTIONS), globOptions || {});
    if (!globOptions.cwd && _container.options.basedir)
      globOptions.cwd = _container.options.basedir;
    debug('..globOptions: %s', globOptions);

    binding = _private.initBinding(binding);
    debug('..binding: %s', binding);

    // get refs for pattern.
    var filenames = glob.sync(pattern, globOptions);
    debug('..found %s files: %s', filenames.length, filenames);
    var refs = _.map(filenames, function(filename) {
      var key = _container.resolveWildcard(_key, filename, binding);
      var ref = new di.Reference(_container, key, filename);
      ref.binding = binding;
      debug('..registering reference [%s]->[%s]', key, filename);
      _container.set(key, ref, _force);
      return ref;
    });

    return new PathBinding(_container, refs);
  }

  _private.initBinding = function(binding) {
    if (_.isString(binding))
      binding = {importer:binding};
    return _.extend(_.clone(DEFAULT_BIND_OPTIONS), binding || {});
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