/*global dessert, troop, sntls, rubberband */
/*global module, test, asyncTest, start, expect, ok, equal, strictEqual, notStrictEqual, deepEqual, notDeepEqual, raises */
(function () {
    "use strict";

    module("LiveTemplate");

    test("Instantiation", function () {
        raises(function () {
            rubberband.LiveTemplate.create({});
        }, "should raise exception on non-string argument");

        var template = rubberband.LiveTemplate.create('foo');
        deepEqual(template.replacements, {}, "should set replacements property");
    });

    test("Conversion from string", function () {
        var template = 'foo'.toLiveTemplate();

        ok(template.isA(rubberband.LiveTemplate), "should return LiveTemplate instance");
        deepEqual(template.replacements, {}, "should set replacements property");
    });

    test("Replacement addition", function () {
        var template = 'foo {{bar}} baz'.toLiveTemplate();

        strictEqual(template.addReplacements({
            '{{bar}}': "Hello World"
        }), template, "should be chainable");

        deepEqual(template.replacements, {
            '{{bar}}': "Hello World"
        }, "should add replacements to template's replacements buffer");
    });

    test("Live template addition as replacement", function () {
        var template1 = 'foo {{bar}} baz'.toLiveTemplate()
                .addReplacements({
                    '{{bar}}': "BAR"
                }),
            template2 = 'Hello {{what}} World!'.toLiveTemplate()
                .addReplacements({
                    '{{what}}': template1
                });

        deepEqual(template2.replacements, {
            '{{what}}': "foo {{bar}} baz",
            '{{bar}}': "BAR"
        }, "should merge replacement template & its replacements to current replacements");

        equal(template2.toString(), "Hello foo BAR baz World!",
            "should prepare template for correct serialization");
    });

    test("Clearing replacements", function () {
        var template = 'foo {{bar}} baz'.toLiveTemplate()
            .addReplacements({
                '{{bar}}': "Hello World"
            });

        strictEqual(template.clearReplacements(), template, "should be chainable");
        deepEqual(template.replacements, {}, "should empty replacements buffer");
    });

    test("Serialization", function () {
        var template = 'foo {{bar}} baz'.toLiveTemplate()
            .addReplacements({
                '{{bar}}': "Hello World"
            });

        equal(template.toString(), "foo Hello World baz", "should return template resolved with stored replacements");
    });
}());
