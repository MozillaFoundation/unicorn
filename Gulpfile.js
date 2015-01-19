var gulp = require('gulp');
var concat = require('gulp-concat');
var browserify = require('browserify');
var transform = require('vinyl-transform');
var reactify = require('reactify');
var source = require('vinyl-source-stream');
var less = require('gulp-less');
var plumber = require('gulp-plumber');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');


// Don't process react. We'll link to its CDN minified version.
// The reasoning here is that we're not offering one app, we're
// offering lots of apps, and bundling react with each app is
// both bloat, and an uncachable resource. Both are bad.
var donottouch = require('browserify-global-shim').configure({
  'react': 'React'
});


/**
 * Browserify bundling of gallery app.
 */
gulp.task('bundle-gallery', function() {
  return browserify('./react code/gallery-app.jsx')
    .transform(reactify)
    .transform(donottouch)
    .bundle()
    .pipe(source('gallery-app.js'))
    .pipe(gulp.dest('./build/react'));
});


/**
 * Minify gallery app
 */
gulp.task('minify-gallery', ['bundle-gallery'], function() {
  return gulp.src('./build/react/gallery-app.js')
    .pipe(uglify())
    .pipe(gulp.dest('./apps/public/gallery/javascript'));
});


/**
 * Browserify bundling of editor app.
 */
gulp.task('bundle-editor', function() {
  return browserify('./react code/editor-app.jsx')
    .transform(reactify)
    .transform(donottouch)
    .bundle()
    .pipe(source('editor-app.js'))
    .pipe(gulp.dest('./build/react'));
});


/**
 * Minify editor app
 */
gulp.task('minify-editor', ['bundle-editor'], function() {
  return gulp.src('./build/react/editor-app.js')
    .pipe(uglify())
    .pipe(gulp.dest('./apps/public/editor/javascript'));
});


/**
 * LESS compilation is independent of any other task
 */
gulp.task('less', function() {
  return gulp.src('./less/*.less')
      .pipe(plumber())
      .pipe(sourcemaps.init())
      .pipe(less())
      .pipe(sourcemaps.write())
      .pipe(gulp.dest('./apps/public/editor/stylesheets'))
      .pipe(gulp.dest('./apps/public/gallery/stylesheets'));
});


/**
 * Javascript and JSX linting
 */
gulp.task('lint', function() {
  // set up jshint to make use of jshint-jsx, as we're mixing
  // plain javascript with React's JSX.
  var jshint = require('gulp-jshint');
  var jsxhinter = require('jshint-jsx');
  jsxhinter.JSHINT = jsxhinter.JSXHINT;

  return gulp.src([
      './lib/**/*.js',
      './react code/**/*.js*'
     ])
    .pipe(jshint({ linter: 'jshint-jsx' }))
    .pipe(jshint.reporter('default'));
});


/**
 * our "default" task runs everything, but -crucially- it
 * runs the subtasks in order. That means we'll wait for
 * files to be written before we move on to the next task,
 * because in this case we can't run parallel tasks.
 */
gulp.task('default', ['lint', 'less', 'minify-gallery', 'minify-editor'], function() {
  console.log("Finishing packing up.");
});
