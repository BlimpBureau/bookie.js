"use strict";

var _ = require("lodash");
var utils = require("./utils.js");

exports.exportBook = exportBook;
exports.exportAccount = exportAccount;
exports.exportVerification = exportVerification;

function exportBook(bookie, book, skipHeader) {
    var output = {};

    if(!skipHeader) {
        output = header(bookie, "book");
    }

    output.accounts = _.map(book.accounts, function(account) {
        return exportAccount(bookie, account, true);
    });

    output.verifications = _.map(book.verifications, function(verification) {
        return exportVerification(bookie, verification, true);
    });

    output.extensions = _.map(book.extensions, function(extension) {
        return extension.name;
    });

    return output;
}

function exportAccount(bookie, account, skipHeader) {
    var output = {};

    if(!skipHeader) {
        output = header(bookie, "account");
    }

    output.number = account.number;
    output.name = account.name;
    
    output.debits = _.map(account.debits, function(debit) {
        return {
            verification: debit.verification.number,
            amount: debit.amount
        };
    });

    output.credits = _.map(account.credits, function(credit) {
        return {
            verification: credit.verification.number,
            amount: credit.amount
        };
    });

    return output;
}

function exportVerification(bookie, verification, skipHeader) {
    var output = {};

    if(!skipHeader) {
        output = header(bookie, "verification");
    }

    output.number = verification.number;
    output.date = utils.dateToString(verification.date);
    output.text = verification.text;

    output.debits = _.map(verification.debits, function(debit) {
        return {
            account: debit.account.number,
            amount: debit.amount
        };
    });

    output.credits = _.map(verification.credits, function(credit) {
        return {
            account: credit.account.number,
            amount: credit.amount
        };
    });

    return output;
}

function header(bookie, type) {
    return {
        _format: "bookie." + type,
        _version: bookie.version
    };
}