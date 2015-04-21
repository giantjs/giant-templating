/*global dessert, troop, sntls, rubberband */
/*global module, test, asyncTest, start, expect, ok, equal, strictEqual, notStrictEqual, deepEqual, notDeepEqual, raises */
(function () {
    "use strict";

    module("FormatCollection");

    test("Conversion from array", function () {
        var formatCollection = [
            'foo'.toTemplate(),
            'bar'.toTemplate(),
            'baz'.toTemplate()
        ].toFormatCollection();

        ok(formatCollection.isA(rubberband.FormatCollection), "should return FormatCollection instance");
        equal(formatCollection.getKeyCount(), 3, "should preserve item count");
    });

    test("Conversion from Hash", function () {
        var hash = [
                'foo'.toTemplate(),
                'bar'.toTemplate(),
                'baz'.toTemplate()
            ].toHash(),
            formatCollection = hash.toFormatCollection();

        ok(formatCollection.isA(rubberband.FormatCollection), "should return FormatCollection instance");
        equal(formatCollection.getKeyCount(), 3, "should preserve item count");
    });

    test("Unique token extraction from mixed format collection", function () {
        var formatCollection = [
                rubberband.Template.create({
                    toString: function () {
                        return 'hello {{foo}} world {{bar}} !';
                    }
                }),
                'brave {{bar}}'.toTemplate(),
                'new'.toTemplate()
            ].toFormatCollection(),
            tokens;

        tokens = formatCollection.extractUniqueTokens();

        ok(tokens.isA(sntls.Collection), "should return Collection instance");
        deepEqual(tokens.items, {
            'hello ' : 'hello ',
            '{{foo}}': '{{foo}}',
            ' world ': ' world ',
            '{{bar}}': '{{bar}}',
            ' !'     : ' !',
            'brave ' : 'brave ',
            ''       : '',
            'new'    : 'new'
        }, "should return unique tokens in all formats in the collection");
    });

    test("Parameter resolution", function () {
        var formatCollection = rubberband.FormatCollection.create({
                '{{}}'   : rubberband.Template.create({
                    toString: function () {
                        return 'hello {{foo}} world {{bar}} !';
                    }
                }),
                '{{foo}}': 'brave {{bar}}'.toTemplate(),
                '{{bar}}': 'new'.toTemplate()
            }),
            resolvedParameters = formatCollection.resolveParameters();

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
