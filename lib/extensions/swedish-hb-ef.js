/* global bookie:true */

"use strict";

var _ = require("lodash");

module.exports = function(options) {
    return {
        name: "SwedishHBEF",
        apply: apply.bind(null, options),
        createVerification: createVerification,
        createFiscalYear: createFiscalYear,
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


    if(owners.length > 4) {
        throw new Error("More than 4 owners currently not supported.");
    }

    addAccounts(book, owners);
    addClassifiers(book, owners);

    book.result = function(from, to) {
        function ownerFilter(owner) {
            return function(transaction) {
                return transaction.amount * transaction.verification.owners[owner.name];
            };
        }

        var output = {};

        if(from) {
            output.from = from;
        }

        if(to) {
            output.to = to;
        }

        var incomes = this.getAccounts(types.income);
        var expenses = this.getAccounts(types.expense);

        var sumIncomes = sumAccounts(incomes, false, from, to);
        var sumExpenses = sumAccounts(expenses, true, from, to);

        var result = sumIncomes - sumExpenses;

        output.incomes = bookie.round(sumIncomes);
        output.expenses = bookie.round(sumExpenses);
        output.result = bookie.round(result);

        if(!this.singleOwner()) {
            var resultShare = {};

            _.forEach(this.owners, function(owner) {
                var ownerIncomes = sumAccounts(incomes, false, from, to, ownerFilter(owner));
                var ownerExpenses = sumAccounts(expenses, true, from, to, ownerFilter(owner));

                resultShare[owner.name] = bookie.round(ownerIncomes - ownerExpenses);
            });

            output.resultShare = resultShare;
        }

        return output;
    };

    book.balance = function(to) {
        function getPreviousBalance() {}

        // function resultVerificationFilter(transaction) {
        //     return transaction.verification.touches(8999) ? 0 : transaction.amount;
        // }

        function isFullFiscal() {
            return bookie.isDatesEqual(fiscalYear.to, to);
        }

        var output = {};

        var fiscalYear = book.getFiscalYear(to) || book.getLastFiscalYear();

        to = to || fiscalYear.to;

        if(to) {
            output.to = _.isString(to) ? to : bookie.dateToString(to);
        }


        var previousBalance = getPreviousBalance(this, fiscalYear.from);
        var ingoingOwnCapital = previousBalance ? previousBalance.ownCapital.outgoing : 0;

        var sumAssets = sumAccounts(this.getAccounts(types.asset), true, null, to);
        var sumOwnCapital = sumAccounts(this.getAccounts(types.ownCapital), false, null, to);
        var sumDebts = sumAccounts(this.getAccounts(types.debt), false, null, to) - sumOwnCapital;

        output.assets = bookie.round(sumAssets);
        output.debts = bookie.round(sumDebts);

        var ownCapital = sumOwnCapital;

        var result;

        if(!fiscalYear.isEnded() || !isFullFiscal()) {
            result = this.result(fiscalYear.from, to);
            ownCapital += result.result;
        }
        
        output.ownCapital = {
            ingoing: ingoingOwnCapital,
            outgoing: bookie.round(ownCapital)
        };

        var valid = bookie.isAmountsEqual(sumAssets, sumDebts + ownCapital);

        if(!this.singleOwner()) {
            var ownCapitalShare = {};

            var n = 1;
            _.forEach(this.owners, function(owner) {
                ownCapitalShare[owner.name] = {
                    ingoing: previousBalance ? previousBalance.ownCapitalShare[owner.name].outgoing : 0,
                    outgoing: bookie.round(sumAccounts(this.getAccounts(types["ownCapitalOwner" + n]), false, fiscalYear.from, to) + (result ? result.resultShare[owner.name] : 0))
                };

                n++;
            }, this);

            output.ownCapitalShare = ownCapitalShare;

            var ownerShareSum = bookie.round(_.reduce(ownCapitalShare, function(sum, share) {
                return sum + share.outgoing;
            }, 0));

            if(ownerShareSum !== output.ownCapital.outgoing) {
                valid = false;
            }
        }

        output.valid = valid;

        return output;
    };

    book.getIncomingBalances = function(fiscalYear) {
        fiscalYear = this.getFiscalYear(fiscalYear);

        var balance = this.balance(null, fiscalYear.to);

        var output = {};

        if(this.singleOwner()) {
            output.ownCapital = balance.ownCapital;
        } else {
            output.ownCapital = {};

            _.forEach(balance.ownCapitalShare, function(ownerShare, key) {
                output.ownCapital[key] = ownerShare.outgoing;
            });
        }

        return output;
    };

    book.singleOwner = function() {
        return !this.owners || this.owners.length === 0 || this.owners.length === 1;
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
            owners[owner.name] = share;
        });

        return owners;
    }

    _.forEach(book.owners, function(owner) {
        owners[owner.name] = 0;
    });

    var missingShare = 1 - _.reduce(ownersObject, function(sum, share) {
        return sum + share;
    });

    var missingOwners = book.owners.length - _.size(ownersObject);

    var missingOwnerShare = missingOwners === 0 ? 0 : bookie.round(missingShare / missingOwners);

    if(_.isArray(ownersObject)) {
        for(var i = 0; i < book.owners.length; i++) {
            owners[book.owners[i].name] = ownersObject[i] || missingOwnerShare;
        }
    } else {
        _.forEach(book.owners, function(owner) {
            owners[owner.name] = ownersObject[owner.name] || missingOwnerShare;
        });
    }

    //Validate
    if(!_.isEqual(_.keys(owners), _.pluck(book.owners, "name"))) {
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

function createFiscalYear(fiscalYear) {
    fiscalYear.isEnded = function() {
        var verifications = this.book.getVerifications(this.to, this.to);
        
        return _.find(verifications, function(verification) {
            return verification.touches(8999);
        }) !== undefined;
    };
}

function addAccounts(book, owners) {
    function createOwnCapitalAccounts() {
        if(owners.length === 0) {
            book.createAccount(2010, "Eget kapital");
            return;
        }

        var n = 10;
        _.forEach(owners, function(owner) {
            if(!owner.name) {
                throw new Error("Owner name required.");
            }

            book.createAccount(2000 + n, "Eget kapital " + owner.name);
            n += n;
        });
    }

    //More to come.

    book.createAccount(1500, "Kundfordringar");
    book.createAccount(1930, "Bank");

    createOwnCapitalAccounts(); //2010 - 2050
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

function addClassifiers(book, owners) {
    book.addClassifier(types.balance, between(1000, 3000));
    book.addClassifier(types.asset, between(1000, 2000));
    book.addClassifier(types.debt, between(2000, 3000));

    book.addClassifier(types.result, between(3000, 8000));
    book.addClassifier(types.income, between(3000, 4000));
    book.addClassifier(types.expense, between(4000, 8000));

    book.addClassifier(types.ownCapital, between(2010, 2050));

    var n = 10;
    _.forEach(owners, function(owner) {
        var type = "ownCapitalOwner" + n/10;
        types[type] = types.ownCapital + " " + owner.name;
        book.addClassifier(types[type], between(2000 + n, 2010 + n));
        n += 10;
    });
}

function between(from, to) {
    return function(account) {
        return account.number >= from && account.number < to;
    };
}

function sumAccounts(accounts, positiveDebit, from, to, filter) {
    return _.reduce(accounts, function(sum, account) {
        var diff = account.sumDebit(from, to, filter) - account.sumCredit(from, to, filter);

        if(!positiveDebit) {
            diff = -diff;
        }

        return sum + diff;
    }, 0);
}