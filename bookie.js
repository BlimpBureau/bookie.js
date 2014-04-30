(function() {
    "use strict";

    //------------ Module ------------

    function runInContext(_) {
        var bookie = {
            runInContext: runInContext
        };

        if(!_) {
            if(console && console.error) {
                console.error("Failed to load lodash dependency.");
            }

            return bookie;
        }

        //==================== Account ====================

        var Account = (function() {
            function Account(book, number, name) {
                if(!isValidBook(book)) {
                    throw new Error("Account must have a valid Book instance reference.");
                }

                if(!_.isNumber(number) || !_.isString(name)) {
                    throw new Error("An account must have a number and a name.");
                }

                this.book = book;
                this.number = number;
                this.name = name;

                this.debits = [];
                this.credits = [];
            }

            Account.prototype.sumDebit = function(from, to) {
                return sumTransactions(this.debits, from, to);
            };

            Account.prototype.sumCredit = function(from, to) {
                return sumTransactions(this.credits, from, to);
            };

            function sumTransactions(container, from, to) {
                debugger;
                from = parseDate(from);
                to = parseDate(to);

                function isVerificationInsideDates(v) {
                    return (!from || v.date.getTime() >= from.getTime()) && (!to || v.date.getTime() <= to.getTime());
                }

                return _.reduce(container, function(sum, transcation) {
                    return sum + (isVerificationInsideDates(transcation.verification) ? transcation.amount : 0);
                }, 0) || 0;
            }

            return Account;
        })();

        //==================== Verification ====================

        var Verification = (function() {
            function Verification(book, date, text) {
                if(!isValidBook(book)) {
                    throw new Error("Verification must have a valid Book instance reference.");
                }

                if(!_.isDate(date) || !_.isString(text)) {
                    throw new Error("A verification must have a date and a text.");
                }

                this.book = book;
                this.date = date;
                this.text = text;
                this.number = book.getNextVerificationNumber();

                this.debits = [];
                this.credits = [];
            }

            function accountTransaction(verification, type, account, amount) {
                if(!isValidVerification(verification)) {
                    throw new Error("Invalid verification.");
                }

                var book = verification.book;

                if(!isValidAccount(book, account)) {
                    var accountnr = account;
                    account = book.getAccount(account);

                    if(!account) {
                        throw new Error("Invalid account: " + accountnr);
                    }
                }

                amount = bookie.round(amount);

                if(amount <= 0) {
                    throw new Error("Amount cannot be less or equal to zero.");
                }

                var vContainer = verification[type + "s"];
                var aContainer = account[type + "s"];

                vContainer.push({
                    account: account,
                    amount: amount
                });

                aContainer.push({
                    verification: verification,
                    amount: amount
                });
            }

            /**
             * Debits an account in the verification.
             * @param {Account | Number} account The account to debit. If number, the account will be fetched from the book.
             */
            Verification.prototype.debit = function(account, amount) {
                accountTransaction(this, "debit", account, amount);
                return this;
            }

            /**
             * Credits an account in the verification.
             * @param {Account | Number} account The account to credit. If number, the account will be fetched from the book.
             */
            Verification.prototype.credit = function(account, amount) {
                accountTransaction(this, "credit", account, amount);
                return this;
            }

            /**
             * Checks so that the sum of credit amounts equal the sum of debit amounts.
             * @return {bool} True if the verification is balanced. False otherwise.
             */
            Verification.prototype.isBalancedCreditDebit = function() {
                return sumTransactions(this.debits) === sumTransactions(this.credits);
            }

            function sumTransactions(container) {
                return _.reduce(container, function(sum, transaction) {
                    return sum + transaction.amount;
                }, 0);
            }

            return Verification;
        })();
        

        //==================== Book ====================

        var Book = (function() {
            /**
             * Creates a bookkeeping book that holds verifications on account changes.
             */
            function Book() {
                //The accounts of the book are stored as the account number as key.
                this.accounts = {};

                //The array of verifications. Will be kept ordered by verification id.
                this.verifications = [];

                this.nextVerificationNumber = 1;
            }

            /**
             * Creates a new account and adds it to the book.
             */
            Book.prototype.createAccount = function(number, name) {
                if(this.accounts[number]) {
                    throw new Error("An account with number " + number + "already exists.");
                }

                var account = new Account(this, number, name)
                this.accounts[number] = account;

                return account;
            }

            Book.prototype.getAccount = function(number) {
                if(!_.isNumber(number)) {
                    throw new Error("Invalid account number.");
                }

                var account = this.accounts[number];

                return account || null;
            }

            Book.prototype.createVerification = function(date, text) {
                var verification = new Verification(this, parseDate(date), text);

                this.verifications.push(verification);

                return verification;
            }

            Book.prototype.getNextVerificationNumber = function() {
                return this.nextVerificationNumber++;
            }

            return Book;
        })();

        //==================== Helpers ====================

        function parseDate(date) {
            function zeroFix(index) {
              if(parts[index].length == 1) {
                parts[index] = '0' + parts[index];
              }
            }

            if(_.isDate(date)) {
                return date;
            }

            if(!date || !_.isString(date)) {
                return null;
            }

            var parts = date.split('-');

            if(parts.length !== 3) {
                return null;
            }

            zeroFix(1);
            zeroFix(2);

            return new Date(parts.join('-'));
        }

        function round(number, decimals) {
            function _round(number, exp) {
                exp = +exp;
                number = +number;

                if(!number) {
                    throw new Error("Invalid number.");
                }

                if(!exp) {
                    return Math.round(number);
                }

                if(exp % 1 !== 0) {
                    throw new Error("Decimals must be an integer.");
                }

                // Shift
                number = number.toString().split('e');
                number = Math.round(+(number[0] + 'e' + (number[1] ? (+number[1] - exp) : -exp)));

                // Shift back
                number = number.toString().split('e');
                return +(number[0] + 'e' + (number[1] ? (+number[1] + exp) : exp));
            }

            var d = decimals ? decimals : bookie.roundDecimals;

            if(!d) {
                throw new Error("Invalid decimals.");
            }

            return _round(number, -d);
        }

        function isValidVerification(verification) {
            return verification instanceof Verification && isValidBook(verification.book);
        }

        function isValidBook(book) {
            return book instanceof Book;
        }

        function isValidAccount(book, account) {
            if(!isValidBook(book)) {
                throw new Error("Invalid book.");
            }

            return account instanceof Account && account.book === book;
        }

        //==================== Expose ====================

        bookie.Book = Book;
        bookie.round = round;
        bookie.parseDate = parseDate;
        bookie.roundDecimals = 2;

        return bookie;
    }

    //------------ Export ------------
    //Mainly taken from lodash.js and benchmark.js.

    //Used to determine if values are of the language type Object.
    var objectTypes = {
        "function": true,
        "object": true
    };

    //Used as a reference to the global object.
    var root = (objectTypes[typeof window] && window) || this;

    //Detect free variable `define`.
    var freeDefine = typeof define == "function" && typeof define.amd == "object" && define.amd && define;

    //Detect free variable `exports`.
    var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;

    //Detect free variable `module`.
    var freeModule = objectTypes[typeof module] && module && !module.nodeType && module;

    //Detect free variable `global` from Node.js or Browserified code and use it as `root`.
    var freeGlobal = freeExports && freeModule && typeof global == "object" && global;
    if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal || freeGlobal.self === freeGlobal)) {
        root = freeGlobal;
    }

    //Detect free variable `require`.
    var freeRequire = typeof require == "function" && require;

    //Detect the popular CommonJS extension `module.exports`.
    var moduleExports = freeModule && freeModule.exports === freeExports && freeExports;

    //Do the actual exporting.
    {
        //Check for AMD first.
        if(typeof define === "function" && typeof define.amd === "object" && define.amd) {
            //AMD environment.

            //Define anonymous module so it can be aliased.
            define("lodash", runInContext);
        } else {
            //Browser or node environment.

            //Make sure the dependencies are gets loaded and then create the module.
            var _ = (freeRequire && require("lodash")) || root._;
            var bookie = runInContext(_);

            //Check for `exports` after `define` in case a build optimizer adds an `exports` object.
            if (freeExports && freeModule) {
              //In Node.js or RingoJS.
              if (moduleExports) {
                (freeModule.exports = bookie).bookie = bookie;
              }
              //In Narwhal or Rhino -require.
              else {
                freeExports.bookie = bookie;
              }
            }
            else {
              //In a browser or Rhino.
              root.bookie = bookie;
            }
        }
    }
}).call(this);