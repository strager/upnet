var url = require('url');
var crypto = require('crypto');
var fs = require('fs');

var hasOwn = require('../util/hasOwn');

function normalizeHashName(hashName) {
    return hashName.replace(/-/g, '');
}

function getHasher(hashName) {
    return crypto.createHash(normalizeHashName(hashName));
}

function hashFile(uri, hashes, callback) {
    var parsedURI = url.parse(uri, false /* query */, false /* // host */);
    var path = parsedURI.pathname;

    var hashers = hashes.map(getHasher);

    var stream = fs.createReadStream(path);
    stream.setEncoding('binary');
    stream.on('data', function (data) {
        hashers.forEach(function (hasher) {
            hasher.update(data);
        });
    });
    stream.on('end', function () {
        var h = { };
        hashes.forEach(function (hashName, i) {
            h[hashName] = new Buffer(hashers[i].digest('binary'), 'binary');
        });

        callback(null, h);
    });
    stream.on('error', function (err) {
        callback(err);
    });
}

var protocolHandlers = {
    'file:': hashFile
};

function hashByURI(uri, hashes, callback) {
    var parsedURI = url.parse(uri, false /* query */, false /* // host */);
    var protocol = parsedURI.protocol;

    if (typeof protocol === 'undefined') {
        protocol = 'file:';
    }

    if (hasOwn(protocolHandlers, protocol)) {
        var handler = protocolHandlers[protocol];
        handler(uri, hashes, callback);
    } else {
        callback(new Error("Unknown protocol: " + parsedURI.protocol));
    }
}

exports.byURI = hashByURI;
