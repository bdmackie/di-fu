var mf = require('module-fu');
mf.setResolver(require.resolve);

function clearTestModules() {
    // Clear test modules.
    var files = [
    	'./dummy-service', 
    	'./sub/dummy-foo', 
    	'./sub/dummy-bar', 
    	'./sub/deep/dummy-svc', 
    	'./sub/deep/dummy-data.json',
        './circular/dummy-foo',
        './circular/dummy-bar',
        './circular/dummy-parent'
    	];
   	files.forEach(function(file) {
	   	mf.remove(file);
   	});
}
exports.clearTestModules = clearTestModules;

function deleteDi() {
    clearTestModules();
    return mf.remove('../index');
}
exports.deleteDi = deleteDi;

function reloadDiVanilla() {
	clearTestModules();
    return mf.reload('../index');
}
module.exports.reloadDiVanilla = reloadDiVanilla;

function reloadDi() {
    return reloadDiVanilla().configure();
}
module.exports.reloadDi = reloadDi;	

module.exports.moduleFu = mf;