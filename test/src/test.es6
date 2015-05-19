require('source-map-support').install();

var mf = require('module-fu');
var expect = require('chai').expect;
var VError = require('VError');

function reloadDic() {
    var dic = mf.reload('../../lib/di-fu', 'container');
    return dic;
}

function reloadDic2() {
    var dic = reloadDic();
    dic.setLoader(function(filePath) {
        return require(filePath);
    });
    return dic;
}

describe('di-fu', function() {
    it('should set and get a basic object component.', function() {
        // arrange
        let dic = reloadDic();
        
        expect(dic).to.be.ok;
        expect(dic.has('basic-object')).to.be.false;

        // act
        dic.set('basic-object', {
            test: 123
        });

        // assert
        expect(dic.has('basic-object')).to.be.true;
        let component = dic.get('basic-object');
        expect(component).to.be.ok;
        expect(component.test).to.equal(123);

        // act
        dic.delete('basic-object');

        // assert
        expect(dic.has('basic-object')).to.be.false;
        component = dic.get('basic-object');
        expect(component).to.be.undefined;
    });

    it('should throw when adding an already existing component.', function() {
        // arrange
        let dic = reloadDic();
        expect(dic).to.be.ok;
        expect(dic.has('basic-object')).to.be.false;

        // act
        dic.set('basic-object', {
            test: 123
        });

        // assert
        expect(dic.has('basic-object')).to.be.true;

        // act + assert
        let badFn = function() {
            dic.set('basic-object', {
                test: 345
            });
        };
        expect(badFn).to.throw(Error);
    });

    it('should load dummy service.', function() {
        // arrange
        let dic = reloadDic2();
        expect(dic).to.be.ok;
        expect(dic.has('dummy-service')).to.be.false;

        // act
        dic.load('dummy-service', './dummy-service');

        // assert
        expect(dic.has('dummy-service')).to.be.true;
        let svc = dic.get('dummy-service').service;
        expect(svc).to.be.ok;
        expect(svc.test()).to.equal(123);
    });

    it('should load dummy service with just a key.', function() {
        // arrange
        let dic = reloadDic2();
        expect(dic).to.be.ok;
        expect(dic.has('dummy-service')).to.be.false;

        // act
        dic.load('dummy-service');

        // assert
        expect(dic.has('dummy-service')).to.be.true;
        let svc = dic.get('dummy-service').service;
        expect(svc).to.be.ok;
        expect(svc.test()).to.equal(123);
    });

    it('should load dummy service in subdirectory.', function() {
        // arrange
        let dic = reloadDic2();
        expect(dic).to.be.ok;
        expect(dic.has('dummy-foo')).to.be.false;

        // act
        dic.load('dummy-foo', './extras/dummy-foo');

        // assert
        expect(dic.has('dummy-foo')).to.be.true;
        let svc = dic.get('dummy-foo').service;
        expect(svc).to.be.ok;
        expect(svc.foo()).to.equal('bar');
    });

    it('should load dummy service in subdirectory but with a different key.', function() {
        // arrange
        let dic = reloadDic2();
        expect(dic).to.be.ok;
        expect(dic.has('dummy-foo')).to.be.false;
        expect(dic.has('x')).to.be.false;

        // act
        dic.load('x', './extras/dummy-foo');

        // assert
        expect(dic.has('dummy-foo')).to.be.false;
        expect(dic.has('x')).to.be.true;
        let svc = dic.get('x').service;
        expect(svc).to.be.ok;
        expect(svc.foo()).to.equal('bar');
    });

    it('should load dummy service with namespace and in default location.', function() {
        // arrange
        let dic = reloadDic2();
        expect(dic).to.be.ok;
        expect(dic.has('dummy-foo')).to.be.false;

        // act
        dic.load('extras/dummy-foo');

        // assert
        expect(dic.has('dummy-foo')).to.be.true;
        let svc = dic.get('dummy-foo').service;
        expect(svc).to.be.ok;
        expect(svc.foo()).to.equal('bar');
    });

    it('should bind an object.', function() {
        // arrange
        let dic = reloadDic2();
        expect(dic).to.be.ok;
        expect(dic.has('foo')).to.be.false;

        // act
        dic.bind('foo').to({test:"bar"});

        // assert
        expect(dic.has('foo')).to.be.true;
        let svc = dic.get('foo');
        console.log(JSON.stringify(svc));
        expect(svc).to.exist;
        expect(svc.test).to.equal('bar');
    });
});

/*
        it('should register a module', function () {
            // arrange
            var di = reloadDi();
            expect(di.dic('dummy-module')).to.be.false;

            // act
            di.registerModule('./dummy-module.js');

            // assert
            expect(di.dic('dummy-module')).to.be.true;
            expect(di.resolve('dummy-module')).to.be.ok;
        });

        it('should register a working module', function () {
            // arrange
            var di = rerequireDi();
            expect(di.contains('dummy-module')).to.be.false;

            // act
            di.registerModule('./dummy-module.js');
            var m = di.resolve('dummy-module');

            // assert
            expect(di.contains('dummy-module')).to.be.true;
            expect(m.hello()).to.equal('hello world');
        });

        it('should register a module by key', function () {
            // arrange
            var di = rerequireDi();
            di.addSearchDir('.');

            // act
            di.registerModule('dummy-module');
            var m = di.resolve('dummy-module');

            // assert
            expect(di.contains('dummy-module')).to.be.true;
            expect(m.hello()).to.equal('hello world');
        });

        it('should auto-register a module by key', function () {
            // arrange
            var di = rerequireDi();
            di.addSearchDir('.');

            // act
            var m = di.resolve('dummy-module');

            // assert
            expect(di.contains('dummy-module')).to.be.true;
            expect(m.hello()).to.equal('hello world');
        });

        it('should register a module properly when it is just a function', function () {
            var di = rerequireDi();
            di.addSearchDir('.');
            di.registerModule('dummy-func-module');

            // assertions here
            expect(di.resolve('dummy-func-module')()).to.equal(99);
        });

        it('should register a module automatically when resolved from another', function () {
            unrequireDi();
            var m = require('./dummy-inc-module.js');

            // assertions here
            expect(m()).to.equal(99);
        });
    })

    describe('registerFunction()', function () {
        it('should correctly register a function', function () {
            var di = rerequireDi();
            di.registerFunction('x',function() { return 2; });

            // assertions here
            expect(di.resolve('x')).to.equal(2);
        });
    })
})
*/