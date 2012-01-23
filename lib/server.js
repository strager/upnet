var url = require('url');
var extend_ = require('node.extend');

var extend = extend_.bind(null, false);
var extendDeep = extend_.bind(null, true);

function clone(obj /* extensions... */) {
    return extend.bind(null, { }).apply(null, arguments);
}

function cloneDeep(obj /* extensions... */) {
    return extendDeep.bind(null, { }).apply(null, arguments);
}

function tryServeHTTP(req, res, options, callback) {
    var parsedURI = url.parse(options.uri, false /* query */, false /* // host */);

    switch (parsedURI.pathname) {
    case '/magnet:':
        return tryServe(req, res, cloneDeep(options, {
            uri: parsedURI.path.slice(1),
            allow: {
                'magnet:': true
            }
        }), callback);

    default:
        return callback(extend(
            new Error("Unknown request URI"),
            { status: 404 }
        ));
    }
}

function tryServeFile(req, res, options, callback) {
    callback(new Error("Serving files not implemented"));
}

function tryServeMagnet(req, res, options, callback) {
    // TODO
    res.writeHead('200', { 'content-type': 'text/plain' });
    res.end("Serving magnet contents for " + options.uri + " (not)");
    callback(null);
}

function tryServe(req, res, options, callback) {
    var parsedURI = url.parse(options.uri, false /* query */, false /* // host */);
    var protocol = parsedURI.protocol;

    if (!options.allow[protocol]) {
        return callback(extend(
            new Error("Protocol not allowed: " + protocol),
            { status: 403 }
        ));
    }

    // TODO Object LUT
    switch (protocol) {
    case 'http:':
        return tryServeHTTP(req, res, options, callback);
    case 'file:':
        return tryServeFile(req, res, options, callback);
    case 'magnet:':
        return tryServeMagnet(req, res, options, callback);
    default:
        return callback(extend(
            new Error("Unknown protocol: " + parsedURI.protocol),
            { status: 501 }
        ));
    }
}

exports.tryServe = tryServe;
