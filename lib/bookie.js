"use strict";

var utils = require("./utils.js");
var Book = require("./book.js");
var exportImport = require("./export-import.js");

var bookie = module.exports = {};

bookie.version = "v0.0.0";

bookie.Book = Book;
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

bookie.export = function(object) {
    if(object instanceof bookie.Book) {
        return bookie.exportBook.apply(null, arguments);
    } else if(object instanceof bookie.Account) {
        return bookie.exportAccount.apply(null, arguments);
    } else if(object instanceof bookie.verification) {
        return bookie.exportVerification.apply(null, arguments);
    } else {
        throw new Error("Invalid object");
    }
};