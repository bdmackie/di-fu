function Service() {
	var _this = {};

	_this.foo = function() {
		return 'bar';
	}

	return _this;
}

exports.service = new Service();