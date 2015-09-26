$oop.postpone($templating, 'TemplateCollection', function (/**$templating*/widgets) {
    "use strict";

    /**
     * Creates a TemplateCollection instance. TemplateCollections may also be created by conversion
     * from arrays and Hash instances.
     * @name $templating.Template.create
     * @function
     * @param {object|Template[]} [items]
     * @returns {$templating.Template}
     * @see String#toTemplateCollection
     * @see $data.Hash#toTemplateCollection
     */

    /**
     * Collection of Template instances. Allows aggregated token extraction and parameter resolution.
     * @class
     * @extends $data.Collection
     * @extends $templating.Template
     */
    $templating.TemplateCollection = $data.Collection.of(widgets.Template)
        .addMethods(/** @lends $templating.TemplateCollection */{
            /**
             * Extracts unique tokens from all formats in the collection.
             * @returns {$data.Collection}
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

$oop.amendPostponed($data, 'Hash', function () {
    "use strict";

    $data.Hash.addMethods(/** @lends $data.Hash */{
        /** @returns {$templating.TemplateCollection} */
        toTemplateCollection: function () {
            return $templating.TemplateCollection.create(this.items);
        }
    });
});

(function () {
    "use strict";

    $oop.extendBuiltIn(Array.prototype, /** @lends Array# */{
        /** @returns {$templating.TemplateCollection} */
        toTemplateCollection: function () {
            return $templating.TemplateCollection.create(this);
        }
    });
}());
