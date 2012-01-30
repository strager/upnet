var url = require('url');

var hasOwn = require('../util/hasOwn');
var metalink = require('../util/metalink');
var metafileDB = require('./db/metafile');
var match = require('../util/match');
var parse = require('../util/parse');

require('../util/extend').pollute(GLOBAL);

function findURL(options, callback) {
    var urls = { };
    urls[options.uri] = { };

    process.nextTick(function () {
        callback(null, {
            "urls": urls
        });
    });
}

function findMagnet(options, callback) {
    var parsedMagnet = parse.magnetURI(options.uri);

    if (parsedMagnet.xt) {
        findResource(cloneDeep(options, {
            uri: parsedMagnet.xt,
            allow: {
                'file:': false,
                'http:': true,
                'urn:': true
            }
        }), callback);
        return;
    }

    console.log(options, parsedMagnet);
    callback(new Error("Unknown magnet URI"));
}

function findURN(options, callback) {
    var urn = parse.urn(options.uri);
    metafileDB.lookUp(urn)
        .fail(callback)
        .then(function (mfiles) {
            var uris = mfiles.reduce(function (acc, mfile) {
                return acc.concat(Object.keys(mfile.urls));
            }, [ ]);

            if (!uris.length) {
                return callback(new Error("Could not find resource by URN"));
            }

            var resource = { };

            var doneCount = 0;
            var errs = [ ];

            function checkDone() {
                if (doneCount === uris.length) {
                    // Warning: errors (in errs array) are ignored
                    callback(null, resource);
                }
            }

            uris.forEach(function (uri) {
                findResource(cloneDeep(options, {
                    uri: uri,
                    allow: {
                        'http:': true,
                        'file:': true
                    }
                }), function (err, subResource) {
                    ++doneCount;

                    if (err) {
                        console.error(err);
                        errs.push(err);
                        checkDone();
                        return;
                    }

                    metalink.extend(resource, subResource);

                    checkDone();
                });
            }, { });
        });
}

var route = match.router([
    [ { protocol: 'http:' }, findURL ],
    [ { protocol: 'file:' }, findURL ],
    [ { protocol: 'magnet:' }, findMagnet ],
    [ { protocol: 'urn:' }, findURN ],
    [ { protocol: undefined }, findURL ]
]);

function findResource(options, callback) {
    try {
        var uri = parse.uri(options.uri);

        var protocol = uri.protocol;
        if (typeof protocol === 'undefined') {
            protocol = 'file:';
        }

        var canAllowProtocol = hasOwn(options.allow, protocol)
            && options.allow[protocol];
        if (!canAllowProtocol) {
            callback(new Error("Protocol not allowed: " + protocol));
            return;
        }

        route(uri, options, callback);
    } catch (e) {
        callback(e);
    }
}

exports.findURL = findURL;
exports.findMagnet = findMagnet;
exports.findURN = findURN;
exports.find = findResource;
