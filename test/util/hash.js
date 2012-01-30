var assert = require('assert');

var hash = require('../../lib/util/hash');

function test_getHasher() {
    function h(data, hashType) {
        var hasher = hash.getHasher(hashType);
        hasher.update(data, 'ascii');
        return hasher.digest('hex');
    }

    assert.equal(h('hello world', 'sha1'), '2aae6c35c94fcfb415dbe95f408b9ce91ee846ed');
    assert.equal(h('hello world', 'sha512'), '309ecc489c12d6eb4cc40f50c902f2b4d0ed77ee511a7c7a9bcd3ca86d4cd86f989dd35bc5ff499670da34255b45b0cfd830e81f605dcf7dc5542e93ae9cd76f');
    assert.equal(h('hello world', 'md5'), '5eb63bbbe01eeed093cb22bb8f5acdc3');
}

function test() {
    test_getHasher();
}

require('../runner').run(test, module);
