/* global bookie:true, _:true, chai:true, expect:true */

bookie = require("../lib/bookie.js");
_ = require("lodash");
chai = require("chai");
sinon = require("sinon");

var sinonChai = require("sinon-chai");

chai.expect();
chai.use(sinonChai);

expect = chai.expect;