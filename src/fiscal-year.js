"use strict";

var utils = require("./utils.js");

module.exports = FiscalYear;

function FiscalYear(book, from, to) {
    from = utils.parseDate(from);
    to = utils.parseDate(to);

    if(from.getTime() >= to.getTime()) {
        throw new Error("Invalid date range.");
    }

    this.book = book;
    this.from = from;
    this.to = to;
}
