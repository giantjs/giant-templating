/*global giant */
giant.postpone(giant, 'LiveTemplate', function () {
    "use strict";

    var base = giant.Template,
        self = base.extend()
            .addTrait(giant.Documented)
            .addTrait(giant.Evented);

    /**
     * Creates a LiveTemplate instance. LiveTemplate instances may also be created from string.
     * @name giant.LiveTemplate.create
     * @function
     * @param {string|giant.Stringifiable} templateString
     * @returns {giant.LiveTemplate}
     * @see String#toLiveTemplate
     */

    /**
     * Template that carries the replacements with it and can be stringified into a resolved template.
     * LiveTemplate triggers events when changing replacements.
     * @class
     * @extends giant.Template
     * @extends giant.Documented
     * @extends giant.Evented
     * @extends giant.Stringifiable
     */
    giant.LiveTemplate = self
        .setEventSpace(giant.templatingEventSpace)
        .addConstants(/** @lends giant.LiveTemplate */{
            /** @constant */
            EVENT_TEMPLATE_REPLACEMENTS_BEFORE_CHANGE: 'giant.replacements-change.before',

            /** @constant */
            EVENT_TEMPLATE_REPLACEMENTS_CHANGE: 'giant.replacements-change'
        })
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
                 * Replacements carried by the template.
                 * @type {object}
                 */
                this.replacements = {};
            },

            /**
             * Merges specified replacements into the template's own replacements buffer.
             * TODO: Use giant.Collection.mergeInto() as soon as it's available.
             * @param {object} replacements
             * @returns {giant.LiveTemplate}
             */
            addReplacements: function (replacements) {
                var keys = Object.keys(replacements),
                    i, key, replacement;

                this.triggerSync(this.EVENT_TEMPLATE_REPLACEMENTS_BEFORE_CHANGE);

                for (i = 0; i < keys.length; i++) {
                    key = keys[i];
                    replacement = replacements[key];

                    if (giant.LiveTemplate.isBaseOf(replacement)) {
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

                this.triggerSync(this.EVENT_TEMPLATE_REPLACEMENTS_CHANGE);

                return this;
            },

            /**
             * Clears replacements buffer.
             * @returns {giant.LiveTemplate}
             */
            clearReplacements: function () {
                this.triggerSync(this.EVENT_TEMPLATE_REPLACEMENTS_BEFORE_CHANGE);
                this.replacements = {};
                this.triggerSync(this.EVENT_TEMPLATE_REPLACEMENTS_CHANGE);
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
