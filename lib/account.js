"use strict";

var _ = require("lodash");
var utils = require("./utils.js");

module.exports = Account;

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

Account.prototype.sumDebit = function(from, to, filter) {
    return sumTransactions(this.debits, from, to, filter);
};

Account.prototype.sumCredit = function(from, to, filter) {
    return sumTransactions(this.credits, from, to, filter);
};

function sumTransactions(container, from, to, filter) {
    function noFilter(transaction) {
        return transaction.amount;
    }

    from = utils.parseDate(from);
    to = utils.parseDate(to);
    filter = filter || noFilter;

    return _.reduce(container, function(sum, transaction) {
        return sum + (utils.insideDates(transaction.verification.date, from, to) ? filter(transaction) : 0);
    }, 0) || 0;
}
