import VError from 'verror';
import _ from 'underscore';
import s from 'underscore.string';

class Container {
	constructor() {
		this._loaderFn = function(path) { return require(path); };
		this._bindings = new Map();
		this._loading = new Set();
	}

	setLoader(loaderFn) {
		this._loaderFn = loaderFn;
	}

	resolve(key) {
		return key;
	}

	bind(key) {
		return new Binding(this, key);
	}

	set(key, component, force = false) {
		if (!force && this.has(key))
			throw new VError('Component already defined with key [%s]', key);
		this._bindings.set(key, component);
	}

	get(key) {
		let resolvedKey = this.resolve(key);
		let component = this._bindings.get(resolvedKey);
		if (component instanceof Deferred) {
			component = this.load(resolvedKey, component.filePath);
		}
		return component;
	}

	delete(key) {
		let resolvedKey = this.resolve(key);
		this._bindings.delete(resolvedKey);
	}

	has(key) {
		let resolvedKey = this.resolve(key);
		return this._bindings.has(resolvedKey);
	}

	load(key, filePath, force = false) {
		let ref = new Reference(this, key, filePath);
		//console.log(ref.toString());
		let component = this._loaderFn(ref.filePath);
		this.set(ref.key, component);
		return component;
	}
}

class Reference {
	constructor(container, key, filePath) {
		if (!container || !(container instanceof Container))
			throw new VError('Dependency injection container not specified.');
		if (!_.isString(key) || s.isBlank(key))
			throw new VError('String key not specified.');
		this.container = container;

		this.fullKey = key;
		if (s.contains(key, '/')) {
			this.ns = s.strLeft(this.fullKey, '/');
			this.key = s.strRight(this.fullKey, '/');
		} else {
			this.ns = '';
			this.key = key;
		}

		if (_.isString(filePath))
			this.filePath = filePath;
		else
			this.filePath = './' + this.fullKey;
	}

	resolve() {
		if (this.filePath)
			return;
		this.filePath = './' + this.key;
	}


	toString() {
		return `[fullKey: ${this.fullKey}, ns: ${this.ns}, key: ${this.key}, path: ${this.path}]`;
	}

}

class Deferred {
  constructor(container, key, filePath) {
    this.container = container;
    this.key = key;
    this.filePath = filePath;
  }

  load() {
    return this.container.load(this.key, this.filePath);
  }
}

class Binding {
  constructor(container, key) {
    this.container = container;
    this.key = key;
  }

  to(component) {
    this.container.set(this.key, component);
  }

  load(filePath) {
  	this.container.load(this.key, filePath);
  }

  defer(filePath) {
    let deferred = new Deferred(this.container, this.key, filePath);
    this.container.set(this.key, deferred);
  }

  factory(factoryFn) {

  }
}

exports.container = new Container();