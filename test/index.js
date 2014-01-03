/* global describe, it */
'use strict';

delete require.cache[require.resolve('..')];
var batch = require('..');
var assert = require('power-assert');

describe('glob-batch', function () {
    it('should batch sync calls to array', function (done) {
        var reciever = batch(function (events) {
            assert.equal(events.length, 2);
            done();
        });
        reciever('one');
        reciever('two');
    });

    it('should batch async calls to array', function (done) {
        var reciever = batch({ timeout: 200 }, function (events) {
            assert.equal(events.length, 2);
            done();
        });
        reciever('one');
        setTimeout(reciever.bind(null, 'two'), 100);
    });

    it('should flush, if we exceed timeout', function (done) {
        var flushes = 0;
        var reciever = batch({ timeout: 100 }, function (events) {
            assert.equal(events.length, 1);
            flushes += 1;
            if (flushes === 2) { done(); }
        });
        reciever('one');
        setTimeout(reciever.bind(null, 'two'), 200);
    });

    it('should flush, if we exceed limit', function (done) {
        var reciever = batch({ limit: 2 }, function (events) {
            if (events.length === 2) { done(); }
        });
        reciever('one');
        reciever('two');
        reciever('three');
    });

    it('should throw, if we provide invalid callback', function () {
        assert.throws(batch, Error);
        assert.throws(batch.bind(null, 'string'), Error);
    });
});