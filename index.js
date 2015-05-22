var myDi = require('./lib/depfile');

var container = new myDi.Container();

var di = container.require;
di.container = container;
di.get = di.container.get;
di.require = di.container.require;
di.bind = di.container.bind;
di.has = di.container.has;
di.delete = function(key) {
	di.container.delete(key);
	return di;
};
di.configure = function(options) {
	di.container.configure(options);
	return di;
};
di.intercept = di.container.intercept;

module.exports = di;