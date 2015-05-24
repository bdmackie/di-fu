var gulp = require('gulp');
var builder = require('build-fu').Builder;
var mocha = require('gulp-mocha');
var Promise = require('bluebird');
var git = require('gulp-git');
var bump = require('gulp-bump');
var runSequence = require('run-sequence');
var fs = require('fs');

gulp.task('default', function() {
  // place code for your default task here
  console.log('hello world');
});

// Clean them generated files.
gulp.task('clean', function () {
});

// Test
gulp.task('test', [], function () {
    console.log('start test');
    //gulp.src('test/lib/**/test*.js', {read: false})
    //    .pipe(mocha({reporter: 'spec', recursive: true}));
    gulp.src('test/**/test*.js', {read: false})
        .pipe(mocha({reporter: 'spec', recursive: true}));
});

// Test
gulp.task('test2', [], function () {
    console.log('start test');
    //gulp.src('test/lib/**/test*.js', {read: false})
    //    .pipe(mocha({reporter: 'spec', recursive: true}));
    gulp.src('test/**/test-difile.js', {read: false})
        .pipe(mocha({reporter: 'spec', recursive: true}));
});

gulp.task('commit-version', function () {
    var m = options.m ? options.m : 'bumped version';
    return gulp.src('.')
        .pipe(git.commit(m, {args: '-a'}));
});

gulp.task('bump', function(){
    return gulp.src('./package.json')
        .pipe(bump())
        .pipe(gulp.dest('./'));
});

gulp.task('push', function (cb) {
    git.push('origin', 'master', cb);
});

gulp.task('bump-push', function (cb) {
  runSequence(
    'bump',
    'commit-version',
    'push',
    function (error) {
      if (error) {
        console.log(error.message);
      } else {
        console.log('BUMP FINISHED SUCCESSFULLY');
      }
      cb(error);
    });
});

gulp.task('tag', function (cb) {
  var version = getPackageJsonVersion();
  git.tag(version, 'Created Tag for version: ' + version, function (error) {
    if (error) {
      return cb(error);
    }
    git.push('origin', 'master', {args: '--tags'}, cb);
  });

  function getPackageJsonVersion () {
    //We parse the json file instead of using require because require caches multiple calls so the version number won't be updated
    return JSON.parse(fs.readFileSync('./package.json', 'utf8')).version;
  };
});
