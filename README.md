Rubberband
==========

*Handlebars-based universal templating*

Rubberband allows you to:

1. Use objects that implement a meaningful `.toString()` method as both template strings and replacements. These will be evaluated upon applying the replacements and generating the final string.
2. Use further templates as replacements. Of course you'll need to make sure circular parameter references are avoided.

Examples
--------

### Basic template composition

Template composition is useful eg. when separating strings that need to be localized from static strings (mostly markup).

    "Today is {{formatted day of the week}}.".toTemplate()
        .getResolvedString({
            {{formatted day of the week}}: "<em>{{day of the week}}</em>",
            {{day of the week}}: "Tuesday"
        });

    // returns "Today is <em>Tuesday</em>."

### Live templates

Live templates may be passed to any method that expects a `Stringifiable`. In contexts like those, a live template will behave like a string that is evaluated on demand. Live templates thus provide a powerful way to pass around text that depend on current language settings, cache / local storage values, or anything with a volatile state reflected in its `.toString()` override.

    var template = "Today is {{formatted day of the week}}.".toLiveTemplate()
        .addReplacements({
            {{formatted day of the week}}: "<em>{{day of the week}}</em>",
            {{day of the week}}: "Tuesday"
        });

    template.toString() // "Today is <em>Tuesday</em>."
    [template].join('') // "Today is <em>Tuesday</em>."
