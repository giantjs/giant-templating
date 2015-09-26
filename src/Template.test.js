(function () {
    "use strict";

    module("Template");

    test("Instantiation with string literal", function () {
        var template = $templating.Template.create('foo');
        equal(template.templateString, 'foo', "should set templateString property");
    });

    test("Instantiation with Stringifiable", function () {
        var stringifiable = {},
            template = $templating.Template.create(stringifiable);
        strictEqual(template.templateString, stringifiable,
            "should set templateString property");
    });

    test("Conversion from string", function () {
        var template = 'foo'.toTemplate();

        ok(template.isA($templating.Template), "should return Template instance");
        equal(template.templateString, 'foo', "should set templateString property");
    });

    test("Extracting tokens from string literal template with no params", function () {
        var template = 'foo'.toTemplate();
        equal(template.extractTokens(), 'foo', "should return literal");
    });

    test("Extracting tokens from string literal template with params", function () {
        var template = 'foo {{bar}} baz'.toTemplate();
        deepEqual(template.extractTokens(), [
            'foo ',
            '{{bar}}',
            ' baz'
        ], "should return parsed array");
    });

    test("Extracting tokens from string literal with params end to end", function () {
        var template = '{{foo}}{{bar}}'.toTemplate();

        deepEqual(template.extractTokens(), [
            '',
            '{{foo}}',
            '',
            '{{bar}}',
            ''
        ], "should return parsed array");
    });

    test("Extracting tokens from Stringifiable template with no params", function () {
        var template = $templating.Template.create({});
        equal(template.extractTokens(), "[object Object]",
            "should return stringified object");
    });

    test("Extracting tokens from Stringifiable template with params", function () {
        var template = $templating.Template.create({
            toString: function () {
                return 'foo {{bar}} baz';
            }
        });
        deepEqual(template.extractTokens(), [
            'foo ',
            '{{bar}}',
            ' baz'
        ], "should return parsed array when stringified object contains params");
    });

    test("Resolving template with string literal content", function () {
        var template = 'foo {{bar}} baz'.toTemplate();

        equal(
            template.getResolvedString({
                '{{bar}}'  : "Hello {{world}}",
                '{{world}}': "World!"
            }),
            "foo Hello World! baz",
            "should return string with all parameters resolved");
    });

    test("Resolving template with empty content", function () {
        var template = 'foo {{bar}} baz'.toTemplate();

        equal(
            template.getResolvedString({
                '{{bar}}': undefined
            }),
            "foo {{bar}} baz",
            "should return string with undefined params left intact");
    });

    test("Resolving template with stringifiable content", function () {
        var template = 'foo {{bar}} baz'.toTemplate();

        equal(
            template.getResolvedString({
                '{{bar}}': {}
            }),
            "foo [object Object] baz",
            "should return string with stringified parameters");
    });

    test("Resolving template with no content", function () {
        var template = 'foo {{bar}} baz'.toTemplate();

        equal(
            template.getResolvedString(),
            "foo  baz",
            "should return string with empty string for parameters");
    });
}());
