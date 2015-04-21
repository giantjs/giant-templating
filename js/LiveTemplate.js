/*global dessert, troop, sntls, rubberband */
troop.postpone(rubberband, 'LiveTemplate', function () {
    "use strict";

    var base = rubberband.Template,
        self = base.extend();

    /**
     * @name rubberband.LiveTemplate.create
     * @function
     * @param {string|rubberband.Stringifiable} templateString
     * @returns {rubberband.LiveTemplate}
     */

    /**
     * Template that carries the replacements with it and can be stringified into a resolved template.
     * @class
     * @extends rubberband.Template
     */
    rubberband.LiveTemplate = self
        .addMethods(/** @lends rubberband.LiveTemplate# */{
            /**
             * @param {string|rubberband.Stringifiable} templateString
             * @ignore
             */
            init: function (templateString) {
                base.init.call(this, templateString);

                /**
                 * Replacements carried by the template.
                 * @type {object}
                 */
                this.replacements = {};
            },

            /**
             * Merges specified replacements into the template's own replacements buffer.
             * TODO: Use sntls.Collection.mergeInto() as soon as it's ready.
             * @param {object} replacements
             * @returns {rubberband.LiveTemplate}
             */
            addReplacements: function (replacements) {
                var keys = Object.keys(replacements),
                    i, key, replacement;

                for (i = 0; i < keys.length; i++) {
                    key = keys[i];
                    replacement = replacements[key];

                    if (rubberband.LiveTemplate.isBaseOf(replacement)) {
                        // when replacement is a LiveTemplate
                        this.replacements[key] = replacement.templateString;

                        // merging template's replacements onto own
                        this.addReplacements(replacement.replacements);
                    } else {
                        // for any other replacement
                        // adding single replacement
                        this.replacements[key] = replacement;
                    }
                }

                return this;
            },

            /**
             * Clears replacements buffer.
             * @returns {rubberband.LiveTemplate}
             */
            clearReplacements: function () {
                this.replacements = {};
                return this;
            },

            /**
             * @returns {string}
             */
            toString: function () {
                return this.getResolvedString(this.replacements);
            }
        });
});

(function () {
    "use strict";

    dessert.addTypes(/** @lends dessert */{
        /** @param {rubberband.LiveTemplate} expr */
        isLiveTemplate: function (expr) {
            return rubberband.LiveTemplate.isBaseOf(expr);
        },

        /** @param {rubberband.LiveTemplate} expr */
        isLiveTemplateOptional: function (expr) {
            return typeof expr === 'undefined' &&
                   rubberband.LiveTemplate.isBaseOf(expr);
        }
    });

    troop.Properties.addProperties.call(
        String.prototype,
        /** @lends String# */{
            /**
             * Converts string to LiveTemplate instance.
             * @returns {rubberband.LiveTemplate}
             */
            toLiveTemplate: function () {
                return rubberband.LiveTemplate.create(this.valueOf());
            }
        },
        false, false, false);
}());
