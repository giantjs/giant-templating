/*global dessert, troop, sntls, rubberband */
/*global module, test, asyncTest, start, expect, ok, equal, strictEqual, notStrictEqual, deepEqual, notDeepEqual, raises */
(function () {
    "use strict";

    module("Format");

    test("Instantiation with string literal", function () {
        var format = rubberband.Format.create('foo');
        equal(format.serializedFormat, 'foo', "should set serializedFormat property");
    });

    test("Instantiation with Stringifiable", function () {
        var stringifiable = {},
            format = rubberband.Format.create(stringifiable);
        strictEqual(format.serializedFormat, stringifiable,
            "should set serializedFormat property");
    });

    test("Conversion from string", function () {
        var format = 'foo'.toFormat();

        ok(format.isA(rubberband.Format), "should return Format instance");
        equal(format.serializedFormat, 'foo', "should set serializedFormat property");
    });

    test("Parsing string literal format with no params", function () {
        var format = 'foo'.toFormat();
        equal(format.getTokens(), 'foo', "should return literal");
    });

    test("Parsing string literal format with params", function () {
        var format = 'foo {{bar}} baz'.toFormat();
        deepEqual(format.getTokens(), [
            'foo ',
            '{{bar}}',
            ' baz'
        ], "should return parsed array");
    });

    test("Parsing Stringifiable format with no params", function () {
        var format = rubberband.Format.create({});
        equal(format.getTokens(), "[object Object]",
            "should return stringified object");
    });

    test("Parsing Stringifiable format with params", function () {
        var format = rubberband.Format.create({
            toString: function () {
                return 'foo {{bar}} baz';
            }
        });
        deepEqual(format.getTokens(), [
            'foo ',
            '{{bar}}',
            ' baz'
        ], "should return parsed array when stringified object contains params");
    });

    test("Setting string literal content", function () {
        var format = 'foo {{bar}} baz'.toFormat();

        equal(
            format.setContent({
                '{{bar}}'  : "Hello {{world}}",
                '{{world}}': "World!"
            }),
            "foo Hello World! baz",
            "should return string with all parameters resolved");
    });

    test("Setting empty content", function () {
        var format = 'foo {{bar}} baz'.toFormat();

        equal(
            format.setContent({
                '{{bar}}': undefined
            }),
            "foo {{bar}} baz",
            "should return string with undefined params left intact");
    });

    test("Setting stringifiable content", function () {
        var format = 'foo {{bar}} baz'.toFormat();

        equal(
            format.setContent({
                '{{bar}}': {}
            }),
            "foo [object Object] baz",
            "should return string with stringified parameters");
    });
}());
