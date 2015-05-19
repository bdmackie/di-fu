function Service() {
	var _this = {};

	_this.test = function() {
		return 123;
	}

	return _this;
}

exports.service = new Service();