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

        it("should throw on invalid input", function() {
            expect(function() {
                financialUtils.vatOfPrice(false, 0.25);
            }).to.throw();
            expect(function() {
                financialUtils.vatOfPrice(124, NaN);
            }).to.throw();
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

        it("should throw on invalid input", function() {
            expect(function() {
                financialUtils.vatRateOfPrice(false, 0.25);
            }).to.throw();
            expect(function() {
                financialUtils.vatRateOfPrice(124, NaN);
            }).to.throw();
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

        it("should throw on invalid input", function() {
            expect(function() {
                financialUtils.priceOfVat(false, 0.25);
            }).to.throw();
            expect(function() {
                financialUtils.priceOfVat(124, NaN);
            }).to.throw();
        });
    });
});
