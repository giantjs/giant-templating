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
            RE_PARAMETER: /{{[^{}]+}}/g,

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
            },

            /**
             * @param {object} parameterValues
             * @returns {string}
             * @private
             */
            _resolveParameters: function (parameterValues) {
                var parameterValuesAsTemplates = giant.Collection.create(parameterValues)
                        // discarding undefined parameter values
                        .filterBySelector(function (parameterValue) {
                            return typeof parameterValue !== 'undefined';
                        })
                        // converting each parameter value to Template
                        .createWithEachItem(giant.Template),
                    resolvedParameters = giant.Collection
                        // merging current templateString with parameter values as templates
                        .create({
                            '{{}}': this
                        })
                        .mergeIn(parameterValuesAsTemplates)
                        .toTemplateCollection()

                        // resolving templateString parameters for main templateString as well as parameter values
                        .resolveParameters();

                return this._flattenResolvedParameters(resolvedParameters['{{}}']);
            },

            /**
             * @returns {string}
             * @private
             */
            _clearParameters: function () {
                return this.templateString.replace(self.RE_PARAMETER, '');
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

                if (self.RE_PARAMETER_TESTER.test(serializedTemplate)) {
                    return serializedTemplate;
                } else {
                    parsedTemplate = serializedTemplate.split(self.RE_TEMPLATE_SPLITTER);
                    return parsedTemplate.length > 1 ? parsedTemplate : serializedTemplate;
                }
            },

            /**
             * Resolves parameters in the template as well as in the specified parameter values
             * (which can also carry templates) and returns the generated string.
             * @param {object} [parameterValues] Parameter name - parameter value (string / Stringifiable) associations.
             * When omitted, parameters will be replaced with empty string.
             * @returns {string}
             */
            getResolvedString: function (parameterValues) {
                if (parameterValues) {
                    return this._resolveParameters(parameterValues);
                } else {
                    return this._clearParameters();
                }
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

    $assertion.addTypes(/** @lends giant */{
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

    giant.extendBuiltIn(String.prototype, /** @lends String# */{
        /**
         * Converts string to Template instance.
         * @returns {giant.Template}
         */
        toTemplate: function () {
            return giant.Template.create(this.valueOf());
        }
    });
}());
