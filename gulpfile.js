const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const csso = require('gulp-csso');
const autoprefixer = require('gulp-autoprefixer');
const gcmq = require('gulp-group-css-media-queries');
const fileinclude = require('gulp-file-include');
const ttf2woff2 = require('gulp-ttf2woff2');
const imagemin = require('gulp-imagemin')
const webpack = require('webpack-stream')
const sync = require('browser-sync').create()

let webConfig = {
    output: {
        filename: 'main.js'
    },
    module: {
        rules: [{
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        "presets": ["@babel/preset-env"],
                        "plugins": [
                            ["@babel/transform-runtime"]
                        ]
                    }
                }
            },
            {
                test: /\.s[ac]ss$/i,
                use: [
                    "style-loader",
                    "css-loader",
                    "sass-loader",
                ],
            },
        ],

    },
    mode: 'production',
    devtool:  'none'
}

const server = () => {
    sync.init({
        server: {
            baseDir: 'dest'
        },
        notify: false,
    })
}

function buildStyles() {
    return gulp.src('src/sass/style.sass')
      .pipe(sass().on('error', sass.logError))
      .pipe(autoprefixer({
        cascade: false
        }))
      .pipe(gcmq())
      .pipe(csso())
      .pipe(gulp.dest('dest/css'));
};

function buildHtml(){
    gulp.src('src/*.html')
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(gulp.dest('dest'));
}

function fonts(){
    gulp.src('src/fonts/src/*.*')
    .pipe(ttf2woff2())
    .pipe(gulp.dest('src/fonts/dest'));
}

function expotrFonts(){
    gulp.src('src/fonts/dest/*.woff2')
    .pipe(gulp.dest('dest/fonts'));
}

function imag(){
    return gulp.src('src/images/src/**/*.*')
    .pipe(imagemin([
        imagemin.mozjpeg({
            quality: 75,
            progressive: true
        }),
    ])) 
    .pipe(gulp.dest('src/images/dest/images/'))
}

function exportImag(){
    gulp.src('src/images/dest/images/**/*.*')
    .pipe(gulp.dest('dest/images'))
}

function js(){
    gulp.src('src/js/main.js')
    .pipe(webpack(webConfig))
    .pipe(gulp.dest('dest/js'))
}

function watch(){
   gulp.watch(['src/**/*.sass', 'src/**/*.scss'], buildStyles)
   gulp.watch(['src/**/*.html' , 'src/*.html'], buildHtml)
   gulp.watch('src/images/dest/**/*.*', exportImag)
   gulp.watch('src/fonts/dest/*.woff2',  expotrFonts)
   gulp.watch('src/js/main.js', js)
}

exports.watch = gulp.parallel(buildStyles, buildHtml, exportImag, expotrFonts, js, server);
/*
exports.server = server
exports.js = js
exports.exportImag = exportImag
exports.imag = imag
exports.css = buildStyles
exports.html = buildHtml
exports.fonts = fonts
exports.expotrFonts = expotrFonts
*/