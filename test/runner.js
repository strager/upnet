var path = require('path');

function run(test, module) {
    if (module === require.main) {
        test();

        // NOTE: This incorrectly reports that all tests pass
        // even if there are things to do in the event queue.
        console.log("All tests passed");
    } else {
        module.exports.test = function () {
            var testName = path.basename(module.filename, '.js');
            if (testName !== 'index') {
                console.log("Testing %s", testName);
            }

            return test.apply(this, arguments);
        };
    }
}

exports.run = run;
