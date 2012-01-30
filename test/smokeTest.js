// Checks for syntax errors, bad module names, etc.
function test() {
    require('../lib/server');
    require('../lib/client/tools/record');
}

require('./runner').run(test, module);
