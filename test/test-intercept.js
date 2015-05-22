var chai = require('chai');
chai.config.includeStack = true;
var expect = chai.expect;
var th = require('./testing-helper');
var mf = th.moduleFu;

describe('intercept', function() {
    it('should intercept on require with object', function() {
        // arrange
        var di = th.reloadDi();
        expect(di).to.be.ok;
        expect(di.has('dummy-service')).to.be.false;
        expect(mf.has('./dummy-service')).to.be.false;

        // act + assert
        di.intercept('./dummy-service', { test: 123 });
        expect(mf.has('./dummy-service')).to.be.false;

        // act + assert
        var svc = di.require('./dummy-service');
        expect(mf.has('./dummy-service')).to.be.false;  
        expect(svc.test).to.equal(123);
    });    

    it('should intercept on require with function', function() {
        // arrange
        var di = th.reloadDi();
        expect(di).to.be.ok;
        expect(di.has('dummy-service')).to.be.false;
        expect(mf.has('./dummy-service')).to.be.false;

        // act + assert
        di.intercept('./dummy-service', function() { return 123; });
        expect(mf.has('./dummy-service')).to.be.false;

        // act + assert
        var svc = di.require('./dummy-service');
        expect(mf.has('./dummy-service')).to.be.false;  
        expect(svc).to.equal(123);
    });

    it('should intercept on require with component', function() {
        // arrange
        var di = th.reloadDi();
        expect(di).to.be.ok;
        expect(di.has('dummy-service')).to.be.false;
        expect(mf.has('./dummy-service')).to.be.false;

        // act + assert
        di.bind('blah').file('./sub/dummy-foo');
        expect(mf.has('./sub/dummy-foo')).to.be.false;
        di.intercept('./dummy-service', 'blah')
        expect(mf.has('./sub/dummy-foo')).to.be.false;
        expect(mf.has('./dummy-service')).to.be.false;

        // act + assert
        var svc = di.require('./dummy-service');
        expect(mf.has('./sub/dummy-foo')).to.be.true;
        expect(mf.has('./dummy-service')).to.be.false;        
        expect(svc).to.be.ok;
        expect(svc.service.foo()).to.equal('bar');
    });

    it('should intercept on require with component with importer', function() {
        // arrange
        var di = th.reloadDi();
        expect(di).to.be.ok;
        expect(di.has('dummy-service')).to.be.false;
        expect(mf.has('./dummy-service')).to.be.false;

        // act + assert
        di.bind('blah').file('./sub/dummy-foo', 'service');
        expect(mf.has('./sub/dummy-foo')).to.be.false;
        di.intercept('./dummy-service', 'blah');
        expect(mf.has('./sub/dummy-foo')).to.be.false;
        expect(mf.has('./dummy-service')).to.be.false;

        // act + assert
        var svc = di.require('./dummy-service');
        expect(mf.has('./sub/dummy-foo')).to.be.true;
        expect(mf.has('./dummy-service')).to.be.false;
        expect(svc).to.be.ok;
        expect(svc.foo()).to.equal('bar');
    });
});