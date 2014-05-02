"use strict";

var _ = require("lodash");

var TYPE_BALANCE = "Balanskonto";
var TYPE_ASSET = "Tillgångar";
var TYPE_DEBT = "Eget kapital och skulder";
var TYPE_RESULT = "Resultatkonto";
var TYPE_INCOME = "Intäkter";
var TYPE_EXPENSE = "Kostnader";

exports = {
    name: "swedish-ef-hb",
    apply: extension
};

function extension(book) {
    book.addClassifier(TYPE_BALANCE, between(1000, 3000));
    book.addClassifier(TYPE_ASSET, between(1000, 2000));
    book.addClassifier(TYPE_DEBT, between(2000, 3000));

    book.addClassifier(TYPE_RESULT, between(3000, 8000));
    book.addClassifier(TYPE_INCOME, between(3000, 4000));
    book.addClassifier(TYPE_EXPENSE, between(4000, 8000));

    book.balance = function(from, to) {
        var assets = book.getAccounts(TYPE_ASSET);
        var debts = book.getAccounts(TYPE_DEBT);

        var sumAssets = sumAccounts(assets);
        var sumDebts = sumDebts(debts);

        var valid = sumAssets === sumDebts ? true : false;

        return {
            from: from,
            to: to,
            assets: sumAssets,
            debts: sumDebts,
            valid: valid
        };
    };
}

function between(from, to) {
    return function(account) {
        return account.number >= from && account.number < to;
    };
}

function sumAccounts(accounts, positiveDebit, from, to) {
    return _.reduce(accounts, function(sum, account) {
        var diff = account.sumDebit(from, to) - account.sumCredit(from, to);

        if(!positiveDebit) {
            diff = -diff;
        }

        return sum + diff;
    }, 0);
}