"use strict";

var numberUtils = require("../../../src/financial/number-utils.js");

describe("numberUtils", function() {
    describe("isValidNumber", function() {
        it("should return true for only numbers that are not NaN", function() {
            expect(numberUtils.isValidNumber()).to.equal(false);
            expect(numberUtils.isValidNumber(true)).to.equal(false);
            expect(numberUtils.isValidNumber("hello")).to.equal(false);
            expect(numberUtils.isValidNumber(NaN)).to.equal(false);

            expect(numberUtils.isValidNumber(13)).to.equal(true);
            expect(numberUtils.isValidNumber(13.37)).to.equal(true);
            expect(numberUtils.isValidNumber(0)).to.equal(true);
            expect(numberUtils.isValidNumber(0.31313)).to.equal(true);
        });
    });

    describe("isDecimalPercent", function() {
        it("should return true for only decimal percent in the inclusive range 0 to 1", function() {
            expect(numberUtils.isDecimalPercent()).to.equal(false);
            expect(numberUtils.isDecimalPercent(13)).to.equal(false);
            expect(numberUtils.isDecimalPercent(14.41)).to.equal(false);
            expect(numberUtils.isDecimalPercent(-0.1)).to.equal(false);
            expect(numberUtils.isDecimalPercent(1.001)).to.equal(false);

            expect(numberUtils.isDecimalPercent(0)).to.equal(true);
            expect(numberUtils.isDecimalPercent(0.1)).to.equal(true);
            expect(numberUtils.isDecimalPercent(1)).to.equal(true);
        });
    });

    describe("isEqual", function() {
        it("should return true only for equal numbers by the given precision", function() {
            expect(numberUtils.isEqual()).to.equal(false);
            expect(numberUtils.isEqual(true, true)).to.equal(false);
            expect(numberUtils.isEqual(13, 14)).to.equal(false);
            expect(numberUtils.isEqual(14, 13)).to.equal(false);

            expect(numberUtils.isEqual(13, 13)).to.equal(true);
            expect(numberUtils.isEqual(0.00012, 0.0012, 0.1)).to.equal(true);
            expect(numberUtils.isEqual(0.1, 0.1, 0)).to.equal(true);
            expect(numberUtils.isEqual(0.1, 0.2), 0).to.equal(false);
        });
    });

    describe("round", function() {
        it("should round numbers to the set decimals", function() {
            expect(numberUtils.round(19.3141)).to.equal(19.31);
            expect(numberUtils.round(15.5)).to.equal(15.5);
            expect(numberUtils.round(15.555)).to.equal(15.56);
            expect(numberUtils.round(0.001)).to.equal(0);

            expect(numberUtils.round(19.3141, 1)).to.equal(19.3);
            expect(numberUtils.round(15.5, 1)).to.equal(15.5);
            expect(numberUtils.round(15.555, 1)).to.equal(15.6);
            expect(numberUtils.round(0.001, 1)).to.equal(0);

            expect(numberUtils.round(19.3141, 0)).to.equal(19);
            expect(numberUtils.round(15.5, 0)).to.equal(16);
            expect(numberUtils.round(15.555, 0)).to.equal(16);
            expect(numberUtils.round(0.001, 0)).to.equal(0);
        });

        it("should be able to round really big numbers", function() {
            expect(numberUtils.round(1031313124120102401204102412401204102.121241512, 3)).to.equal(1031313124120102401204102412401204102.121);
            expect(numberUtils.round(1031313124120102401204102412401204114124124125125151251251202.1399, 3)).to.equal(1031313124120102401204102412401204114124124125125151251251202.14);
        });

        it("should throw on invalid number and decimal", function() {
            expect(function() {
                numberUtils.round(true);
            }).to.throw();
            expect(function() {
                numberUtils.round(new Date());
            }).to.throw();
            expect(function() {
                numberUtils.round(13, 13.37);
            }).to.throw();
        });
    });
});
