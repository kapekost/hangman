/*
 general helper array extending classes for Javascript
 compatibility and convenience (conforms to future releases)
 */
function compatibleArrays() {
    if (!Array.prototype.map) {
        Array.prototype.map = function (fun) {
            var len = this.length;
            if (typeof fun != "function")
                throw new TypeError();
            var res = new Array(len);
            var thisp = arguments[1];
            for (var i = 0; i < len; i++) {
                if (i in this)
                    res[i] = fun.call(thisp, this[i], i, this);
            }
            return res;
        };
    }
    if (!Array.prototype.includes) {
        Array.prototype.includes = function (searchElement /*, fromIndex*/) {
            'use strict';
            var O = Object(this);
            var len = parseInt(O.length) || 0;
            if (len === 0) {
                return false;
            }
            var n = parseInt(arguments[1]) || 0;
            var k;
            if (n >= 0) {
                k = n;
            } else {
                k = len + n;
                if (k < 0) {k = 0;}
            }
            var currentElement;
            while (k < len) {
                currentElement = O[k];
                if (searchElement === currentElement ||
                    (searchElement !== searchElement && currentElement !== currentElement)) { // NaN !== NaN
                    return true;
                }
                k++;
            }
            return false;
        };
    }
}
module.exports = compatibleArrays;
