(function (exports) {
  function isArray(arr) {
    if (typeof Array.isArray === 'function') {
      return Array.isArray(arr);
    } else {
      return Object.prototype.toString.call(arr) === '[object Array]';
    }
  }

  function typeOf(o) {
    var type = typeof o;

    if (type === 'object') {
      if (isArray(o)) {
        return 'array';
      } else if (o === null) {
        return 'null';
      } else if (Object.prototype.toString.call(o) === '[object RegExp]') {
        return 'regexp';
      } else if (Object.prototype.toString.call(o) === '[object Date]') {
        return 'date';
      } else {
        return type;
      }
    } else if (type === 'number') {
      if (isNaN(o)) {
        return 'nan';
      } else {
        return type;
      }
    } else {
      return type;
    }
  }


  function Tests() {
    this.tests = [];
    this.messages = [];
  }

  Tests.prototype.getTests = function getTests() {
    return this.tests.slice(0);
  };

  Tests.prototype.addTest = function addTest(signature, fn, redefine) {
    if (signature.indexOf('//+') === -1) {
      signature = '//+' + signature;
    }

    function comp_func(func) {
      var pieces = func.split(".");
      var curr_obj;
      for (var i = 0; i < pieces.length; i += 1) {
        if (i === 0) {
          curr_obj = window[pieces[0]];
        } else {
          curr_obj = curr_obj[pieces[i]]
        }
      }
      curr_obj.name = func;
      return curr_obj;
    }

    var base = JSON.parse(typedjs_parser.parse(signature));
    base.func_name = base.func;
    base.ret = base.args.pop();
    if (redefine) {
      TypedJS.redefine(base.func_name, base.args, base.ret);
    }
    base.func = fn || comp_func(base.func);

    this.tests.push(base);
    return base;
  };

  Tests.prototype.log = function log() {
    var msg = Array.prototype.slice.call(arguments, 0).join(' ');
    this.messages.push(msg);
  };


  Tests.prototype.runAll = function runAll(redefine) {
    var fail_count = 0;
    var func_fail = [];

    if (!this.tests && this.tests.length === 0) {
      throw new Error('Please define tests.');
    }

    var total_cases = this.tests.length * Tests.test_cases;

    this.tests.forEach(function (test) {
      var failures = run_test(test.args, test.func, test.ret, test.func_name, redefine);
      fail_count = fail_count + failures;
      if (failures > 0) {
        func_fail.push(test.func_name);
      }
    });

    this.log(total_cases, 'tests.');
    this.log(fail_count, 'failed.');
    (fail_count > 1) && this.log('Failures', func_fail);
  };

  Tests.test_cases =  200;


  function run_test(object, func, exp_typ, func_name, redefine) {
    var fail_count = 0;
    var i = 0;
    var happy_sig;
    var res = null;

    for (i; i < Tests.test_cases; i++) {
      happy_sig = TypedJS.walk_object(object);
      try {
        res = func.apply(null, (happy_sig));
        if (!redefine) {
          if (!TypedJS.check_type(res,exp_typ)) {
            throw new Error("Type Error: " + func_name + ": " +
                            "Expected " + JSON.stringify(exp_typ) +
                            " but returned " + JSON.stringify(res) +
                            " on input: " + JSON.stringify(happy_sig)
                            );
          }
        }
      } catch(e) {
        console.log(e.message);
        fail_count += 1;
      }
    }

    return fail_count;
  }



  function extractTypeSignatures(content) {
    var types = [];
    lines = content.split("\n");
    lines.forEach(function (line) {
      if (line.replace(" ",'').replace(' ','').indexOf("//+") == 0) {
        types.push(line);
      }
    });
    return types;
  }

  function test(fileName, signatures, redefine) {
    var tests = new Tests();
    tests.log(fileName);

    signatures.forEach(function (signature) {
      tests.addTest(signature, null, redefine);
    });

    tests.runAll();

    console.log(tests.messages);

    return tests;
  }


  var generate = {
    possible: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789`1234567890-=~!@#$%^&*()_+[]\{}|;':\",./<>?",
    string: function (len) {
      var text = "";
      for (var i = 0; i < len; i += 1) {
        text += this.possible.charAt(Math.floor(Math.random() * this.possible.length));
      }
      return text;
    },
    primitive: function (obj) {
      if (typeof(obj) === "string") {
        switch (obj) {
        case "number":
          return Math.round(Math.random() * 100);
        case "string":
          return this.string(10);
        case "boolean":
          if (Math.random() * 10 < 5) {
            return true;
          } else {
            return false;
          }
        default:
          return obj;
        }
      } else {
        throw new Error("Bad Input Type: " + typeOf(obj) + " -- this shouldn't happen.");
      }
    }
  };

  var TypedJS = {
    random_array_max_length:10,
    walk_object:function(obj){
      if(typeof(obj) === "object"){
        if(obj["array"] != undefined){
          var x = obj["array"], new_part = [],
              ran = Math.random()*TypedJS.random_array_max_length;
          for (var i = 1; i < ran; i++){
            new_part.push(TypedJS.walk_object(x));
          }
          return new_part;
        }
        else if(obj["or"] != undefined){
          var x = obj["or"], select = Math.floor(obj["or"].length * Math.random());
          return TypedJS.walk_object(obj["or"][select]);
        }
        else{
          var new_o;
          if (typeOf(obj) === "array") new_o = [];
          else new_o = {};
          for (i in obj){
            new_o[i] = TypedJS.walk_object(obj[i]);
          }
          return new_o;
        }
      }
      else{
        return generate.primitive(obj);
      }
    },
    check_type:function(obj,exp){
      if(exp === undefined || obj === undefined){
        return false;
      }
      if(exp["or"] != undefined){
        var tmp = false;
        for(i in exp["or"]){
          tmp = tmp || TypedJS.check_type(obj, exp["or"][i]);
        }
        return tmp;
      }
      else{
        var top = typeOf(obj);
        if(top === "array"){
          if(typeOf(exp) === "array"){
            var tmp = true;
            for(var i = 0; i < obj.length; i++){
              tmp = tmp && TypedJS.check_type(obj[i], exp[i])
            }
            return tmp;
          }
          else if(exp["array"] != undefined){
            var tmp = true;
            for(var i = 0; i < obj.length; i++){
              tmp = tmp && TypedJS.check_type(obj[i], exp["array"])
            }
            return tmp;
          }
          else{
            return false;
          }
        }
        else if(top === "object"){
          var tmp = true;
          for(i in obj){
            tmp = tmp && TypedJS.check_type(obj[i],exp[i]);
          }
          return tmp;
        }
        else{
          return top === exp;
        }
      }
    },
    // Checking types at runtime
    redefine:function(f_name, arg_types, ret_type){
      console.log(f_name);
      function wrap(f){
        return function(){
          try{
            if(arg_types != undefined){
              for(i in arguments){
                if(!TypedJS.check_type(arguments[i],arg_types[i])){
                  throw new Error("Type Error: Expected " + arg_types[i] + " but given " + JSON.stringify(arguments[i]));
                }
              }
            }
            if(ret_type != undefined){
              var ret = f.apply(this, arguments);
              if(!TypedJS.check_type(ret,ret_type)){
                throw new Error("Type Error: " + f_name +
                                ": Expected " + JSON.stringify(ret_type) +
                                " but returned " + JSON.stringify(ret) +
                                " on input args: " + JSON.stringify(arguments)
                                );
              }
              return ret;
            }
            return f.apply(this, arguments);
          }
          catch(e){
            console.log(e); // Do something more interesting here...
            throw e;
          }
        }
      };
      if(window[f_name] === undefined){
        var parts = f_name.split('.');
        var e_str = "window";
        for(i in parts){
          e_str = e_str + "[\"" + parts[i] + "\"]";
        }
        console.log(e_str);
        if(eval(e_str) === undefined){
          throw new Error("Function " + f_name + " does not exist.");
        }
        else{
          console.log("wrapping...");
          console.log(arg_types);
          e_str = e_str + "=wrap("+e_str+")";
          console.log(e_str);
          return eval(e_str);
        }
      }
      else{
        window[f_name] = wrap(window[f_name]);
        return window[f_name];
      }
    }
  }


  exports.TypedJS = {
    run_tests: function (redefine) {
      if (redefine === undefined) {
        redefine = false;
      }

      function request(url, cb) {
        var httpRequest;
        if (window.XMLHttpRequest) {
          httpRequest = new XMLHttpRequest();
        } else if (window.ActiveXObject) {
          httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
        }

        httpRequest.onreadystatechange = function requestReadyState() {
          if (httpRequest.readyState === 4) {
            cb(httpRequest.responseText);
          }
        };

        httpRequest.open('GET', url, true);
        httpRequest.send(null);
      }

      var scripts = Array.prototype.slice.call(document.getElementsByTagName('script'), 0);

      scripts.forEach(function (script) {
        request(script.src, function (data) {
          var types = extractTypeSignatures(data);

          if (types.length > 0) {
            test(script.src, types, redefine);
          }
        });
      });
    }
  };

  if (typeof module !== 'undefined') {
    module.exports = new Tests();
  }

}(this));
