/*global dessert, troop, sntls, rubberband */
/*global module, test, asyncTest, start, expect, ok, equal, strictEqual, notStrictEqual, deepEqual, notDeepEqual, raises */
(function () {
    "use strict";

    module("Template");

    test("Instantiation with string literal", function () {
        var template = rubberband.Template.create('foo');
        equal(template.templateString, 'foo', "should set templateString property");
    });

    test("Instantiation with Stringifiable", function () {
        var stringifiable = {},
            template = rubberband.Template.create(stringifiable);
        strictEqual(template.templateString, stringifiable,
            "should set templateString property");
    });

    test("Conversion from string", function () {
        var template = 'foo'.toTemplate();

        ok(template.isA(rubberband.Template), "should return Template instance");
        equal(template.templateString, 'foo', "should set templateString property");
    });

    test("Parsing string literal template with no params", function () {
        var template = 'foo'.toTemplate();
        equal(template.getTokens(), 'foo', "should return literal");
    });

    test("Parsing string literal template with params", function () {
        var template = 'foo {{bar}} baz'.toTemplate();
        deepEqual(template.getTokens(), [
            'foo ',
            '{{bar}}',
            ' baz'
        ], "should return parsed array");
    });

    test("Parsing Stringifiable template with no params", function () {
        var template = rubberband.Template.create({});
        equal(template.getTokens(), "[object Object]",
            "should return stringified object");
    });

    test("Parsing Stringifiable template with params", function () {
        var template = rubberband.Template.create({
            toString: function () {
                return 'foo {{bar}} baz';
            }
        });
        deepEqual(template.getTokens(), [
            'foo ',
            '{{bar}}',
            ' baz'
        ], "should return parsed array when stringified object contains params");
    });

    test("Setting string literal content", function () {
        var template = 'foo {{bar}} baz'.toTemplate();

        equal(
            template.getResolvedString({
                '{{bar}}'  : "Hello {{world}}",
                '{{world}}': "World!"
            }),
            "foo Hello World! baz",
            "should return string with all parameters resolved");
    });

    test("Setting empty content", function () {
        var template = 'foo {{bar}} baz'.toTemplate();

        equal(
            template.getResolvedString({
                '{{bar}}': undefined
            }),
            "foo {{bar}} baz",
            "should return string with undefined params left intact");
    });

    test("Setting stringifiable content", function () {
        var template = 'foo {{bar}} baz'.toTemplate();

        equal(
            template.getResolvedString({
                '{{bar}}': {}
            }),
            "foo [object Object] baz",
            "should return string with stringified parameters");
    });
}());
