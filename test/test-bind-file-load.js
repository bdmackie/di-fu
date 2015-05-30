var chai = require('chai');
var expect = chai.expect;
var th = require('./testing-helper');
var mf = th.moduleFu;

describe('bind-file-load', function() {
    it('should load dummy service.', function() {
        // arrange
        var di = th.reloadDi();
        expect(di).to.be.ok;
        expect(di.has('dummy-service')).to.be.false;

        // act
        expect(mf.has('./dummy-service')).to.be.false;
        di.bind('dummy-service').file('./dummy-service').load();
        expect(mf.has('./dummy-service')).to.be.true;

        // assert
        expect(di.has('dummy-service')).to.be.true;
        var svc = di('dummy-service').service;
        expect(svc).to.be.ok;
        expect(svc.test()).to.equal(123);
    });

    it('should load dummy service and import an object.', function() {
        // arrange
        var di = th.reloadDi();
        expect(di).to.be.ok;
        expect(di.has('dummy-service')).to.be.false;

        // act
        expect(mf.has('./dummy-service')).to.be.false;
        di.bind('dummy-service').file('./dummy-service', {importer: 'service'}).load();
        expect(mf.has('./dummy-service')).to.be.true;

        // assert
        expect(di.has('dummy-service')).to.be.true;
        var svc = di('dummy-service');
        expect(svc).to.be.ok;
        expect(svc.test()).to.equal(123);
    });

    it('should load dummy service in subdirectory.', function() {
        // arrange
        var di = th.reloadDi();
        expect(di).to.be.ok;
        expect(di.has('dummy-foo')).to.be.false;

        // act
        expect(mf.has('./sub/dummy-foo')).to.be.false;
        di.bind('dummy-foo').file('./sub/dummy-foo').load();
        expect(mf.has('./sub/dummy-foo')).to.be.true;

        // assert
        expect(di.has('dummy-foo')).to.be.true;
        var svc = di('dummy-foo').service;
        expect(svc).to.be.ok;
        expect(svc.foo()).to.equal('bar');
    });

    it('should load dummy service in subdirectory but with a different key.', function() {
        // arrange
        var di = th.reloadDi();
        expect(di).to.be.ok;
        expect(di.has('dummy-foo')).to.be.false;
        expect(di.has('x')).to.be.false;

        // act
        expect(mf.has('./sub/dummy-foo')).to.be.false;
        di.bind('x').file('./sub/dummy-foo').load();
        expect(mf.has('./sub/dummy-foo')).to.be.true;

        // assert
        expect(di.has('dummy-foo')).to.be.false;
        expect(di.has('x')).to.be.true;
        var svc = di('x').service;
        expect(svc).to.be.ok;
        expect(svc.foo()).to.equal('bar');
    });

    it('should throw when binding to no component.', function() {
        // arrange
        var di = th.reloadDi();
        expect(di).to.be.ok;
        expect(di.has('dummy-service')).to.be.false;

        // act
        var badFn = function() {
            di.bind('dummy-service').file();
        }

        // assert
        expect(badFn).to.throw(Error);
        expect(di.has('dummy-service')).to.be.false;
    });
});