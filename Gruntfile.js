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
            bookie: {
                src: ["lib/bookie.js"],
                dest: "build/bookie.js",
                options: {
                    bundleOptions: {
                        standalone: "bookie"
                    }
                }
            },
            bookieSwedishHBEF: {
                src: "lib/extensions/swedish-hb-ef.js",
                dest: "build/bookie-swedish-hb-ef.js",
                options: {
                    bundleOptions: {
                        standalone: "bookieSwedishHBEF"
                    }
                }
            }
        },
        mochaTest: {
            node: {
                options: {
                    reporter: "spec",
                    require: ["test/support/coverage/blanket.js", "test/setup-mocha.js"]
                },
                src: "test/**/*_test.js"
            },
            coverage: {
                options: {
                    reporter: "html-cov",
                    require: ["test/support/coverage/blanket.js", "test/setup-mocha.js"],
                    quiet: true,
                    captureFile: "coverage.html"
                },
                src: "test/**/*_test.js"
            }
        },
        karma: {
            client: {
                configFile: "karma.conf.js"
            }
        }
    });

    grunt.registerTask("build", ["browserify"]);

    grunt.registerTask("test:node", ["mochaTest:node"]);
    grunt.registerTask("test:browser", ["build", "karma:client"]);

    grunt.registerTask("coverage", ["mochaTest"]);

    grunt.registerTask("test", ["jshint", "test:node", "test:browser"]);

    grunt.registerTask("default", ["test"]);
};