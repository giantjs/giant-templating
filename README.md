Rubberband
==========

*String templating*

Rubberband is a general and flexible tool for working with string templates. The primary aim of rubberband is to render text rather than markup, depending on current language ([v18n](https://github.com/danstocker/v18n)), or data ([bookworm](https://github.com/danstocker/bookworm)). Rubberband builds on the OOP principles set forth by [troop](https://github.com/danstocker/troop), data structures from [sntls](https://github.com/danstocker/sntls), and eventing from [evan](https://github.com/danstocker/evan).

Rubberband allows you to:

1. Use objects that implement a meaningful `.toString()` method as both template strings and replacements. These will be evaluated upon applying the replacements and generating the final string.
2. Use further templates as replacements. Of course you'll need to make sure circular parameter references are avoided.

Examples
--------

### Basic template composition

Template composition is useful eg. when separating strings that need to be localized from static strings (mostly markup).

    "Today is {{formatted day of the week}}.".toTemplate()
        .getResolvedString({
            '{{formatted day of the week}}': "<em>{{day of the week}}</em>",
            '{{day of the week}}': "Tuesday"
        });

    // returns "Today is <em>Tuesday</em>."

### Live templates

See [http://jsfiddle.net/danstocker/zm9srv5m/](http://jsfiddle.net/danstocker/zm9srv5m/)

Live templates may be passed to any method that expects a `Stringifiable`. In contexts like those, a live template will behave like a string that is evaluated on demand. Live templates thus provide a powerful way to pass around text that depend on current language settings, cache / local storage values, or anything with a volatile state reflected in its `.toString()` override.

    var template = "Today is {{formatted day of the week}}.".toLiveTemplate()
        .addReplacements({
            '{{formatted day of the week}}': "<em>{{day of the week}}</em>",
            '{{day of the week}}': "Tuesday"
        });

    template.toString() // "Today is <em>Tuesday</em>."
    [template].join('') // "Today is <em>Tuesday</em>."

Live templates have the `evan.Evented` trait, both triggering events when replacements change, and providing an API to listen to changes.

    var template = "Today is {{formatted day of the week}}.".toLiveTemplate()
        .subscribeTo(rubberband.LiveTemplate.EVENT_TEMPLATE_REPLACEMENTS_CHANGE, function (event) {
            console.log("replacements changed, new string " + event.sender);
        })

    // will trigger event and log to the console

    template.addReplacements({
        '{{formatted day of the week}}': "<em>{{day of the week}}</em>",
        '{{day of the week}}': "Tuesday"
    });
