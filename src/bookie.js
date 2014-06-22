"use strict";

var _ = require("lodash");
var utils = require("./utils.js");
var Book = require("./book.js");
var Account = require("./account.js");
var Verification = require("./verification.js");
var exportImport = require("./export-import.js");

var bookie = module.exports = {};

bookie.version = "v0.0.0";

bookie.Book = Book;
bookie.Account = Account;
bookie.Verification = Verification;
bookie.parseDate = utils.parseDate;
bookie.dateToString = utils.dateToString;
bookie.isDatesEqual = utils.isDatesEqual;
bookie.round = utils.round;
bookie.insideDates = utils.insideDates;
bookie.vatOfPrice = utils.vatOfPrice;
bookie.vatRateOfPrice = utils.vatRateOfPrice;
bookie.priceOfVat = utils.priceOfVat;
bookie.isAmountsEqual = utils.isAmountsEqual;

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
