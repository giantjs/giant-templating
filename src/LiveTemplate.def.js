/*global giant */
giant.postpone(giant, 'LiveTemplate', function () {
    "use strict";

    var base = giant.Template,
        self = base.extend()
            .addTrait(giant.Documented)
            .addTrait(giant.Evented),
        shallowCopy = giant.DataUtils.shallowCopy;

    /**
     * Creates a LiveTemplate instance. LiveTemplate instances may also be created from string.
     * @name giant.LiveTemplate.create
     * @function
     * @param {string|giant.Stringifiable} templateString
     * @returns {giant.LiveTemplate}
     * @see String#toLiveTemplate
     */

    /**
     * Template that carries the parameter values with it and can be stringified into a resolved template.
     * LiveTemplate triggers events when changing parameter values.
     * @class
     * @extends giant.Template
     * @extends giant.Documented
     * @extends giant.Evented
     * @extends giant.Stringifiable
     */
    giant.LiveTemplate = self
        .setEventSpace(giant.eventSpace)
        .addMethods(/** @lends giant.LiveTemplate# */{
            /**
             * @param {string|giant.Stringifiable} templateString
             * @ignore
             */
            init: function (templateString) {
                base.init.call(this, templateString);
                giant.Documented.init.call(this);
                this.setEventPath(['template', this.instanceId].toPath());

                /**
                 * Parameter values carried by the template.
                 * @type {object}
                 */
                this.parameterValues = {};
            },

            /**
             * Merges specified parameter values into the template's own set of parameter values.
             * New values overwrite old values associated with the same parameter.
             * @param {object} parameterValues
             * @returns {giant.LiveTemplate}
             */
            setParameterValues: function (parameterValues) {
                var parameterValuesAfter = this.parameterValues,
                    parameterValuesBefore = shallowCopy(parameterValuesAfter),
                    parameterNames = Object.keys(parameterValues),
                    parameterCount = parameterNames.length,
                    i, parameterName, parameterValue;

                for (i = 0; i < parameterCount; i++) {
                    parameterName = parameterNames[i];
                    parameterValue = parameterValues[parameterName];

                    if (giant.LiveTemplate.isBaseOf(parameterValue)) {
                        // when parameter value is a LiveTemplate
                        parameterValuesAfter[parameterName] = parameterValue.templateString;

                        // merging template's parameter value onto own
                        this.setParameterValues(parameterValue.parameterValues);
                    } else {
                        // for any other parameter type
                        // adding single parameter value
                        parameterValuesAfter[parameterName] = parameterValue;
                    }
                }

                this.spawnEvent(giant.EVENT_TEMPLATE_PARAMETER_VALUES_CHANGE)
                    .setPayloadItems({
                        parameterValuesBefore: parameterValuesBefore,
                        parameterValuesAfter : parameterValuesAfter
                    });

                return this;
            },

            /**
             * Clears parameter values assigned to the template.
             * @returns {giant.LiveTemplate}
             */
            clearParameterValues: function () {
                var parameterValuesBefore = this.parameterValues,
                    parameterValuesAfter = {};

                this.parameterValues = parameterValuesAfter;

                // TODO: Add special event type instead of payload.
                this.spawnEvent(giant.EVENT_TEMPLATE_PARAMETER_VALUES_CHANGE)
                    .setPayloadItems({
                        parameterValuesBefore: parameterValuesBefore,
                        parameterValuesAfter : parameterValuesAfter
                    });

                return this;
            },

            /**
             * @returns {string}
             */
            toString: function () {
                return this.getResolvedString(this.parameterValues);
            }
        });
});

(function () {
    "use strict";

    giant.addGlobalConstants(/** @lends giant */{
        /**
         * Signals that parameter values in a template changed.
         * @constant
         */
        EVENT_TEMPLATE_PARAMETER_VALUES_CHANGE: 'template.change.parameterValues'
    });

    giant.addTypes(/** @lends giant */{
        /** @param {giant.LiveTemplate} expr */
        isLiveTemplate: function (expr) {
            return giant.LiveTemplate.isBaseOf(expr);
        },

        /** @param {giant.LiveTemplate} expr */
        isLiveTemplateOptional: function (expr) {
            return typeof expr === 'undefined' &&
                giant.LiveTemplate.isBaseOf(expr);
        }
    });

    giant.extendBuiltIn(String.prototype, /** @lends String# */{
        /**
         * Converts string to LiveTemplate instance.
         * @returns {giant.LiveTemplate}
         */
        toLiveTemplate: function () {
            return giant.LiveTemplate.create(this.valueOf());
        }
    });
}());
