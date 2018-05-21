/* eslint-disable */
const fs             = require('fs'),
      path           = require('path'),
      gulp           = require('gulp'),
      log            = require('fancy-log'),
      pluginError    = require('plugin-error'),
      newer          = require('gulp-newer'),
      runSequence    = require('run-sequence'),
      sass           = require('gulp-sass'),
      autoprefixer   = require('gulp-autoprefixer'),
      cleanCSS       = require('gulp-clean-css'),
      replace        = require('gulp-replace'),
      eslint         = require('gulp-eslint'),
      concat         = require('gulp-concat'),
      browserSync    = require('browser-sync'),
      rename         = require('gulp-rename'),
      babel          = require('gulp-babel'),
      sourcemaps     = require('gulp-sourcemaps'),
      uglify         = require('gulp-uglify'),
      reload         = browserSync.reload;

const paths = {
          js: {
              all: "src/js/**/*",
              dist: "static/js",
              bootstrap: [
                "./src/js/bootstrap/util.js",
                "./src/js/bootstrap/alert.js",
                "./src/js/bootstrap/button.js",
                "./src/js/bootstrap/carousel.js",
                "./src/js/bootstrap/collapse.js",
                "./src/js/bootstrap/dropdown.js",
                "./src/js/bootstrap/modal.js",
                "./src/js/bootstrap/tooltip.js",
                "./src/js/bootstrap/popover.js",
                "./src/js/bootstrap/scrollspy.js",
                "./src/js/bootstrap/tab.js"
              ],
              mrare: "src/js/mrare/**/*.js",
          },
          scss: {
              all: 'src/scss/**/*',
              dist: "static/css",
              themeScss: ['src/scss/theme.scss', '!src/scss/user.scss', '!src/scss/user-variables.scss' ],
          },
          copyDependencies:[
            { 
              files: "jquery.min.js",
              from: "node_modules/jquery/dist",
              to: "static/js"
            },
            {
              files: "jquery.smartWizard.min.js",
              from: "node_modules/smartwizard/dist/js",
              to: "static/js"
            },
            {
              files: "flickity.pkgd.min.js",
              from: "node_modules/flickity/dist",
              to: "static/js"
            },
            {
              files: "flickity.min.css",
              from: "node_modules/flickity/dist",
              to: "static/css"
            },
            {
              files: "popper.min.js",
              from: "node_modules/popper.js/dist/umd",
              to: "static/js"
            },
            {
              files: "scrollMonitor.js",
              from: "node_modules/scrollmonitor",
              to: "static/js"
            },
            {
              files: "socicon.css",
              from: "node_modules/socicon/css",
              to: "static/css"
            },
            {
              files: "*.*",
              from: "node_modules/socicon/font",
              to: "static/fonts"
            },
            {
              files: "prism.js",
              from: "node_modules/prismjs",
              to: "static/js"
            },
            {
              files: "prism.css",
              from: "node_modules/prismjs",
              to: "src/scss/custom/components/plugins"
            },
            {
              files: "prism-okaidia.css",
              from: "node_modules/prismjs",
              to: "src/scss/custom/components/plugins"
            },{
              files: "smooth-scroll.polyfills.js",
              from: "node_modules/smooth-scroll/dist/js",
              to: "static/js"
            },
            {
              files: "zoom-vanilla.min.js",
              from: "node_modules/zoom-vanilla.js/dist",
              to: "static/js"
            },
            {
              files: "zoom.css",
              from: "node_modules/zoom-vanilla.js/dist",
              to: "src/scss/custom/components/plugins"
            },
          ]
      };

// DEFINE TASKS

gulp.task('default', function(cb){
  return runSequence( ['sass-min', 'bootstrapjs', 'mrarejs'], ['watch'], cb);
});

gulp.task('build', function(cb){
  return runSequence( ['sass-min', 'bootstrapjs', 'mrarejs'], cb);
});

gulp.task('sass-min', function(){
    return gulp.src(paths.scss.themeScss)
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(cleanCSS({compatibility: 'ie9'}))
        .pipe(autoprefixer())
        .pipe(rename({
          suffix: '.min'
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.scss.dist))
        .pipe(reload({ stream:true }));
});

gulp.task('bootstrapjs', function(){
    return gulp.src(paths.js.bootstrap)
        .pipe(concat('bootstrap.js'))
        .pipe(replace(/^(export|import).*/gm, ''))
        .pipe(babel({
            "compact" : false,
            "presets": [
              [
                "env", {
                  
                  "modules": false,
                  "loose": true
                }
              ]
            ],
            plugins: [
              process.env.PLUGINS && 'transform-es2015-modules-strip',
              '@babel/proposal-object-rest-spread'
            ].filter(Boolean)
          }
        ))
        // .pipe(gulp.dest(paths.js.dist))
        .pipe(uglify())
        .pipe(rename({
          suffix: '.min'
        }))
        .pipe(gulp.dest(paths.js.dist));
        // .pipe(reload({ stream:true }));
});

gulp.task('mrarejs', function(){
    return gulp.src(paths.js.mrare)
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError())
        .pipe(concat('theme.js'))
        .pipe(replace(/^(export|import).*/gm, ''))
        .pipe(babel({
            "compact" : false,
            "presets": [
              [
                "env",
                {
                  "modules": false,
                  "loose": true
                }
              ]
            ],
            "plugins": [
              "transform-es2015-modules-strip"
            ]
          }
        ))
        // .pipe(gulp.dest(paths.js.dist))
        .pipe(uglify())
        .pipe(rename({
          suffix: '.min'
        }))
        .pipe(gulp.dest(paths.js.dist));
        // .pipe(reload({ stream:true }));
});

gulp.task('deps', function(){
  paths.copyDependencies.forEach(function(files){
      gulp.src(`${files.from}/${files.files}`)
          .pipe(newer(files.to))
          .pipe(gulp.dest(files.to));
  });
});

gulp.task('watch', function() {

  // SCSS
  // Any .scss file change will trigger a sass rebuild
  gulp.watch([paths.scss.all], {cwd: './'}, ['sass']);

  // JS
  // Rebuild bootstrap js if files change
  gulp.watch([paths.js.bootstrap], {cwd: './'}, ['bootstrapjs']);

  // Rebuild mrare js if files change
  gulp.watch([paths.js.mrare], {cwd: './'}, ['mrarejs']);

});
