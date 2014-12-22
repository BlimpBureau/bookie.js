"use strict";

var _ = require("lodash");

exports.round = round;
exports.vatOfPrice = vatOfPrice;
exports.vatRateOfPrice = vatRateOfPrice;
exports.priceOfVat = priceOfVat;
exports.isAmountsEqual = isAmountsEqual;

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
