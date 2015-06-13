var chai = require('chai');
chai.config.includeStack = true;
var expect = chai.expect;
var th = require('./testing-helper');
var mf = th.moduleFu;
var _ = require('underscore');
var s = require('underscore.string');
var path = require('path');

describe('bind-path', function() {
    it('should load from subdirectory.', function() {
        // arrange
        var di = th.reloadDi();
        expect(di).to.be.ok;
        expect(di.has('dummy-service')).to.be.false;
        expect(mf.has('./dummy-service')).to.be.false;

        // act + assert
        di.bind().path('./sub/*.js');
        expect(di.has('dummy-foo')).to.be.true;
        expect(mf.has('./sub/dummy-foo')).to.be.false;
        expect(di.has('dummy-bar')).to.be.true;
        expect(mf.has('./sub/dummy-bar')).to.be.false;
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
        di.bind().path('./sub/**/dummy-*');
        expect(di.has('dummy-foo')).to.be.true;
        expect(mf.has('./sub/dummy-foo')).to.be.false;
        expect(di.has('dummy-bar')).to.be.true;
        expect(mf.has('./sub/dummy-bar')).to.be.false;
        expect(di.has('dummy-svc')).to.be.true;
        expect(mf.has('./sub/deep/dummy-svc')).to.be.false;
        expect(di.has('dummy-data')).to.be.true;
        expect(mf.has('./sub/deep/dummy-data')).to.be.false;

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
        di.bind().path('./sub/**/dummy-*', {ignore: './**/*foo*'});
        expect(di.has('dummy-foo')).to.be.false;
        expect(mf.has('./sub/dummy-foo')).to.be.false;
        expect(di.has('dummy-bar')).to.be.true;
        expect(mf.has('./sub/dummy-bar')).to.be.false;
        expect(di.has('dummy-svc')).to.be.true;
        expect(mf.has('./sub/deep/dummy-svc')).to.be.false;
        expect(di.has('dummy-data')).to.be.true;
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

    it('should load files with a pattern and an ignore extension pattern.', function() {
        // arrange
        var di = th.reloadDi();
        expect(di).to.be.ok;
        expect(di.has('dummy-foo')).to.be.false;
        expect(di.has('dummy-bar')).to.be.false;
        expect(di.has('dummy-svc')).to.be.false;

        // act + assert
        di.bind().path('./sub/**/dummy-*', {ignore: './**/*.json'});
        expect(di.has('dummy-foo')).to.be.true;
        expect(mf.has('./sub/dummy-foo')).to.be.false;
        expect(di.has('dummy-bar')).to.be.true;
        expect(mf.has('./sub/dummy-bar')).to.be.false;
        expect(di.has('dummy-svc')).to.be.true;
        expect(mf.has('./sub/deep/dummy-svc')).to.be.false;
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
        di.bind('sub:*').path('./sub/*.js');
        expect(di.has('sub:dummy-foo')).to.be.true;
        expect(di.has('dummy-foo')).to.be.false;
        expect(mf.has('./sub/dummy-foo')).to.be.false;
        expect(di.has('sub:dummy-bar')).to.be.true;
        expect(di.has('dummy-bar')).to.be.false;
        expect(mf.has('./sub/dummy-bar')).to.be.false;

        // act + assert
        var svc = di.get('sub:dummy-foo').service;
        expect(mf.has('./sub/dummy-foo')).to.be.true;        
        expect(svc).to.be.ok;
        expect(svc.foo()).to.equal('bar');

        var Bar = di.get('sub:dummy-bar').Bar;
        var b = new Bar();
        expect(b.add(1, 2)).to.equal(3);
    });

    it('should load files with a wildcard and namespace.', function() {
        // arrange
        var di = th.reloadDi();
        expect(di).to.be.ok;
        expect(di.has('dummy-foo')).to.be.false;
        expect(di.has('dummy-bar')).to.be.false;

        // act + assert
        function myWildcard(filename) {
            return s.capitalize(s.strRight(s.strLeftBack(path.basename(filename), '.'), '-'));
        }
        di.bind('model:*').path('./model/dummy-*.js', 
                null, 
                { wildcard: myWildcard, importer: '*Model' }
            );
        expect(di.has('model:Foo')).to.be.true;
        expect(di.has('model:Bar')).to.be.true;

        // act + assert
        var FooModel = di('model:Foo');
        expect(FooModel).to.be.ok;
        var foo = new FooModel();
        expect(foo).to.be.ok;
        expect(foo.foo()).to.equal('bar');
        var BarModel = di.get('model:Bar');
        var bar = new BarModel();
        expect(bar.add(1, 2)).to.equal(3);
    });
});