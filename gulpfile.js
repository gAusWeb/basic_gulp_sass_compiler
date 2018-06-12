const gulp          = require('gulp');
const browserSync   = require('browser-sync').create();
const sass          = require('gulp-sass');
const uglify        = require('gulp-uglify');
const imageMin      = require('gulp-imagemin');
const sourcemaps    = require('gulp-sourcemaps');
const concat        = require('gulp-concat');
const del           = require('del');
// const merge         = require('merge-stream');
const color         = require('gulp-color');
const concatCss     = require('gulp-concat-css');
const size          = require('gulp-size');
const cleancss      = require('gulp-clean-css');
const rename        = require('gulp-rename');
const cache         = require('gulp-cache');
const order         = require("gulp-order");
let paths           = require('./gulp-config/paths.json')
let baseStyles      = require('./gulp-config/baseStyles.json')
let siteStyles      = require('./gulp-config/sites.json')

let siteName        = siteStyles.name


// prepare SASS / JS files
// -------------------------------------------------------------------------------------------------

// Compile Sass & Inject Into Browser
gulp.task('sass', () => {
    console.log(color('>>> COMPILING SASS', 'GREEN'));
    return gulp.src(['app/src/scss/*.sass'])
        .pipe(sass())
        .pipe(gulp.dest('app/src/assets/css'))
        .pipe(browserSync.stream());
});

gulp.task('concatCss', ['sass'], function() {
    console.log(color('>>> CONCATENATING CSS', 'GREEN'));
    return gulp.src('app/src/assets/css/*.css')
        .pipe(order([
            'grid.css',
            'main.css'
        ]))
        .pipe(concat(siteName + ".css"))
        .pipe(cleancss())
        .pipe(rename( siteName + ".min.css" ))
        .pipe(gulp.dest('app/src/assets/css/minified'))
        .pipe(size({showFiles: true, title: 'stylesheets (minified)', gzip:false}));
})

// Concat, then Minify JS files and copy them to dist folder
gulp.task('concatJs', function() {
    console.log(color('>>> CONCATENATING Javascript files', 'GREEN'));
    return gulp.src('app/src/assets/js/*.js')
        .pipe(order([
            '*.min.js',
            '*.js'
        ]))
        .pipe(concat(siteName + ".js"))
        .pipe(cache(uglify({
            mangle: false,
            compress: true
        })))
        .pipe(rename( siteName + ".min.js" ))
        .pipe(size({showFiles: true, title: 'javascripts', gzip:false}))
        .pipe(gulp.dest('app/src/assets/js/minified/'))
})

// Watch Sass & Serve
gulp.task('serve', ['concatCss', 'concatJs'], () => {
    browserSync.init({
        server: './app/src'
    })
    gulp.watch(['app/src/scss/**/*'], ['concatCss']).on('change', browserSync.reload)
    gulp.watch(['app/src/assets/js/**/*.js'], ['concatJs']).on('change', browserSync.reload)
    gulp.watch(['app/src/*.html']).on('change', () => {
      return gulp.src(['app/src/*.html'])
          .pipe(gulp.dest('app/dist'))
          .pipe(browserSync.stream());
    });
});

// Default Task
gulp.task('default', ['serve','help']);




// build dist folders
// -------------------------------------------------------------------------------------------------

// Copy HTML to dist folder
gulp.task('copyHtml', () => {
    return gulp.src(['app/src/*.html'])
        .pipe(gulp.dest('app/dist'));
});
// Copy Css to dist folder
gulp.task('copyCss', () => {
    return gulp.src(['app/src/assets/css/minified/*.min.css'])
        .pipe(gulp.dest('app/dist/assets/css/minified/'));
});

// Copy minified JS files to dist folder
gulp.task('copyJs', () => {
    return gulp.src(['app/src/assets/js/minified/*.js'])
        .pipe(gulp.dest('app/dist/assets/js/minified/'));
});
// ImageMin
gulp.task('imageMin', () => {
    return gulp.src(['app/src/assets/img/*'])
        .pipe(imageMin())
        .pipe(gulp.dest('app/dist/assets/img'));
});




// build dist folders
// -------------------------------------------------------------------------------------------------

gulp.task('build', ['sass', 'concatCss', 'concatJs', 'imageMin', 'copyJs', "copyCss", 'copyHtml']);

// Clean the build folder
gulp.task('clean', () => {
  console.log('-> Cleaning dist folder')
  del([
    'app/dist'
  ]);
});




// build dist folders
// -------------------------------------------------------------------------------------------------

// Help Task
gulp.task('help', () => {
  console.log('');
  console.log('===== Help for Gav\'s SASS, auto-reload, server kit =====');
  console.log('');
  console.log('Usage: gulp [command]');
  console.log('The commands are the following');
  console.log('-------------------------------------------------------');
  console.log('        npm install: Install all Node Modules required');
  console.log('');
  console.log('        npm start: Start the server, compile and watch all files, reload app on-save');
  console.log('');
  console.log('        npm clean: Delete the production folder (dist) and all its contents');
  console.log('');
  console.log('        npm build: Compile, compress & copy all production-ready files & images to the production folder, \'app/dist\'');
  console.log('');
  console.log('        help: Print this message');
  console.log('');
});