var di = require('../../index').configure({resolver: require.resolve, basedir: __dirname});

function BarService() {
	var _this = {};

	var _parent = di.get('parent').service;
	//var _parent = null;

	_this.parent = function() {
		//if (_parent == null)
		//	_parent = di.get('parent').service;
		return _parent;
	}

	_this.test = function() {
		return 123;
	}

	return _this;
}

module.exports = new BarService();