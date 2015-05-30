var chai = require('chai');
chai.config.includeStack = true;
var expect = chai.expect;
var th = require('./testing-helper');
var mf = th.moduleFu;

describe('invoking', function() {
    it('should call a function', function() {
        // arrange
        var di = th.reloadDiVanilla();
        expect(di.has('foo')).to.be.false;

        // act
        di.bind('foo').to(function(name) {
            return "Hello " + name; 
        });
        var msg = di.invoke('foo', ['Bob']);

        // assert
        expect(msg).to.equal('Hello Bob');
    });

    it('should create an object instance', function() {
        // arrange
        var di = th.reloadDiVanilla();
        expect(di.has('foo')).to.be.false;

        // act
        di.bind('Bar').to(function(name) {
            var _this = this;
            var _name = name;

            _this.id = 1;

            _this.hello = function() {
                return "Hello " + _name;
            }
        });
        var obj = di.create('Bar', ['Bob']);

        // assert
        expect(obj.hello()).to.equal('Hello Bob');

        var obj2 = di.create('Bar', ['John']);
        obj2.id = 2;
        expect(obj2.hello()).to.equal('Hello John');
        expect(obj2.id).to.equal(2);
        expect(obj.id).to.equal(1);
    });
});