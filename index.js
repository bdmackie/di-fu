// Create container singleton.
var container = new require('./lib/container').Container();

// Create wrapper that defaults to require function
// and omits configure method.
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
di.intercept = di.container.intercept;

// Expose sole container method that returns
// a configured container.
module.exports.container = function(options) {
	di.container.configure(options);
	return di;
}