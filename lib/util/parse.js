var url = require('url');

function parseURI(uri, parseQuery /* = false */) {
    // TODO Make more robust
    if (typeof uri === 'string') {
        return url.parse(uri, parseQuery, false /* // host */);
    } else {
        return uri;
    }
}

function parseURN(urnString) {
    // TODO This is quickly hacked together and isn't very resiliant
    return {
        raw: urnString,
        sha1: urnString.split(':')[2]
    };
}

function parseMagnetURI(magnetURI) {
    magnetURI = parseURI(magnetURI, true);

    // TODO
    return magnetURI.query;
}

exports.uri = parseURI;
exports.urn = parseURN;
exports.magnetURI = parseMagnetURI;
