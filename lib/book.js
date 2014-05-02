"use strict";

var _ = require("lodash");
var utils = require("./utils.js");
var Account = require("./account.js");
var Verification = require("./verification.js");

module.exports = Book;

/**
 * Creates a bookkeeping book that holds verifications on account changes.
 */
function Book() {
    //The accounts of the book are stored as the account number as key.
    this.accounts = {};

    //The array of verifications. Will be kept ordered by verification id.
    this.verifications = [];

    this.nextVerificationNumber = 1;

    this.extensions = {};
}

Book.prototype.use = function(extension) {
    if(!_.isObject(extension) || !_.isString(extension.name) || !_.isFunction(extension.apply)) {
        throw new Error("Invalid extension");
    }

    if(this.extensions[extension.name]) {
        throw new Error("Extension " + extension.name + " already applied to this book.");
    }

    this.extension[name] = extension;

    try {
        extension.apply(this);
    } catch(err) {
        throw new Error("Failed to apply extension " + extension.name + ". Error: " + err);
    }
};

/**
 * Creates a new account and adds it to the book.
 */
Book.prototype.createAccount = function(number, name) {
    if(this.accounts[number]) {
        throw new Error("An account with number " + number + "already exists.");
    }

    var account = new Account(this, number, name);
    this.accounts[number] = account;

    this.classifiers = {};

    return account;
};

Book.prototype.getAccount = function(number) {
    if(!_.isNumber(number)) {
        throw new Error("Invalid account number.");
    }

    var account = this.accounts[number];

    return account || null;
};

Book.prototype.createVerification = function(date, text) {
    var verification = new Verification(this, utils.parseDate(date), text);

    this.verifications.push(verification);

    return verification;
};

Book.prototype.getVerifications = function(from, to) {
    return _.filter(this.verifications, function(v) {
        return utils.insideDates(v.date, from, to);
    });
};

Book.prototype.getNextVerificationNumber = function() {
    return this.nextVerificationNumber++;
};

Book.prototype.addClassifier = function(type, classifier) {
    if(!_.isString(type)) {
        throw new Error("Invalid type.");
    }

    if(!_.isFunction(classifier)) {
        throw new Error("Classifier function required.");
    }

    if(!_.isArray(this.classifiers[type])) {
        this.classifiers[type] = [];
    }

    this.classifiers[type].push(classifier);
};

Book.prototype.getAccounts = function(type) {
    var result = [];

    var classifiers = this.classifiers[type] || [];


    _.forEach(this.accounts, function(account) {
        var good = true;
        classifiers.forEach(function(classifier) {
            return (good = classifier(account));
        });

        if(good) {
            result.push(account);
        }
    });

    return result;
};
