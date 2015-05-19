var mf = require('module-fu');
mf.setResolver(require.resolve);

function clearTestModules() {
    // Clear test modules.
    var files = [
    	'./dummy-service', 
    	'./sub/dummy-foo', 
    	'./sub/dummy-bar', 
    	'./sub/deep/dummy-svc', 
    	'./sub/deep/dummy-data.json'
    	];
   	files.forEach(function(file) {
	   	mf.remove(file);
   	});
}
exports.clearTestModules = clearTestModules;

function reloadDiVanilla() {
	clearTestModules();
    return mf.reload('../index');
}
module.exports.reloadDiVanilla = reloadDiVanilla;

function reloadDi() {
    return reloadDiVanilla()
        .options({
            resolver: require.resolve, 
            basedir: __dirname
        });
}
module.exports.reloadDi = reloadDi;	

module.exports.moduleFu = mf;