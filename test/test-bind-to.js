var chai = require('chai');
var expect = chai.expect;
var th = require('./testing-helper');

describe('bind-to', function() {
   it('should set and get a basic object component.', function() {
        // arrange
        var di = th.reloadDiVanilla();
        expect(di.has('hello')).to.be.false;
        
        expect(di).to.be.ok;
        expect(di.has('foo')).to.be.false;

        // act
        di.bind('foo').to({
            test: 123
        });

        // assert
        expect(di.has('foo')).to.be.true;
        var component = di('foo');
        expect(component).to.be.ok;
        expect(component.test).to.equal(123);

        // act
        di.unbind('foo');

        // assert
        expect(di.has('foo')).to.be.false;
        var badFn = function() {
            component = di('foo');
        };
        expect(badFn).to.throw(Error);
    });

    it('should throw when adding an already existing component.', function() {
        // arrange
        var di = th.reloadDiVanilla();
        expect(di).to.be.ok;
        expect(di.has('hello')).to.be.false;
        expect(di.has('foo')).to.be.false;

        // act
        di.bind('foo').to({
            test: 123
        });

        // assert
        expect(di.has('foo')).to.be.true;

        // act + assert
        var badFn = function() {
            di.bind('foo').to({
                test: 345
            });
        };
        expect(badFn).to.throw(Error);
    });

    it('should bind a module component.', function() {
        // arrange
        var di = th.reloadDiVanilla();
        expect(di).to.be.ok;
        expect(di.has('hello')).to.be.false;
        expect(di.has('dummy-service')).to.be.false;

        // act
        di.bind('dummy-service').to(require('./dummy-service'));

        // assert
        expect(di.has('dummy-service')).to.be.true;
        var svc = di('dummy-service').service;
        expect(svc).to.be.ok;
        expect(svc.test()).to.equal(123);
    });

    it('should rebind an existing component.', function() {
        // arrange
        var di = th.reloadDiVanilla();
        expect(di.has('hello')).to.be.false;
        
        expect(di).to.be.ok;
        expect(di.has('foo')).to.be.false;

        // act
        di.bind('foo').to({
            test: 123
        });

        // assert
        expect(di.has('foo')).to.be.true;
        var component = di('foo');
        expect(component).to.be.ok;
        expect(component.test).to.equal(123);

        // act
        di.rebind('foo').to({
            test: 456
        })

        // assert
        expect(di.has('foo')).to.be.tue;
        component = di('foo');
        expect(component).to.be.ok;
        expect(component.test).to.equal(456);
    });
});