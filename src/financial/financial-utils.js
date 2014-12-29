"use strict";

var numberUtils = require("./number-utils");

/**
 * @exports bookie/financialUtils
 */
var financialUtils = module.exports = {};

/**
 * Calculates the VAT amount by the given price and VAT percent.
 * @public
 * @param {number} price The price to calculate the VAT amount of.
 * @param {number} vatRate The VAT percent rate to be used to calculate the VAT amount. Must be in the range 0 to 1 inclusive.
 * @param {boolean} [priceIncludesVat=false] Tells if the given price already includes the VAT amount. If true, the price includes the VAT amount.
 * @returns {?number} The VAT amount by the given price at VAT percent. Returns null if parameters are invalid.
 */
financialUtils.vatOfPrice = function(price, vatRate, priceIncludesVat) {
    if(!numberUtils.isValidNumber(price) || !numberUtils.isDecimalPercent(vatRate)) {
        return null;
    }

    if(priceIncludesVat) {
        return price - (price / (1 + vatRate));
    } else {
        return price * vatRate;
    }
};

/**
 * Calculates the VAT percent rate of the given price and VAT amount.
 * @public
 * @param {number} price The price to be used for calculating the VAT percent rate.
 * @param {number} vat The VAT amount to be used for calculating the VAT percent rate.
 * @param {boolean} [priceIncludesVat=false] Tells if the given price already includes the VAT amount. If true, the price includes the VAT amount.
 * @returns {?number} The VAT percent rate of the given price and VAT amount. Returns null if parameters are invalid.
 */
financialUtils.vatRateOfPrice = function(price, vat, priceIncludesVat) {
    if(!numberUtils.isValidNumber(price) || !numberUtils.isValidNumber(vat)) {
        return null;
    }

    if(priceIncludesVat) {
        return vat / (price - vat);
    } else {
        return vat / price;
    }
};

/**
 * Calculates the price of the given VAT amount and VAT percent rate.
 * @public
 * @param {number} vat The VAT amount to be used for calculating the price amount.
 * @param {number} vatRate The VAT percent rate to be used for calculating the price amount. Must be in the inclusive range 0 to 1.
 * @param {boolean} [priceIncludesVat=false] Tells if the given price already includes the VAT amount. If true, the price includes the VAT amount.
 * @returns {number} The price amount of the given VAT amount and VAT percent rate. Returns null if parameters are invalid.
 */
financialUtils.priceOfVat = function(vat, vatRate, priceIncludesVat) {
    if(!numberUtils.isValidNumber(vat) || !numberUtils.isDecimalPercent(vatRate)) {
        return null;
    }

    if(priceIncludesVat) {
        return (vat / vatRate) + vat;
    } else {
        return vat / vatRate;
    }
};
