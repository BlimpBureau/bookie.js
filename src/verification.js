"use strict";

var _ = require("lodash");
var numberUtils = require("./financial/number-utils");

module.exports = Verification;

/**
 * Represents a verification in a bookkepping {@link Book}.
 * @Constructor
 * @public
 * @param {Book} book The book that the verifiation belongs to.
 * @param {date|string} date The date that the verification happened. If string the date will be parsed.
 * @param {string} text The text (description) of the verification. Should describe what this verification represents.
 */
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

/**
 * Debits an account in the verification.
 * @public
 * @param {Account|number} account The account to debit. If number, the account will be fetched from the book.
 * @param {number} amount The amount to be debited from the given account.
 * @returns {Verification} This instance for chaining.
 */
Verification.prototype.debit = function(account, amount) {
    accountTransaction(this, "debit", account, amount);
    return this;
};

/**
 * Credits an account in the verification.
 * @public
 * @param {Account|number} account The account to credit. If number, the account will be fetched from the book.
 * @returns {Verification} This instance for chaining.
 */
Verification.prototype.credit = function(account, amount) {
    accountTransaction(this, "credit", account, amount);
    return this;
};

/**
 * Checks so that the verification is balanced. It is balanced if the sum of credit amounts equal the sum of debit amounts.
 * @public
 * @return {boolean} True if the verification is balanced. False otherwise.
 */
Verification.prototype.isBalancedCreditDebit = function() {
    return numberUtils.isEqual(sumTransactions(this.debits), sumTransactions(this.credits));
};

/**
 * Tells if the verification has a transaction on the given account.
 * @public
 * @param {Account|number} account The account to check if a transaction exists for this verification. If number, the account will be fetched from the book.
 * @return {boolean} True if a transaction of the given account exists for this verification.
 */
Verification.prototype.touches = function(account) {
    function inContainer(container, account) {
        var found = false;

        _.forEach(container, function(transaction) {
            if(transaction.account === account) {
                found = true;
                return false;
            }
        });

        return found;
    }

    account = _.isNumber(account) ? this.book.getAccount(account) : account;

    return inContainer(this.debits, account) || inContainer(this.credits, account);
};

function sumTransactions(container) {
    return _.reduce(container, function(sum, transaction) {
        return sum + transaction.amount;
    }, 0);
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

    amount = numberUtils.round(amount);

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
