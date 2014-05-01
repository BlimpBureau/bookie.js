function makeTransactions(book) {
    book.createVerification("2012-02-11", "Domain names").credit(2010, 188).debit(2640, 37.6).debit(6500, 150.4);
    book.createVerification("2012-03-04", "Paper holders").credit(2010, 29).debit(2640, 5.8).debit(6100, 23.2);
    book.createVerification("2012-03-09", "Office stuff").credit(2010, 31).debit(2640, 6.2).debit(6100, 24.8);
    book.createVerification("2012-03-09", "Post stamps").credit(2010, 18).debit(2640, 3.6).debit(6100, 14.4);
    book.createVerification("2012-03-24", "iPad").credit(2020, 7195).debit(2640, 1439).debit(5400, 5756);
}

function makeAccounts(book) {
    book.createAccount(1930, "Bank");
    book.createAccount(2010, "Own capital John Doe");
    book.createAccount(2020, "Own capital Jane Doe")
    book.createAccount(2640, "Incoming VAT 25 %");
    book.createAccount(5400, "Usage inventory");
    book.createAccount(6100, "Office material");
    book.createAccount(6500, "External services");
}

describe("bookie.js", function() {
    it("should be defined", function() {
        expect(bookie).to.be.a("object");
    });

    describe("round", function() {
        it("should be defined and have roundDecimals in place", function() {
            expect(bookie.round).to.be.a("function");
        });

        it("should round numbers to the set decimals of roundDecimals", function() {
            expect(bookie.round(19.3141)).to.equal(19.31);
            expect(bookie.round(15.5)).to.equal(15.5);
            expect(bookie.round(15.555)).to.equal(15.56);
            expect(bookie.round(0.001)).to.equal(0);

            bookie.roundDecimals = 1;
            expect(bookie.round(19.3141, 1)).to.equal(19.3);
            expect(bookie.round(15.5, 1)).to.equal(15.5);
            expect(bookie.round(15.555, 1)).to.equal(15.6);
            expect(bookie.round(0.001, 1)).to.equal(0);
        });

        it("should be able to round really big numbers", function() {
            expect(bookie.round(1031313124120102401204102412401204102.121241512, 3)).to.equal(1031313124120102401204102412401204102.121);
            expect(bookie.round(1031313124120102401204102412401204114124124125125151251251202.1399, 3)).to.equal(1031313124120102401204102412401204114124124125125151251251202.14);
        });
    });

    describe("parseDate", function() {
        it("should be defined", function() {
            expect(bookie.parseDate).to.be.a("function");
        });

        function validDate(date, year, month, day) {
            expect(date.getDate()).to.equal(day);
            expect(date.getMonth()).to.equal(month-1);
            expect(date.getFullYear()).to.equal(year);
        }

        it("should return dates if given dates", function() {
            var date = new Date();

            expect(bookie.parseDate(date)).to.equal(date);
        });

        it("should parse string dates to dates", function() {
            var date;

            validDate(bookie.parseDate("2014-01-02"), 2014, 1, 2);
            validDate(bookie.parseDate("2014-1-2"), 2014, 1, 2);
        });

        it("should return null if unable to parse date", function() {
            expect(bookie.parseDate()).to.equal(null);
            expect(bookie.parseDate("adwd")).to.equal(null);
            expect(bookie.parseDate({wat:"sup"})).to.equal(null);
            expect(bookie.parseDate(1412)).to.equal(null);
            expect(bookie.parseDate(1337)).to.equal(null);
            expect(bookie.parseDate(true)).to.equal(null);
            expect(bookie.parseDate(1.1)).to.equal(null);
        });
    });

    describe("Book", function() {
        it("should have constructor defined", function() {
            expect(bookie.Book).to.be.a("function");
            expect((new bookie.Book()) instanceof bookie.Book).to.equal(true);
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
                expect(v.date.getTime()).to.equal((new Date("2013-01-02")).getTime());
                expect(v.text).to.equal("text"); 
            });
        });

        describe("Verifications", function() {
            var book;

            beforeEach(function() {
                book = new bookie.Book();

                makeAccounts(book);
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

                book.verifications.forEach(function(v) {
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

                it("Should create a new Account instance", function() {
                    var account = book.createAccount(1337, "test");
                    
                    expect(account.book).to.equal(book);
                    expect(account.number).to.equal(1337);
                    expect(account.name).to.equal("test");
                });

                it("Should not be able to create mutliple accounts with same number", function() {
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

                it("Should return accounts by number", function() {
                    expect(book.createAccount(1337, "test")).to.equal(book.getAccount(1337));
                    expect(book.getAccount(9999)).to.equal(null);
                });
            });

            describe("getAccounts", function() {
                it("should be defined", function() {
                    expect(book.getAccounts).to.be.a("function");
                });
                
                it("should return all accounts", function() {
                    expect(book.getAccounts()).to.include.members([
                        book.getAccount(1930),
                        book.getAccount(2010),
                        book.getAccount(2020),
                        book.getAccount(2640),
                        book.getAccount(5400),
                        book.getAccount(6100),
                        book.getAccount(6500),
                    ]);
                });
            });

            it("should be able to sum transactions", function() {
                expect(book.getAccount(2010).sumDebit()).to.equal(0)
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
                expect(book.getAccount(2010).sumDebit("2012-02-11")).to.equal(0)
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
});