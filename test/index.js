/* global describe, it */
'use strict';

delete require.cache[require.resolve('..')];
var batch = require('..');
var assert = require('power-assert');
var async = require('async');

describe('glob-batch', function () {
    it('should batch sync calls to array', function (done) {
        var receiver = batch({ timeout: 10 }, function (events) {
            assert.equal(events.length, 2);
            done();
        });
        receiver('one');
        receiver('two');
    });

    it('should batch async calls to array', function (done) {
        var receiver = batch({ timeout: 10 }, function (events) {
            assert.equal(events.length, 2);
            done();
        });
        receiver('one');
        setTimeout(receiver.bind(null, 'two'), 5);
    });

    it('should flush, if we exceed timeout', function (done) {
        var iterator = async.iterator([
            function (events) { assert.equal(events.length, 1); },
            function () { done(); }
        ]);

        var receiver = batch({ timeout: 5 }, function (events) {
            iterator = iterator(events);
        });

        receiver('one');
        setTimeout(receiver.bind(null, 'two'), 10);
    });

    it('should flush, if we exceed limit', function (done) {
        var iterator = async.iterator([
            function (events) { assert.equal(events.length, 2); },
            function (events) {
                assert.equal(events.length, 1);
                done();
            }
        ]);
        var receiver = batch({ timeout: 10, limit: 2 }, function (events) {
            iterator = iterator(events);
        });
        receiver('one');
        receiver('two');
        receiver('three');
    });

    it('should support done callback function', function (done) {
        var iterator = async.iterator([
            function (events, cb) {
                receiver('three');
                receiver('four');
                receiver('five');
                setTimeout(function () {
                    cb();
                    receiver('six');
                    receiver('seven');
                }, 15);
            },
            function (events) {
                assert.equal(events.length, 5);
                done();
            }
        ]);
        var receiver = batch({ timeout: 10 }, function (events, cb) {
            iterator = iterator(events, cb);
        });
        receiver('one');
        receiver('two');
    });

    it('should throw, if we provide invalid callback', function () {
        assert.throws(batch, /Provided callback is not a function/);
        assert.throws(batch.bind(null, 'string'), /Provided callback is not a function/);
    });
});