/*global dessert, troop, sntls, rubberband */
/*global module, test, asyncTest, start, expect, ok, equal, strictEqual, notStrictEqual, deepEqual, notDeepEqual, raises */
(function () {
    "use strict";

    module("Stringifier");

    test("Serialization", function () {
        equal(rubberband.Stringifier.stringify('foo'), 'foo',
            "should return string literal for literal based format");
        equal(rubberband.Stringifier.stringify(), '',
            "should return empty string for undefined based format");
        equal(rubberband.Stringifier.stringify(null), '',
            "should return empty string for null based format");
        equal(rubberband.Stringifier.stringify(4), '4',
            "should return correct string for integer");
        equal(rubberband.Stringifier.stringify(4.667), '4.667',
            "should return correct string for float");
        equal(rubberband.Stringifier.stringify(true), 'true',
            "should return correct string for boolean");
        equal(rubberband.Stringifier.stringify({}), '[object Object]',
            "should return serialized stringifiable for stringifiable based format");
    });
}());
