"use strict";

var _ = require("lodash");

module.exports = {
    name: "SwedishHBEF",
    apply: apply,
    types: types
};

var types = {
    balance: "Balanskonto",
    asset: "Tillgångar",
    debt: "Eget kapital och skulder",
    result: "Resultatkonto",
    income: "Intäkter",
    expense: "Kostnader"
};

function apply(book) {
    book.addClassifier(types.balance, between(1000, 3000));
    book.addClassifier(types.asset, between(1000, 2000));
    book.addClassifier(types.debt, between(2000, 3000));

    book.addClassifier(types.result, between(3000, 8000));
    book.addClassifier(types.income, between(3000, 4000));
    book.addClassifier(types.expense, between(4000, 8000));

    book.balance = function(from, to) {
        var assets = book.getAccounts(types.asset);
        var debts = book.getAccounts(types.debts);

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