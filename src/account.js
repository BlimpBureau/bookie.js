"use strict";

var _ = require("lodash");
var dateUtils = require("./date/date-utils.js");

module.exports = Account;

/**
 * Represents an account in a bookkeeping {@link Book}.
 * @constructor
 * @public
 * @param {Book} book The book that the account belongs to.
 * @param {number} number The account number. Should be unique in the context of the book.
 * @param {string} name The name (description) of the account. Should be unique in the context of the book.
 */
function Account(book, number, name) {
    if(!book) {
        throw new Error("Invalid book.");
    }

    if(!_.isNumber(number) || !_.isString(name)) {
        throw new Error("An account must have a number and a name.");
    }

    this.book = book;
    this.number = number;
    this.name = name;

    this.debits = [];
    this.credits = [];
}

/**
 * Sums all debit verifications in this account by the given date range and filter.
 * @public
 * @param {?(date|string)} from The lower inclusive bound of the range limit. Null means no lower range limit. If string, it will be parsed to a date.
 * @param {?(date|string)} to The higher inclusive bound of the range limit. Null means no higher range limit. If string, it will be parsed to a date.
 * @param {?function} filter The filter function that also should be applied to filtering the verifications to be summed.
 * @returns {number} The sum of all debit verifications that were filtered by the parameters.
 */
Account.prototype.sumDebit = function(from, to, filter) {
    return sumTransactions(this.debits, from, to, filter);
};

/**
 * Sums all credit verifications in this account by the given date range and filter.
 * @public
 * @param {?(date|string)} from The lower inclusive bound of the range limit. Null means no lower range limit. If string, it will be parsed to a date.
 * @param {?(date|string)} to The higher inclusive bound of the range limit. Null means no higher range limit. If string, it will be parsed to a date.
 * @param {?function} filter The filter function that also should be applied to filtering the verifications to be summed.
 * @returns {number} The sum of all credit verifications that were filtered by the parameters.
 */
Account.prototype.sumCredit = function(from, to, filter) {
    return sumTransactions(this.credits, from, to, filter);
};

function sumTransactions(container, from, to, filter) {
    function noFilter(transaction) {
        return transaction.amount;
    }

    from = dateUtils.parse(from);
    to = dateUtils.parse(to);
    filter = filter || noFilter;

    return _.reduce(container, function(sum, transaction) {
        return sum + (dateUtils.isInsideDates(transaction.verification.date, from, to) ? filter(transaction) : 0);
    }, 0) || 0;
}
