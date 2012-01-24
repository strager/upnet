var url = require('url');
var extend_ = require('node.extend');

var magnet = require('./magnet');
var db = require('./db');

// Oh, you think it's this easy for a shallow extend function,
// right?  Hah!  Think again!
//var extend = extend_.bind(null, false);

var extendDeep = extend_.bind(null, true);

function extend(target /* extensions... */) {
    // jQuery.extend has this stupid idea that, if there are no
    // extensions, `target` is actually an extension of the
    // jQuery object (extend(t) => extend($, t), or something).
    // Why would you do that to a utility function?  =|
    if (arguments.length === 1) {
        return target;
    }

    // jQuery.extend's implementation is the worst ever.  It
    // can't accept `false` as its `deep` parameter.
    // Fucking hell.
    if (target === true) {
        target = { };
    }

    var extensions = Array.prototype.slice.call(arguments, 1);
    return extend_.apply(null, [ target ].concat(extensions));
}

function clone(obj /* extensions... */) {
    return extend.bind(null, { }).apply(null, arguments);
}

function cloneDeep(obj /* extensions... */) {
    return extendDeep.bind(null, { }).apply(null, arguments);
}

function tryServeHTTP(req, res, options, callback) {
    // Instead of proxying and serving the file ourselves, we
    // redirect the client to the resource.
    res.writeHead('307', { 'location': options.uri });
    res.end();
    callback(null);
}

function tryServeFile(req, res, options, callback) {
    var parsedURI = url.parse(options.uri, false /* query */, false /* // host */);
    var fs = require('fs');

    // TODO HTTP ranges
    // TODO Try to understand what the file is
    //      and serve a content-type guess

    var fileStream = fs.createReadStream(parsedURI.path);
    fileStream.on('error', function (err) {
        callback(err);
    });

    res.writeHead('200', { 'content-type': 'application/octet-stream' });
    fileStream.pipe(res.socket);
}

function tryServeMagnet(req, res, options, callback) {
    var parsedMagnet = magnet.parse(options.uri);

    if (parsedMagnet.xt) {
        return tryServe(req, res, cloneDeep(options, {
            uri: parsedMagnet.xt,
            allow: {
                'file:': false,
                'http:': true,
                'urn:': true
            }
        }), callback);
    }

    callback(extend(
        new Error("Unknown magnet URI"),
        { status: 501 }
    ));
}

function tryServeURN(req, res, options, callback) {
    var urn = magnet.parseURN(options.uri);
    var local = db.lookUpLocal(urn);
    if (!local || !local.length) {
        return callback(new Error("Could not find resource"));
    }

    // TODO Try serving all
    tryServe(req, res, cloneDeep(options, {
        uri: local[0],
        allow: {
            // TODO http:; currently we mix requests and redirects
            // and it's ugly
            'http:': false,
            'file:': true
        }
    }), callback);
}

var protocolHandlers = {
    'http:': tryServeHTTP,
    'file:': tryServeFile,
    'magnet:': tryServeMagnet,
    'urn:': tryServeURN
};

function tryServe(req, res, options, callback) {
    var parsedURI = url.parse(options.uri, false /* query */, false /* // host */);
    var protocol = parsedURI.protocol;

    var hop = Object.prototype.hasOwnProperty;

    var canAllowProtocol = hop.call(options.allow, protocol)
        && options.allow[protocol];

    if (!canAllowProtocol) {
        return callback(extend(
            new Error("Protocol not allowed: " + protocol),
            { status: 403 }
        ));
    }

    var handler = protocolHandlers[protocol];
    var canHandleProtocol = typeof handler === 'function'
        && hop.call(protocolHandlers, protocol);

    if (canHandleProtocol) {
        handler(req, res, options, callback);
    } else {
        callback(extend(
            new Error("Unknown protocol: " + parsedURI.protocol),
            { status: 501 }
        ));
    }
}

exports.tryServe = tryServe;
