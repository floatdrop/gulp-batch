'use strict';

var gulp = require('gulp');
var mocha = require('gulp-mocha');
var batch = require('./index.js');

function noop() {}

gulp.task('mocha', function () {
    gulp.src(['test/*.js'])
        .pipe(mocha({ reporter: 'list' }))
        .on('error', noop);
});

gulp.task('watch', function () {
    gulp.watch(['test/**', 'index.js'], batch(function () {
        gulp.run('mocha');
    }));
});

gulp.task('default', function () {
    gulp.run('mocha');
    gulp.run('watch');
});
