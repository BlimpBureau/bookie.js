/* global bookie:true */

"use strict";

var _ = require("lodash");

module.exports = function(options) {
    return {
        name: "SwedishHBEF",
        apply: apply.bind(null, options),
        createVerification: createVerification,
        types: types
    };
};

var types = {
    balance: "Balanskonto",
    asset: "Tillgångar",
    debt: "Eget kapital och skulder",
    result: "Resultatkonto",
    income: "Intäkter",
    expense: "Kostnader",
    ownCapital: "Eget kapital"
};

function apply(options, book) {
    options = options || {};
    var owners = options.owners || [];

    addAccounts(book, owners);
    addClassifiers(book);

    book.result = function(from, to) {
        var incomes = this.getAccounts(types.income);
        var expenses = this.getAccounts(types.expense);

        var sumIncomes = sumAccounts(incomes, false, from, to);
        var sumExpenses = sumAccounts(expenses, true, from, to);

        var result = sumIncomes - sumExpenses;

        return {
            from: from,
            to: to,
            incomes: bookie.round(sumIncomes),
            expenses: bookie.round(sumExpenses),
            result: bookie.round(result)
        };
    };

    book.balance = function(from, to) {
        var assets = this.getAccounts(types.asset);
        var debts = this.getAccounts(types.debt);

        var sumAssets = sumAccounts(assets, true, from, to);
        var sumDebts = sumAccounts(debts, false, from, to);

        var result = this.result(from, to);
        sumDebts += result.result;

        var valid = sumAssets === sumDebts ? true : false;

        return {
            from: from,
            to: to,
            assets: bookie.round(sumAssets),
            debts: bookie.round(sumDebts),
            valid: valid
        };
    };

    book.owners = owners;
}

function createVerification(verification, owners) {
    verification.owners = parseOwnersShare(verification.book, owners);
}

function parseOwnersShare(book, ownersObject) {
    var owners = {};

    if(!ownersObject || (_.isArray(ownersObject) && !ownersObject.length)) {
        var share = 1 / book.owners.length;

        _.forEach(book.owners, function(owner) {
            owners[owner] = share;
        });

        return owners;
    }

    _.forEach(book.owners, function(owner) {
        owners[owner] = 0;
    });

    if(_.isArray(ownersObject)) {
        for(var i = 0; i < book.owners.length; i++) {
            owners[book.owners[i]] = ownersObject[i] || 0;
        }
    } else {
        _.forEach(book.owners, function(owner) {
            owners[owner] = ownersObject[owner] || 0;
        });
    }

    //Validate
    if(_.isEqual(_.keys(owners), book.owners)) {
        throw new Error("Invalid format.");
    }

    var sum = _.reduce(owners, function(sum, share) {
        return sum + share;
    });

    if(sum !== 1) {
        throw new Error("Invalid share distribution.");
    }

    return owners;
}

function addAccounts(book, owners) {
    function createOwnCapitalAccounts() {
        if(owners.length > 9) {
            throw new Error("9 is the maximum number of owners.");
        }

        if(owners.length === 0) {
            book.createAccount(2010, "Eget kapital");
            return;
        }

        var n = 10;
        _.forEach(owners, function(owner) {
            book.createAccount(2000 + n, "Eget kapital " + owner.name);
            n += n;
        });
    }

    //More to come.

    book.createAccount(1500, "Kundfordringar");
    book.createAccount(1930, "Bank");

    createOwnCapitalAccounts(); //2010 - 2090
    book.createAccount(2440, "Leverantörsskulder");
    book.createAccount(2610, "Utgående moms 25 %");
    book.createAccount(2615, "Moms varuförvärv EU 25 %");
    book.createAccount(2640, "Ingående moms 25 %");
    book.createAccount(2645, "Ingående moms utland");
    book.createAccount(2650, "Moms redovisningskonto");

    book.createAccount(3000, "Momspliktiga intäkter");

    book.createAccount(4000, "Varor");
    book.createAccount(4056, "Inköp varor EU 25 %");
    book.createAccount(5400, "Förbrukningsinventarier");
    book.createAccount(6070, "Representation");
    book.createAccount(6100, "Kontorsmaterial och trycksaker");
    book.createAccount(6200, "Tele och post");
    book.createAccount(6300, "Försäkringar");
    book.createAccount(6500, "Övriga externa tjänster");
    book.createAccount(6570, "Bankavgifter");

    book.createAccount(8999, "Årets resultat");
}

function addClassifiers(book) {
    book.addClassifier(types.balance, between(1000, 3000));
    book.addClassifier(types.asset, between(1000, 2000));
    book.addClassifier(types.debt, between(2000, 3000));

    book.addClassifier(types.result, between(3000, 8000));
    book.addClassifier(types.income, between(3000, 4000));
    book.addClassifier(types.expense, between(4000, 8000));

    book.addClassifier(types.ownCapital, between(2010, 2050));
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