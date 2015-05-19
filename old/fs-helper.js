var VError = require('verror');
var _path = require('path');
var _fs = require('fs');

module.exports.visitFiles = function(options, fileCallback, matches) {
    if (typeof options === 'string') {
        options = {
            dirname: options,
            filter: /(.+)\.js(on)?$/,
            excludeDirs: /^\.(git|svn)$/,
            recurse: false
        };
    }

    var files = _fs.readdirSync(options.dirname);

    if (!matches)
        matches = [];

    function excludeDirectory(dirname) {
        return options.excludeDirs && dirname.match(options.excludeDirs);
    }

    files.forEach(function(file) {
        var filepath = options.dirname + '/' + file;
        if (!_fs.statSync(filepath).isDirectory()) {
            var match = file.match(options.filter);
            if (!match) return;

            if (fileCallback)
                fileCallback(filepath);
            matches.push(filepath);
        } else {
            if (!options.recurse || excludeDirectory(file)) return;

            walkDir({
                    dirname: filepath,
                    filter: options.filter,
                    excludeDirs: options.excludeDirs
                },
                fileCallback,
                matches
            );
        }
    });

    return matches;
}