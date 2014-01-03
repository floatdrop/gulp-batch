'use strict';

module.exports = function (opts, cb) {
    if (typeof opts === 'function') {
        cb = opts;
        opts = {};
    }

    opts.debounce = opts.debounce || 0;

    return function (event) {
        cb(event);
    };
};