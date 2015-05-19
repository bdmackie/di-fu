var chai = require('chai');
chai.config.includeStack = true;
var expect = chai.expect;
var th = require('./testing-helper');
var mf = th.moduleFu;

describe('require', function() {
    it('should load bound component on require.', function() {
        // arrange
        var di = th.reloadDi();
        expect(di).to.be.ok;
        expect(di.has('dummy-service')).to.be.false;
        expect(mf.has('./dummy-service')).to.be.false;

        // act + assert
        di.bind('dummy-service').file('./dummy-service');
        expect(di.has('dummy-service')).to.be.true;
        expect(mf.has('./dummy-service')).to.be.false;

        // act + assert
        var svc = di.require('dummy-service').service;
        expect(mf.has('./dummy-service')).to.be.true;        
        expect(svc).to.be.ok;
        expect(svc.test()).to.equal(123);
        var x = mf.find('./dummy-service');
    });

    it('should load base component on require.', function() {
        // arrange
        var di = th.reloadDi();
        expect(di).to.be.ok;
        expect(di.has('dummy-service')).to.be.false;
        expect(mf.has('./dummy-service')).to.be.false;

        // act + assert
        var svc = di.require('./dummy-service').service;
        expect(mf.has('./dummy-service')).to.be.true;        
        expect(svc).to.be.ok;
        expect(svc.test()).to.equal(123);
        var x = mf.find('./dummy-service');
    });

    it('should load dummy service in subdirectory.', function() {
        // arrange
        var di = th.reloadDi();
        expect(di).to.be.ok;
        expect(di.has('dummy-foo')).to.be.false;

        // act + asssert
        di.bind('dummy-foo').file('./sub/dummy-foo');
        expect(di.has('dummy-foo')).to.be.true;
        expect(mf.has('./sub/dummy-foo')).to.be.false;

        // act + assert
        var svc = di.get('dummy-foo').service;
        expect(di.has('dummy-foo')).to.be.true;
        expect(mf.has('./sub/dummy-foo')).to.be.true;
        expect(svc).to.be.ok;
        expect(svc.foo()).to.equal('bar');
    });
});