function LogService() {
	var _this = {};

	_this.log = function(message) {
		console.log(message);
	}

	return _this;
}

exports.service = new LogService();