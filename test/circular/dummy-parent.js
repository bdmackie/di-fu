var di = require('../../index').configure();

function ParentService() {
	var _this = {};

	var _foo = di.get('foo');

	_this.foo = function() {
		return _foo;
	}

	return _this;
}

exports.service = new ParentService();