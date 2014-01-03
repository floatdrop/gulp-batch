'use strict';

module.exports = function (opts, cb) {
    if (typeof opts === 'function') {
        cb = opts;
        opts = {};
    }

    if (typeof cb !== 'function') {
        throw new Error('Provided callback is not a function: ' + cb.toString());
    }

    opts.debounce = opts.debounce || 0;
    opts.timeout = opts.timeout || 200;

    var batch = [];

    function flush() {
        if (!batch.length) { return; }
        var _batch = batch;
        batch = [];
        process.nextTick(cb.bind(null, _batch));
    }

    var timeout;

    return function (event) {
        batch.push(event);
        if (timeout) { clearTimeout(timeout); }

        if (opts.limit && batch.length >= opts.limit) {
            flush();
            return;
        }

        timeout = setTimeout(flush, opts.timeout);
    };
};
