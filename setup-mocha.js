/* jshint strict:false */
/* global _:true, chai:true, expect:true, sinon:true */

require("blanket")({});

_ = require("lodash");
chai = require("chai");
sinon = require("sinon");

var sinonChai = require("sinon-chai");

chai.expect();
chai.use(sinonChai);

expect = chai.expect;
