(function () {
    "use strict";

    module("TemplateCollection");

    test("Conversion from array", function () {
        var templates = [
            'foo'.toTemplate(),
            'bar'.toTemplate(),
            'baz'.toTemplate()
        ].toTemplateCollection();

        ok(templates.isA($templating.TemplateCollection), "should return TemplateCollection instance");
        equal(templates.getKeyCount(), 3, "should preserve item count");
    });

    test("Conversion from Hash", function () {
        var hash = [
                'foo'.toTemplate(),
                'bar'.toTemplate(),
                'baz'.toTemplate()
            ].toHash(),
            templates = hash.toTemplateCollection();

        ok(templates.isA($templating.TemplateCollection), "should return TemplateCollection instance");
        equal(templates.getKeyCount(), 3, "should preserve item count");
    });

    test("Unique token extraction from mixed template collection", function () {
        var templates = [
                $templating.Template.create({
                    toString: function () {
                        return 'hello {{foo}} world {{bar}} !';
                    }
                }),
                'brave {{bar}}'.toTemplate(),
                'new'.toTemplate()
            ].toTemplateCollection(),
            tokens;

        tokens = templates.extractUniqueTokens();

        ok(tokens.isA($data.Collection), "should return Collection instance");
        deepEqual(tokens.items, {
            'hello ' : 'hello ',
            '{{foo}}': '{{foo}}',
            ' world ': ' world ',
            '{{bar}}': '{{bar}}',
            ' !'     : ' !',
            'brave ' : 'brave ',
            ''       : '',
            'new'    : 'new'
        }, "should return unique tokens in all templates in the collection");
    });

    test("Parameter resolution", function () {
        var templates = $templating.TemplateCollection.create({
                '{{}}'   : $templating.Template.create({
                    toString: function () {
                        return 'hello {{foo}} world {{bar}} !';
                    }
                }),
                '{{foo}}': 'brave {{bar}}'.toTemplate(),
                '{{bar}}': 'new'.toTemplate()
            }),
            resolvedParameters = templates.resolveParameters();

        equal(typeof resolvedParameters, 'object', "should return object");
        deepEqual(resolvedParameters, {
            "{{}}"   : [
                "hello ",
                [
                    "brave ",
                    "new",
                    ""
                ],
                " world ",
                "new",
                " !"
            ],
            "{{foo}}": [
                "brave ",
                "new",
                ""
            ],
            "{{bar}}": "new",
            "hello " : "hello ",
            " world ": " world ",
            " !"     : " !",
            "brave " : "brave ",
            ""       : "",
            "new"    : "new"
        }, "should return resolved token tree");
    });
}());
