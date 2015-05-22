function Service() {
	var _this = {};

	_this.hello = function() {
		return 'world';
	}

	return _this;
}

exports.service = new Service();