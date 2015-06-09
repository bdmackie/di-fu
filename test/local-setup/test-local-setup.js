var chai = require('chai');
chai.config.includeStack = true;
var expect = chai.expect;
var th = require('../testing-helper');
var mf = th.moduleFu;

describe('local-setup', function() {
    it('should have stable resolution when retrieving container mid-config.', function() {
        th.deleteDi();

        var di = require('../../index')();

        // assert
        expect(di).to.be.ok;
        expect(di.has('hello')).to.be.true; // from root.
        expect(di.has('log')).to.be.true;
        //expect(mf.has('./dummy-log')).to.be.true;
        expect(di.has('foo')).to.be.true;
        //expect(mf.has('./sub/dummy-foo')).to.be.true;
        expect(di.has('bar')).to.be.true;
        //expect(mf.has('./dummy-bar')).to.be.false;

        var Bar = di('bar').Bar;
        var b = new Bar();
        expect(b.add(1, 2)).to.equal(3);       
    });
});