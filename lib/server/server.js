var fs = require('fs');

var hasOwn = require('../util/hasOwn');
var match = require('../util/match');
var parse = require('../util/parse');

require('../util/extend').pollute(GLOBAL);

function resourceHeaders(resource) {
    // Broken implementation of http://tools.ietf.org/html/rfc6249

    // TODO FIXME Security problems?

    var links = [ ];
    var digests = [ ];

    Object.keys(Object(resource.urls)).forEach(function (uri) {
        uri = parse.uri(uri);
        if (uri.protocol !== "file:") {
            links.push("<" + uri.href + ">; rel=duplicate");
        }
    });

    Object.keys(Object(resource.hashes)).forEach(function (hashType) {
        // FIXME Are all hashes base16?
        digests.push(hashType + "=" + baseenc.from16.to64(resource[hashType]));
    });

    // TODO metaurls

    return {
        "Link": links,
        "Digest": digests
    };
}

function setResourceHeaders(res, resource) {
    var headers = resourceHeaders(resource);
    Object.keys(headers).forEach(function (header) {
        res.setHeader(header, headers[header]);
    });
}

function serveHTTPRedirect(req, res, uri, callback) {
    // Instead of proxying and serving the file ourselves, we
    // redirect the client to the resource.
    res.writeHead('307', { 'location': uri });
    res.end();
    callback(null);
}

function serveFile(req, res, uri, callback) {
    uri = parse.uri(uri);

    // TODO HTTP ranges
    // TODO Try to understand what the file is
    //      and serve a content-type guess

    var fileStream = fs.createReadStream(uri.path);
    fileStream.on('error', function (err) {
        callback(err);
    });

    res.writeHead('200', { 'content-type': 'application/octet-stream' });
    fileStream.pipe(res);
}

var route = match.router([
    [ { protocol: 'http:' }, serveHTTPRedirect ],
    [ { protocol: 'file:' }, serveFile ],
    [ { protocol: undefined }, serveFile ]
]);

function serveResource(req, res, resource, callback) {
    try {
        // TODO Handle priority, fallbacks, etc.
        var uri = Object.keys(resource.urls)[0];
        uri = parse.uri(uri);

        setResourceHeaders(res, resource);

        route(uri, req, res, uri, callback);
    } catch (e) {
        callback(e);
    }
}

exports.resourceHeaders = resourceHeaders;
exports.setResourceHeaders = setResourceHeaders;
exports.serveResource = serveResource;
