var assert = require('assert');

var match = require('../../lib/util/match');

function test_isMatch() {
    assert.equal(true, match.isMatch({ a: 'test' }, { a: 'test' }));

    assert.equal(false, match.isMatch({ a: 'test' }, { b: 'test' }));
}

function test() {
    test_isMatch();
}

require('../runner').run(test, module);
