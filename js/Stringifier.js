/*global giant, giant, giant, giant */
giant.postpone(giant, 'Stringifier', function () {
    "use strict";

    var base = giant.Base,
        self = base.extend();

    /**
     * Serializes variables. Returns strings unchanged, converts numbers and booleans to string,
     * calls .toString() on Objects, returns empty string for undefined, null, and functions.
     * @class
     * @extends giant.Base
     */
    giant.Stringifier = self
        .addMethods(/** @lends giant.Stringifier# */{
            /**
             * @param {*} [stringifiable]
             * @returns {string}
             */
            stringify: function (stringifiable) {
                switch (typeof stringifiable) {
                case 'string':
                    return stringifiable;
                case 'object':
                    if (stringifiable instanceof Object) {
                        return stringifiable.toString();
                    } else {
                        return '';
                    }
                    break;
                case 'boolean':
                case 'number':
                    return String(stringifiable);
                default:
                case 'function':
                case 'undefined':
                    return '';
                }
            }
        });
});
