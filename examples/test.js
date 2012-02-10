
//+ add_all :: [Number] -> Number

function add_all(num_arr) {
  if (num_arr.length === 0) return 0;

  var count = num_arr.reduce(function (a, b) {
    a = a || 0;
    b = b || 0;
    return a + b;
  });

  return count;
}

//+ my_prop :: {name:String, valid:Boolean} -> Boolean | String

function my_prop(obj){
  if(obj.valid === true){
    return "true"; // Error, we are
  }                // returning a string here
  else{
    return obj.valid;
  }
}

//+ fullname :: {first:String, last:String} -> String
function fullname(obj){
  return obj.first + " " + obj.last;
}

//+ join_char :: String -> String -> String
function join_char(c1,c2){
  return c1;
}

//+ test_obj :: {name:String, email:String} -> {name:String, email:String}
function test_obj(o){
  return o;
}

//+ test_or :: {name:String, email:String} -> String
function test_or(o){
  return "f";
};

//+ test_arr :: String | Number -> String -> [String | Number]
function test_arr(s1,s2){
  return [s1,s2];
}

MyObj = {
  //+ MyObj.test_fun :: Number -> Number -> Number
  test_fun:function(num1, num2){
    return num1 + num2;
  }
}

if (typeof module !== 'undefined') {
  module.exports = join_char;
}
