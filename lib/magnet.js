var url = require('url');

function parseURN(urnString) {
    // TODO This is quickly hacked together and isn't very resiliant
    return {
        raw: urnString,
        sha1: urnString.split(':')[2]
    };
}

function parseMagnetURI(magnetURI) {
    var parsedURI = url.parse(magnetURI, true /* query */, false /* // host */);

    // TODO
    return parsedURI.query;
}

exports.parseURN = parseURN;
exports.parse = parseMagnetURI;
