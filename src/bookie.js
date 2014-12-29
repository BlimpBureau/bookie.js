"use strict";

var _ = require("lodash");
var numberUtils = require("./financial/number-utils.js");
var financialUtils = require("./financial/financial-utils.js");
var Book = require("./book.js");
var Account = require("./account.js");
var Verification = require("./verification.js");
var exportImport = require("./export-import.js");
var dateUtils = require("./date/date-utils.js");

/**
 * @exports bookie
 */
var bookie = module.exports = {};

/**
 * The version of bookie in standard semver syntax.
 * @see http://semver.org/
 * @public
 * @type string
 */
bookie.version = "v0.0.0";

/**
 * {@link Book} constructor.
 * @private
 */
bookie.Book = Book;

/**
 * {@link Account} constructor.
 * @private
 */
bookie.Account = Account;

/**
 * {@link Verification} constructor.
 * @private
 */
bookie.Verification = Verification;

//Export date utils.
bookie.parseDate = dateUtils.parse;
bookie.dateToString = dateUtils.stringify;
bookie.isDatesEqual = dateUtils.isEqual;
bookie.isInsideDates = dateUtils.isInsideDates;

//Export number utils.
bookie.round = numberUtils.round;
bookie.isAmountsEqual = numberUtils.isEqual;
bookie.isDecimalPercent = numberUtils.isDecimalPercent;
bookie.isValidNumber = numberUtils.isValidNumber;

//Export financial utils.
bookie.vatOfPrice = financialUtils.vatOfPrice;
bookie.vatRateOfPrice = financialUtils.vatRateOfPrice;
bookie.priceOfVat = financialUtils.priceOfVat;

//Export importing and exporting methods.
bookie.exportBook = _.partial(exportImport.exportBook, bookie);
bookie.exportAccount = _.partial(exportImport.exportAccount, bookie);
bookie.exportVerification = _.partial(exportImport.exportVerification, bookie);
bookie.export = _.partial(exportImport.export, bookie);

bookie.importBook = _.partial(exportImport.importBook, bookie);
bookie.import = _.partial(exportImport.import, bookie);

bookie.Book.prototype.export = function() {
    return _.partial(bookie.exportBook, this).apply(null, arguments);
};

bookie.Book.prototype.import = function() {
    return _.partial(bookie.importBook, this).apply(null, arguments);
};

bookie.Account.prototype.export = function() {
    return _.partial(bookie.exportAccount, this).apply(null, arguments);
};

bookie.Verification.prototype.export = function() {
    return _.partial(bookie.exportVerification, this).apply(null, arguments);
};
