const {
  src,
  dest,
  watch,
  parallel,
  series
} = require('gulp');

const scss = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const del = require('del');
const browserSync = require('browser-sync').create();
const gulpStylelint = require('gulp-stylelint');
const svgSprite = require('gulp-svg-sprite');
const fileinclude = require('gulp-file-include');

function browsersync() {
  browserSync.init({
    server: {
      baseDir: 'app/'
    }
  })
}

function styles() {
  return src([
    'app/scss/style.scss'
  ])
    .pipe(scss({
      outputStyle: 'compressed'
    }))
    .pipe(concat('style.min.css'))
    .pipe(autoprefixer({
      overrideBrowserslist: ['last 10 versions'],
      grid: true
    }))
    .pipe(dest('app/css'))
    .pipe(browserSync.stream())
}


function scripts() {
  return src([
    'node_modules/jquery/dist/jquery.js',
    'node_modules/slick-carousel/slick/slick.min.js',
    'node_modules/mixitup/dist/mixitup.min.js',
    'app/js/main.js'])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('app/js'))
    .pipe(browserSync.stream())
}

function images() {
  return src(['app/images/**/*.*', !'app/images/icons/**.*'])
    .pipe(imagemin([
      imagemin.gifsicle({
        interlaced: true
      }),
      imagemin.mozjpeg({
        quality: 75,
        progressive: true
      }),
      imagemin.optipng({
        optimizationLevel: 5
      }),
      imagemin.svgo({
        plugins: [{
          removeViewBox: true
        },
        {
          cleanupIDs: false
        }
        ]
      })
    ]))
    .pipe(dest('dist/images'))
}

function lintCss() {
  return src('app/scss/*.scss')
    .pipe(gulpStylelint({
      reporters: [
        { formatter: 'string', console: true }
      ]
    }));
}


function spriteSvg() {
  return src('app/images/icons/*.svg')
    .pipe(svgSprite(
      {
        mode: {
          stack: {
            sprite: "../sprite.svg"
          }
        },
      }
    ))
    .pipe(dest('app/images'))
    .pipe(browserSync.stream())
}

function htmlInclude() {
  return src(['app/html/**/*.html'])
    .pipe(fileinclude({
      prefix: '@',
      basepath: '@file'
    }))
    .pipe(dest('app/'))
    .pipe(browserSync.stream());
}

function build() {
  return src([
    'app/dist/*.html',
    'app/dist/css/style.min.css',
    'app/dist/js/main.min.js'
  ], {
    base: 'app'
  })
    .pipe(dest('dist'))
}

function cleanDist() {
  return del('dist')
}

function wacthing() {
  watch(['app/scss/**/*.scss'], styles);
  watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts);
  watch(['app/**/*.html']).on('change', browserSync.reload);
  watch(['app/html/**/*.html'], htmlInclude);
  watch(['app/images/icons/**/*.svg'], spriteSvg);
}


exports.styles = styles;
exports.scripts = scripts;
exports.browsersync = browsersync;
exports.wacthing = wacthing;
exports.images = images;
exports.cleanDist = cleanDist;
exports.lintCss = lintCss;
exports.spriteSvg = spriteSvg;
exports.htmlInclude = htmlInclude;
exports.build = series(cleanDist, images, build);

exports.default = parallel(styles, scripts, browsersync, wacthing, spriteSvg, htmlInclude);