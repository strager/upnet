var path = require('path');
var Q = require('q');
var Qfs = require('q-fs');

var metalink = require('../../util/metalink');
var resource = require('../resource');
var baseenc = require('../../util/baseenc');
var hash = require('../../util/hash');
var extend = require('../../util/extend');
var parseURI = require('../../util/parseURI');

var metafiles = [ ];
var initd = false;
var databaseFile = path.join(__dirname, '../../../database-metafile.json');

var init = Q.when(Qfs.read(databaseFile))
    .then(JSON.parse, function (err) {
        if (err.cause.code === 'ENOENT') {
            return [ ];
        }

        throw err;
    })
    .then(function (metafilesData) {
        metafiles = metafilesData;
        return;
    });

function reportError(err) {
    console.error(err);
}

function save() {
    return Qfs.write(databaseFile, JSON.stringify(metafiles))
        .fail(reportError);
}

function addMetafile(mfile) {
    return init.then(function () {
        metafiles.push(mfile);
        save();
        return;
    });
}

// FIXME This function does too much
function addMetafileByURI(uri) {
    var defer = Q.defer();

    hash.byURI(uri, [ 'sha-1' ], function (err, hashes) {
        if (err) return defer.reject(err);

        uri = parseURI(uri);
        var filename = path.basename(uri.path);

        var urls = { };
        urls[uri.href] = { };

        Object.keys(hashes).forEach(function (hashName) {
            hashes[hashName] = baseenc.fromBuffer.to16(hashes[hashName]);
        });

        var mfile = {
            "urls": urls,
            "hashes": hashes
        };

        addMetafile(mfile)
            .then(function () {
                defer.resolve(mfile);
            })
            .fail(reportError);
    });

    return defer.promise;
}

function lookUpMetafile(urn) {
    return init.then(function () {
        return metafiles.filter(function (mfile) {
            var matched = metalink.urnMatchesFile(mfile, urn);

            return matched === 'matched';
        }).map(extend.cloneDeep);
    });
}

exports.lookUp = lookUpMetafile;
exports.add = addMetafile;
exports.addByURI = addMetafileByURI;
