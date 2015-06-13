function FooModel() {
	var _this = {};

	_this.foo = function() {
		return 'bar';
	}

	return _this;
}

exports.FooModel = FooModel;