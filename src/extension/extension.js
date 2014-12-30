"use strict";

var _ = require("lodash");

module.exports = Extension;

/**
 * Represents an extension that will be applied to bookkeeping {@link Book}'s.
 * @constructor
 * @public
 * @param {string} name - The name of the extension. Must be unique in the context of used extensions in a {@link Book}.
 * @param {function=} init - The function to be called to init the extension to the given {@link Book}.
 */
function Extension(name, init) {
    this.name = name;
    this.init = init || _.noop;
}

/**
 * Inits the extension to the given book. Here extensions can alter properties and methods to the given {@link Book}. This method should be overriden by extensions.
 * @param {Book} book - The book that this extension should be applied to.
 */
Extension.prototype.init = function(book) {
    this.init(book);
};
