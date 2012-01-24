var metalink = require('./metalink');

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
