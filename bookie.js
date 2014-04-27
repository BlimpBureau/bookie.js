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