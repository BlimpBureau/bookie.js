/* jshint expr: true */
/* global describe, beforeEach, it, expect, bookie, _, bookieSwedishHBEF */

"use strict";

function makeTransactions(book) {
    var verifications = [];

    verifications.push(book.createVerification("2012-02-11", "Domain names").credit(2010, 188).debit(2640, 37.6).debit(6500, 150.4));
    verifications.push(book.createVerification("2012-03-04", "Paper holders").credit(2010, 29).debit(2640, 5.8).debit(6100, 23.2));
    verifications.push(book.createVerification("2012-03-09", "Office stuff").credit(2010, 31).debit(2640, 6.2).debit(6100, 24.8));
    verifications.push(book.createVerification("2012-03-09", "Post stamps").credit(2010, 18).debit(2640, 3.6).debit(6100, 14.4));
    verifications.push(book.createVerification("2012-03-24", "iPad").credit(2020, 7195).debit(2640, 1439).debit(5400, 5756));

    return verifications;
}

describe("SwedishHBEF", function() {
    it("should be defined", function() {
        expect(bookieSwedishHBEF).to.be.a("function");
        expect(bookieSwedishHBEF().name).to.equal("SwedishHBEF");
        expect(bookieSwedishHBEF().apply).to.be.a("function");
    });

    describe("apply", function() {
        var book;

        beforeEach(function() {
            book = new bookie.Book();
        });

        it("should add classifiers and default to one owner", function() {
            book.use(bookieSwedishHBEF());

            _.forEach(bookieSwedishHBEF.types, function(type) {
                expect(book.classifiers[type]).to.be.a("function");
            });

            expect(book.getAccount(2010).name).to.equal("Eget kapital");
            expect(book.getAccount(2020)).to.equal(null);
        });

        it("should respond to owners option", function() {
            book.use(bookieSwedishHBEF({
                owners: [{ name: "John" }, { name: "Jane" }]
            }));

            expect(book.getAccount(2010).name).to.equal("Eget kapital John");
            expect(book.getAccount(2020).name).to.equal("Eget kapital Jane");
            expect(book.getAccount(2030)).to.equal(null);
        });
    });

    describe("result", function() {
        var book;

        beforeEach(function() {
            book = new bookie.Book();
            book.use(bookieSwedishHBEF({
                owners: [{ name: "John" }, { name: "Jane" }]
            }));
        });

        it("should have been applied to book", function() {
            expect(book.result).to.be.a("function");
        });

        it("should return a result object", function() {
            makeTransactions(book);

            var result = book.result();

            expect(result).to.be.an("object");
            expect(result.from).to.equal(undefined);
            expect(result.to).to.equal(undefined);
            expect(result.incomes).to.equal(0);
            expect(result.expenses).to.equal(5968.8);
            expect(result.result).to.equal(-5968.8);
        });
    });

    describe("balance", function() {
        var book;

        beforeEach(function() {
            book = new bookie.Book();
            book.use(bookieSwedishHBEF({
                owners: [{ name: "John" }, { name: "Jane" }]
            }));
        });

        it("should have been applied to book", function() {
            expect(book.balance).to.be.a("function");
        });

        it("should return a balance object", function() {
            makeTransactions(book);

            var balance = book.balance();

            expect(balance).to.be.an("object");
            expect(balance.from).to.equal(undefined);
            expect(balance.to).to.equal(undefined);
            expect(balance.assets).to.equal(0);
            expect(balance.debts).to.equal(0);
            expect(balance.valid).to.equal(true);

            makeTransactions(book);

            balance = book.balance();

            expect(balance).to.be.an("object");
            expect(balance.from).to.equal(undefined);
            expect(balance.to).to.equal(undefined);
            expect(balance.assets).to.equal(0);
            expect(balance.debts).to.equal(0);
            expect(balance.valid).to.equal(true);
        });
    });
});