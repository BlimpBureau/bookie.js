/* global process:false */

"use strict";

function registerSauceBrowsers(config, sauceBrowsers, configFile) {
    function capitalize(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    var karma = config.karma;

    var tasks = [];

    for(var key in sauceBrowsers) {
        if(sauceBrowsers.hasOwnProperty(key)) {
            var parts = key.toLowerCase().split("_");
            var name = "sauce" + capitalize(parts[0]) + capitalize(parts[1]);

            var configObject = {
                configFile: configFile,
                options: {
                    browsers: sauceBrowsers[key]
                }
            };

            karma[name] = configObject;

            tasks.push("karma:" + name);
        }
    }

    return tasks;
}

module.exports = function(grunt) {
    require("load-grunt-tasks")(grunt);

    var config = {
        pkg: grunt.file.readJSON("package.json"),
        banner: "/*!\n" +
                " * bookie.js <%= pkg.version %> (<%= grunt.template.today('yyyy-mm-dd, HH:MM') %>)\n" +
                " * <%= pkg.homepage %>\n" +
                " * Licensed under <%= pkg.license %>\n" +
                " */\n",
        jshint: {
            all: ["src/**/*.js", "test/**/*.js", "*.js"],
            options: {
                jshintrc: true
            }
        },
        jscs: {
            src: ["src/**/*.js", "test/**/*.js", "*.js", "*.json", ".jshintrc"],
            options: {
                config: ".jscs.json"
            }
        },
        browserify: {
            bookie: {
                src: ["src/bookie.js"],
                dest: "build/bookie.js",
                options: {
                    bundleOptions: {
                        standalone: "bookie"
                    }
                }
            },
            bookieSwedishHBEF: {
                src: "src/extensions/swedish-hb-ef.js",
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
                    require: ["test/setup-mocha.js"]
                },
                src: "test/**/*_test.js"
            },
            coverage: {
                options: {
                    reporter: "html-cov",
                    require: ["test/setup-mocha.js"],
                    quiet: true,
                    captureFile: "coverage.html"
                },
                src: "test/**/*_test.js"
            }
        },
        karma: {
            local: {
                configFile: "karma.conf.js",
                options: {
                    browsers: ["Chrome", "Safari", "Firefox"]
                }
            }
        },
        "sauce_connect": {
            options: {
                username: process.env.SAUCE_USERNAME,
                accessKey: process.env.SAUCE_ACCESS_KEY,
                tunnelIdentifier: process.env.SAUCE_TUNNEL_ID
            },
            tunnel: {}
        },
        "update_json": {
            bower: {
                src: "package.json",
                dest: "bower.json",
                fields: [
                    "name",
                    "version",
                    "homepage",
                    "authors",
                    "description",
                    "license",
                    "repository",
                    "dependencies",
                    "devDependencies"
                ]
            }
        },
        copy: {
            dist: {
                cwd: "build/",
                expand: true,
                src: "**/*",
                dest: "dist/"
            }
        },
        uglify: {
            dist: {
                "dist/bookie.js.min": "dist/bookie.js",
                "dist/swedish-hb-ef.js": "dist/swedish-hb-ef.js.min"
            }
        },
        usebanner: {
            dist: {
                options: {
                    position: "top",
                    banner: "<%= banner %>"
                },
                files: {
                    src: "dist/**/*"
                }
            }
        }
    };

    var sauceBrowsers = {
        "CHROME_LATEST": ["SL_CHROME_LATEST_OSX", "SL_CHROME_LATEST_WINDOWS", "SL_CHROME_LATEST_LINUX"],
        "FIREFOX_LATEST": ["SL_FIREFOX_LATEST_OSX", "SL_FIREFOX_LATEST_WINDOWS", "SL_FIREFOX_LATEST_LINUX"],
        "SAFARI_LATEST": ["SL_SAFARI_LATEST_OSX", "SL_SAFARI_LATEST_WINDOWS"],
        "OPERA_LATEST": ["SL_OPERA_LATEST_WINDOWS", "SL_OPERA_LATEST_LINUX"],
        "IE_LATEST": ["SL_IE_LATEST_WINDOWS"]
    };

    var sauceBrowserTasks = registerSauceBrowsers(config, sauceBrowsers,"karma.sauce.conf.js");

    grunt.initConfig(config);

    grunt.registerTask("sauceConnect:start", ["checkSauceConnectEnv", "sauce_connect"]);
    grunt.registerTask("sauceConnect:stop", ["sauce-connect-close"]);

    grunt.registerTask("build", ["browserify"]);
    grunt.registerTask("dist", ["copy:dist", "uglify:dist", "usebanner:dist"]);

    grunt.registerTask("test:node", ["mochaTest:node"]);
    grunt.registerTask("test:local", ["build", "karma:local"]);
    grunt.registerTask("test:sauce", ["build", "checkSauceConnectEnv"].concat(sauceBrowserTasks));

    grunt.registerTask("coverage", ["mochaTest"]);

    grunt.registerTask("test:style", ["jshint", "jscs"]);

    grunt.registerTask("test", ["test:style", "test:node", "build", "karma:local"]);
    grunt.registerTask("test:full", ["test:style", "test:node", "build", "karma:local", "test:sauce"]);

    grunt.registerTask("ci", ["jshint", "jscs", "build", "test:node", "sauceConnect:start", "test:sauce", "sauceConnect:stop"]);

    grunt.registerTask("default", ["test"]);

    grunt.registerTask("checkSauceConnectEnv", "Checks so all env variables are set for sauce connect.", function() {
        if(!process.env.SAUCE_USERNAME) {
            grunt.log.error("env SAUCE_USERNAME needs to be set.");
            return false;
        }

        if(!process.env.SAUCE_ACCESS_KEY) {
            grunt.log.error("env SAUCE_ACCESS_KEY needs to be set.");
            return false;
        }

        if(!process.env.SAUCE_TUNNEL_ID) {
            grunt.log.writeln("env SAUCE_TUNNEL_ID needs to be set.");
            return false;
        }
    });
};
