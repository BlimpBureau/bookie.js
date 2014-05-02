/* jshint strict:false */
/* global bookie:true, _:true, chai:true, expect:true, bookieSwedishHBEF:true, sinon:true */

bookie = require("../lib/bookie.js");
bookieSwedishHBEF = require("../lib/extensions/swedish-hb-ef.js");
_ = require("lodash");
chai = require("chai");
sinon = require("sinon");

var sinonChai = require("sinon-chai");

chai.expect();
chai.use(sinonChai);

expect = chai.expect;