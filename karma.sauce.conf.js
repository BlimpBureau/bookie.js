/* global process:false */

"use strict";

var sharedConfig = require("./karma.conf.js");

module.exports = function(config) {
    sharedConfig(config);

    // define SL browsers
    var customLaunchers = {
        "SL_CHROME_LATEST_OSX": {
            base: "SauceLabs",
            platform: "Mac 10.9",
            browserName: "chrome",
            version: "34"
        },
        "SL_CHROME_LATEST_WINDOWS": {
            base: "SauceLabs",
            platform: "Windows 8.1",
            browserName: "chrome",
            version: "35"
        },
        "SL_CHROME_LATEST_LINUX": {
            base: "SauceLabs",
            platform: "Linux",
            browserName: "chrome",
            version: "35"
        },

        //Firefox

        "SL_FIREFOX_LATEST_OSX": {
            base: "SauceLabs",
            platform: "Mac 10.9",
            browserName: "firefox",
            version: "28"
        },
        "SL_FIREFOX_LATEST_WINDOWS": {
            base: "SauceLabs",
            platform: "Windows 8.1",
            browserName: "firefox",
            version: "29"
        },
        "SL_FIREFOX_LATEST_LINUX": {
            base: "SauceLabs",
            platform: "Linux",
            browserName: "firefox",
            version: "29"
        },

        //Safari

        "SL_SAFARI_LATEST_OSX": {
            base: "SauceLabs",
            platform: "Mac 10.9",
            browserName: "safari",
            version: "7"
        },
        "SL_SAFARI_LATEST_WINDOWS": {
            base: "SauceLabs",
            platform: "Windows 7",
            browserName: "safari",
            version: "5"
        },

        //IE

        "SL_IE_LATEST_WINDOWS": {
            base: "SauceLabs",
            platform: "Windows 8.1",
            browserName: "internet explorer",
            version: "11"
        },

            //Opera
        "SL_OPERA_LATEST_WINDOWS": {
            base: "SauceLabs",
            platform: "Windows 7",
            browserName: "opera",
            version: "12"
        },
        "SL_OPERA_LATEST_LINUX": {
            base: "SauceLabs",
            platform: "Linux",
            browserName: "opera",
            version: "12"
        }
    };

    config.set({
        autoWatch: false,

        reporters: ["dots", "saucelabs"],

          // If browser does not capture in given timeout [ms], kill it
        captureTimeout: 120000,

        sauceLabs: {
            testName: "bookie.js",
            recordScreenshots: false,
            startConnect: false,
            tunnelIdentifier: process.env.SAUCE_TUNNEL_ID
        },

        customLaunchers: customLaunchers,
        singleRun: true
    });
};
