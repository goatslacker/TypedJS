var TypedJS = require('./typed');
typedjs_parser = require('./typedjs_parser');

var testjs = require('./examples/test.js');

TypedJS.addTest('join_char :: String -> String -> String', testjs);
TypedJS.runAll();
console.log(TypedJS.messages);
