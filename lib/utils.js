"use strict";

var _ = require("lodash");

exports.parseDate = parseDate;
exports.round = round;
exports.insideDates = insideDates;

function parseDate(date) {
    function zeroFix(index) {
      if(parts[index].length === 1) {
        parts[index] = "0" + parts[index];
      }
    }

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

    zeroFix(1);
    zeroFix(2);

    return new Date(parts.join("-"));
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