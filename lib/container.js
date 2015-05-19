var di = require('./depfile');
var debug = di.debuglogger('container');
var _ = require('underscore');
var s = require('underscore.string');
var VError = require('verror');
var helper = di.helper;

function Container() {
    var _this = this;
    var _private = {};

    var _components = new di.Map();
    var _intercepts = new di.Map();
    var _options = {
        resolver: require.resolve,
        basedir: null
    }

    _this.options = function(optionsToSet) {
        if (arguments.length == 0)
            return _.clone(_options);
        _options = _.extend(_options, optionsToSet);
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
            debug('..loading deferred component [%s] filename [%s]...', key, ref.filename);
            var interceptComponent = _private.doIntercept(ref.filename);
            if (interceptComponent == null) {
                debug('..no interceptor. Loading [%s]=>[%s]...', ref.key, ref.filename);
                component = _private.load(ref, true);
                debug('..loaded component [%s]=>[%s]', ref.key, ref.filename);
            } else {
                debug('..found interceptor for [%s]', ref.filename);
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
        var filename = _options.resolver(ref.filename);
        debug('loading [%s]=>[%s]', ref.key, ref.filename);
        var component = require(filename);
        component = _private.resolveImport(component, ref);
        _private.set(ref.key, component, force);
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

    _private.optionsInfo = _options;

    _internal = _.extend(_.clone(_this), _private);

    return _this;
};

module.exports = Container;