// Persist container state in module context.
var containerModule = require('./lib/container');
var containerState = new containerModule.ContainerState();

// Recreate container for each call.
module.exports = function(options) {
	var container = new containerModule.Container(options, containerState);
	
	var di = container.get;
	di.container = container;
	di.get = di.container.get;
	di.invoke = di.container.invoke;
	di.create = di.container.create;
	di.require = di.container.require;
	di.has = di.container.has;
	di.bind = di.container.bind;
	di.rebind = di.container.rebind;
	di.unbind = function(key) {
		di.container.unbind(key);
		return di;
	};

	return di;
}