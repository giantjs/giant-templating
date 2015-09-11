/*global giant */
(function () {
    "use strict";

    module("LiveTemplate");

    test("Instantiation", function () {
        var template = giant.LiveTemplate.create('foo');
        deepEqual(template.replacements, {}, "should set replacements property");
        ok(template.eventPath.equals(['template', template.instanceId].toPath()), "should set event path");
    });

    test("Conversion from string", function () {
        var template = 'foo'.toLiveTemplate();

        ok(template.isA(giant.LiveTemplate), "should return LiveTemplate instance");
        deepEqual(template.replacements, {}, "should set replacements property");
    });

    test("Replacement addition", function () {
        var template = 'foo {{bar}} baz'.toLiveTemplate(),
            eventNames = [];

        template.addMocks({
            triggerSync: function (eventName) {
                eventNames.push(eventName);
            }
        });

        strictEqual(template.addReplacements({
            '{{bar}}': "Hello World"
        }), template, "should be chainable");

        deepEqual(template.replacements, {
            '{{bar}}': "Hello World"
        }, "should add replacements to template's replacements buffer");

        deepEqual(eventNames, [
            template.EVENT_TEMPLATE_REPLACEMENTS_BEFORE_CHANGE,
            template.EVENT_TEMPLATE_REPLACEMENTS_CHANGE
        ], "should trigger template replacement events");
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
            '{{bar}}' : "BAR"
        }, "should merge replacement template & its replacements to current replacements");

        equal(template2.toString(), "Hello foo BAR baz World!",
            "should prepare template for correct serialization");
    });

    test("Clearing replacements", function () {
        var template = 'foo {{bar}} baz'.toLiveTemplate()
                .addReplacements({
                    '{{bar}}': "Hello World"
                }),
            eventNames = [];

        template.addMocks({
            triggerSync: function (eventName) {
                eventNames.push(eventName);
            }
        });

        strictEqual(template.clearReplacements(), template, "should be chainable");

        deepEqual(template.replacements, {}, "should empty replacements buffer");
        deepEqual(eventNames, [
            template.EVENT_TEMPLATE_REPLACEMENTS_BEFORE_CHANGE,
            template.EVENT_TEMPLATE_REPLACEMENTS_CHANGE
        ], "should trigger template replacement events");
    });

    test("Serialization", function () {
        var template = 'foo {{bar}} baz'.toLiveTemplate()
            .addReplacements({
                '{{bar}}': "Hello World"
            });

        equal(template.toString(), "foo Hello World baz", "should return template resolved with stored replacements");
    });
}());
