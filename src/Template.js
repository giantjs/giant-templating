/*global giant */
giant.postpone(giant, 'Template', function () {
    "use strict";

    var base = giant.Base,
        self = base.extend();

    /**
     * Creates a Template instance. Templates may also be created by conversion from string.
     * @name giant.Template.create
     * @function
     * @param {string|giant.Stringifiable} templateString Either handlebars based string,
     * or object that serializes to one.
     * @returns {giant.Template}
     * @see String#toTemplate
     */

    /**
     * Defines a template with handlebars parameters. Parameters may be replaced
     * with strings and Stringifiable instances.
     * @class
     * @extends giant.Base
     */
    giant.Template = self
        .addConstants(/** @lends giant.Template */{
            /**
             * @type {RegExp}
             * @constant
             */
            RE_PARAMETER_TESTER: /^{{[^{}]+}}$/,

            /**
             * @type {RegExp}
             * @constant
             */
            RE_TEMPLATE_SPLITTER: /({{.+?}})/
        })
        .addPrivateMethods(/** @lends giant.Template# */{
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
        .addMethods(/** @lends giant.Template# */{
            /**
             * @param {string|giant.Stringifiable} templateString
             * @ignore
             */
            init: function (templateString) {
                /**
                 * Original templateString string.
                 * @type {string|giant.Stringifiable}
                 */
                this.templateString = templateString;
            },

            /**
             * Parses current template string and returns an array of tokens
             * that make up the template's current value.
             * @returns {string|string[]}
             */
            extractTokens: function () {
                var serializedTemplate = giant.Stringifier.stringify(this.templateString),
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
             * TODO: Use giant.Collection.mergeInto() as soon as it's available.
             * @param {object} replacements Placeholder - string / Stringifiable associations.
             * @returns {string}
             */
            getResolvedString: function (replacements) {
                var resolvedParameters = giant.Collection
                    // merging current templateString with replacement values as templates
                    .create({
                        '{{}}': this
                    })
                    .mergeWith(giant.Collection.create(replacements)
                        // discarding value-less replacements
                        .filterBySelector(function (replacement) {
                            return typeof replacement !== 'undefined';
                        })
                        // converting each replacement to Template
                        .createWithEachItem(giant.Template))
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
                return giant.Stringifier.stringify(this.templateString);
            }
        });
});

(function () {
    "use strict";

    giant.addTypes(/** @lends giant */{
        /** @param {giant.Template} expr */
        isTemplate: function (expr) {
            return giant.Template.isBaseOf(expr);
        },

        /** @param {giant.Template} expr */
        isTemplateOptional: function (expr) {
            return typeof expr === 'undefined' &&
                   giant.Template.isBaseOf(expr);
        }
    });

    giant.Properties.addProperties.call(
        String.prototype,
        /** @lends String# */{
            /**
             * Converts string to Template instance.
             * @returns {giant.Template}
             */
            toTemplate: function () {
                return giant.Template.create(this.valueOf());
            }
        },
        false, false, false);
}());
