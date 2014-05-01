var _ = require("lodash");
var utils = require("./utils.js");

module.exports = Verification;

function Verification(book, date, text) {
    if(!book) {
        throw new Error("Invalid book.");
    }

    if(!_.isDate(date) || !_.isString(text)) {
        throw new Error("A verification must have a date and a text.");
    }

    this.book = book;
    this.date = date;
    this.text = text;
    this.number = book.getNextVerificationNumber();

    this.debits = [];
    this.credits = [];
}

function accountTransaction(verification, type, account, amount) {
    var book = verification.book;

    if(_.isNumber(account)) {
        var accountnr = account;
        account = book.getAccount(account);

        if(!account) {
            throw new Error("Invalid account: " + accountnr);
        }
    }

    if(!account || account.book !== book) {
        throw new Error("Invalid account. Book of account and the verification needs to be the same.");
    }

    amount = utils.round(amount);

    if(amount <= 0) {
        throw new Error("Amount cannot be less or equal to zero.");
    }

    var vContainer = verification[type + "s"];
    var aContainer = account[type + "s"];

    vContainer.push({
        account: account,
        amount: amount
    });

    aContainer.push({
        verification: verification,
        amount: amount
    });
}

/**
 * Debits an account in the verification.
 * @param {Account | Number} account The account to debit. If number, the account will be fetched from the book.
 */
Verification.prototype.debit = function(account, amount) {
    accountTransaction(this, "debit", account, amount);
    return this;
}

/**
 * Credits an account in the verification.
 * @param {Account | Number} account The account to credit. If number, the account will be fetched from the book.
 */
Verification.prototype.credit = function(account, amount) {
    accountTransaction(this, "credit", account, amount);
    return this;
}

/**
 * Checks so that the sum of credit amounts equal the sum of debit amounts.
 * @return {bool} True if the verification is balanced. False otherwise.
 */
Verification.prototype.isBalancedCreditDebit = function() {
    return sumTransactions(this.debits) === sumTransactions(this.credits);
}

function sumTransactions(container) {
    return _.reduce(container, function(sum, transaction) {
        return sum + transaction.amount;
    }, 0);
}
