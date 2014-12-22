/* jshint expr: true */

"use strict";

var Book = require("../../src/book.js");

function getMockedFiscalYear() {
    var MockedFiscalYear = function() {};

    MockedFiscalYear.create = function(from, to) {
        return new MockedFiscalYear(from, to);
    };

    return MockedFiscalYear;
}

describe("Book", function() {
    describe("use", function() {
        it("should register extensions", function() {
            var spy = sinon.spy();

            var extension = {
                name: "test",
                apply: spy
            };

            var book = new Book();

            book.use(extension);

            expect(spy).to.have.been.calledOnce;
            expect(spy).to.have.been.calledWith(book);
            expect(book.extensions.test).to.equal(extension);
        });

        it("should throw on using already applied extension", function() {
            var spy = sinon.spy();

            var extension = {
                name: "test",
                apply: spy
            };

            var book = new Book();

            book.use(extension);

            expect(spy).to.have.been.calledOnce;

            expect(function() {
                book.use(extension);
            }).to.throw(Error);

            expect(spy).to.have.been.calledOnce;
        });

        it("should throw on invalid extension", function() {
            var spy = sinon.spy();

            var book = new Book();

            expect(function() {
                book.use();
            }).to.throw(Error);

            expect(function() {
                book.use(true);
            }).to.throw(Error);

            expect(function() {
                book.use({
                    foo: "bar"
                });
            }).to.throw(Error);

            expect(function() {
                book.use({
                    name: true,
                    apply: spy
                });
            }).to.throw(Error);
            expect(spy).to.not.have.been.called;

            expect(function() {
                book.use({
                    name: "test",
                    apply: true
                });
            }).to.throw(Error);
        });
    });

    describe("using", function() {
        it("return boolean indicating using of a extension name", function() {
            var book = new Book();

            expect(book.using("")).to.equal(false);
            expect(book.using("test")).to.equal(false);

            book.use({
                name: "test",
                apply: _.noop
            });

            expect(book.using("test")).to.equal(true);
            expect(book.using("test2")).to.equal(false);

            book.use({
                name: "test2",
                apply: _.noop
            });

            expect(book.using("test")).to.equal(true);
            expect(book.using("test2")).to.equal(true);
            expect(book.using("")).to.equal(false);
        });
    });

    describe("fiscal years", function() {
        describe("createFiscalYear", function() {
            it("should create fiscal years and add it to internal list", function() {
                var book = new Book({
                    FiscalYear: getMockedFiscalYear()
                });

                var fiscalYear1 = book.createFiscalYear("2012-01-01", "2012-12-31");
                expect(book.fiscalYears.length).to.equal(1);
                expect(book.fiscalYears[0]).to.eql(fiscalYear1);

                var fiscalYear2 = book.createFiscalYear("2011-01-01", "2011-12-31");
                expect(book.fiscalYears.length).to.equal(2);
                expect(book.fiscalYears[0]).to.equal(fiscalYear2);
                expect(book.fiscalYears[1]).to.equal(fiscalYear1);

                var fiscalYear3 = book.createFiscalYear("2009-06-01", "2010-12-31");
                expect(book.fiscalYears.length).to.equal(3);
                expect(book.fiscalYears[0]).to.equal(fiscalYear3);
                expect(book.fiscalYears[1]).to.equal(fiscalYear2);
                expect(book.fiscalYears[2]).to.equal(fiscalYear1);

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

            it("should apply extensions", function() {
                var spy = sinon.spy();

                var book = new Book({
                    FiscalYear: getMockedFiscalYear()
                });

                book.use({
                    name: "test with no method",
                    apply: function() {}
                })
                .use({
                    name: "test with method",
                    apply: function() {},
                    createFiscalYear: spy
                });

                var fy = book.createFiscalYear("2012-01-01", "2012-12-31", { test: "hello" }, true);

                expect(spy).to.have.been.calledOnce;
                expect(spy).to.have.been.calledWith(fy, { test: "hello" }, true);
            });
        });

        describe("getFiscalYear", function() {
            it("should return the fiscal years right by selector", function() {
                var MockedFiscalYear = getMockedFiscalYear();

                var fiscalYears = [
                    new MockedFiscalYear("2009-06-01", "2010-12-31"),
                    new MockedFiscalYear("2011-01-01", "2011-12-31"),
                    new MockedFiscalYear("2012-01-01", "2012-12-31")
                ];

                function test(selector, fiscalYearNumber) {
                    var book = new Book({
                        dateUtils: {
                            isInsideDates: function(date, from, to) {
                                var fy = fiscalYears[fiscalYearNumber - 1];
                                return from === fy.from && to === fy.to;
                            },
                            parse: function(date) {
                                return date;
                            }
                        }
                    });

                    book.fiscalYears = fiscalYears;

                    var fy = book.getFiscalYear(selector);

                    if(fiscalYearNumber !== null) {
                        expect(fy).to.eql(book.fiscalYears[fiscalYearNumber - 1]);
                    } else {
                        expect(fy).to.equal(null);
                    }
                }

                test("2012-01-01", 3);
                test("2012-04-12", 3);
                test(new Date("2010-01-02"), 1);
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
            it("should return the last fiscal year", function() {
                var book = new Book({
                    FiscalYear: getMockedFiscalYear()
                });
                book.createFiscalYear("2009-06-01", "2010-12-31");
                book.createFiscalYear("2011-01-01", "2011-12-31");
                var last = book.createFiscalYear("2012-01-01", "2012-12-31");

                expect(book.getLastFiscalYear()).to.eql(last);

                book = new Book();

                expect(book.getLastFiscalYear()).to.equal(null);
            });
        });
    });
    /*describe("Verifications", function() {
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
                var date = new Date();
                var v = book.createVerification(date, "text");

                expect(v.book).to.equal(book);
                expect(v.number).to.equal(1);
                expect(v.date).to.equal(date);
                expect(v.text).to.equal("text");

                v = book.createVerification(date, "test");
                expect(v.book).to.equal(book);
                expect(v.number).to.equal(2);
                expect(v.date).to.equal(date);
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
                    apply: function() {}
                })
                .use({
                    name: "test with method",
                    apply: function() {},
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
                        return bookie.insideDates(v.date, from, to);
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
    });*/
});
