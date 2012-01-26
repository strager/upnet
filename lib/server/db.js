var url = require('url');
var path = require('path');

var metalink = require('./metalink');
var timestamp = require('./timestamp');
var resource = require('./resource');
var baseenc = require('../util/baseenc');
var hash = require('./hash');

var localMetalinks = [ ];

// TEMPORARY
localMetalinks.push({
    "files": {
        ".vimrc": {
            "hashes": {
                "sha-1": "e8797441d3a2767673a0013c5d915a45e30abdf3"
            },
            "urls": {
                "file:///alt/home/mg/.vimrc": { "priority": 1 }
            }
        }
    }
});

function recordMetalink(metalink, callback) {
    process.nextTick(function () {
        callback(new Error("recordMetalink not implemented"));
    });
}

// FIXME This function does too much
function recordURI(uri, callback) {
    hash.byURI(uri, [ 'sha-1' ], function (err, hashes) {
        if (err) return callback(err);

        var parsedURI = url.parse(uri, false /* query */, false /* // host */);
        var filename = path.basename(parsedURI.path);

        var urls = { };
        urls[uri] = { };

        Object.keys(hashes).forEach(function (hashName) {
            hashes[hashName] = baseenc.fromBuffer.to16(hashes[hashName]);
        });

        var metafile = {
            "urls": urls,
            "hashes": hashes
        };

        var files = { };
        files[filename] = metafile;

        var metalink = {
            "published": timestamp(Date.now()),
            "files": files
        };

        localMetalinks.push(metalink);

        callback(null, metalink);
    });
}

// TODO This function should probably return metafiles or
// something eventually (and not the URL's).
function lookUpLocal(urn) {
    return localMetalinks.reduce(function (acc, mlink) {
        var matched = metalink.urnMatches(mlink, urn).matched;

        var urls = matched.reduce(function (acc, filename) {
            var urls = Object.keys(mlink.files[filename].urls);
            return acc.concat(urls);
        }, [ ]);

        return acc.concat(urls);
    }, [ ]);
}

exports.lookUpLocal = lookUpLocal;
exports.recordMetalink = recordMetalink;
exports.recordURI = recordURI;
