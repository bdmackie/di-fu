var chai = require('chai');
chai.config.includeStack = true;
var expect = chai.expect;
var th = require('./testing-helper');
var mf = th.moduleFu;

describe('bind-path-load', function() {
    it('should load from subdirectory.', function() {
        // arrange
        var di = th.reloadDi();
        expect(di).to.be.ok;
        expect(di.has('dummy-service')).to.be.false;
        expect(mf.has('./dummy-service')).to.be.false;

        // act + assert
        di.bind().path('./sub/*.js').load();
        expect(di.has('dummy-foo')).to.be.true;
        expect(mf.has('./sub/dummy-foo')).to.be.true;
        expect(di.has('dummy-bar')).to.be.true;
        expect(mf.has('./sub/dummy-bar')).to.be.true;
        expect(di.has('dummy-service')).to.be.false;
        expect(di.has('dummy-data')).to.be.false;

        // act + assert
        var svc = di.get('dummy-foo').service;
        expect(mf.has('./sub/dummy-foo')).to.be.true;        
        expect(svc).to.be.ok;
        expect(svc.foo()).to.equal('bar');

        var Bar = di.get('dummy-bar').Bar;
        var b = new Bar();
        expect(b.add(1, 2)).to.equal(3);
    });

    it('should load files with a recursive pattern.', function() {
        // arrange
        var di = th.reloadDi();
        expect(di).to.be.ok;
        expect(di.has('dummy-foo')).to.be.false;
        expect(di.has('dummy-bar')).to.be.false;
        expect(di.has('dummy-svc')).to.be.false;

        // act + assert
        di.bind().path('./sub/**/dummy-*').load();
        expect(di.has('dummy-foo')).to.be.true;
        expect(mf.has('./sub/dummy-foo')).to.be.true;
        expect(di.has('dummy-bar')).to.be.true;
        expect(mf.has('./sub/dummy-bar')).to.be.true;
        expect(di.has('dummy-svc')).to.be.true;
        expect(mf.has('./sub/deep/dummy-svc')).to.be.true;
        expect(di.has('dummy-data')).to.be.true;
        expect(mf.has('./sub/deep/dummy-data')).to.be.true;

        // act + assert
        var svc = di.get('dummy-foo').service;
        expect(mf.has('./sub/dummy-foo')).to.be.true;        
        expect(svc).to.be.ok;
        expect(svc.foo()).to.equal('bar');

        var Bar = di.get('dummy-bar').Bar;
        var b = new Bar();
        expect(b.add(1, 2)).to.equal(3);

        svc = di.get('dummy-svc').service;
        expect(mf.has('./sub/deep/dummy-svc')).to.be.true;        
        expect(svc).to.be.ok;
        expect(svc.test()).to.equal(123);

        var data = di.get('dummy-data');
        expect(mf.has('./sub/deep/dummy-data')).to.be.true;
        expect(data).to.be.ok;
        expect(data['hello']).to.equal('world');
    });

    it('should load files with a pattern and an ignore pattern.', function() {
        // arrange
        var di = th.reloadDi();
        expect(di).to.be.ok;
        expect(di.has('dummy-foo')).to.be.false;
        expect(di.has('dummy-bar')).to.be.false;
        expect(di.has('dummy-svc')).to.be.false;

        // act + assert
        di.bind().path('./sub/**/dummy-*', {ignore: './**/*foo*'}).load();
        expect(di.has('dummy-foo')).to.be.false;
        expect(mf.has('./sub/dummy-foo')).to.be.false;
        expect(di.has('dummy-bar')).to.be.true;
        expect(mf.has('./sub/dummy-bar')).to.be.true;
        expect(di.has('dummy-svc')).to.be.true;
        expect(mf.has('./sub/deep/dummy-svc')).to.be.true;
        expect(di.has('dummy-data')).to.be.true;
        expect(mf.has('./sub/deep/dummy-data')).to.be.true;

        // act + assert
        var Bar = di.get('dummy-bar').Bar;
        var b = new Bar();
        expect(b.add(1, 2)).to.equal(3);

        var svc = di.get('dummy-svc').service;
        expect(mf.has('./sub/deep/dummy-svc')).to.be.true;        
        expect(svc).to.be.ok;
        expect(svc.test()).to.equal(123);

    });

    it('should load files with a pattern and an ignore extension pattern.', function() {
        // arrange
        var di = th.reloadDi();
        expect(di).to.be.ok;
        expect(di.has('dummy-foo')).to.be.false;
        expect(di.has('dummy-bar')).to.be.false;
        expect(di.has('dummy-svc')).to.be.false;

        // act + assert
        di.bind().path('./sub/**/dummy-*', {ignore: './**/*.json'}).load();
        expect(di.has('dummy-foo')).to.be.true;
        expect(mf.has('./sub/dummy-foo')).to.be.true;
        expect(di.has('dummy-bar')).to.be.true;
        expect(mf.has('./sub/dummy-bar')).to.be.true;
        expect(di.has('dummy-svc')).to.be.true;
        expect(mf.has('./sub/deep/dummy-svc')).to.be.true;
        expect(di.has('dummy-data')).to.be.false;
        expect(mf.has('./sub/deep/dummy-data')).to.be.false;

        // act + assert
        var Bar = di.get('dummy-bar').Bar;
        var b = new Bar();
        expect(b.add(1, 2)).to.equal(3);

        var svc = di.get('dummy-svc').service;
        expect(mf.has('./sub/deep/dummy-svc')).to.be.true;        
        expect(svc).to.be.ok;
        expect(svc.test()).to.equal(123);

    });

    it('should load files with a pattern and namespace.', function() {
        // arrange
        var di = th.reloadDi();
        expect(di).to.be.ok;
        expect(di.has('dummy-foo')).to.be.false;
        expect(di.has('dummy-bar')).to.be.false;
        expect(di.has('dummy-svc')).to.be.false;

        // act + assert
        di.bind('sub:*').path('./sub/*.js').load();
        expect(di.has('sub:dummy-foo')).to.be.true;
        expect(di.has('dummy-foo')).to.be.false;
        expect(mf.has('./sub/dummy-foo')).to.be.true;
        expect(di.has('sub:dummy-bar')).to.be.true;
        expect(di.has('dummy-bar')).to.be.false;
        expect(mf.has('./sub/dummy-bar')).to.be.true;

        // act + assert
        var svc = di.get('sub:dummy-foo').service;
        expect(mf.has('./sub/dummy-foo')).to.be.true;        
        expect(svc).to.be.ok;
        expect(svc.foo()).to.equal('bar');

        var Bar = di.get('sub:dummy-bar').Bar;
        var b = new Bar();
        expect(b.add(1, 2)).to.equal(3);
    });
});