"use strict";

var dateUtils = require("../../../src/date/date-utils.js");

function validDate(date, year, month, day) {
    expect(date.getDate()).to.equal(day);
    expect(date.getMonth()).to.equal(month - 1);
    expect(date.getFullYear()).to.equal(year);
    expect(date.getHours()).to.equal(0);
    expect(date.getMinutes()).to.equal(0);
    expect(date.getSeconds()).to.equal(0);
    expect(date.getMilliseconds()).to.equal(0);
}

describe("dateUtils", function() {
    describe("parse", function() {
        it("should return dates without time if given dates", function() {
            var date = new Date();
            date.setTime(1332403882588); //2012-03-22
            var expectedDate = new Date();
            expectedDate.setTime(1332370800000);
            var actual = dateUtils.parse(date);
            expect(actual.getTime()).to.equal(expectedDate.getTime());
            validDate(actual, 2012, 3, 22);
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
        it("should return true if dates are equal, false otherwise", function() {
            expect(dateUtils.isEqual("2012-01-02", "2012-01-02")).to.equal(true);
            expect(dateUtils.isEqual("2012-01-02", "2012-01-03")).to.equal(false);
            expect(dateUtils.isEqual(dateUtils.parse("2012-01-02"), "2012-01-02")).to.equal(true);
            expect(dateUtils.isEqual(dateUtils.parse("2012-01-02"), dateUtils.parse("2012-01-02"))).to.equal(true);
            expect(dateUtils.isEqual(dateUtils.parse("2012-01-03"), "2012-01-02")).to.equal(false);
            expect(dateUtils.isEqual(dateUtils.parse("2012-01-02"), dateUtils.parse("2012-02-02"))).to.equal(false);
        });

        it("should return false if any date is invalid", function() {
            expect(dateUtils.isEqual(null, null)).to.equal(false);
            expect(dateUtils.isEqual(null, dateUtils.parse("2012-01-01"))).to.equal(false);
            expect(dateUtils.isEqual("2012-01-01", null)).to.equal(false);
        });
    });

    describe("stringify", function() {
        it("should convert a date to a string", function() {
            expect(dateUtils.stringify(dateUtils.parse("2012-03-10"))).to.equal("2012-03-10");
            expect(dateUtils.stringify(dateUtils.parse("1991-1-05"))).to.equal("1991-01-05");
            expect(dateUtils.stringify(dateUtils.parse("2012-4-1"))).to.equal("2012-04-01");
            expect(dateUtils.stringify(dateUtils.parse("1991-12-31"))).to.equal("1991-12-31");
            expect(dateUtils.stringify(dateUtils.parse("1991-1-1"))).to.equal("1991-01-01");
        });

        it("should parse and convert string dates to a string", function() {
            expect(dateUtils.stringify("2012-03-10")).to.equal("2012-03-10");
            expect(dateUtils.stringify("1991-1-05")).to.equal("1991-01-05");
        });

        it("should throw on invalid input", function() {
            expect(function() {
                dateUtils.stringify();
            }).to.throw();
            expect(function() {
                dateUtils.stringify(true);
            }).to.throw();
        });
    });

    describe("isInsideDates", function() {
        it("should return true for dates inside range and false otherwise", function() {
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

        it("should return false for invalid date", function() {
            expect(dateUtils.isInsideDates()).to.equal(false);
            expect(dateUtils.isInsideDates("123123")).to.equal(false);
        });
    });
});
