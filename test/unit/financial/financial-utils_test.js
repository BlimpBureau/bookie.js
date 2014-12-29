"use strict";

var financialUtils = require("../../../src/financial/financial-utils");

describe("financialUtils", function() {
    describe("vatOfPrice", function() {
        it("should return the correct vat by price exclusive vat", function() {
            expect(financialUtils.vatOfPrice(100, 0.25, false)).to.equal(25);
        });

        it("should default priceIncludingVat paramater to false", function() {
            expect(financialUtils.vatOfPrice(100, 0.25)).to.equal(25);
        });

        it("should work with float vat values", function() {
            expect(financialUtils.vatOfPrice(1, 0.1)).to.equal(0.1);
        });

        it("should return the correct vat by price inclusive vat", function() {
            expect(financialUtils.vatOfPrice(100, 0.25, true)).to.equal(20);
        });

        it("should return null on invalid input", function() {
            expect(financialUtils.vatOfPrice(false, 0.25)).to.equal(null);
            expect(financialUtils.vatOfPrice(124, NaN)).to.equal(null);
        });
    });

    describe("vatRateOfPrice", function() {
        it("should return the correct vat rate by price exlcusive vat", function() {
            expect(financialUtils.vatRateOfPrice(100, 25, false)).to.equal(0.25);
        });

        it("should default priceIncludingVat parameter to false", function() {
            expect(financialUtils.vatRateOfPrice(100, 10)).to.equal(0.1);
        });

        it("should return the correct vat rate by price inclusive vat", function() {
            expect(financialUtils.vatRateOfPrice(100, 20, true)).to.equal(0.25);
        });

        it("should return null on invalid input", function() {
            expect(financialUtils.vatRateOfPrice(false, 0.25)).to.equal(null);
            expect(financialUtils.vatRateOfPrice(124, NaN)).to.equal(null);
        });
    });

    describe("priceOfVat", function() {
        it("should return the correct price by price exclusive vat", function() {
            expect(financialUtils.priceOfVat(25, 0.25, false)).to.equal(100);
        });

        it("should default priceIncludingVat parameter to false", function() {
            expect(financialUtils.priceOfVat(10, 0.1)).to.equal(100);
        });

        it("should return the correct price by price inclusive vat", function() {
            expect(financialUtils.priceOfVat(20, 0.25, true)).to.equal(100);
            expect(financialUtils.priceOfVat(10, 0.1, true)).to.equal(110);
        });

        it("should return null on invalid input", function() {
            expect(financialUtils.priceOfVat(false, 0.25)).to.equal(null);
            expect(financialUtils.priceOfVat(124, NaN)).to.equal(null);
        });
    });
});
