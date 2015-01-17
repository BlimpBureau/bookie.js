"use strict";

var dateUtils = require("./date/date-utils");

module.exports = FiscalYear;

/**
 * Represents a fiscal year range in a bookkeeping {@link Book}.
 * @Constructor
 * @public
 * @param {date|string} from The inclusive start range of the fiscal year. If string, it will be parsed to a date.
 * @param {date|string} to The inclusive end range of the fiscal year. If string, it will be parsed to a date.
 */
function FiscalYear(from, to) {
    from = dateUtils.parse(from);
    to = dateUtils.parse(to);

    if(from.getTime() >= to.getTime()) {
        throw new Error("Invalid date range.");
    }

    this.from = from;
    this.to = to;
}
