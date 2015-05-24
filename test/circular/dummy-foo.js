var di = require('../../index').configure();

function FooService() {
	var _this = {};

	var _bar = di.get('bar');

	_this.bar = function() {
		return _bar;
	}

	return _this;
}

module.exports = new FooService();