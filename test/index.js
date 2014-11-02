/* global describe, it */
'use strict';

var batch = require('..');
var assert = require('stream-assert');
require('should');

var defaultTimeout = 10;

var opts = {
    timeout: defaultTimeout
};

describe('gulp-batch', function () {

    it('should throw, if we provide invalid callback', function () {
        batch.should.throw(/Provided callback is not a function/);
        (function () { batch('string'); }).should.throw(/Provided callback is not a function/);
    });

    it('should batch sync calls to stream', function (done) {
        var receiver = batch(opts, function (events) {
            events.pipe(assert.length(2))
                .pipe(assert.end(done));
        });
        receiver('one');
        receiver('two');
    });

    it('should batch async calls to stream', function (done) {
        var receiver = batch(opts, function (events) {
            events.pipe(assert.length(2))
                .pipe(assert.end(done));
        });
        receiver('one');
        setTimeout(receiver, 5, 'two');
    });

    it('should flush, if we exceed timeout', function (done) {
        var i = 0;
        var receiver = batch({ timeout: 5 }, function (events, cb) {
            events.pipe(assert.length(1))
                .on('assertion', done);
            if (++i === 2) { done(); }
            cb();
        });

        receiver('one');
        setTimeout(receiver, defaultTimeout + 10, 'two');
    });

    it('should flush, if we exceed limit', function (done) {
        var i = 0;
        var receiver = batch({ limit: 1 }, function (events) {
            events.pipe(assert.length(1))
                .on('assertion', done);
            if (++i === 2) { done(); }
        });

        receiver('one');
        receiver('two');
    });

    it('should hold events, while current batch is processing', function (done) {
        var i = 0;
        var receiver = batch({ timeout: 5 }, function (events, cb) {
            setTimeout(cb, defaultTimeout * 2);
            if (++i === 2) { done(); }
        });

        receiver('one');
        setTimeout(receiver, defaultTimeout, 'two');
    });

    it('should pass throwen error to errorHandler', function (done) {
        var receiver = batch(opts, function (cb) {
            throw new Error('Bang!');
        }, function (err) {
            err.message.should.eql('Bang!');
            done();
        });

        receiver('one');
    });

    it('should pass cb error to errorHandler', function (done) {
        var receiver = batch(function (events, cb) {
            cb(new Error('Bang!'));
        }, function (err) {
            err.message.should.eql('Bang!');
            done();
        });

        receiver('one');
    });
});
