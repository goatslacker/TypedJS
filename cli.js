var TypedJS = require('./typed');
typedjs_parser = require('./typedjs_parser');

var vm = require('vm');
var fs = require('fs');

var data = fs.readFileSync('examples/test.js', 'utf-8');
var testjs = require('./examples/test.js');

// temporarily here
//window = {};
//vm.runInNewContext(data, window);

//TypedJS.run_tests('test.js', data);

var test = TypedJS.addTest('//+ join_char :: String -> String -> String', testjs);
TypedJS.go([test]);
//console.log(test);
