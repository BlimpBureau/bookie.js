/* jshint expr: true */

"use strict";

var ExtensionHandler = require("../../../src/extension/extension-handler");

describe("ExtensionHandler", function() {
    describe("register", function() {
        it("should register extensions", function() {
            var extensionHandler = new ExtensionHandler();
            var spy = sinon.spy();

            var extension = {
                name: "test",
                init: spy
            };

            var book = {};
            extensionHandler.register(book, extension);

            expect(spy).to.have.been.calledOnce;
            expect(spy).to.have.been.calledWith(book);
            expect(extensionHandler.extensions.test).to.equal(extension);
        });

        it("should throw on using already registered extension", function() {
            var extensionHandler = new ExtensionHandler();
            var spy = sinon.spy();

            var extension = {
                name: "test",
                init: spy
            };

            extensionHandler.register(null, extension);

            expect(spy).to.have.been.calledOnce;

            expect(function() {
                extensionHandler.register(null, extension);
            }).to.throw(Error);

            expect(spy).to.have.been.calledOnce;
        });

        it("should throw on invalid extension", function() {
            var extensionHandler = new ExtensionHandler();
            var spy = sinon.spy();

            expect(function() {
                extensionHandler.register();
            }).to.throw(Error);

            expect(function() {
                extensionHandler.register(true);
            }).to.throw(Error);

            expect(function() {
                extensionHandler.register({
                    foo: "bar"
                });
            }).to.throw(Error);

            expect(function() {
                extensionHandler.register({
                    name: true,
                    init: spy
                });
            }).to.throw(Error);
            expect(spy).to.not.have.been.called;

            expect(function() {
                extensionHandler.register({
                    name: "test",
                    init: true
                });
            }).to.throw(Error);
        });
    });

    describe("isRegistered", function() {
        it("return boolean indicating using of an extension", function() {
            var extensionHandler = new ExtensionHandler();

            expect(extensionHandler.isRegistered("")).to.equal(false);
            expect(extensionHandler.isRegistered("test")).to.equal(false);

            var extension1 = {
                name: "test",
                init: _.noop
            };

            var extension2 = {
                name: "test2",
                init: _.noop
            };

            extensionHandler.register(null, extension1);

            expect(extensionHandler.isRegistered("test")).to.equal(true);
            expect(extensionHandler.isRegistered("test2")).to.equal(false);

            extensionHandler.register(null, extension2);

            expect(extensionHandler.isRegistered("test")).to.equal(true);
            expect(extensionHandler.isRegistered("test2")).to.equal(true);
            expect(extensionHandler.isRegistered("")).to.equal(false);

            expect(extensionHandler.isRegistered(extension1)).to.equal(true);
            expect(extensionHandler.isRegistered(extension2)).to.equal(true);
            expect(extensionHandler.isRegistered({
                name: "no"
            })).to.equal(false);
        });
    });

    describe("get", function() {
        it("should return extension by name", function() {
            var extensionHandler = new ExtensionHandler();
            var extension = {
                name: "test",
                init: _.noop
            };

            extensionHandler.register(null, extension);

            expect(extensionHandler.get("test")).to.eql(extension);
            expect(extensionHandler.get()).to.equal(null);
        });
    });

    describe("getMethods", function() {
        it("should return all extension methods by the given method name", function() {
            var extensionHandler = new ExtensionHandler();
            var method1 = function() {};
            var method2 = function() {};
            var method3 = function() {};
            extensionHandler.register(null, {
                name: "1",
                init: _.noop,
                test: method1
            });
            extensionHandler.register(null, {
                name: "2",
                init: _.noop,
                test: method2
            });
            extensionHandler.register(null, {
                name: "3",
                init: _.noop,
                other: method3
            });

            expect(extensionHandler.getMethods()).to.eql([]);
            expect(extensionHandler.getMethods("something")).to.eql([]);
            expect(extensionHandler.getMethods("test")).to.have.members([method1, method2]);
            expect(extensionHandler.getMethods("other")).to.have.members([method3]);
        });
    });

    describe("callMethods", function() {
        it("should call all extension methods by the given method name with given arguments", function() {
            var extensionHandler = new ExtensionHandler();
            var method1 = sinon.spy();
            var method2 = sinon.spy();
            var method3 = sinon.spy();
            extensionHandler.register(null, {
                name: "1",
                init: _.noop,
                test: method1
            });
            extensionHandler.register(null, {
                name: "2",
                init: _.noop,
                test: method2
            });
            extensionHandler.register(null, {
                name: "3",
                init: _.noop,
                other: method3
            });

            extensionHandler.callMethods(); //Should not throw.

            extensionHandler.callMethods("test");
            expect(method1).to.have.been.calledOnce;
            expect(method1).to.have.been.calledWith(undefined);
            expect(method2).to.have.been.calledOnce;
            expect(method2).to.have.been.calledWith(undefined);

            var args = [1, true, "hello"];
            extensionHandler.callMethods("test", args);
            expect(method1).to.have.been.calledTwice;
            expect(method1).to.have.been.calledWith(args[0], args[1], args[2]);
            expect(method2).to.have.been.calledTwice;
            expect(method2).to.have.been.calledWith(args[0], args[1], args[2]);

            extensionHandler.callMethods("other", args);
            expect(method3).to.have.been.calledOnce;
            expect(method3).to.have.been.calledWith(args[0], args[1], args[2]);
        });
    });
});
