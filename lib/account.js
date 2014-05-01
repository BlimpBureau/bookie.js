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

Account.prototype.sumDebit = function(from, to) {
    return sumTransactions(this.debits, from, to);
};

Account.prototype.sumCredit = function(from, to) {
    return sumTransactions(this.credits, from, to);
};

function sumTransactions(container, from, to) {
    from = utils.parseDate(from);
    to = utils.parseDate(to);

    function isVerificationInsideDates(v) {
        return (!from || v.date.getTime() >= from.getTime()) && (!to || v.date.getTime() <= to.getTime());
    }

    return _.reduce(container, function(sum, transcation) {
        return sum + (isVerificationInsideDates(transcation.verification) ? transcation.amount : 0);
    }, 0) || 0;
}
