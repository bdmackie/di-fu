var VError = require('verror');
var _path = require('path');
var _fs = require('fs');
var _fsHelper = require('./fs-helper.js');

function Locator() {
}

Locator.prototype = function() {
    var _searchDirs = [];
    var _components = {};
    var self = {};
    
    // Adds a directory to be searched when locating modules.
    self.addSearchDir = function(dir) {
        var absDir = _path.resolve(_path.dirname(module.parent.filename), dir);
        _searchDirs.push(absDir);
    };

    self.clear = function() {
        _components = {};
    }

    // Registers a new component (module or function).
    self.register = function(key, object) {
        if (typeof key != 'string')
            throw new VError('Unable to register component. Key invalid/not defined.');
        if (typeof object != 'object' && typeof object != 'function')
            throw new VError('Unable to register component. Component must be object or function.');
        //console.log('Registering component with key "%s" and type "%s"', key, typeof object);
        _components[key] = object;
    };

    // Indicates if a component with the specified key has been registered.
    self.contains = function(key) {
        return _components.hasOwnProperty(key);
    };

    // Registers a new module from a path or key.
    self.registerModule = function(pathOrKey) {
        var m = requireModule(pathOrKey);
        self.register(getModuleKey(pathOrKey), m);
        return m;
    };

    self.registerModuleDir = function(options) {
        _fsHelper.visitFiles(
            options,
            function(file) {
                //console.log('walking and registering %s', file);
                self.registerModule(file);
            }
        );
    };

    self.registerFunction = function(key, fn) {
        if (typeof fn != 'function')
            throw new VError('Function component expected.');
        fn.__isFunctionComponent = true;
        self.register(key, fn);
    };

    self.resolve = function(key) {
        // Happy case - component is registered.
        if (self.contains(key)) {
            var obj = _components[key];
            if (obj.__isFunctionComponent)
                return obj();
            else
                return obj;
        }

        // Default to registering a new module by its key.
        if (key.indexOf('.') >= 0 || key.indexOf('/') > 0)
            throw new VError('Cannot resolve component by path.');
        return self.registerModule(key);
    };

    // Helper method - gets a module key from it's path (safely returns the key if it's not a path already).
    function getModuleKey(path) {
        return _path.basename(path, _path.extname(path));
    }

    // Helper method - does the requiring of a new module from a path or key,
    // using the search directories if it's a key.
    function requireModule(pathOrKey) {
        var isPath = pathOrKey.indexOf('.') >= 0 || pathOrKey.indexOf('/') > 0;

        // Check if the path is in fact a path.
        if (isPath && _fs.existsSync(pathOrKey))
            return module.parent.require(pathOrKey);

        // Scan search directories if the identifier is not a path.
        if (!isPath) {
            for (var i = 0; i < _searchDirs.length; i++) {
                var path = _path.resolve(_searchDirs[i], pathOrKey);
                if (_fs.existsSync(path + '.js'))
                    return require(path + '.js');
                else if (_fs.existsSync(path + '.json'))
                    return require(path + '.json');
            }
        }

        // Last resort - call a require from the parent.
        return module.parent.require(pathOrKey);
    }

    return self;
}();

module.exports = new Locator();