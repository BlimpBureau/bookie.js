/**
 * This class represents a bookkeeping book that holds verifications on account changes.
 */

"use strict";

var _ = require("lodash");
var Account = require("./account.js");
var Verification = require("./verification.js");
var dateUtils = require("./date/date-utils.js");
var ExtensionHandler = require("./extension/extension-handler");
var FiscalYearHandler = require("./fiscal-year-handler");

module.exports = Book;

/**
 * Creates a bookkeeping book that holds verifications on account changes.
 * @constructor
 * @public
 */
function Book() {
    this.extensionHandler = new ExtensionHandler();
    this.fiscalYearHandler = new FiscalYearHandler();

    //The accounts of the book are stored as the account number as key.
    this.accounts = {};

    //The array of verifications. Verification number is key.
    this.verifications = {};
    this.numVerifications = 0;

    this.classifiers = {};
}

/**
 * Register an extension to be used by this book.
 * @public
 * @param {Extension} extension The extension object to be used.
 * @returns {Book} This book instance for chaining.
 */
Book.prototype.use = function(extension) {
    this.extensionHandler.register(this, extension);
    return this;
};

/**
 * Tells if an extension is being used by this book.
 * @public
 * @param {string|Extension} extension The extension to be checked if being used. If string, it will be used as name of the extension.
 * @returns {boolean} True if the extension is being used in this book.
 */
Book.prototype.using = function(extension) {
    return this.extensionHandler.isRegistered(extension);
};

/**
 * Gets the extension by the given extension name.
 * @param {string} name The name of the extension to get.
 * @returns The extension object with the given name. Returns null if it doesn't exist.
 */
Book.prototype.getExtension = function(name) {
    return this.extensionHandler.get(name);
};

/**
 * Creates a new {@link Account} and adds it to the book.
 * @public
 * @param {number} number The account number. Must be unique in the context of the book.
 * @param {string} name The account name. Must be unique in the context of the book.
 * @returns {Account} The created account.
 */
Book.prototype.createAccount = function(number, name) {
    if(this.accounts[number]) {
        throw new Error("An account with number " + number + "already exists.");
    }

    var account = new Account(this, number, name);
    this.accounts[number] = account;

    return account;
};

/**
 * Gets the {@link Account} with the given account number.
 * @public
 * @param {number} number The account number of the account to get.
 * @returns {?Account} The account with the given account number. Returns null if the given number didn't match any account in the book.
 */
Book.prototype.getAccount = function(number) {
    if(!_.isNumber(number)) {
        throw new Error("Invalid account number.");
    }

    var account = this.accounts[number];

    return account || null;
};

/**
 * Creates a {@link Verification} and adds it to the book. The book will decide which verification number the verification should have.
 * @public
 * @param {date|string} date The date that the verification happened. If string, it will be parsed to a date.
 * @param {string} text The text describing the verification.
 * @returns {Verification} The created verification.
 */
Book.prototype.createVerification = function(date, text) {
    var verification = new Verification(this, dateUtils.parse(date), text);

    var key = verification.number;

    if(this.verifications[key]) {
        throw new Error("Internal verification numbering error.");
    }

    this.verifications[key] = verification;
    this.numVerifications++;

    //Let the extensions do their work on the verification before returning it.
    var args = Array.prototype.slice.call(arguments);
    args.unshift(verification);
    args.unshift(this);

    this.extensionHandler.callMethods("createVerification", args);

    return verification;
};

/**
 * Gets a {@link Verification} given a verification number.
 * @public
 * @param {number} number The number of the verification to retrieve.
 * @returns {?Verification} The verification with the given verification number. If it doesn't exist null will be returned.
 */
Book.prototype.getVerification = function(number) {
    return this.verifications[number] || null;
};

/**
 * Gets an Array of all {@link Verification}'s in the given date range.
 * @public
 * @param {?(date|string)} from The lower inclusive bound of the date range of verifications retrieved. Will be parsed if string. If null there is no lower bound.
 * @param {?(data|string)} to The higher inclusive bound of the date range of the verifications retrieved. Will be parsed if string. If null there is no higher bound.
 * @returns {Verification[]} All verifications in the given date range.
 */
Book.prototype.getVerifications = function(from, to) {
    return _.filter(this.verifications, function(v) {
        return dateUtils.isInsideDates(v.date, from, to);
    });
};

/**
 * Gets the next {@link Verification} number that the next added verification will get.
 * @private
 * @returns {number} The next verification number.
 */
Book.prototype.getNextVerificationNumber = function() {
    return this.numVerifications + 1;
};

/**
 * Adds an account classifier function to the book.
 * @public
 * @param {string} type The type of the classifier. The type must be unique in the context of the book.
 * @param {function} classifier The classifier function to be added to the book.
 * @returns {Book} The book instance for chaining.
 */
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

    return this;
};

/**
 * Gets an array of {@link Account}'s. If a classifier type is given, only the accounts meeting the classifiers of the given type will be retrieved.
 * @param {?string} type The classifier type to use for filtering the returned accounts.
 * @returns {Account[]} The array of accounts given classifier type.
 */
Book.prototype.getAccounts = function(type) {
    var result = [];

    var classifiers = this.classifiers[type] || [];

    if(type && !classifiers.length) {
        throw new Error("Invalid classifier type: " + type);
    }

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

/**
 * Tells about problems in the book. Will generate an array of warnings.
 * @public
 * @returns {string[]} An array containing string warnings about problems in the book.
 */
Book.prototype.doctor = function() {
    function unbalancedVerifications(verifications) {
        var unbalanced = _.filter(verifications, function(verification) {
            return !verification.isBalancedCreditDebit();
        });

        return _.map(unbalanced, function(verification) {
            return "Invalid verification: " + verification.number + " is unbalanced.";
        });
    }

    function verificationsOutOfFiscalYears(verifications, fiscalYears) {
        if(!fiscalYears.length) {
            if(_.size(verifications)) {
                return ["Verifications exists without any fiscal years present."];
            }

            return [];
        }

        var start = (_.first(fiscalYears)).from;
        var end = (_.last(fiscalYears)).to;

        var out = _.filter(verifications, function(verification) {
            return verification.date < start || verification.date > end;
        });

        return _.map(out, function(verification) {
            return "Verification out of fiscal years range. Verification: " + verification.number + ". Fiscal year range: " + dateUtils.stringify(start) + " to " + dateUtils.stringify(end) + ".";
        });
    }

    var result = [];

    result = result.concat(unbalancedVerifications(this.verifications));
    result = result.concat(verificationsOutOfFiscalYears(this.verifications, this.fiscalYearHandler.getAll()));

    _.forEach(this.extensionHandler.getMethods("doctor"), function(method) {
        result = result.concat(method(this));
    });

    return result;
};

Book.prototype.export = function() {

};

/**
 * Creates a {@link FiscalYear} and adds it to the book. All fiscal years must be adjacent to each other in the book.
 * @public
 * @param {date|string} from The lower inclusive bound of the fiscal year. If string, it will be parsed to a date.
 * @param {data|string} to The higher inclusive bound of the fiscal year. If string, it will be parsed to a date.
 * @returns {FiscalYear} The created fiscal year.
 * @throws If an invalid date range is give.
 */
Book.prototype.createFiscalYear = function(from, to) {
    var fiscalYear = this.fiscalYearHandler.create(from, to);

    //Let the extensions do their work on the fiscal year.
    var args = Array.prototype.slice.call(arguments);
    args.unshift(fiscalYear);
    args.unshift(this);
    this.extensionHandler.callMethods("createFiscalYear", args);

    return fiscalYear;
};

/**
 * Returns the {@link FiscalYear} that matches the selector.
 * @public
 * @param {number|date|string} selector If date or date string given, the fiscal year that contains the date will be returned. If selector is number it will retrieve the fiscal year at the number position in the fiscal year range (1 is first). If string, it will be parsed to a date.
 * @return {?FiscalYear} Returns the fiscal year that matched to selector. If not found null will be returned.
 */
Book.prototype.getFiscalYear = function(selector) {
    return this.fiscalYearHandler.get(selector);
};

/**
 * Gets the chronologically last {@link FiscalYear}.
 * @public
 * @returns {?FiscalYear} The chronologically last fiscal year. If no fiscal years present, null will be returned.
 */
Book.prototype.getLastFiscalYear = function() {
    return this.fiscalYearHandler.getLast();
};
