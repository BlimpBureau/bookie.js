var bookie = require("../bookie.js");
var chai = require("chai");
var expect = chai.expect;

describe("bookie.js", function() {
	it("should be defined", function() {
		expect(bookie).to.be.a("object");
	});

	describe("runInContext", function() {
		it("should be defined in bookie object", function() {
			expect(bookie.runInContext).to.be.a("function");
		});
	});
});