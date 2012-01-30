// Checks for syntax errors, bad module names, etc.
function test() {
    try {
        require('../lib/server');
        require('../lib/client/tools/record');
    } catch (e) {
        if (e.message === 'The "sys" module is now called "util".') {
            // This error is "okay"; in this case, it means whoever is running
            // the test doesn't have a patched version of the q-io module (which
            // is not in npm yet).  Sorry; it sucks.
            //
            // Pull request in question:
            // https://github.com/kriskowal/q-io/pull/1

            // Do nothing
        } else {
            throw e;
        }
    }
}

require('./runner').run(test, module);
