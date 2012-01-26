/* Metalink JSON format
 *
 * This format is based on [RFC5854] and is incomplete.
 *
 * Based upon the second example of Section 1.1 of [RFC5854].
 *

    {
        "published": "2009-05-15T12:23:23Z",
        "files": {
            "example.ext": {
                "size": "14471447",
                "hashes": {
                    "sha-256": "f0ad929cd259957e160ea442eb80986b5f01..."
                },
                "urls": {
                    "ftp://ftp.example.com/example.ext": {
                        "priority": 1,
                    },
                    "http://example.com/example.ext": {
                        "priority": 1
                    }
                },
                "metaurls": {
                    "http://example.com/example.ext.torrent": {
                        "priority": 2,
                        "mediatype": "torrent"
                    }
                }
            },
            "example2.ext": {
                "size": 14471447,
                "hashes": {
                    "sha-256": "2f548ce50c459a0270e85a7d63b2383c5523..."
                },
                "urls": {
                    "ftp://ftp.example.com/example2.ext": {
                        "priority": 1
                    },
                    "http://example.com/example2.ext": {
                        "priority": 1
                    }
                },
                "metaurls": {
                    "http://example.com/example2.ext.torrent": {
                        "priority": 2
                    }
                }
            }
        }
    }

 *
 */

var hasOwn = require('../util/hasOwn');
var baseenc = require('../util/baseenc');

// Returns an object of the following form:
//
// {
//   "matched": [ ... ],
//   "failed": [ ... ],
//   "unknown": [ ... ]
// }
//
// `...` denotes an array of zero or more filename strings,
// as dictated by the metalink object.
//
// Files under "matched" matched all known hashes.  Note
// that there is still the possibility of a hash collision.
//
// Files under "failed" failed to match at least one known
// hash.  Such files conclusively do not match the URN.
//
// Files under "unknown" did not match because no
// corresponding hashes were found.  However, the file *may*
// still be present in the metalink; not enough information
// is available to conclude either way.
function urnMatches(metalink, urn) {
    var matched = [ ];
    var failed = [ ];
    var unknown = [ ];

    Object.keys(metalink.files).forEach(function (filename) {
        var metafile = metalink.files[filename];
        var hashes = Object(metafile.hashes);

        var matchCount = 0;
        var failCount = 0;

        // SHA-1
        if (hasOwn(urn, 'sha1') && hasOwn(hashes, 'sha-1')) {
            // urn:sha1: is base32, upper-case
            // metalink sha-1 is base base16, lower-case
            var urnHash = baseenc.from32.to16(urn['sha1']);
            var metaHash = hashes['sha-1'];

            if (urnHash === metaHash) {
                ++matchCount;
            } else {
                ++failCount;
            }
        }

        // TODO Find other common hashes
        //
        // (SHA-256 is highly recommended for metalink
        // files, but URN's do not commonly have SHA-256
        // hashes.)

        if (matchCount === 0 && failCount === 0) {
            unknown.push(filename);
        } else if (failCount > 0) {
            failed.push(filename);
        } else {
            matched.push(filename);
        }
    });

    return {
        matched: matched,
        failed: failed,
        unknown: unknown
    };
}

function extend(target, extension) {
    // TODO Naïve deep clone insufficient
    return require('node.extend')(true, target, extension);
}

function toURN(metalink) {
    // FIXME It seems all this if checking can be done by
    // some magical utility function.

    // FIXME Only handles one file
    var filename = Object.keys(metalink.files)[0];
    if (typeof filename === 'undefined') {
        throw new Error("File missing");
    }

    var file = metalink.files[filename];
    if (!file || typeof file !== 'object') {
        throw new Error("File data missing");
    }

    var hashes = file.hashes;
    if (!hashes || typeof hashes !== 'object') {
        throw new Error("Hash data missing");
    }

    if (typeof hashes['sha-1'] !== 'string') {
        throw new Error("SHA-1 hash missing");
    }

    return 'urn:sha1:' + baseenc.from16.to32(hashes['sha-1']);
}

exports.urnMatches = urnMatches;
exports.extend = extend;
exports.toURN = toURN;
