'use strict';
/**
 * @file Main container for injector.
 * @copyright Ben Mackie 2015
 * @license MIT
 */

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

function ContainerState() {
    var _this = this;

    _this.components = new di.Map();
    _this.loading = new di.Set();
    _this.configCount = 0;
    _this.fileUpSearcher = new di.FileUpSearcher('difile.js');
}

function Container(options, state) {
    var _this = this;
    var _private = {};

    var _state = state;

    // Configure container and load any difile.js in path.
    debug('New container with [%s]', options);
    var _options = _.extend(_.clone(DEFAULT_OPTIONS), options || {});;
    if (!_options.basedir) {
        _options.basedir = stackFu.callingDir([
            './*',
            '../index.js'
            ]);
    }
    debug('..configuring [%s] with [%s]', ++_state.configCount, _options);
    if (_options.configfile) {
        var files = _state.fileUpSearcher.find(_options.basedir);
        files.forEach(function(filename) {
            debug('..loading [%s]...', filename);
            require(filename);
            debug('..loaded [%s]', filename);
        });
    }
    debug('..finished configuring [%s] with [%s]', _state.configCount, _options);
    _state.configCount--;

    _this.bind = function(key) {
        return new di.Binding(_private, key);
    }

    _this.rebind = function(key) {
        return new di.Binding(_private, key, true);
    }

    _this.has = function(key) {
        return _state.components.has(key);
    }

    _this.get = function(key) {
        debug('get [%s]', key);

        if (!_state.components.has(key))
            throw new VError('Error resolving component [%s]. Component not defined.', key);

        var component = _state.components.get(key);
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
            component = _private.load(ref, true);
            debug('..loaded component [%s]=>[%s]', ref.key, filename);
        }
        else {
            debug('..found loaded component [%s]', key);
        }
        return component;

    }

    _this.invoke = function(key, args) {
        var component = _this.get(key);
        if (!_.isFunction(component))
            throw new VError('Error invoking component [%s]. Component is not a function.', key);
        var result;
        try {
            if (arguments.length > 1)
                result = component.apply(component, args);
            else
                result = component();
        } catch (err) {
            throw new VError(err, 'Error invoking component [%s]: %s', key, err.message);
        }
        return result;
    }

    _this.create = function(key, args) {
        var component = _this.get(key);
        if (!_.isFunction(component))
            throw new VError('Error invoking component [%s]. Component is not a function.', key);
        var result;
        try {
            if (arguments.length > 1) {
                var F = function() {
                    return component.apply(this, args);
                }
                F.prototype = component.prototype;
                result = new F();
            }
            else
                result = new component();
        } catch (err) {
            throw new VError(err, 'Error invoking component [%s]: %s', key, err.message);
        }
        return result;
    }

    _this.require = function(filename) {
        debug('require [%s]', filename);

        // Get component if it's defined.
        if (_this.has(filename)) {
            debug('..found component. Getting...');
            return _this.get(filename);
        }

        // Resolve filename.
        filename = _private.resolveFilename(filename);

        // Pass through to require.
        debug('..pass thru to require...');
        return require(filename);
    }

    _private.resolveFilename = function(filename) {
        // Resolve filename.
        var originalFilename = filename;
        if (!path.isAbsolute(filename))
            filename = path.join(_options.basedir, filename);
        debug('Resolving [%s] to [%s]...', originalFilename, filename);
        var resolver = _options.resolver || require.resolve;
        filename = resolver(filename);
        debug('...to [%s]...', filename);
        return filename;
    }

    _this.unbind = function(key) {
        _state.components.delete(key);
        return _this;
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
        _state.components.set(key, component);
    }

    _private.load = function(ref, force) {
        var filename = ref.resolveFilename();
        if (_state.loading.has(filename))
            throw new VError('Circular dependency detected: Filename [%s] key [%s]',
                filename, ref.key);
        _state.loading.add(filename);
        debug('loading [%s]=>[%s]', ref.key, filename);
        var component = require(filename);
        component = _private.resolveImport(component, ref, filename);
        _private.set(ref.key, component, force);
        _state.loading.delete(filename);
        return component;
    }

    _private.resolveImport = function(component, ref, filename) {
        if (!ref.binding || !ref.binding.importer) {
            debug('..no bind options or importer');
            return component;
        }
        var importer = ref.binding.importer;
        var importObj;
        if (_.isString(importer)) {
            importer = _private.resolveWildcard(importer, filename, ref.binding);
            debug('..resolving import from property [%s]...', importer);
            importObj = component[importer];
            if (_.isUndefined(importObj))
                throw new VError('Import [%s] not defined in loaded module [%s]',
                    importer, filename);
        } else if (_.isFunction(importer)) {
            debug('..resolving import from function...');
            importObj = importer(component, filename);
            if (_.isUndefined(importObj))
                throw new VError('Importer function return undefined in loaded module [%s]',
                    ref.filepath);
        } else {
            throw new VError('Uknown importer type [%s] for loaded module [%s]',
                typeof importer, filename);
        }
        return importObj;
    }

    _private.resolveWildcard = function(key, filename, binding) {
        if (key.indexOf('*') < 0)
          return key;
        var wildcard = binding && binding.wildcard ? binding.wildcard : helper.stem;
        wildcard = wildcard(filename);
        debug('..Wildcard: [%s] from filename [%s]', wildcard, filename)
        return key.replace('*', wildcard);
    }

    _this.logOptions = function() {
        console.log(JSON.stringify(_options));
    }

    _private.options = _options;

    _private = _.extend(_this, _private);

    return _this;
};

module.exports.ContainerState = ContainerState;
module.exports.Container = Container;