/* jshint expr: true */
/* global describe, beforeEach, it, expect, bookie, _ , sinon */

"use strict";

function validDate(date, year, month, day) {
    expect(date.getDate()).to.equal(day);
    expect(date.getMonth()).to.equal(month - 1);
    expect(date.getFullYear()).to.equal(year);
    expect(date.getHours()).to.equal(0);
    expect(date.getMinutes()).to.equal(0);
    expect(date.getSeconds()).to.equal(0);
    expect(date.getMilliseconds()).to.equal(0);
}

function makeTransactions(book) {
    var verifications = [];

    verifications.push(book.createVerification("2012-02-11", "Domain names").credit(2010, 188).debit(2640, 37.6).debit(6500, 150.4));
    verifications.push(book.createVerification("2012-03-04", "Paper holders").credit(2010, 29).debit(2640, 5.8).debit(6100, 23.2));
    verifications.push(book.createVerification("2012-03-09", "Office stuff").credit(2010, 31).debit(2640, 6.2).debit(6100, 24.8));
    verifications.push(book.createVerification("2012-03-09", "Post stamps").credit(2010, 18).debit(2640, 3.6).debit(6100, 14.4));
    verifications.push(book.createVerification("2012-03-24", "iPad").credit(2020, 7195).debit(2640, 1439).debit(5400, 5756));

    return verifications;
}

function makeAccounts(book) {
    var accounts = [];

    accounts.push(book.createAccount(1930, "Bank"));
    accounts.push(book.createAccount(2010, "Own capital John Doe"));
    accounts.push(book.createAccount(2020, "Own capital Jane Doe"));
    accounts.push(book.createAccount(2640, "Incoming VAT 25 %"));
    accounts.push(book.createAccount(5400, "Usage inventory"));
    accounts.push(book.createAccount(6100, "Office material"));
    accounts.push(book.createAccount(6500, "External services"));

    return accounts;
}

function expectMethods(methods) {
    _.forEach(methods, function(method) {
        try {
            expect(bookie[method]).to.be.a("function");
        } catch(e) {
            throw new Error("Expected method '" + method + "' to be present in bookie.");
        }
    });
}

describe("bookie.js", function() {
    it("should be defined", function() {
        expect(bookie).to.be.a("object");
    });

    it("should have version property defined", function() {
        expect(bookie.version).to.equal("v0.0.0");
    });

    it("should have date utils available", function() {
        expectMethods(["parseDate", "isDatesEqual", "dateToString", "isInsideDates"]);
    });

    it("should have number utils available", function() {
        expectMethods(["round", "isValidNumber", "isDecimalPercent", "isAmountsEqual"]);
    });

    it("should have financial utils available", function() {
        expectMethods(["vatOfPrice", "vatRateOfPrice", "priceOfVat"]);
    });

    describe("Book", function() {
        it("should have constructor defined", function() {
            expect(bookie.Book).to.be.a("function");
            expect((new bookie.Book()) instanceof bookie.Book).to.equal(true);
        });

        describe("use", function() {
            var book;

            beforeEach(function() {
                book = new bookie.Book();
            });

            it("should be defined", function() {
                expect(book.use).to.be.a("function");
            });
            //TODO: Make sure it passes the right book into the delegated extensionHandler method and returns the book instance.
        });

        describe("using", function() {
            //TODO: Just make sure the method is defined. Already tested by extension handler.
        });

        describe("FiscalYears", function() {
            var book;

            beforeEach(function() {
                book = new bookie.Book();
            });

            it("container should be present in book", function() {
                expect(book.fiscalYears).to.be.an("array");
                expect(book.fiscalYears.length).to.equal(0);
            });

            describe("createFiscalYear", function() {
                var book;

                beforeEach(function() {
                    book = new bookie.Book();
                });

                it("should be defined", function() {
                    expect(book.createFiscalYear).to.be.a("function");
                });

                it("should create fiscal years", function() {
                    book.createFiscalYear("2012-01-01", "2012-12-31");
                    expect(book.fiscalYears.length).to.equal(1);
                    expect(bookie.dateToString(book.fiscalYears[0].from)).to.equal("2012-01-01");
                    expect(bookie.dateToString(book.fiscalYears[0].to)).to.equal("2012-12-31");

                    book.createFiscalYear(bookie.parseDate("2011-01-01"), "2011-12-31");
                    expect(book.fiscalYears.length).to.equal(2);
                    expect(bookie.dateToString(book.fiscalYears[0].from)).to.equal("2011-01-01");
                    expect(bookie.dateToString(book.fiscalYears[0].to)).to.equal("2011-12-31");

                    book.createFiscalYear("2009-06-01", "2010-12-31");
                    expect(book.fiscalYears.length).to.equal(3);
                    expect(bookie.dateToString(book.fiscalYears[0].from)).to.equal("2009-06-01");
                    expect(bookie.dateToString(book.fiscalYears[0].to)).to.equal("2010-12-31");

                    expect(bookie.dateToString(book.fiscalYears[0].from)).to.equal("2009-06-01");
                    expect(bookie.dateToString(book.fiscalYears[0].to)).to.equal("2010-12-31");
                    expect(bookie.dateToString(book.fiscalYears[1].from)).to.equal("2011-01-01");
                    expect(bookie.dateToString(book.fiscalYears[1].to)).to.equal("2011-12-31");
                    expect(bookie.dateToString(book.fiscalYears[2].from)).to.equal("2012-01-01");
                    expect(bookie.dateToString(book.fiscalYears[2].to)).to.equal("2012-12-31");

                    expect(function() {
                        book.createFiscalYear("2010-01-01", "2010-12-31");
                    }).to.throw(Error);

                    expect(function() {
                        book.createFiscalYear("2013-01-02", "2013-12-31");
                    }).to.throw(Error);

                    expect(function() {
                        book.createVerification("", 133);
                    }).to.throw(Error);
                });

                it("should init extensions", function() {
                    var spy = sinon.spy();

                    book.use({
                        name: "test with no method",
                        init: function() {}
                    })
                    .use({
                        name: "test with method",
                        init: function() {},
                        createFiscalYear: spy
                    });

                    var fy = book.createFiscalYear("2012-01-01", "2012-12-31", { test: "hello" }, true);

                    expect(spy).to.have.been.calledOnce;
                    expect(spy).to.have.been.calledWith(fy, { test: "hello" }, true);
                });
            });

            describe("getFiscalYear", function() {
                var book;

                beforeEach(function() {
                    book = new bookie.Book();

                    book.createFiscalYear("2009-06-01", "2010-12-31");
                    book.createFiscalYear("2011-01-01", "2011-12-31");
                    book.createFiscalYear("2012-01-01", "2012-12-31");
                });

                it("should be defined", function() {
                    expect(book.getFiscalYear).to.be.a("function");
                });

                it("should return the fiscal years right by selector", function() {
                    function test(selector, fiscalYearNumber) {
                        var fy = book.getFiscalYear(selector);

                        if(fiscalYearNumber !== null) {
                            expect(fy).to.eql(book.fiscalYears[fiscalYearNumber - 1]);
                        } else {
                            expect(fy).to.equal(null);
                        }
                    }

                    test("2012-01-01", 3);
                    test("2012-04-12", 3);
                    test(bookie.parseDate("2010-01-02"), 1);
                    test("2013-01-01", null);
                    test("2011-11-02", 2);
                    test("2011-12-31", 2);
                    test("2009-06-02", 1);
                    test("2010-12-31", 1);

                    test(1, 1);
                    test(3, 3);
                });
            });

            describe("getLastFiscalYear", function() {
                it("should be defined", function() {
                    var book = new bookie.Book();
                    expect(book.getLastFiscalYear).to.be.a("function");
                });

                it("should return the last fiscal year", function() {
                    var book = new bookie.Book();
                    book.createFiscalYear("2009-06-01", "2010-12-31");
                    book.createFiscalYear("2011-01-01", "2011-12-31");
                    var last = book.createFiscalYear("2012-01-01", "2012-12-31");

                    expect(book.getLastFiscalYear()).to.eql(last);

                    book = new bookie.Book();

                    expect(book.getLastFiscalYear()).to.equal(null);
                });
            });
        });

        describe("Verifications", function() {
            var book;

            beforeEach(function() {
                book = new bookie.Book();

                makeAccounts(book);
                makeTransactions(book);
            });

            describe("createVerification", function() {
                var book;

                beforeEach(function() {
                    book = new bookie.Book();
                });

                it("should be defined", function() {
                    expect(book.createVerification).to.be.a("function");
                });

                it("should create a new Verification instance", function() {
                    var date = new Date("2012-01-01");
                    var v = book.createVerification(date, "text");

                    expect(v.book).to.equal(book);
                    expect(v.number).to.equal(1);
                    validDate(v.date, 2012, 1, 1);
                    expect(v.text).to.equal("text");

                    v = book.createVerification(date, "test");
                    expect(v.book).to.equal(book);
                    expect(v.number).to.equal(2);
                    validDate(v.date, 2012, 1, 1);
                    expect(v.text).to.equal("test");
                });

                it("should accept date strings as date", function() {
                    var v = book.createVerification("2013-01-2", "text");

                    expect(v.book).to.equal(book);
                    expect(v.number).to.equal(1);
                    expect(bookie.isDatesEqual(v.date, "2013-01-02")).to.equal(true);
                    expect(v.text).to.equal("text");
                });

                it("should call extension methods when creating", function() {
                    var spy = sinon.spy();

                    book.use({
                        name: "test with no method",
                        init: function() {}
                    })
                    .use({
                        name: "test with method",
                        init: function() {},
                        createVerification: spy
                    });

                    var v = book.createVerification("2012-01-02", "test", { test: "hello" }, true);

                    expect(spy).to.have.been.calledOnce;
                    expect(spy).to.have.been.calledWith(v, { test: "hello" }, true);
                });
            });

            describe("getVerification", function() {
                var book;
                var verifications;

                beforeEach(function() {
                    book = new bookie.Book();
                    makeAccounts(book);
                    verifications = makeTransactions(book);
                });

                it("should be defined", function() {
                    expect(book.getVerification).to.be.a("function");
                });

                it("should return a verification", function() {
                    for(var i = 0; i < verifications.length; i++) {
                        expect(book.getVerification(i + 1)).to.eql(verifications[i]);
                    }
                });
            });

            describe("getVerifications", function() {
                var book;
                var verifications;

                beforeEach(function() {
                    book = new bookie.Book();
                    makeAccounts(book);
                    verifications = makeTransactions(book);
                });

                it("should return the verifications between the dates", function() {
                    expect(book.getVerifications()).to.eql(verifications);

                    function expected(from, to) {
                        return _.filter(verifications, function(v) {
                            return bookie.isInsideDates(v.date, from, to);
                        });
                    }

                    function test(from, to) {
                        expect(book.getVerifications(from, to)).to.eql(expected(from, to));
                    }

                    test("2012-03-09");
                    test("2012-03-09", "2012-03-09");
                    test(null, "2012-03-09");
                    test("2010-01-01", "2015-01-01");
                });
            });

            describe("touches", function() {
                var book;
                var verifications;

                beforeEach(function() {
                    book = new bookie.Book();
                    makeAccounts(book);
                    verifications = makeTransactions(book);
                });

                it("should be defined", function() {
                    expect(verifications[0].touches).to.be.a("function");
                });

                it("should return true for the accounts that the verification touches", function() {
                    expect(verifications[0].touches(1930)).to.equal(false);
                    expect(verifications[0].touches(2010)).to.equal(true);
                    expect(verifications[0].touches(2020)).to.equal(false);
                    expect(verifications[0].touches(2640)).to.equal(true);
                    expect(verifications[0].touches(book.getAccount(2645))).to.equal(false);
                    expect(verifications[0].touches(book.getAccount(6500))).to.equal(true);
                });
            });

            it("should be able to transact accounts", function() {
                var v = book.createVerification("2012-02-11", "Domain names");
                v.credit(2010, 188);
                v.debit(2640, 37.6);
                v.debit(6500, 150.4);

                function sum(container) {
                    return _.reduce(container, function(sum, transaction) {
                        return sum + transaction.amount;
                    }, 0);
                }

                expect(sum(v.credits)).to.equal(188);
                expect(sum(v.debits)).to.equal(188);

                //Should also work to transact with account objects.
                v = book.createVerification("2012-03-04", "Paper holders");
                v.credit(book.getAccount(2010), 29);
                v.debit(book.getAccount(2640), 5.8);
                v.debit(book.getAccount(6100), 23.2);

                expect(sum(v.credits)).to.equal(29);
                expect(sum(v.debits)).to.equal(29);
            });

            it("should be able to validate credit and debit balance", function() {
                makeTransactions(book);

                _.forEach(book.verifications, function(v) {
                    expect(v.isBalancedCreditDebit(), "V. nr: " + v.number).to.equal(true);
                });
            });
        });

        describe("Accounts", function() {
            var book;

            beforeEach(function() {
                book = new bookie.Book();

                makeAccounts(book);
                makeTransactions(book);
            });

            describe("createAccount", function() {
                it("should be defined", function() {
                    expect(book.createAccount).to.be.a("function");
                });

                it("should create a new Account instance", function() {
                    var account = book.createAccount(1337, "test");

                    expect(account.book).to.equal(book);
                    expect(account.number).to.equal(1337);
                    expect(account.name).to.equal("test");
                });

                it("should not be able to create mutliple accounts with same number", function() {
                    book.createAccount(1337, "test");

                    expect(function() {
                        book.createAccount(1337, "daw");
                    }).to.throw(Error);
                });
            });

            describe("getAccount", function() {
                it("should be defined", function() {
                    expect(book.getAccount).to.be.a("function");
                });

                it("should return accounts by number", function() {
                    expect(book.createAccount(1337, "test")).to.equal(book.getAccount(1337));
                    expect(book.getAccount(9999)).to.equal(null);
                });

                it("should throw error on invalid arguments", function() {
                    expect(function() {
                        book.getAccount(true);
                    }).to.throw(Error);

                    expect(function() {
                        book.getAccount(new Date());
                    }).to.throw(Error);

                    expect(function() {
                        book.getAccount("adwadawd");
                    }).to.throw(Error);
                });
            });

            describe("getAccounts", function() {
                it("should be defined", function() {
                    expect(book.getAccounts).to.be.a("function");
                });

                // Unsure about this functionality.
                // it("should return all accounts", function() {
                //     expect(book.getAccounts()).to.include.members([
                //         book.getAccount(1930),
                //         book.getAccount(2010),
                //         book.getAccount(2020),
                //         book.getAccount(2640),
                //         book.getAccount(5400),
                //         book.getAccount(6100),
                //         book.getAccount(6500),
                //     ]);
                // });

                it("should throw on unknown classifier type", function() {
                    expect(function() {
                        book.getAccounts("foo");
                    }).to.throw(Error);

                    expect(function() {
                        book.getAccount();
                    }).to.throw(Error);
                });
            });

            it("should be able to sum transactions", function() {
                expect(book.getAccount(2010).sumDebit()).to.equal(0);
                expect(book.getAccount(2010).sumCredit()).to.equal(266);

                expect(book.getAccount(2020).sumDebit()).to.equal(0);
                expect(book.getAccount(2020).sumCredit()).to.equal(7195);

                expect(book.getAccount(2640).sumDebit()).to.equal(1492.2);
                expect(book.getAccount(2640).sumCredit()).to.equal(0);

                expect(book.getAccount(5400).sumDebit()).to.equal(5756);
                expect(book.getAccount(5400).sumCredit()).to.equal(0);

                expect(book.getAccount(6100).sumDebit()).to.equal(62.4);
                expect(book.getAccount(6100).sumCredit()).to.equal(0);

                expect(book.getAccount(6500).sumDebit()).to.equal(150.4);
                expect(book.getAccount(6500).sumCredit()).to.equal(0);
            });

            it("should be able to sum transactions by date filter", function() {
                expect(book.getAccount(2010).sumDebit("2012-02-11")).to.equal(0);
                expect(book.getAccount(2010).sumCredit("2012-03-09")).to.equal(49);

                expect(book.getAccount(2020).sumDebit()).to.equal(0);
                expect(book.getAccount(2020).sumCredit(null, "2012-03-24")).to.equal(7195);

                expect(book.getAccount(2640).sumDebit("2012-03-04", "2012-03-09")).to.equal(15.6);
                expect(book.getAccount(2640).sumCredit()).to.equal(0);

                expect(book.getAccount(5400).sumDebit("2014-01-01")).to.equal(0);
                expect(book.getAccount(5400).sumCredit()).to.equal(0);

                expect(book.getAccount(6100).sumDebit("2012-03-04", "2012-03-04")).to.equal(23.2);
                expect(book.getAccount(6100).sumCredit()).to.equal(0);

                expect(book.getAccount(6500).sumDebit("2011-1-1", "2015-1-1")).to.equal(150.4);
                expect(book.getAccount(6500).sumCredit()).to.equal(0);
            });

            it("should be able to sum transactions by custom filter", function() {
                expect(book.getAccount(2010).sumDebit("2012-02-11")).to.equal(0);
                expect(book.getAccount(2010).sumCredit("2012-03-09", null, function() {
                    return 1337;
                })).to.equal(1337 * 2);

                expect(book.getAccount(2020).sumDebit()).to.equal(0);
                expect(book.getAccount(2020).sumCredit(null, "2012-03-24", function(verification) {
                    return (verification.amount % 2 === 0) ? verification.amount : 0;
                })).to.equal(0);

                expect(book.getAccount(2640).sumDebit("2012-03-04", "2012-03-09")).to.equal(15.6);
                expect(book.getAccount(2640).sumCredit()).to.equal(0);

                expect(book.getAccount(5400).sumDebit("2014-01-01")).to.equal(0);
                expect(book.getAccount(5400).sumCredit()).to.equal(0);

                expect(book.getAccount(6100).sumDebit("2012-03-04", "2012-03-04")).to.equal(23.2);
                expect(book.getAccount(6100).sumCredit()).to.equal(0);

                expect(book.getAccount(6500).sumDebit("2011-1-1", "2015-1-1")).to.equal(150.4);
                expect(book.getAccount(6500).sumCredit()).to.equal(0);
            });
        });

        describe("Classifying", function() {
            var book;

            beforeEach(function() {
                book = new bookie.Book();
                makeAccounts(book);
                makeTransactions(book);
            });

            describe("addClassifier", function() {
                it("should be defined", function() {
                    expect(book.addClassifier).to.be.a("function");
                });

                it("should be able to add classifiers", function() {
                    book.addClassifier("balance", function() {
                        return "test";
                    });

                    expect(book.classifiers.balance).to.have.length(1);
                    expect(book.classifiers.balance[0]()).to.equal("test");

                    book.addClassifier("balance", function() {
                        return 1337;
                    });

                    expect(book.classifiers.balance).to.have.length(2);
                    expect(book.classifiers.balance[1]()).to.equal(1337);
                });

                it("should throw on invalid arguments", function() {
                    expect(function() {
                        book.addClassifier(1311, function() {});
                    }).to.throw(Error);

                    expect(function() {
                        book.addClassifier(true, function() {});
                    }).to.throw(Error);

                    expect(function() {
                        book.addClassifier("test", true);
                    }).to.throw(Error);
                });
            });

            it("getAccounts should be able to retrieve by classified type", function() {
                book.addClassifier("balance", function(account) {
                    return account.number >= 1000 && account.number < 3000;
                });

                book.addClassifier("result", function(account) {
                    return account.number >= 3000 && account.number < 8000;
                });

                expect(book.getAccounts("balance")).to.eql([
                    book.getAccount(1930),
                    book.getAccount(2010),
                    book.getAccount(2020),
                    book.getAccount(2640)
                ]);

                expect(book.getAccounts("result")).to.eql([
                    book.getAccount(5400),
                    book.getAccount(6100),
                    book.getAccount(6500)
                ]);
            });
        });
    });

    describe("Exporting", function() {
        describe("exportAccount", function() {
            var book;

            beforeEach(function() {
                book = new bookie.Book();
                makeAccounts(book);
                makeTransactions(book);
            });

            it("should be defined", function() {
                expect(bookie.exportAccount).to.be.a("function");
            });

            it("should export an account", function() {
                var object;

                object = bookie.exportAccount(book.getAccount(1930));

                expect(object).to.be.an("object");
                expect(object._format).to.equal("bookie.account");
                expect(object._version).to.equal(bookie.version);
                expect(object.number).to.equal(1930);
                expect(object.name).to.equal("Bank");
                expect(object.debits).to.eql([]);
                expect(object.credits).to.eql([]);

                object = bookie.exportAccount(book.getAccount(2010));

                expect(object).to.be.an("object");
                expect(object._format).to.equal("bookie.account");
                expect(object._version).to.equal(bookie.version);
                expect(object.number).to.equal(2010);
                expect(object.name).to.equal("Own capital John Doe");
                expect(object.debits).to.eql([]);
                expect(object.credits).to.eql([
                    {
                        verification: 1,
                        amount: 188
                    },
                    {
                        verification: 2,
                        amount: 29
                    },
                    {
                        verification: 3,
                        amount: 31
                    },
                    {
                        verification: 4,
                        amount: 18
                    }
                ]);

                object = bookie.exportAccount(book.getAccount(5400), true);

                expect(object).to.be.an("object");
                expect(object._format).to.be.an("undefined");
                expect(object._version).to.be.an("undefined");
                expect(object.number).to.equal(5400);
                expect(object.name).to.equal("Usage inventory");
                expect(object.debits).to.eql([
                    {
                        verification: 5,
                        amount: 5756
                    }
                ]);
                expect(object.credits).to.eql([]);
            });
        });

        describe("exportVerification", function() {
            var book;

            beforeEach(function() {
                book = new bookie.Book();
                makeAccounts(book);
                makeTransactions(book);
            });

            it("should be defined", function() {
                expect(bookie.exportVerification).to.be.a("function");
            });

            it("should export a verification", function() {
                var object;

                object = bookie.exportVerification(book.getVerification(1));

                expect(object).to.be.an("object");
                expect(object._format).to.equal("bookie.verification");
                expect(object._version).to.equal(bookie.version);
                expect(object.number).to.equal(1);
                expect(object.date).to.equal("2012-02-11");
                expect(object.text).to.equal("Domain names");
                expect(object.debits).to.eql([
                    {
                        account: 2640,
                        amount: 37.6
                    },
                    {
                        account: 6500,
                        amount: 150.4
                    }
                ]);
                expect(object.credits).to.eql([
                    {
                        account: 2010,
                        amount: 188
                    }
                ]);

                object = bookie.exportVerification(book.getVerification(5));

                expect(object).to.be.an("object");
                expect(object._format).to.equal("bookie.verification");
                expect(object._version).to.equal(bookie.version);
                expect(object.number).to.equal(5);
                expect(object.date).to.equal("2012-03-24");
                expect(object.text).to.equal("iPad");
                expect(object.debits).to.eql([
                    {
                        account: 2640,
                        amount: 1439
                    },
                    {
                        account: 5400,
                        amount: 5756
                    }
                ]);
                expect(object.credits).to.eql([
                    {
                        account: 2020,
                        amount: 7195
                    }
                ]);

                object = bookie.exportVerification(book.getVerification(3), true);

                expect(object).to.be.an("object");
                expect(object._format).to.equal(undefined);
                expect(object._version).to.equal(undefined);
                expect(object.number).to.equal(3);
                expect(object.date).to.equal("2012-03-09");
                expect(object.text).to.equal("Office stuff");
                expect(object.debits).to.eql([
                    {
                        account: 2640,
                        amount: 6.2
                    },
                    {
                        account: 6100,
                        amount: 24.8
                    }
                ]);
                expect(object.credits).to.eql([
                    {
                        account: 2010,
                        amount: 31
                    }
                ]);
            });
        });

        describe("exportBook", function() {
            var book;

            beforeEach(function() {
                book = new bookie.Book();
                makeAccounts(book);
                makeTransactions(book);
            });

            it("should be defined", function() {
                expect(bookie.exportBook).to.be.a("function");
            });

            it("should export a book", function() {
                var accounts = _.map(book.getAccounts(), function(account) {
                    return bookie.exportAccount(account, true);
                });

                var verifications = _.map(book.getVerifications(), function(verification) {
                    return bookie.exportVerification(verification, true);
                });

                var object;

                object = bookie.exportBook(book);

                expect(object).to.be.an("object");
                expect(object._format).to.equal("bookie.book");
                expect(object._version).to.equal(bookie.version);
                expect(object.accounts).to.eql(accounts);
                expect(object.verifications).to.eql(verifications);
                expect(object.extensions).to.eql([]);

                object = bookie.exportBook(book, true);

                expect(object).to.be.an("object");
                expect(object._format).to.equal(undefined);
                expect(object._version).to.equal(undefined);
                expect(object.accounts).to.eql(accounts);
                expect(object.verifications).to.eql(verifications);
                expect(object.extensions).to.eql([]);

                book
                .use({
                    name: "extension-test",
                    init: function() {}
                })
                .use({
                    name: "test åäö",
                    init: function() {}
                });

                object = bookie.exportBook(book);

                expect(object).to.be.an("object");
                expect(object._format).to.equal("bookie.book");
                expect(object._version).to.equal(bookie.version);
                expect(object.accounts).to.eql(accounts);
                expect(object.verifications).to.eql(verifications);
                expect(object.extensions).to.eql(["extension-test", "test åäö"]);
            });
        });

        describe("export", function() {
            var book;

            beforeEach(function() {
                book = new bookie.Book();
                makeAccounts(book);
                makeTransactions(book);
            });

            it("should be defined", function() {
                expect(bookie.export).to.be.a("function");
            });

            it("should be smart and export objects by instance type", function() {
                var account = book.getAccount(6100);
                expect(bookie.export(account)).to.eql(bookie.exportAccount(account));

                var verification = book.getVerification(3);
                expect(bookie.export(verification)).to.eql(bookie.exportVerification(verification));

                expect(bookie.export(book)).to.eql(bookie.exportBook(book));
            });
        });

        it("export methods should also be present in objects", function() {
            var book = new bookie.Book();
            makeAccounts(book);
            makeTransactions(book);

            function test(arg) {
                expect(book.getAccount(2640).export(arg)).to.eql(bookie.export(book.getAccount(2640), arg));
                expect(book.getVerification(3).export(arg)).to.eql(bookie.export(book.getVerification(3), arg));
                expect(book.export(arg)).to.eql(bookie.export(book, arg));
            }

            test();
            test(true);
        });
    });

    describe("Importing", function() {
        describe("importBook", function() {
            var book;

            beforeEach(function() {
                book = new bookie.Book();
                makeAccounts(book);
                makeTransactions(book);
            });

            it("should be defined", function() {
                expect(bookie.importBook).to.be.a("function");
            });

            it("should import exported data", function() {
                var data = bookie.export(book);

                var b = new bookie.Book();
                bookie.importBook(b, data);

                expect(b).to.eql(book);
            });

            it("should be okay with existing accounts if matching", function() {
                var data = bookie.export(book);

                var b = new bookie.Book();
                makeAccounts(b);
                bookie.importBook(b, data);

                expect(b).to.eql(book);
            });

            it("should also be present as import method in Book", function() {
                var data = book.export();

                var b = new bookie.Book();
                var b2 = new bookie.Book();

                expect(b.import(data)).to.eql(bookie.importBook(b2, data));
            });
        });
    });
});
