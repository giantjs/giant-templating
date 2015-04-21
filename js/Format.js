/*global dessert, troop, sntls, rubberband */
troop.postpone(rubberband, 'Format', function () {
    "use strict";

    var base = troop.Base,
        self = base.extend();

    /**
     * @name rubberband.Format.create
     * @function
     * @param {string} serializedFormat Handlebars - based serializedFormat string.
     * @returns {rubberband.Format}
     */

    /**
     * Format with handlebars parameters that may be replaced with string literals or other formats.
     * @class
     * @extends troop.Base
     */
    rubberband.Format = self
        .addConstants(/** @lends rubberband.Format */{
            /**
             * @type {RegExp}
             * @constant
             */
            RE_PLACEHOLDER_TESTER: /^{{.+?}}$/,

            /**
             * @type {RegExp}
             * @constant
             */
            RE_FORMAT_SPLITTER: /({{.+?}})/
        })
        .addPrivateMethods(/** @lends rubberband.Format# */{
            /**
             * @param {Array} resolvedParameters Array of strings and arrays.
             * @returns {string}
             * @private
             */
            _flattenResolvedParameters: function (resolvedParameters) {
                var result = "",
                    i, subTree;

                for (i = 0; i < resolvedParameters.length; i++) {
                    subTree = resolvedParameters[i];
                    if (subTree instanceof Array) {
                        result += this._flattenResolvedParameters(subTree);
                    } else {
                        result += subTree;
                    }
                }

                return result;
            }
        })
        .addMethods(/** @lends rubberband.Format# */{
            /**
             * @param {string} serializedFormat
             * @ignore
             */
            init: function (serializedFormat) {
                /**
                 * Original serializedFormat string.
                 * @type {string|rubberband.Stringifiable}
                 */
                this.serializedFormat = serializedFormat;
            },

            /**
             * Parses current string format value and returns an array of tokens
             * that make up the format's current value.
             * @returns {string|string[]}
             */
            getTokens: function () {
                var serializedFormat = this.serializedFormat,
                    serializedFormatString = typeof serializedFormat === 'string' ?
                        serializedFormat :
                        serializedFormat.toString(),
                    parsedFormat;

                if (this.RE_PLACEHOLDER_TESTER.test(serializedFormatString)) {
                    return serializedFormatString;
                } else {
                    parsedFormat = serializedFormatString.split(this.RE_FORMAT_SPLITTER);
                    return parsedFormat.length > 1 ? parsedFormat : serializedFormatString;
                }
            },

            /**
             * Fills current serializedFormat with content using the specified replacements and returns the generated string.
             * @param {object} replacements Placeholder - string / Stringifiable associations.
             * @returns {string}
             * @example
             * 'May fortune {{do sg}}'.toFormat()
             *  .setContent({
             *      '{{do sg}}': "favor the {{what}}.",
             *      '{{what}}': "foolish"
             *  }) // "May fortune favor the foolish."
             */
            setContent: function (replacements) {
                var resolvedParameters = sntls.Collection
                    // merging current serializedFormat with replacement values as formats
                    .create({
                        '{{}}': this
                    })
                    .mergeWith(sntls.Collection.create(replacements)
                        // discarding value-less replacements
                        .filterBySelector(function (replacement) {
                            return typeof replacement !== 'undefined';
                        })
                        // converting each replacement to Format
                        .createWithEachItem(rubberband.Format))
                    .toFormatCollection()

                    // resolving serializedFormat parameters for main serializedFormat as well as replacements
                    .resolveParameters();

                return this._flattenResolvedParameters(resolvedParameters['{{}}']);
            }
        });
});

(function () {
    "use strict";

    dessert.addTypes(/** @lends dessert */{
        /** @param {rubberband.Format} expr */
        isFormat: function (expr) {
            return rubberband.Format.isBaseOf(expr);
        },

        /** @param {rubberband.Format} expr */
        isFormatOptional: function (expr) {
            return typeof expr === 'undefined' &&
                   rubberband.Format.isBaseOf(expr);
        }
    });

    troop.Properties.addProperties.call(
        String.prototype,
        /** @lends String# */{
            /**
             * Converts string to Format instance.
             * @returns {rubberband.Format}
             */
            toFormat: function () {
                return rubberband.Format.create(this.valueOf());
            }
        },
        false, false, false);
}());
