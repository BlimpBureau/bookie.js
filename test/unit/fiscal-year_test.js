"use strict";

var fiscalYear = require("../../src/fiscal-year.js");
fiscalYear.dependencies.dateUtils = undefined;

describe("Fiscal Year", function() {
    describe("create", function() {
        it("should create new fiscal year objects", function() {
            var from = new Date(693446400000);
            var to = new Date(725068800000);

            fiscalYear.dependencies.dateUtils = {

            };

            var fiscalYear = new FiscalYear(from, to); //1991-11-23 to 1992-11-23
            expect(fiscalYear.isValid()).to.equal(true);

            fiscalYear = new FiscalYear(to, from);
            expect(fiscalYear.isValid()).to.equal(false);
        });
    });
});
