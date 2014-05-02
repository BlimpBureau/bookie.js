"use strict";

var utils = require("./utils.js");
var Book = require("./book.js");

exports.Book = Book;
exports.parseDate = utils.parseDate;
exports.round = utils.round;
exports.insideDates = utils.insideDates;
exports.vatOfPrice = utils.vatOfPrice;
exports.vatRateOfPrice = utils.vatRateOfPrice;
exports.priceOfVat = utils.priceOfVat;