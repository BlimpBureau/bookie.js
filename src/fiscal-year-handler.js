"use strict";

var FiscalYear = require("./fiscal-year");
var dateUtils = require("./date/date-utils");

module.exports = FiscalYearHandler;

/**
 * Handles {@link FiscalYear}s of a {@link Book} instance.
 * @constructor
 * @public
 */
function FiscalYearHandler() {
    this.fiscalYears = [];
}

/**
 * Creates a {@link FiscalYear} and adds it to the fiscal year handler. All fiscal years must be adjacent to each other.
 * @public
 * @param {date|string} from The lower inclusive bound of the fiscal year. If string, it will be parsed to a date.
 * @param {data|string} to The higher inclusive bound of the fiscal year. If string, it will be parsed to a date.
 * @returns {FiscalYear} The created fiscal year.
 * @throws If an invalid date range is given.
 */
FiscalYearHandler.prototype.create = function(from, to) {
    function oneDayDiff(first, second) {
        return (first.getTime() - second.getTime()) / (1000 * 60 * 60 * 24) === 1;
    }

    var fiscalYear = new FiscalYear(from, to);

    if(!this.fiscalYears.length) {
        this.fiscalYears.push(fiscalYear);
    } else {
        var start = _.first(this.fiscalYears).from;
        var end = _.last(this.fiscalYears).to;

        if(oneDayDiff(start, fiscalYear.to)) {
            this.fiscalYears.unshift(fiscalYear);
        } else if(oneDayDiff(fiscalYear.from, end)) {
            this.fiscalYears.push(fiscalYear);
        } else {
            throw new Error("The fiscal year must be adjacent to the current range.");
        }
    }

    return fiscalYear;
};

/**
 * Returns the {@link FiscalYear} that matches the selector.
 * @public
 * @param {number|date|string} selector If date or date string given, the fiscal year that contains the date will be returned. If selector is number it will retrieve the fiscal year at the number position in the fiscal year range (1 is first). If string, it will be parsed to a date.
 * @return {?FiscalYear} Returns the fiscal year that matched to selector. If not found null will be returned.
 */
FiscalYearHandler.prototype.get = function(selector) {
    if(_.isNumber(selector)) {
        return this.fiscalYears[selector - 1] || null;
    }

    var found = null;

    _.forEach(this.fiscalYears, function(fy) {
        if(dateUtils.isInsideDates(selector, fy.from, fy.to)) {
            found = fy;
            return false;
        }
    });

    return found;
};

/**
 * Returns all {@link FiscalYear}s in the handler.
 * @public
 * @return {FiscalYear[]} All fiscal years in the handler.
 */
 FiscalYearHandler.prototype.getAll = function() {
    return this.fiscalYears;
 };

/**
 * Gets the chronologically last {@link FiscalYear}.
 * @public
 * @returns {?FiscalYear} The chronologically last fiscal year. If no fiscal years present, null will be returned.
 */
FiscalYearHandler.prototype.getLast = function() {
    return _.last(this.fiscalYears) || null;
};
