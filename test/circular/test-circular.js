var chai = require('chai');
chai.config.includeStack = true;
var expect = chai.expect;
var th = require('../testing-helper');
var mf = th.moduleFu;

describe('circular', function() {
    it('should detect circular dependencies', function() {
        th.deleteDi();

        var di = require('../../index').configure({resolver: require.resolve, basedir: __dirname});

        var svc;        
        var badFn = function() {
            svc = di.get('parent').service;
        };
        expect(badFn).to.throw(Error);
    });
});