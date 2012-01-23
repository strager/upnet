var url = require('url');

function parseURN(urnString) {
    // TODO This is quickly hacked together and isn't very resiliant
    return {
        sha1: {
            urnString.split(':')[2]
        }
    };
}

function parseMagnetURI(magnetURI) {
    var parsedURI = url.parse(magnetURI, true /* query */, false /* // host */);

    // TODO This is quickly hacked together and isn't very resiliant
    var parsed = {
        xt: {
            urn: parseURN(parsedURI.params.xt);
        }
    };

    return parsed;
}

exports.parse = parseMagnetURI;
