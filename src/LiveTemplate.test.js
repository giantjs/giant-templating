(function () {
    "use strict";

    module("LiveTemplate");

    test("Instantiation", function () {
        var template = $templating.LiveTemplate.create('foo');
        deepEqual(template.parameterValues, {}, "should set parameterValues property");
        ok(template.eventPath.equals(['template', template.instanceId].toPath()), "should set event path");
    });

    test("Conversion from string", function () {
        var template = 'foo'.toLiveTemplate();

        ok(template.isA($templating.LiveTemplate), "should return LiveTemplate instance");
        deepEqual(template.parameterValues, {}, "should set parameterValues property");
    });

    test("Parameter value addition", function () {
        var template = 'foo {{bar}} baz'.toLiveTemplate();

        function onParameterValuesChange (event) {
            deepEqual(event.payload.parameterValuesBefore, {
            }, "should set parameterValuesBefore on event");
            deepEqual(event.payload.parameterValuesAfter, {
                '{{bar}}': "Hello World"
            }, "should set parameterValuesAfter on event");
        }

        template.subscribeTo($templating.EVENT_TEMPLATE_PARAMETER_VALUES_CHANGE, onParameterValuesChange);

        strictEqual(template.setParameterValues({
            '{{bar}}': "Hello World"
        }), template, "should be chainable");

        template.unsubscribeFrom($templating.EVENT_TEMPLATE_PARAMETER_VALUES_CHANGE, onParameterValuesChange);

        deepEqual(template.parameterValues, {
            '{{bar}}': "Hello World"
        }, "should add parameter values to template's parameterValues buffer");
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
                });

        function onParameterValuesChange (event) {
            deepEqual(event.payload.parameterValuesBefore, {
                '{{bar}}': "Hello World"
            }, "should set parameterValuesBefore on event");
            deepEqual(event.payload.parameterValuesAfter, {
            }, "should set parameterValuesAfter on event");
        }

        template.subscribeTo($templating.EVENT_TEMPLATE_PARAMETER_VALUES_CHANGE, onParameterValuesChange);

        strictEqual(template.clearParameterValues(), template, "should be chainable");

        template.unsubscribeFrom($templating.EVENT_TEMPLATE_PARAMETER_VALUES_CHANGE, onParameterValuesChange);

        deepEqual(template.parameterValues, {}, "should empty parameterValues buffer");
    });

    test("Serialization", function () {
        var template = 'foo {{bar}} baz'.toLiveTemplate()
            .setParameterValues({
                '{{bar}}': "Hello World"
            });

        equal(template.toString(), "foo Hello World baz", "should return template resolved with stored parameterValues");
    });
}());
