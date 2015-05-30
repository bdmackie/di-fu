// Create container singleton.
var container = new require('./lib/container').Container();

// Create wrapper that defaults to require function
// and omits configure method.
var di = container.get;
di.container = container;
di.get = di.container.get;
di.invoke = di.container.invoke;
di.create = di.container.create;
di.has = di.container.has;
di.bind = di.container.bind;
di.rebind = di.container.rebind;
di.unbind = function(key) {
	di.container.unbind(key);
	return di;
};
//di.intercept = di.container.intercept;

// Expose sole container method that returns
// a configured container.
module.exports.container = function(options) {
	di.container.configure(options);
	return di;
}