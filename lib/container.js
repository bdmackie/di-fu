'use strict';

var di = require('./depfile');
var debug = di.debuglogger('container');
var _ = require('underscore');
var s = require('underscore.string');
var VError = require('verror');
var helper = di.helper;
var path = require('path');
var stackFu = di.stackFu;

var DEFAULT_OPTIONS = {
    resolver: null,
    basedir: null,
    configfile: true
}

var Container = function Container() {
    var _this = this;
    var _private = {};

    var _components = new di.Map();
    var _intercepts = new di.Map();
    var _loading = new di.Set();
    var _options = null;
    var _fileUpSearcher = new di.FileUpSearcher('difile.js');
    var _internal = null;
    var _configCount = 0;

    _this.configure = function(options) {       
        var debug = di.debuglogger('container.configure');
        debug('Configuring [%s] with [%s]', ++_configCount, options);

        // Important to leave storing the options till after
        // higher level difile's have run.
        options = _.extend(_.clone(DEFAULT_OPTIONS), options || {});
        debug('..configuring [%s] with [%s]', _configCount, options);
        if (!options.basedir) {
            options.basedir = stackFu.callingDir([
                './*',
                '../index.js'
                ]);
        }
        if (!options.resolver) {
            options.resolver = function(filename) {
                if (!path.isAbsolute(filename))
                    filename = path.join(options.basedir, filename);
                return require.resolve(filename);
            }
        }
        if (options.configfile) {
            var files = _fileUpSearcher.find(options.basedir);
            files.forEach(function(filename) {
                debug('..loading [%s]...', filename);
                require(filename);
            });
        }
        _options = options;
        debug('..setting options [%s] to be [%s]', _configCount, _options);
        _configCount--;
        return _this;
    }

    _this.bind = function(key) {
        return new di.Binding(_internal, key);
    }

    _this.has = function(key) {
        return _components.has(key);
    }

    _this.get = function(key) {
        debug('get [%s]', key);

        if (!_components.has(key))
            throw new VError('Error resolving component [%s]. Component not defined.', key);

        var component = _components.get(key);
        if (component instanceof di.Reference) {
            var ref = component;
            var filename = null;
            try {
                filename = ref.resolveFilename();
            } catch(e) {
                throw new VError(e, 'Unable to resolve file [%s] for component [%s]',
                    ref.filename, ref.key);
            }
            debug('..loading deferred component [%s] filename [%s]...', key, filename);
            var interceptComponent = _private.doIntercept(filename);
            if (interceptComponent == null) {
                debug('..no interceptor', ref.key, filename);
                component = _private.load(ref, true);
                debug('..loaded component [%s]=>[%s]', ref.key, filename);
            } else {
                debug('..found interceptor for [%s]', filename);
                component = interceptComponent;
            }
        }
        else {
            debug('..found loaded component [%s]', key);
        }
        return component;

    }

    _this.require = function(keyOrFilename) {
        debug('require [%s]', keyOrFilename);

        // Get component if it's defined.
        if (_this.has(keyOrFilename)) {
            debug('..found component. Getting...');
            return _this.get(keyOrFilename);
        }

        // Resolve filename.
        var filename = _options.resolver(keyOrFilename);
        debug('..resolved filename: [%s]', filename);

        // Check for intercept.
        var interceptComponent = _private.doIntercept(filename);
        if (interceptComponent != null) {
            debug('..found interceptor for [%s]. Returning...', filename);
            return interceptComponent;
        }

        // Pass through to require.
        debug('..pass thru to require...');
        return require(filename);
    }

    _this.delete = function(key) {
        _components.delete(key);
    }

    _this.intercept = function(filename, interceptor) {
        filename = _options.resolver(filename);
        if (arguments.length == 1)
            return _intercepts.get(filename);
        
        if (interceptor == null) { // Interpret null as delete.
            if (_intecepts.has(filename))
                _intercepts.delete(filename);
        } else {
            // Interpret valid types.
            if (_.isString(interceptor) 
                || _.isFunction(interceptor) 
                || _.isObject(interceptor)) {
                _intercepts.set(filename, interceptor);
            } else
                throw new VError('Invalid interceptor for [%s]. Must be string, function or object.',
                    filename);
        }
    }

    _private.doIntercept = function(filename) {
        filename = _options.resolver(filename);
        if (!_intercepts.has(filename))
            return null;
        var interceptor = _intercepts.get(filename);
        if (_.isString(interceptor)) {
            if (!_this.has(interceptor))
                throw new VError('Invalid interceptor for [%s]. Component [%s] not defined.',
                    filename, interceptor);
            debug('..found string inteceptor [%s] for [%s]. Getting...', interceptor, filename);
            return _this.get(interceptor);
        } else if (_.isFunction(interceptor)) {
            debug('..found function inteceptor for [%s]. Evaluating...', filename);
            return interceptor(filename);
        } else if (_.isObject(interceptor)) {
            debug('..found object inteceptor for [%s]. Returning...', filename);
            return interceptor;
        } else {
            throw new VError('Invalid interceptor for [%s]. Uknown type.',
                filename);
        }
    }

    _private.validateKey = function(key) {
        if (!_.isString(key))
            throw new VError('Key must be a string.');
        key = s.trim(key);
        if (key.length == 0)
            throw new VError('Blank key specified.');
        return key;
    }

    _private.set = function(key, component, force) {
        key = _private.validateKey(key);
        force = (typeof force !== 'undefined' ? force : false); 
        if (!force && _this.has(key))
            throw new VError('Component already defined with key [%s]', key);
        _components.set(key, component);
    }

    _private.load = function(ref, force) {
        var filename = ref.resolveFilename();
        if (_loading.has(filename))
            throw new VError('Circular dependency detected: Filename [%s] key [%s]',
                filename, ref.key);
        _loading.add(filename);
        debug('loading [%s]=>[%s]', ref.key, ref.filename);
        var component = require(filename);
        component = _private.resolveImport(component, ref);
        _private.set(ref.key, component, force);
        _loading.delete(filename);
        return component;
    }

    _private.resolveImport = function(component, ref) {
        if (!ref.bindOptions || !ref.bindOptions.importer) {
            debug('..no bind options or importer');
            return component;
        }
        var importer = ref.bindOptions.importer;
        var importObj;
        if (_.isString(importer)) {
            debug('..resolving import from property [%s]...');
            importObj = component[importer];
            if (_.isUndefined(importObj))
                throw new VError('Import [%s] not defined in loaded module [%s]',
                    importer, ref.filepath);
        } else if (_.isFunction(importer)) {
            debug('..resolving import from function...');
            importObj = importer(component);
            if (_.isUndefined(importObj))
                throw new VError('Importer function return undefined in loaded module [%s]',
                    ref.filepath);
        } else {
            throw new VError('Uknown importer type [%s] for loaded module [%s]',
                typeof importer, ref.filepath);
        }
        return importObj;
    }

    _private.getOptions = function() {
        return _options;
    }

    _this.logOptions = function() {
        console.log(JSON.stringify(_options));
    }

    _internal = _.extend(_.clone(_this), _private);

    return _this;
};

module.exports.Container = Container;