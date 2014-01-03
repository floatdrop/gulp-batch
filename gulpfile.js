'use strict';

var gulp = require('gulp');
var mocha = require('gulp-mocha');

gulp.task('watch', function () {
    gulp.watch(['test/**', 'index.js'], function () {
        gulp.src(['test/*.js'])
            .pipe(mocha({ reporter: 'list' }))
            .on('error', function () {
                // Too Bad
            });
    });
});

gulp.task('default', function () {
    gulp.run('watch');
});
