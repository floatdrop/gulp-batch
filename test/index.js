/* global describe, it */
'use strict';

delete require.cache[require.resolve('..')];
var batch = require('..');
var assert = require('power-assert');
var async = require('async');

describe('glob-batch', function () {
    it('should support domains `on(\'error\', ...)` without callback', function (done) {
        var domain = require('domain').create();
        domain.on('error', function (err) {
            done();
        });
        var receiver = domain.bind(batch({ timeout: 10 }, function () {
            throw new Error('Bang!');
        }));
        receiver('one');
    });

    it('should support domains `on(\'error\', ...)` with callback', function (done) {
        var domain = require('domain').create();
        domain.on('error', function (err) {
            done();
        });
        var receiver = domain.bind(batch({ timeout: 10 }, function (events, async) {
            async(new Error('Bang!'));
        }));
        receiver('one');
    });

    it('should support domains `on(\'error\', ...)` with callback, but with throw', function (done) {
        var domain = require('domain').create();
        domain.on('error', function (err) {
            done();
        });
        var receiver = domain.bind(batch({ timeout: 10 }, function (events, async) {
            throw new Error('Bang!');
        }));
        receiver('one');
    });

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
                receiver('two');
                setTimeout(function () {
                    cb();
                    receiver('three');
                }, 15);
            },
            function (events) {
                assert.equal(events.length, 2);
                done();
            }
        ]);
        var receiver = batch({ timeout: 10 }, function (events, cb) {
            iterator = iterator(events, cb);
        });
        receiver('one');
    });

    it('should support debounce option', function (done) {
        var iterator = async.iterator([
            function (events, cb) {
                receiver('two');
                setTimeout(function () {
                    cb();
                    setTimeout(receiver.bind(null, 'three'), 15);
                }, 15);
            },
            function (events) {
                assert.equal(events.length, 2);
                done();
            }
        ]);
        var receiver = batch({ timeout: 10, debounce: 10 }, function (events, cb) {
            iterator = iterator(events, cb);
        });
        receiver('one');
    });

    it('should throw, if we provide invalid callback', function () {
        assert.throws(batch, /Provided callback is not a function/);
        assert.throws(batch.bind(null, 'string'), /Provided callback is not a function/);
    });
});
