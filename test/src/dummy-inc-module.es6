module.exports = function() {
    var loc = require('./dummy-loc.js');
    var m = loc.resolve('dummy-func-module');
    return m();
}