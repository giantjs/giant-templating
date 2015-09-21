/*global giant */
(function () {
    "use strict";

    module("LiveTemplate");

    test("Instantiation", function () {
        var template = giant.LiveTemplate.create('foo');
        deepEqual(template.parameterValues, {}, "should set parameterValues property");
        ok(template.eventPath.equals(['template', template.instanceId].toPath()), "should set event path");
    });

    test("Conversion from string", function () {
        var template = 'foo'.toLiveTemplate();

        ok(template.isA(giant.LiveTemplate), "should return LiveTemplate instance");
        deepEqual(template.parameterValues, {}, "should set parameterValues property");
    });

    test("Parameter value addition", function () {
        var template = 'foo {{bar}} baz'.toLiveTemplate(),
            eventNames = [];

        template.addMocks({
            triggerSync: function (eventName) {
                eventNames.push(eventName);
            }
        });

        strictEqual(template.setParameterValues({
            '{{bar}}': "Hello World"
        }), template, "should be chainable");

        deepEqual(template.parameterValues, {
            '{{bar}}': "Hello World"
        }, "should add parameterValues to template's parameterValues buffer");

        deepEqual(eventNames, [
            giant.EVENT_TEMPLATE_PARAMETER_VALUES_BEFORE_CHANGE,
            giant.EVENT_TEMPLATE_PARAMETER_VALUES_CHANGE
        ], "should trigger template parameter value events");
    });

    test("Live template addition as parameter value", function () {
        var template1 = 'foo {{bar}} baz'.toLiveTemplate()
                .setParameterValues({
                    '{{bar}}': "BAR"
                }),
            template2 = 'Hello {{what}} World!'.toLiveTemplate()
                .setParameterValues({
                    '{{what}}': template1
                });

        deepEqual(template2.parameterValues, {
            '{{what}}': "foo {{bar}} baz",
            '{{bar}}' : "BAR"
        }, "should merge parameter value template & _its_ parameter values to current parameter values");

        equal(template2.toString(), "Hello foo BAR baz World!",
            "should prepare template for correct serialization");
    });

    test("Clearing parameterValues", function () {
        var template = 'foo {{bar}} baz'.toLiveTemplate()
                .setParameterValues({
                    '{{bar}}': "Hello World"
                }),
            eventNames = [];

        template.addMocks({
            triggerSync: function (eventName) {
                eventNames.push(eventName);
            }
        });

        strictEqual(template.clearParameterValues(), template, "should be chainable");

        deepEqual(template.parameterValues, {}, "should empty parameterValues buffer");
        deepEqual(eventNames, [
            giant.EVENT_TEMPLATE_PARAMETER_VALUES_BEFORE_CHANGE,
            giant.EVENT_TEMPLATE_PARAMETER_VALUES_CHANGE
        ], "should trigger parameter value events");
    });

    test("Serialization", function () {
        var template = 'foo {{bar}} baz'.toLiveTemplate()
            .setParameterValues({
                '{{bar}}': "Hello World"
            });

        equal(template.toString(), "foo Hello World baz", "should return template resolved with stored parameterValues");
    });
}());
