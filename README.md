Rubberband
==========

*Handlebars-based universal templating.*

Rubberband allows you to:

1. Use objects that implement a meaningful `.toString()` method as both template strings and replacements. These will be evaluated upon applying the replacements and generating the final string.
2. Use further templates as replacements. Of course you'll need to make sure circular parameter references are avoided.

Example
-------

The following sample demonstrates template composition. Template composition is useful eg. when separating strings that need to be localized from static strings, mostly markup.

    "Today is {{formatted day of the week}}.".toTemplate()
        .getResolvedString({
            {{formatted day of the week}}: "<em>{{day of the week}}</em>",
            {{day of the week}}: "Tuesday"
        });

    // returns "Today is <em>Tuesday</em>."
