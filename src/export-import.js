"use strict";

var _ = require("lodash");
var dateUtils = require("./date/date-utils.js");

exports.exportBook = exportBook;
exports.exportAccount = exportAccount;
exports.exportVerification = exportVerification;
exports.export = smartExport;

exports.importBook = importBook;
exports.import = smartImport;

// ---------- Import ----------

function importBook(bookie, book, data) {
    if(data._version && data._version !== bookie.version) {
        throw new Error("Mismatch version of bookie and import data. bookie: " + bookie.version + ", data: " + data._version);
    }

    if(data._format && data._format !== "bookie.book") {
        throw new Error("Wrong data type. Expected a book.");
    }

    //Make sure the extensions are loaded first since extensions can alter the way accounts and verifications are added to the book.

    _.forEach(data.extensions, function(extension) {
        if(!book.using(extension)) {
            //TODO: Apply it automatically if existing?
            throw new Error("Import data requires book extension: " + extension);
        }
    });

    _.forEach(data.accounts, function(account) {
        var existing = book.getAccount(account.number);

        if(!existing) {
            book.createAccount(account.number, account.name);
        } else if(existing.name !== account.name) {
            throw new Error("Account " + account.number + " already exists.");
        }
    });

    _.forEach(data.verifications, function(verification) {
        var created = book.createVerification(verification.date, verification.text);

        if(created.number !== verification.number) {
            throw new Error("Verification numbering mismatch.");
        }

        _.forEach(verification.debits, function(debit) {
            created.debit(debit.account, debit.amount);
        });

        _.forEach(verification.credits, function(credit) {
            created.credit(credit.account, credit.amount);
        });
    });
}

function smartImport(bookie, object) {
    if(object instanceof bookie.Book) {
        return importBook.apply(null, arguments);
    } else {
        throw new Error("Invalid object");
    }
}

// ---------- Export ----------

function smartExport(bookie, object) {
    if(object instanceof bookie.Book) {
        return exportBook.apply(null, arguments);
    } else if(object instanceof bookie.Account) {
        return exportAccount.apply(null, arguments);
    } else if(object instanceof bookie.Verification) {
        return exportVerification.apply(null, arguments);
    } else {
        throw new Error("Invalid object");
    }
}

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

    output.extensions = _.map(book.extensionHandler.extensions, function(extension) {
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
    output.date = dateUtils.stringify(verification.date);
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
