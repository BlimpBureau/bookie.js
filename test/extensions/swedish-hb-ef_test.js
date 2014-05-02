/* jshint expr: true */
/* global describe, beforeEach, it, expect, bookie, _, bookieSwedishHBEF */

"use strict";

describe("SwedishHBEF", function() {
	it("should be defined", function() {
		expect(bookieSwedishHBEF).to.be.an("object");
		expect(bookieSwedishHBEF.name).to.equal("SwedishHBEF");
		expect(bookieSwedishHBEF.apply).to.be.a("function");
	});

	describe("apply", function() {
		var book;

		beforeEach(function() {
			book = new bookie.Book();
			book.use(bookieSwedishHBEF);
		});

		it("should add classifiers", function() {
			_.forEach(bookieSwedishHBEF.types, function(type) {
				expect(book.classifiers[type]).to.be.a("function");
			});
		});
	});
});