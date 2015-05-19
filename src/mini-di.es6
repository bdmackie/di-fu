var VError = require('verror');
var _path = require('path');
var _fs = require('fs');
var _fsHelper = require('./fs-helper.js');

class Locator {
    constructor() {
      this._searchDirs = [];
      this._components = {};
    }

    // Adds a directory to be searched when locating modules.
    addSearchDir(dir) {
        var absDir = _path.resolve(_path.dirname(module.parent.filename), dir);
        this._searchDirs.push(absDir);
    };

    clear() {
        this._components = {};
    }

    // Registers a new component (module or function).
    register(key, object) {
        if (typeof key != 'string')
            throw new VError('Unable to register component. Key invalid/not defined.');
        if (typeof object != 'object' && typeof object != 'function')
            throw new VError('Unable to register component. Component must be object or function.');
        //console.log('Registering component with key "%s" and type "%s"', key, typeof object);
        this._components[key] = object;
    };

    // Indicates if a component with the specified key has been registered.
    contains(key) {
        return this._components.hasOwnProperty(key);
    };

    // Registers a new module from a path or key.
    registerModule(pathOrKey) {
        var m = this.requireModule(pathOrKey);
        this.register(this.getModuleKey(pathOrKey), m);
        return m;
    };

    registerModuleDir(options) {
        _fsHelper.visitFiles(
            options,
            function(file) {
                //console.log('walking and registering %s', file);
                this.registerModule(file);
            }
        );
    };

    registerFunction(key, fn) {
        if (typeof fn != 'function')
            throw new VError('Function component expected.');
        fn.__isFunctionComponent = true;
        this.register(key, fn);
    };

    resolve(key) {
        // Happy case - component is registered.
        if (this.contains(key)) {
            var obj = this._components[key];
            if (obj.__isFunctionComponent)
                return obj();
            else
                return obj;
        }

        // Default to registering a new module by its key.
        if (key.indexOf('.') >= 0 || key.indexOf('/') > 0)
            throw new VError('Cannot resolve component by path.');
        return this.registerModule(key);
    };

    // Helper method - gets a module key from it's path (safely returns the key if it's not a path already).
    getModuleKey(path) {
        return _path.basename(path, _path.extname(path));
    }

    // Helper method - does the requiring of a new module from a path or key,
    // using the search directories if it's a key.
    requireModule(pathOrKey) {
        var isPath = pathOrKey.indexOf('.') >= 0 || pathOrKey.indexOf('/') > 0;

        // Check if the path is in fact a path.
        if (isPath && _fs.existsSync(pathOrKey))
            return module.parent.require(pathOrKey);

        // Scan search directories if the identifier is not a path.
        if (!isPath) {
            for (var i = 0; i < this._searchDirs.length; i++) {
                var path = _path.resolve(this._searchDirs[i], pathOrKey);
                if (_fs.existsSync(path + '.js'))
                    return require(path + '.js');
                else if (_fs.existsSync(path + '.json'))
                    return require(path + '.json');
            }
        }

        // Last resort - call a require from the parent.
        return module.parent.require(pathOrKey);
    }
}

module.exports = new Locator();