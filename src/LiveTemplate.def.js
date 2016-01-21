$oop.postpone($templating, 'LiveTemplate', function () {
    "use strict";

    var base = $templating.Template,
        self = base.extend()
            .addTrait($utils.Documented)
            .addTrait($event.Evented),
        shallowCopy = $data.DataUtils.shallowCopy;

    /**
     * Creates a LiveTemplate instance. LiveTemplate instances may also be created from string.
     * @name $templating.LiveTemplate.create
     * @function
     * @param {string|$utils.Stringifiable} templateString
     * @returns {$templating.LiveTemplate}
     * @see String#toLiveTemplate
     */

    /**
     * Template that carries the parameter values with it and can be stringified into a resolved template.
     * LiveTemplate triggers events when changing parameter values.
     * @class
     * @extends $templating.Template
     * @extends $utils.Documented
     * @extends $event.Evented
     * @extends $utils.Stringifiable
     */
    $templating.LiveTemplate = self
        .setEventSpace($event.eventSpace)
        .addMethods(/** @lends $templating.LiveTemplate# */{
            /**
             * @param {string|$utils.Stringifiable} templateString
             * @ignore
             */
            init: function (templateString) {
                base.init.call(this, templateString);
                $utils.Documented.init.call(this);
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
             * @returns {$templating.LiveTemplate}
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

                    if ($templating.LiveTemplate.isBaseOf(parameterValue)) {
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

                this.spawnEvent($templating.EVENT_TEMPLATE_PARAMETER_VALUES_CHANGE)
                    .setPayloadItems({
                        parameterValuesBefore: parameterValuesBefore,
                        parameterValuesAfter : parameterValuesAfter
                    })
                    .triggerSync();

                return this;
            },

            /**
             * Clears parameter values assigned to the template.
             * @returns {$templating.LiveTemplate}
             */
            clearParameterValues: function () {
                var parameterValuesBefore = this.parameterValues,
                    parameterValuesAfter = {};

                this.parameterValues = parameterValuesAfter;

                // TODO: Add special event type instead of payload.
                this.spawnEvent($templating.EVENT_TEMPLATE_PARAMETER_VALUES_CHANGE)
                    .setPayloadItems({
                        parameterValuesBefore: parameterValuesBefore,
                        parameterValuesAfter : parameterValuesAfter
                    })
                    .triggerSync();

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

    $oop.addGlobalConstants.call($templating, /** @lends $templating */{
        /**
         * Signals that parameter values in a template changed.
         * @constant
         */
        EVENT_TEMPLATE_PARAMETER_VALUES_CHANGE: 'template.change.parameterValues'
    });

    $assertion.addTypes(/** @lends $templating */{
        /** @param {$templating.LiveTemplate} expr */
        isLiveTemplate: function (expr) {
            return $templating.LiveTemplate.isBaseOf(expr);
        },

        /** @param {$templating.LiveTemplate} expr */
        isLiveTemplateOptional: function (expr) {
            return typeof expr === 'undefined' &&
                $templating.LiveTemplate.isBaseOf(expr);
        }
    });

    $oop.extendBuiltIn(String.prototype, /** @lends String# */{
        /**
         * Converts string to LiveTemplate instance.
         * @returns {$templating.LiveTemplate}
         */
        toLiveTemplate: function () {
            return $templating.LiveTemplate.create(this.valueOf());
        }
    });
}());
