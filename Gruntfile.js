/*jshint node:true */
module.exports = function (grunt) {
    "use strict";

    var params = {
        files: [
            'src/namespace.js',
            'src/templatingEventSpace.js',
            'src/Stringifiable.js',
            'src/Stringifier.js',
            'src/Template.js',
            'src/TemplateCollection.js',
            'src/LiveTemplate.js',
            'src/exports.js'
        ],

        test: [
            'src/jsTestDriver.conf'
        ],

        globals: {}
    };

    // invoking common grunt process
    require('common-gruntfile')(grunt, params);
};
