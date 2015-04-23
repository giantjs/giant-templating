/*global dessert, troop, sntls, rubberband */
troop.postpone(rubberband, 'TemplateCollection', function (/**rubberband*/widgets) {
    "use strict";

    /**
     * Creates a TemplateCollection instance. TemplateCollections may also be created by conversion
     * from arrays and Hash instances.
     * @name rubberband.Template.create
     * @function
     * @param {object|Template[]} [items]
     * @returns {rubberband.Template}
     * @see String#toTemplateCollection
     * @see sntls.Hash#toTemplateCollection
     */

    /**
     * Collection of Template instances. Allows aggregated token extraction and parameter resolution.
     * @class
     * @extends sntls.Collection
     * @extends rubberband.Template
     */
    rubberband.TemplateCollection = sntls.Collection.of(widgets.Template)
        .addMethods(/** @lends rubberband.TemplateCollection */{
            /**
             * Extracts unique tokens from all formats in the collection.
             * @returns {sntls.Collection}
             */
            extractUniqueTokens: function () {
                return this
                    // concatenating all parsedFormat of all formats in the collection
                    .callOnEachItem('extractTokens')
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
                            .toTemplateCollection())
                        .extractTokens();

                tokensCollection
                    // going through all template tokens and replacing parameter value in each
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
        /** @returns {rubberband.TemplateCollection} */
        toTemplateCollection: function () {
            return rubberband.TemplateCollection.create(this.items);
        }
    });
});

(function () {
    "use strict";

    troop.Properties.addProperties.call(
        Array.prototype,
        /** @lends Array# */{
            /** @returns {rubberband.TemplateCollection} */
            toTemplateCollection: function () {
                return rubberband.TemplateCollection.create(this);
            }
        },
        false, false, false);
}());
