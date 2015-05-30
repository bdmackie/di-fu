var chai = require('chai');
chai.config.includeStack = true;
var expect = chai.expect;
var th = require('./testing-helper');
var mf = th.moduleFu;

describe('require', function() {
    it('should require module with no bindings.', function() {
        // arrange
        var di = th.reloadDi();
        expect(di).to.be.ok;
        expect(di.has('dummy-service')).to.be.false;
        expect(di.has('./dummy-service')).to.be.false;
        expect(mf.has('./dummy-service')).to.be.false;

        // act + assert
        var svc = di.require('./dummy-service').service;
        expect(di.has('dummy-service')).to.be.false;
        expect(di.has('./dummy-service')).to.be.false;
        expect(mf.has('./dummy-service')).to.be.true;
        expect(svc).to.be.ok;
        expect(svc.test()).to.equal(123);
    });

    it('should require module with no bindings.', function() {
        // arrange
        var di = th.reloadDi();
        expect(di).to.be.ok;
        expect(di.has('dummy-service')).to.be.false;
        expect(di.has('./dummy-service')).to.be.false;
        expect(mf.has('./dummy-service')).to.be.false;

        // act + assert
        di.bind('./dummy-service').to({
            service : {
                test : function() { return 456; }
            }
        });
        expect(di.has('dummy-service')).to.be.false;
        expect(di.has('./dummy-service')).to.be.true;
        expect(mf.has('./dummy-service')).to.be.false;

        // act + assert
        var svc = di.require('./dummy-service').service;
        expect(di.has('dummy-service')).to.be.false;
        expect(di.has('./dummy-service')).to.be.true;
        expect(mf.has('./dummy-service')).to.be.false;
        expect(svc).to.be.ok;
        expect(svc.test()).to.equal(456);
    });
});