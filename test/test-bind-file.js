var chai = require('chai');
chai.config.includeStack = true;
var expect = chai.expect;
var th = require('./testing-helper');
var mf = th.moduleFu;

describe('bind-file', function() {
    it('should load dummy service.', function() {
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
        var svc = di.get('dummy-service').service;
        expect(mf.has('./dummy-service')).to.be.true;        
        expect(svc).to.be.ok;
        expect(svc.test()).to.equal(123);
    });

    it('should load dummy service with default key.', function() {
        // arrange
        var di = th.reloadDi();
        expect(di).to.be.ok;
        expect(di.has('dummy-service')).to.be.false;
        expect(mf.has('./dummy-service')).to.be.false;

        // act + assert
        di.bind().file('./dummy-service');
        expect(di.has('dummy-service')).to.be.true;
        expect(mf.has('./dummy-service')).to.be.false;

        // act + assert
        var svc = di.get('dummy-service').service;
        expect(mf.has('./dummy-service')).to.be.true;        
        expect(svc).to.be.ok;
        expect(svc.test()).to.equal(123);
        var x = mf.find('./dummy-service');
    });

    it('should load dummy service and import object.', function() {
        // arrange
        var di = th.reloadDi();
        expect(di).to.be.ok;
        expect(di.has('dummy-service')).to.be.false;
        expect(mf.has('./dummy-service')).to.be.false;

        // act + assert
        di.bind('dummy-service').file('./dummy-service', {importer: 'service'});
        expect(di.has('dummy-service')).to.be.true;
        expect(mf.has('./dummy-service')).to.be.false;

        // act + assert
        var svc = di.get('dummy-service');
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

    it('should load dummy service in subdirectory but with a different key.', function() {
        // arrange
        var di = th.reloadDi();
        expect(di).to.be.ok;
        expect(di.has('dummy-foo')).to.be.false;
        expect(di.has('x')).to.be.false;

        // act + assert
        di.bind('x').file('./sub/dummy-foo');
        expect(di.has('dummy-foo')).to.be.false;
        expect(di.has('x')).to.be.true;
        expect(mf.has('./sub/dummy-foo')).to.be.false;

        // act + assert
        var svc = di.get('x').service;
        expect(di.has('dummy-foo')).to.be.false;
        expect(di.has('x')).to.be.true;
        expect(mf.has('./sub/dummy-foo')).to.be.true;
        expect(svc).to.be.ok;
        expect(svc.foo()).to.equal('bar');
    });
});