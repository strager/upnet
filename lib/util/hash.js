var url = require('url');
var crypto = require('crypto');
var fs = require('fs');

var hasOwn = require('./hasOwn');
var match = require('./match');
var parseURI = require('./parseURI');

function normalizeHashType(hashType) {
    return hashType.replace(/-/g, '');
}

function getHasher(hashType) {
    return crypto.createHash(normalizeHashType(hashType));
}

function hashFile(uri, hashTypes, callback) {
    var path = uri.pathname;

    var hashers = hashTypes.map(getHasher);

    var stream = fs.createReadStream(path);
    stream.setEncoding('binary');
    stream.on('data', function (data) {
        hashers.forEach(function (hasher) {
            hasher.update(data);
        });
    });
    stream.on('end', function () {
        var h = { };
        hashTypes.forEach(function (hashType, i) {
            h[hashType] = new Buffer(hashers[i].digest('binary'), 'binary');
        });

        callback(null, h);
    });
    stream.on('error', function (err) {
        callback(err);
    });
}

var route = match.router([
    [ { protocol: 'file:' }, hashFile ],
    [ { protocol: undefined }, hashFile ]
]);

function hashByURI(uri, hashTypes, callback) {
    try {
        uri = parseURI(uri);

        var protocol = uri.protocol;
        if (typeof protocol === 'undefined') {
            protocol = 'file:';
        }

        route(uri, uri, hashTypes, callback);
    } catch (e) {
        callback(e);
    }
}

exports.byURI = hashByURI;
exports.getHasher = getHasher;
