'use strict';

module.exports = function (opts, cb) {
    if (typeof opts === 'function') {
        cb = opts;
        opts = {};
    }

    if (typeof cb !== 'function') {
        throw new Error('Provided callback is not a function: ' + cb);
    }

    opts.debounce = opts.debounce || 0;
    opts.timeout = opts.timeout || 200;

    var batch = [];
    var holdOn;
    var timeout;

    function brace() {
        if (!holdOn && batch.length) {
            timeout = setTimeout(flush, opts.timeout);
        }
    }

    function async() {
        if (opts.debounce) {
            setTimeout(function () {
                holdOn = false;
                brace();
            }, opts.debounce);
        } else {
            holdOn = false;
            brace();
        }
    }

    function flush() {
        if (!batch.length) { return; }
        var _batch = batch;
        batch = [];
        if (cb.length < 2) {
            process.nextTick(function () { cb(_batch); });
        } else {
            holdOn = true;
            process.nextTick(function () { cb(_batch, async); });
        }
    }

    return function (event) {
        batch.push(event);
        if (timeout) { clearTimeout(timeout); }

        if (opts.limit && batch.length >= opts.limit) {
            flush();
        } else {
            brace();
        }
    };
};
