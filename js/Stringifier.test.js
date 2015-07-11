/*global giant, giant, giant, giant */
/*global module, test, asyncTest, start, expect, ok, equal, strictEqual, notStrictEqual, deepEqual, notDeepEqual, raises */
(function () {
    "use strict";

    module("Stringifier");

    test("Serialization", function () {
        equal(giant.Stringifier.stringify('foo'), 'foo',
            "should return string literal for literal based format");
        equal(giant.Stringifier.stringify(), '',
            "should return empty string for undefined based format");
        equal(giant.Stringifier.stringify(null), '',
            "should return empty string for null based format");
        equal(giant.Stringifier.stringify(4), '4',
            "should return correct string for integer");
        equal(giant.Stringifier.stringify(4.667), '4.667',
            "should return correct string for float");
        equal(giant.Stringifier.stringify(true), 'true',
            "should return correct string for boolean");
        equal(giant.Stringifier.stringify({}), '[object Object]',
            "should return serialized stringifiable for stringifiable based format");
    });
}());
