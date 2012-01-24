var assert = require('assert');

var baseenc = require('../lib/baseenc');

function test_from32_to16() {
    var f = baseenc.from32.to16;

    assert.equal(f('AAAA'), '00000');
    assert.equal(f('7777'), 'fffff');
    assert.equal(f('AAAB'), '00001');
    assert.equal(f('QAAA'), '80000');
    assert.equal(f('5B4XIQOTUJ3HM45AAE6F3EK2IXRQVPPT'), 'e8797441d3a2767673a0013c5d915a45e30abdf3');
}

function test() {
    test_from32_to16();
}

exports.test = test;

test();
