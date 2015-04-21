/*global dessert, troop, sntls, rubberband */
troop.postpone(rubberband, 'FormatCollection', function (/**rubberband*/widgets) {
    "use strict";

    /**
     * @name rubberband.Template.create
     * @function
     * @param {object|Template[]} [items]
     * @returns {rubberband.Template}
     */

    /**
     * Collection of Template instances. Allows aggregated token extraction and parameters resolution.
     * @class
     * @extends sntls.Collection
     * @extends rubberband.Template
     */
    rubberband.FormatCollection = sntls.Collection.of(widgets.Template)
        .addMethods(/** @lends rubberband.FormatCollection */{
            /**
             * Extracts unique tokens from all formats in the collection.
             * @returns {sntls.Collection}
             */
            extractUniqueTokens: function () {
                return this
                    // concatenating all parsedFormat of all formats in the collection
                    .callOnEachItem('getTokens')
                    .getValues()
                    .reduce(function (previous, current) {
                        return previous.concat(current);
                    }, [])

                    // extracting unique parsedFormat
                    .toStringDictionary()
                    .reverse()

                    // symmetrizing results (key = value)
                    .toCollection()
                    .mapValues(function (index, token) {
                        return token;
                    });
            },

            /**
             * Resolves templateString parameters. Returns an object in which each templateString parameter is associated with
             * an array-of-arrays structure holding corresponding string literals.
             * @returns {object}
             */
            resolveParameters: function () {
                var allTokens = this.extractUniqueTokens(),
                    tokensCollection = this
                        .mergeWith(allTokens
                            .callOnEachItem('toTemplate')
                            .toFormatCollection())
                        .getTokens();

                tokensCollection
                    // going through all format tokens and replacing parameter value in each
                    .forEachItem(function (/**string[]*/tokens) {
                        var i, token;
                        if (tokens instanceof Array) {
                            for (i = 0; i < tokens.length; i++) {
                                token = tokens[i];
                                tokens[i] = tokensCollection.getItem(token);
                            }
                        }
                    });

                return tokensCollection.items;
            }
        });
});

troop.amendPostponed(sntls, 'Hash', function () {
    "use strict";

    sntls.Hash.addMethods(/** @lends sntls.Hash */{
        /**
         * @returns {rubberband.FormatCollection}
         */
        toFormatCollection: function () {
            return rubberband.FormatCollection.create(this.items);
        }
    });
});

(function () {
    "use strict";

    troop.Properties.addProperties.call(
        Array.prototype,
        /** @lends Array# */{
            /** @returns {rubberband.FormatCollection} */
            toFormatCollection: function () {
                return rubberband.FormatCollection.create(this);
            }
        },
        false, false, false);
}());
