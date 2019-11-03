const devBuild = ((process.env.NODE_ENV || 'development').trim().toLowerCase() === 'development')
const gulp = require('gulp');
const clean = require('gulp-clean');
const gls = require('gulp-live-server');
const noop = require('gulp-noop');
const terser = require('gulp-terser');
const stylus = require('gulp-stylus');
const livereload = require('gulp-livereload');
const sourcemaps = devBuild ? require('gulp-sourcemaps') : null;
const updateDotenv = require('update-dotenv');

const js = () => {
  return gulp.src('src/js/**/*.js')
    .pipe(sourcemaps ? sourcemaps.init() : noop())
    .pipe(terser())
    .pipe(sourcemaps ? sourcemaps.write('.') : noop())
    .pipe(gulp.dest('dist/js/'))
    .pipe(livereload());
};

const css = () => {
  return gulp.src('src/css/**/*.styl')
    .pipe(sourcemaps ? sourcemaps.init() : noop())
    .pipe(stylus({compress: true}))
    .pipe(sourcemaps ? sourcemaps.write('.') : noop())
    .pipe(gulp.dest('dist/css/'))
    .pipe(livereload());
};

const static = () => {
  return gulp.src('static/**/*')
    .pipe(gulp.dest('dist/'));
}

const dotenv = (done) => {
  updateDotenv({
    API_KEY: process.env.API_KEY,
  });
  done();
}

const serve = () => {
  livereload.listen();
  const server = gls('app.js', undefined, false);
  server.start();
}

const watch = (done) => {
  gulp.watch('src/css/**/*.styl', gulp.series(css));
  gulp.watch('src/js/**/*.js', gulp.series(js));
  done();
};

const distClean = (done) => {
  return gulp.src('dist/**/*', {read: false})
    .pipe(clean());
};

const dist = gulp.series(static, gulp.parallel(js, css));

const actions = {
  dist: gulp.series(distClean, dist, dotenv),
  serve: gulp.series(distClean, dist, dotenv, watch, serve),
}

module.exports = {
  default: actions.dist,
  dist: actions.dist,
  serve: actions.serve,
}