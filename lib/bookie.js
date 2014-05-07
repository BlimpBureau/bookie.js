"use strict";

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
bookie.round = utils.round;
bookie.insideDates = utils.insideDates;
bookie.vatOfPrice = utils.vatOfPrice;
bookie.vatRateOfPrice = utils.vatRateOfPrice;
bookie.priceOfVat = utils.priceOfVat;

bookie.exportBook = exportImport.exportBook.bind(null, bookie);
bookie.exportAccount = exportImport.exportAccount.bind(null, bookie);
bookie.exportVerification = exportImport.exportVerification.bind(null, bookie);
bookie.export = exportImport.export.bind(null, bookie);

bookie.importBook = exportImport.importBook.bind(null, bookie);