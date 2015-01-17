/* jshint expr: true */

"use strict";

var dateUtils = require("../../src/date/date-utils");
var FiscalYearHandler = require("../../src/fiscal-year-handler");

describe("FiscalYearHandler", function() {
    describe("create", function() {
        it("should create fiscal years", function() {
            var fiscalYearHandler = new FiscalYearHandler();

            fiscalYearHandler.create("2012-01-01", "2012-12-31");
            expect(fiscalYearHandler.fiscalYears.length).to.equal(1);
            expect(fiscalYearHandler.fiscalYears[0].from).to.eql(dateUtils.parse("2012-01-01"));
            expect(fiscalYearHandler.fiscalYears[0].to).to.eql(dateUtils.parse("2012-12-31"));

            fiscalYearHandler.create("2011-01-01", "2011-12-31");
            expect(fiscalYearHandler.fiscalYears.length).to.equal(2);
            expect(fiscalYearHandler.fiscalYears[0].from).to.eql(dateUtils.parse("2011-01-01"));
            expect(fiscalYearHandler.fiscalYears[0].to).to.eql(dateUtils.parse("2011-12-31"));

            fiscalYearHandler.create("2009-06-01", "2010-12-31");
            expect(fiscalYearHandler.fiscalYears.length).to.equal(3);
            expect(fiscalYearHandler.fiscalYears[0].from).to.eql(dateUtils.parse("2009-06-01"));
            expect(fiscalYearHandler.fiscalYears[0].to).to.eql(dateUtils.parse("2010-12-31"));

            expect(fiscalYearHandler.fiscalYears[0].from).to.eql(dateUtils.parse("2009-06-01"));
            expect(fiscalYearHandler.fiscalYears[0].to).to.eql(dateUtils.parse("2010-12-31"));
            expect(fiscalYearHandler.fiscalYears[1].from).to.eql(dateUtils.parse("2011-01-01"));
            expect(fiscalYearHandler.fiscalYears[1].to).to.eql(dateUtils.parse("2011-12-31"));
            expect(fiscalYearHandler.fiscalYears[2].from).to.eql(dateUtils.parse("2012-01-01"));
            expect(fiscalYearHandler.fiscalYears[2].to).to.eql(dateUtils.parse("2012-12-31"));

            expect(function() {
                fiscalYearHandler.createFiscalYear("2010-01-01", "2010-12-31");
            }).to.throw(Error);

            expect(function() {
                fiscalYearHandler.createFiscalYear("2013-01-02", "2013-12-31");
            }).to.throw(Error);

            expect(function() {
                fiscalYearHandler.createVerification("", 133);
            }).to.throw(Error);
        });
    });

    describe("get", function() {
        it("should get the fiscal year that matches the selector", function() {
            var fiscalYearHandler = new FiscalYearHandler();

            fiscalYearHandler.create("2009-06-01", "2010-12-31");
            fiscalYearHandler.create("2011-01-01", "2011-12-31");
            fiscalYearHandler.create("2012-01-01", "2012-12-31");

            function test(selector, fiscalYearNumber) {
                var fy = fiscalYearHandler.get(selector);

                if(fiscalYearNumber !== null) {
                    expect(fy).to.equal(fiscalYearHandler.fiscalYears[fiscalYearNumber - 1]);
                } else {
                    expect(fy).to.equal(null);
                }
            }

            test("2012-01-01", 3);
            test("2012-04-12", 3);
            test(dateUtils.parse("2010-01-02"), 1);
            test("2013-01-01", null);
            test("2011-11-02", 2);
            test("2011-12-31", 2);
            test("2009-06-02", 1);
            test("2010-12-31", 1);

            test(1, 1);
            test(3, 3);
        });
    });

    describe("getLast", function() {
        it("should return the last fiscal year by time", function() {
            var fiscalYearHandler = new FiscalYearHandler();
            fiscalYearHandler.create("2009-06-01", "2010-12-31");
            fiscalYearHandler.create("2011-01-01", "2011-12-31");
            var last = fiscalYearHandler.create("2012-01-01", "2012-12-31");
            expect(fiscalYearHandler.getLast()).to.eql(last);

            fiscalYearHandler = new FiscalYearHandler();
            expect(fiscalYearHandler.getLast()).to.equal(null);
        });
    });

    describe("getAll", function() {
        it("should return all fiscal years in chronological order, with the lowest date as the first", function() {
            var fiscalYearHandler = new FiscalYearHandler();
            var fy0 = fiscalYearHandler.create("2009-06-01", "2010-12-31");
            var fy1 = fiscalYearHandler.create("2011-01-01", "2011-12-31");
            var fy2 = fiscalYearHandler.create("2012-01-01", "2012-12-31");
            expect(fiscalYearHandler.getAll()).to.eql([fy0, fy1, fy2]);

            fiscalYearHandler = new FiscalYearHandler();
            expect(fiscalYearHandler.getAll()).to.eql([]);
        });
    });
});
