var url = require('url');

function parseURI(uri) {
    // TODO Make more robust
    if (typeof uri === 'string') {
        return url.parse(uri, false /* query */, false /* // host */);
    } else {
        return uri;
    }
}

exports.uri = parseURI;
