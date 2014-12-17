"use strict";

var dateUtils = require("../../src/date/date.js");

function validDate(date, year, month, day) {
    expect(date.getDate()).to.equal(day);
    expect(date.getMonth()).to.equal(month - 1);
    expect(date.getFullYear()).to.equal(year);
}

describe("date", function() {
    describe("parse", function() {
        it("should return dates if given dates", function() {
            var date = new Date();

            expect(dateUtils.parse(date)).to.equal(date);
        });

        it("should parse string dates to dates", function() {
            validDate(dateUtils.parse("2014-01-02"), 2014, 1, 2);
            validDate(dateUtils.parse("2014-1-2"), 2014, 1, 2);
        });

        it("should return null if unable to parse date", function() {
            expect(dateUtils.parse()).to.equal(null);
            expect(dateUtils.parse("adwd")).to.equal(null);
            expect(dateUtils.parse({ wat:"sup" })).to.equal(null);
            expect(dateUtils.parse(1412)).to.equal(null);
            expect(dateUtils.parse(1337)).to.equal(null);
            expect(dateUtils.parse(true)).to.equal(null);
            expect(dateUtils.parse(1.1)).to.equal(null);
        });
    });

    describe("isEqual", function() {
        it("should be defined", function() {
            expect(dateUtils.isEqual).to.be.a("function");
        });

        it("should work as expected", function() {
            expect(dateUtils.isEqual("2012-01-02", "2012-01-02")).to.equal(true);
            expect(dateUtils.isEqual("2012-01-02", "2012-01-03")).to.equal(false);
            expect(dateUtils.isEqual(dateUtils.parse("2012-01-02"), "2012-01-02")).to.equal(true);
            expect(dateUtils.isEqual(dateUtils.parse("2012-01-02"), dateUtils.parse("2012-01-02"))).to.equal(true);
            expect(dateUtils.isEqual(dateUtils.parse("2012-01-03"), "2012-01-02")).to.equal(false);
            expect(dateUtils.isEqual(dateUtils.parse("2012-01-02"), dateUtils.parse("2012-02-02"))).to.equal(false);
        });
    });

    describe("toString", function() {
        it("should be defined", function() {
            expect(dateUtils.toString).to.be.a("function");
        });

        it("should convert a date to a string", function() {
            expect(dateUtils.toString(dateUtils.parse("2012-03-10"))).to.equal("2012-03-10");
            expect(dateUtils.toString(dateUtils.parse("1991-1-05"))).to.equal("1991-01-05");
            expect(dateUtils.toString(dateUtils.parse("2012-4-1"))).to.equal("2012-04-01");
            expect(dateUtils.toString(dateUtils.parse("1991-12-31"))).to.equal("1991-12-31");
            expect(dateUtils.toString(dateUtils.parse("1991-1-1"))).to.equal("1991-01-01");
        });
    });

    describe("isInsideDates", function() {
        it("should be defined", function() {
            expect(dateUtils.isInsideDates).to.be.a("function");
        });

        it("should return true for dates inside range", function() {
            expect(dateUtils.isInsideDates(dateUtils.parse("2014-02-01"), "2012-01-01", "2014-02-02")).to.equal(true);
            expect(dateUtils.isInsideDates(dateUtils.parse("2014-02-02"), "2012-01-01", "2014-02-02")).to.equal(true);
            expect(dateUtils.isInsideDates(dateUtils.parse("2012-01-01"), "2012-01-01", "2014-02-02")).to.equal(true);
            expect(dateUtils.isInsideDates(dateUtils.parse("2014-02-03"), "2012-01-01", "2014-02-02")).to.equal(false);
            expect(dateUtils.isInsideDates(dateUtils.parse("2011-12-30"), "2012-01-01", "2014-02-02")).to.equal(false);

            expect(dateUtils.isInsideDates(dateUtils.parse("2014-12-20"), "2014-12-20", "2014-12-20")).to.equal(true);
            expect(dateUtils.isInsideDates(dateUtils.parse("2014-12-21"), "2014-12-20", "2014-12-20")).to.equal(false);
            expect(dateUtils.isInsideDates(dateUtils.parse("2014-12-19"), "2014-12-20", "2014-12-20")).to.equal(false);
        });

        it("should be able to skip from and to arguments", function() {
            expect(dateUtils.isInsideDates(dateUtils.parse("2014-12-20"), "2014-12-20")).to.equal(true);
            expect(dateUtils.isInsideDates(dateUtils.parse("2014-12-21"), "2014-12-20")).to.equal(true);
            expect(dateUtils.isInsideDates(dateUtils.parse("2015-12-21"), "2014-12-20")).to.equal(true);
            expect(dateUtils.isInsideDates(dateUtils.parse("2014-11-21"), "2014-12-20")).to.equal(false);

            expect(dateUtils.isInsideDates(dateUtils.parse("2014-12-20"), null, "2014-12-20")).to.equal(true);
            expect(dateUtils.isInsideDates(dateUtils.parse("2010-12-21"), null, "2014-12-20")).to.equal(true);
            expect(dateUtils.isInsideDates(dateUtils.parse("2014-12-21"), null, "2014-12-20")).to.equal(false);

            expect(dateUtils.isInsideDates(dateUtils.parse("1912-02-22"))).to.equal(true);
            expect(dateUtils.isInsideDates(dateUtils.parse("2115-12-21"))).to.equal(true);
            expect(dateUtils.isInsideDates(dateUtils.parse("2010-09-03"))).to.equal(true);
        });
    });
});
