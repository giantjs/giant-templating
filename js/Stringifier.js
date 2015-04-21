/*global dessert, troop, sntls, rubberband */
troop.postpone(rubberband, 'Stringifier', function () {
    "use strict";

    var base = troop.Base,
        self = base.extend();

    /**
     * @class
     * @extends troop.Base
     */
    rubberband.Stringifier = self
        .addMethods(/** @lends rubberband.Stringifier# */{
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
                default:
                case 'undefined':
                    return '';
                }
            }
        });
});
