"use strict";

var _ = require("lodash");

/**
 * @exports bookie/numberUtils
 */
var numberUtils = module.exports;

/**
 * Round the given number to the given number of decimals.
 * @public
 * @param {number} number The number to be rounded.
 * @param {decimals} [decimals=2] The number of decimals to be used when rounding the number.
 * @returns {?number} The rounded number.
 * @throws On invalid number and invalid decimals.
 */
numberUtils.round = function(number, decimals) {
    function roundToDecimals(number, exp) {
        exp = +exp;
        number = +number;

        if(!exp) {
            return Math.round(number);
        }

        if(exp % 1 !== 0) {
            throw new Error("Invalid decimals. Must be an integer.");
        }

        // Shift
        number = number.toString().split("e");
        number = Math.round(+(number[0] + "e" + (number[1] ? (+number[1] - exp) : -exp)));

        // Shift back
        number = number.toString().split("e");
        return +(number[0] + "e" + (number[1] ? (+number[1] + exp) : exp));
    }

    if(!numberUtils.isValidNumber(number)) {
        throw new Error("Invalid number");
    }

    var d = _.isNumber(decimals) ? decimals : 2;

    return roundToDecimals(number, -d);
};

/**
 * Tells if the given value is of type number and is not NaN.
 * @public
 * @param {*} value The value to check if it is a valid number.
 * @returns {boolean} Returns true if the value is a number and not NaN.
 */
numberUtils.isValidNumber = function(value) {
    return _.isNumber(value) && !isNaN(value);
};

/**
 * Tells if the given value is a percent number in the inclusive range 0 to 1.
 * @public
 * @param {*} value The value to check if it is a percent range.
 * @returns {boolean} Returns true if the value is a percent range.
 */
numberUtils.isDecimalPercent = function(value) {
    return numberUtils.isValidNumber(value) && value >= 0 && value <= 1;
};

/**
 * Tells if the given numbers are equal by the given precision.
 * @public
 * @param {number} number1 The number to be checked for equality to the second number.
 * @param {number} number2 The number to be checked for equality to the first number.
 * @param {number} [epsilon=1e-6] The precision epsilon to be used while checking for equality.
 * @returns {boolean} True if all parameters are valid and the two numbers are equal given the epsilon.
 */
numberUtils.isEqual = function(number1, number2, epsilon) {
    if(!numberUtils.isValidNumber(number1) || !numberUtils.isValidNumber(number2)) {
        return false;
    }

    epsilon = numberUtils.isValidNumber(epsilon) ? epsilon : 1e-6;
    return Math.abs(number1 - number2) <= epsilon;
};
