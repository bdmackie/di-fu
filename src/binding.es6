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

exports.Binding = Binding;