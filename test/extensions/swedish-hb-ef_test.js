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

function makeOwnerShareTransactions(book) {
    book.createVerification("2012-02-11", "Domain names").credit(2010, 188).debit(2640, 37.6).debit(6500, 150.4);
    book.createVerification("2012-03-04", "Paper holders").credit(2010, 29).debit(2640, 5.8).debit(6100, 23.2);
    book.createVerification("2012-03-09", "Office stuff").credit(2010, 31).debit(2640, 6.2).debit(6100, 24.8);
    book.createVerification("2012-03-09", "Post stamps").credit(2010, 18).debit(2640, 3.6).debit(6100, 14.4);
    book.createVerification("2012-03-24", "iPad", [0, 1]).credit(2020, 7195).debit(2640, 1439).debit(5400, 5756);
    book.createVerification("2012-10-04", "Sold product", [0, 1]).debit(1930, 7500).credit(2610, 1500).credit(3000, 6000);    
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
            expect(book.owners).to.eql([]);
            expect(book.extensions.SwedishHBEF.types.ownCapital).to.equal("Eget kapital");
        });

        it("should respond to owners option", function() {
            var owners = [{ name: "John" }, { name: "Jane" }];

            book.use(bookieSwedishHBEF({
                owners: owners
            }));

            expect(book.getAccount(2010).name).to.equal("Eget kapital John");
            expect(book.getAccount(2020).name).to.equal("Eget kapital Jane");
            expect(book.getAccount(2030)).to.equal(null);

            expect(book.owners).to.eql(owners);
            expect(book.extensions.SwedishHBEF.types.ownCapital).to.equal("Eget kapital");
            expect(book.extensions.SwedishHBEF.types.ownCapitalOwner1).to.equal("Eget kapital John");
            expect(book.extensions.SwedishHBEF.types.ownCapitalOwner2).to.equal("Eget kapital Jane");
            expect(book.classifiers[book.extensions.SwedishHBEF.types.ownCapitalOwner1]).to.be.an("array");
            expect(book.classifiers[book.extensions.SwedishHBEF.types.ownCapitalOwner2]).to.be.an("array");

            expect(book.getAccounts(book.extensions.SwedishHBEF.types.ownCapitalOwner1)).to.eql([book.getAccount(2010)]);
            expect(book.getAccounts(book.extensions.SwedishHBEF.types.ownCapitalOwner2)).to.eql([book.getAccount(2020)]);
        });
    });

    describe("createVerification", function() {
        var book;

        beforeEach(function() {
            book = new bookie.Book();
            book.use(bookieSwedishHBEF({
                owners: [{ name: "John" }, { name: "Jane" }]
            }));
        });

        it("should add default owners object to verifications", function() {
            book.createVerification("2012-03-01", "testing").credit(2010, 29).debit(2640, 5.8).debit(6100, 23.2);

            expect(book.getVerification(1).owners).to.eql({
                "John": 0.5,
                "Jane": 0.5
            });
        });

        it("should respond to owners object parameter", function() {
            var share = { "John": 0.1, "Jane": 0.9 };
            book.createVerification("2012-03-01", "testing", share).credit(2010, 29).debit(2640, 5.8).debit(6100, 23.2);
            expect(book.getVerification(1).owners).to.eql(share);

            book.createVerification("2014-12-04", "something else", { "Jane": 0.34 });
            expect(book.getVerification(2).owners).to.eql({
                "John": 0.66,
                "Jane": 0.34
            });
        });

        it("should respond to owners array parameter", function() {
            book.createVerification("2102-03-12", "test", [0.12, 0.88]);
            expect(book.getVerification(1).owners).to.eql({
                "John": 0.12,
                "Jane": 0.88
            });

            book.createVerification("2012-03-01", "something", [0.9]);
            expect(book.getVerification(2).owners).to.eql({
                "John": 0.9,
                "Jane": 0.1
            });
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
            expect(result.resultShare).to.eql({
                "John": -5968.8/2,
                "Jane": -5968.8/2
            });
        });

        it("should calculate owner result share correctly", function() {
            expect(book.result().resultShare).to.eql({
                "John": 0,
                "Jane": 0
            });

            book.createVerification("2012-02-11", "Domain names", [0.2, 0.8]).credit(2010, 188).debit(2640, 37.6).debit(6500, 150.4);

            expect(book.result().resultShare).to.eql({
                "John": -30.08,
                "Jane": -120.32
            });

            book.createVerification("2012-03-04", "Paper holders", [1, 0]).credit(2010, 29).debit(2640, 5.8).debit(6100, 23.2);

            expect(book.result().resultShare).to.eql({
                "John": -30.08 -23.2,
                "Jane": -120.32
            });

            book.createVerification("2012-03-09", "Office stuff", [0, 1]).credit(2010, 31).debit(2640, 6.2).debit(6100, 24.8);

            expect(book.result().resultShare).to.eql({
                "John": -30.08 -23.2,
                "Jane": -120.32 -24.8
            });

            book.createVerification("2012-03-09", "Post stamps", [0.23, 0.77]).credit(2010, 18).debit(2640, 3.6).debit(6100, 14.4);

            expect(book.result().resultShare).to.eql({
                "John": -30.08 -23.2 -3.31,
                "Jane": -120.32 -24.8 -11.09
            });

            book.createVerification("2012-03-24", "iPad", [0, 1]).credit(2020, 7195).debit(2640, 1439).debit(5400, 5756);

            expect(book.result().resultShare).to.eql({
                "John": -30.08 -23.2 -3.31,
                "Jane": -120.32 -24.8 -11.09 -5756
            });

            book = new bookie.Book();
            book.use(bookieSwedishHBEF({
                owners: [{ name: "John" }, { name: "Jane" }]
            }));

            makeOwnerShareTransactions(book);

            expect(book.result().result).to.eql(31.2);
            expect(book.result().resultShare).to.eql({
                "John": -212.8/2,
                "Jane": bookie.round(-212.8/2 -5756 + 6000)
            });
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
            var balance = book.balance();

            expect(balance).to.be.an("object");
            expect(balance.from).to.equal(undefined);
            expect(balance.to).to.equal(undefined);
            expect(balance.assets).to.equal(0);
            expect(balance.debts).to.equal(0);
            expect(balance.ownCapital).to.eql({
                ingoing: 0,
                outgoing: 0
            });
            expect(balance.valid).to.equal(true);
            expect(balance.ownCapitalShare).to.eql({
                "John": {
                    ingoing: 0,
                    outgoing: 0
                },
                "Jane": {
                    ingoing: 0,
                    outgoing: 0
                }
            });

            makeTransactions(book);

            balance = book.balance();

            expect(balance).to.be.an("object");
            expect(balance.from).to.equal(undefined);
            expect(balance.to).to.equal(undefined);
            expect(balance.assets).to.equal(0);
            expect(balance.debts).to.equal(-1492.2);
            expect(balance.ownCapital).to.eql({
                ingoing: 0,
                outgoing: 1492.2
            });
            expect(balance.valid).to.equal(true);
            expect(balance.ownCapitalShare).to.eql({
                "John": {
                    ingoing: 0,
                    outgoing: -2718.4,
                },
                "Jane": {
                    ingoing: 0,
                    outgoing: 4210.6
                }
            });

            book.createVerification("2012-10-04", "Sold product").debit(1930, 7500).credit(2610, 1500).credit(3000, 6000);

            balance = book.balance();
            expect(balance).to.be.an("object");
            expect(balance.from).to.equal(undefined);
            expect(balance.to).to.equal(undefined);
            expect(balance.assets).to.equal(7500);
            expect(balance.debts).to.equal(7.8);
            expect(balance.ownCapital).to.eql({
                ingoing: 0,
                outgoing: 7492.20
            });
            expect(balance.valid).to.equal(true);
            expect(balance.ownCapitalShare).to.eql({
                "John": {
                    ingoing: 0,
                    outgoing: 281.6,
                },
                "Jane": {
                    ingoing: 0,
                    outgoing: 7210.6
                }
            });

            balance = book.balance("2012-01-01", "2012-12-31");
            expect(balance).to.be.an("object");
            expect(balance.from).to.equal("2012-01-01");
            expect(balance.to).to.equal("2012-12-31");
            expect(balance.assets).to.equal(7500);
            expect(balance.debts).to.equal(7.8);
            expect(balance.ownCapital).to.eql({
                ingoing: 0,
                outgoing: 7492.20
            });
            expect(balance.valid).to.equal(true);
            expect(balance.ownCapitalShare).to.eql({
                "John": {
                    ingoing: 0,
                    outgoing: 281.6,
                },
                "Jane": {
                    ingoing: 0,
                    outgoing: 7210.6
                }
            });

            balance = book.balance(null, bookie.parseDate("2012-12-31"));
            expect(balance).to.be.an("object");
            expect(balance.from).to.equal(undefined);
            expect(balance.to).to.equal("2012-12-31");
            expect(balance.assets).to.equal(7500);
            expect(balance.debts).to.equal(7.8);
            expect(balance.ownCapital).to.eql({
                ingoing: 0,
                outgoing: 7492.20
            });
            expect(balance.valid).to.equal(true);
            expect(balance.ownCapitalShare).to.eql({
                "John": {
                    ingoing: 0,
                    outgoing: 281.6,
                },
                "Jane": {
                    ingoing: 0,
                    outgoing: 7210.6
                }
            });
        });

        it("should calculate right own capital when owners have different shares of result and expenses", function() {
            makeOwnerShareTransactions(book);

            var balance = book.balance();
            expect(balance).to.be.an("object");
            expect(balance.from).to.equal(undefined);
            expect(balance.to).to.equal(undefined);
            expect(balance.assets).to.equal(7500);
            expect(balance.debts).to.equal(7.8);
            expect(balance.ownCapital).to.eql({
                ingoing: 0,
                outgoing: 7492.20
            });
            expect(balance.valid).to.equal(true);
            expect(balance.ownCapitalShare).to.eql({
                "John": {
                    ingoing: 0,
                    outgoing: 159.6,
                },
                "Jane": {
                    ingoing: 0,
                    outgoing: 7332.6
                }
            });
        });
    });
});