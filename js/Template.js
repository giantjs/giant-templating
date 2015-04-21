/*global dessert, troop, sntls, rubberband */
troop.postpone(rubberband, 'Template', function () {
    "use strict";

    var base = troop.Base,
        self = base.extend();

    /**
     * @name rubberband.Template.create
     * @function
     * @param {string} templateString Handlebars - based templateString string.
     * @returns {rubberband.Template}
     */

    /**
     * Defines a template with handlebars parameters. The parameters may be substituted
     * with strings and Stringifiable instances.
     * @class
     * @extends troop.Base
     */
    rubberband.Template = self
        .addConstants(/** @lends rubberband.Template */{
            /**
             * @type {RegExp}
             * @constant
             */
            RE_PARAMETER_TESTER: /^{{.+?}}$/,

            /**
             * @type {RegExp}
             * @constant
             */
            RE_TEMPLATE_SPLITTER: /({{.+?}})/
        })
        .addPrivateMethods(/** @lends rubberband.Template# */{
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
        .addMethods(/** @lends rubberband.Template# */{
            /**
             * @param {string} templateString
             * @ignore
             */
            init: function (templateString) {
                /**
                 * Original templateString string.
                 * @type {string|rubberband.Stringifiable}
                 */
                this.templateString = templateString;
            },

            /**
             * Parses current template string and returns an array of tokens
             * that make up the template's current value.
             * @returns {string|string[]}
             */
            extractTokens: function () {
                var serializedTemplate = this.toString(),
                    parsedTemplate;

                if (this.RE_PARAMETER_TESTER.test(serializedTemplate)) {
                    return serializedTemplate;
                } else {
                    parsedTemplate = serializedTemplate.split(this.RE_TEMPLATE_SPLITTER);
                    return parsedTemplate.length > 1 ? parsedTemplate : serializedTemplate;
                }
            },

            /**
             * Resolves the params in the template as well as the replacements
             * (which can also carry templates) and returns the generated string.
             * TODO: Use sntls.Collection.mergeInto() as soon as it's ready.
             * @param {object} replacements Placeholder - string / Stringifiable associations.
             * @returns {string}
             */
            getResolvedString: function (replacements) {
                var resolvedParameters = sntls.Collection
                    // merging current templateString with replacement values as templates
                    .create({
                        '{{}}': this
                    })
                    .mergeWith(sntls.Collection.create(replacements)
                        // discarding value-less replacements
                        .filterBySelector(function (replacement) {
                            return typeof replacement !== 'undefined';
                        })
                        // converting each replacement to Template
                        .createWithEachItem(rubberband.Template))
                    .toTemplateCollection()

                    // resolving templateString parameters for main templateString as well as replacements
                    .resolveParameters();

                return this._flattenResolvedParameters(resolvedParameters['{{}}']);
            },

            /**
             * Stringifies template.
             * @returns {string}
             */
            toString: function () {
                return rubberband.Stringifier.stringify(this.templateString);
            }
        });
});

(function () {
    "use strict";

    dessert.addTypes(/** @lends dessert */{
        /** @param {rubberband.Template} expr */
        isTemplate: function (expr) {
            return rubberband.Template.isBaseOf(expr);
        },

        /** @param {rubberband.Template} expr */
        isTemplateOptional: function (expr) {
            return typeof expr === 'undefined' &&
                   rubberband.Template.isBaseOf(expr);
        }
    });

    troop.Properties.addProperties.call(
        String.prototype,
        /** @lends String# */{
            /**
             * Converts string to Template instance.
             * @returns {rubberband.Template}
             */
            toTemplate: function () {
                return rubberband.Template.create(this.valueOf());
            }
        },
        false, false, false);
}());
