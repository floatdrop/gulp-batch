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
        var reciever = batch(function (events) {
            assert.equal(events.length, 2);
            done();
        });
        reciever('one');
        setTimeout(reciever.bind(null, 'two'), 100);
    });
});