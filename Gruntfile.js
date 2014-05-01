"use strict";

module.exports = function(grunt) {
    require("load-grunt-tasks")(grunt);

    grunt.initConfig({
        jshint: {
            all: ["lib/**/*.js", "test/**/*.js", "Gruntfile.js"],
            options: {
                jshintrc: true
            }
        },
        browserify: {
            standalone: {
                src: "lib/bookie.js",
                dest: "bookie.js",
                options: {
                    bundleOptions: {
                        standalone: "bookie"
                    }
                }
            }
        },
        mochaTest: {
            node: {
                options: {
                    reporter: "spec",
                    require: "test/setup-mocha.js"
                },
                src: "test/bookie_test.js"
            }
        },
        karma: {
            client: {
                configFile: "karma.conf.js"
            }
        }
    });

    grunt.registerTask("build", ["browserify:standalone"]);

    grunt.registerTask("test:node", ["mochaTest:node"]);
    grunt.registerTask("test:browser", ["build", "karma:client"]);

    grunt.registerTask("test", ["jshint", "test:node", "test:browser"]);

    grunt.registerTask("default", ["test"]);
};