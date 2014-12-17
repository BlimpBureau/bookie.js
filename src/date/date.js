"use strict";

var _ = require("lodash");

/**
 * @exports bookie/date
 */
var dateModule = module.exports = {};

/**
 * Parses the input into a date. The date will always be set to the time 00:00:00 GMT+0.
 * This function parses strings of the format YYYY-MM-dd where the first M or d is optional if it is 0.
 * @public
 * @param {date|string} date The date to parse to a timeless `date` object. If date, the time part will simply be set to the specification. If string, it will be parsed to the given date.
 * @returns {?date} The parsed date. If invalid input is given the function will return null.
 */
dateModule.parse = function(date) {
    if(_.isDate(date)) {
        //TODO: Remove time part and set timezone.
        return date;
    }

    if(!date || !_.isString(date)) {
        return null;
    }

    var parts = date.split("-");

    if(parts.length !== 3) {
        return null;
    }

    var year = +parts[0];
    var month = +parts[1];
    var day = +parts[2];

    if(!year || !month || !day) {
        return null;
    }

    var d = new Date(Date.UTC(year, month - 1, day));

    //TODO: Make sure to set the date to the timezone GMT+0?
    //Make sure the date has the time 00:00:00.
    //Since javascript Date will add or subtract hours depending on local timezone, make sure the date gets back to 00:00:00.
    var userOffset = d.getTimezoneOffset() * 60000; //Hours
    d.setTime(d.getTime() + userOffset);

    return d;
};

/**
 * Serializes a date object to a string of the format YYYY-MM-dd.
 * @public
 * @param {string|date} date The date to serialize. If string, it will be parsed as a date before serializing.
 * @returns {?string} The serialized string representation of the date. Null if invalid input.
 */
dateModule.toString = function(date) {
    date = dateModule.parse(date);

    if(!date) {
        return null;
    }

    var d = date.getDate();
    var m = date.getMonth() + 1;
    var y = date.getFullYear();

    return "" + y + "-" + (m <= 9 ? "0" + m : m) + "-" + (d <= 9 ? "0" + d : d);
};

/**
 * Tells if two dates are equal.
 * @public
 * @param {string|date} date1 The first date to check for equality with the second date. If string, it will be parsed to a date.
 * @param {string|date} date2 The second date to check for equality with the first date. If string, it will be parsed to a date.
 * @returns {boolean} True if the given dates are equal. False if they are not equal or if any of the dates are invalid.
 */
dateModule.isEqual = function(date1, date2) {
    date1 = dateModule.parse(date1);
    date2 = dateModule.parse(date2);

    if(!date1 || !date2) {
        return null;
    }

    return date1.getTime() === date2.getTime();
};

/**
 * Tells if the given date is inside the given date range.
 * @public
 * @param {string|date} date The date to be checked if inside the date range. Will be parsed if string.
 * @param {?(string|date)} from The lower inclusive bound for the date range. No lower bound if null.
 * @param {?(string|date)} to The higher inclusive bound for the date range. No higher bound if null.
 * @returns {boolean} True if the date is inside the given date range. False if not or if date is invalid.
 */
dateModule.isInsideDates = function(date, from, to) {
    date = dateModule.parse(date);

    if(!date) {
        return false;
    }

    function parseIfDefined(value) {
        if(value && _.isDate(value)) {
            return value;
        }

        return value ? dateModule.parse(value) : value;
    }

    if(!_.isDate(date)) {
        throw new Error("Invalid date.");
    }

    from = parseIfDefined(from);
    to = parseIfDefined(to);

    return (!from || date.getTime() >= from.getTime()) && (!to || date.getTime() <= to.getTime());
};
