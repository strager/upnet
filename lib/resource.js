var url = require('url');

var hasOwn = require('./hasOwn');
var metalink = require('./metalink');
var magnet = require('./magnet');
var db = require('./db');

require('./extend').pollute(GLOBAL);

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
    var parsedMagnet = magnet.parse(options.uri);

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

    callback(new Error("Unknown magnet URI"));
}

function findURN(options, callback) {
    var urn = magnet.parseURN(options.uri);
    var localURIs = db.lookUpLocal(urn);
    if (!localURIs.length) {
        return callback(new Error("Could not find resource by URN"));
    }

    var resource = { };

    var doneCount = 0;
    var errs = [ ];

    function checkDone() {
        if (doneCount === localURIs.length) {
            // Warning: errors (in errs array) are ignored
            callback(null, resource);
        }
    }

    localURIs.forEach(function (uri) {
        findResource(cloneDeep(options, {
            uri: uri,
            allow: {
                'http:': true,
                'file:': true
            }
        }), function (err, subResource) {
            ++doneCount;

            if (err) {
                errs.push(err);
                checkDone();
                return;
            }

            metalink.extend(resource, subResource);

            checkDone();
        });
    }, { });
}

var protocolHandlers = {
    'http:': findURL,
    'file:': findURL,
    'magnet:': findMagnet,
    'urn:': findURN
};

function findResource(options, callback) {
    var parsedURI = url.parse(options.uri, false /* query */, false /* // host */);
    var protocol = parsedURI.protocol;

    var canAllowProtocol = hasOwn(options.allow, protocol)
        && options.allow[protocol];

    if (!canAllowProtocol) {
        return callback(new Error("Protocol not allowed: " + protocol));
    }

    var handler = protocolHandlers[protocol];
    var canHandleProtocol = typeof handler === 'function'
        && hasOwn(protocolHandlers, protocol);

    if (canHandleProtocol) {
        handler(options, callback);
    } else {
        callback(new Error("Unknown protocol: " + parsedURI.protocol));
    }
}

exports.findURL = findURL;
exports.findMagnet = findMagnet;
exports.findURN = findURN;
exports.find = findResource;
