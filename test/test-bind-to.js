var chai = require('chai');
var expect = chai.expect;
var th = require('./testing-helper');

describe('bind-to', function() {
   it('should set and get a basic object component.', function() {
        // arrange
        var di = th.reloadDiVanilla();
        expect(di.has('hello')).to.be.false;
        
        expect(di).to.be.ok;
        expect(di.has('basic-object')).to.be.false;

        // act
        //di.set('basic-object', {
        //    test: 123
        //});
        di.bind('basic-object').to({
            test: 123
        });

        // assert
        expect(di.has('basic-object')).to.be.true;
        var component = di.get('basic-object');
        expect(component).to.be.ok;
        expect(component.test).to.equal(123);

        // act
        di.unbind('basic-object');

        // assert
        expect(di.has('basic-object')).to.be.false;
        var badFn = function() {
            component = di.get('basic-object');
        };
        expect(badFn).to.throw(Error);
        //component = di.get('basic-object');
        //expect(component).to.be.undefined;
    });

    it('should throw when adding an already existing component.', function() {
        // arrange
        var di = th.reloadDiVanilla();
        expect(di).to.be.ok;
        expect(di.has('hello')).to.be.false;
        expect(di.has('basic-object')).to.be.false;

        // act
        //di.set('basic-object', {
        //    test: 123
        //});
        di.bind('basic-object').to({
            test: 123
        });

        // assert
        expect(di.has('basic-object')).to.be.true;

        // act + assert
        var badFn = function() {
            //di.set('basic-object', {
            //    test: 345
            //});
            di.bind('basic-object').to({
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
});