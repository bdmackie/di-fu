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

function Binding(container, key) {
  var _this = this;
  var _private = {};

  var _container = container;
  var _key = key;
  if (!_key || s.isBlank(_key))
    _key = '*';

  /**
   * Binds to a specified object component.
   */
  _this.to = function(component, force) {
    if (_.isUndefined(component))
      throw new VError('Component not defined.');
    _container.set(_key, component, force);
  }

  /**
   * Binds to a module that is deferred and loaded when it is
   * first retrieved.
   */
  _this.file = function(filename, bindOptions) {
    if (_.isUndefined(filename))
      throw new VError('Module filename not defined.');
    var ref = new di.Reference(_container, _key, filename);
    ref.bindOptions = _private.initBindOptions(bindOptions);
    _container.set(_key, ref);
    return new FileBinding(_container, ref);
  }

  /**
   * Binds to a module that is loaded on the spot.
   */
  _this.path = function(pattern, globOptions, bindOptions) {
    if (!_.isString(pattern))
      throw new VError('Module pattern not defined.');
    debug('Binding path [%s]', pattern);

    globOptions = _.extend(DEFAULT_GLOB_OPTIONS, globOptions || {});
    if (!globOptions.cwd && _container.optionsInfo.basedir)
      globOptions.cwd = _container.optionsInfo.basedir;
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
      _container.set(key, ref);
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