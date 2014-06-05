"use strict";

var _ = require("lodash");

exports.parseDate = parseDate;
exports.dateToString = dateToString;
exports.isDatesEqual = isDatesEqual;
exports.round = round;
exports.insideDates = insideDates;
exports.vatOfPrice = vatOfPrice;
exports.vatRateOfPrice = vatRateOfPrice;
exports.priceOfVat = priceOfVat;
exports.isAmountsEqual = isAmountsEqual;

function parseDate(date) {
  if(_.isDate(date)) {
      return date;
  }

  if(!date || !_.isString(date)) {
      return null;
  }

  var parts = date.split("-");

  if(parts.length !== 3) {
      return null;
  }

  var year = ~~parts[0];
  var month = ~~parts[1];
  var day = ~~parts[2];

  if(!year || !month || !day) {
    throw new Error("Invalid date format.");
  }

  var d = new Date(Date.UTC(year, month - 1, day));

  //Make sure the date has the time 00:00:00.
  //Since javascript Date will add or subtract hours depending on local timezone, make sure the date gets back to 00:00:00.
  var userOffset = d.getTimezoneOffset() * 60000; //Hours
  d.setTime(d.getTime() + userOffset);

  return d;
}

function dateToString(date) {
  var d = date.getDate();
  var m = date.getMonth() + 1;
  var y = date.getFullYear();
  
  return "" + y + "-" + (m <= 9 ? "0" + m : m) + "-" + (d <= 9 ? "0" + d : d);
}

function isDatesEqual(date1, date2) {
    return parseDate(date1).getTime(  ) === parseDate(date2).getTime();
}

function round(number, decimals) {
    function _round(number, exp) {
        exp = +exp;
        number = +number;

        if(!exp) {
            return Math.round(number);
        }

        if(exp % 1 !== 0) {
            throw new Error("Decimals must be an integer.");
        }

        // Shift
        number = number.toString().split("e");
        number = Math.round(+(number[0] + "e" + (number[1] ? (+number[1] - exp) : -exp)));

        // Shift back
        number = number.toString().split("e");
        return +(number[0] + "e" + (number[1] ? (+number[1] + exp) : exp));
    }

    if(!_.isNumber(number)) {
        throw new Error("Invalid number.");
    }

    var d = _.isNumber(decimals) ? decimals : 2;

    return _round(number, -d);
}

function insideDates(date, from, to) {
    date = parseDate(date);

    if(!date) {
        return false;
    }

    function parseIfDefined(value) {
        if(value && _.isDate(value)) {
            return value;
        }

        return value ? parseDate(value) : value;
    }

    if(!_.isDate(date)) {
        throw new Error("Invalid date.");
    }

    from = parseIfDefined(from);
    to = parseIfDefined(to);

    return (!from || date.getTime() >= from.getTime()) && (!to || date.getTime() <= to.getTime());
}

function vatOfPrice(price, vatRate, piv) {
    if(piv) {
        return price - (price / (1 + vatRate));
    } else {
        return price * vatRate;
    }
}

function vatRateOfPrice(price, vat, piv) {
    if(piv) {
        return vat / (price - vat);
    } else {
        return vat / price;
    }
}

function priceOfVat(vat, vatRate, piv) {
    if(piv) {
        return (vat / vatRate) + vat;
    } else {
        return vat / vatRate;
    }
}

function isAmountsEqual(amount1, amount2) {
    var EPSILON = 1e-6;
    return (amount1 - amount2) < EPSILON;
}