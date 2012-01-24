var url = require('url');
var fs = require('fs');

var hasOwn = require('./hasOwn');

require('./extend').pollute(GLOBAL);

function resourceHeaders(resource) {
    // TODO FIXME Security problems?

    var links = [ ];
    var digests = [ ];

    Object.keys(Object(resource.urls)).forEach(function (uri) {
        var parsedURI = url.parse(uri, false /* query */, false /* // host */);
        if (parsedURI.protocol !== "file:") {
            links.push("<" + uri + ">; rel=duplicate");
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
    var parsedURI = url.parse(uri, false /* query */, false /* // host */);

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

var protocolHandlers = {
    'http:': serveHTTPRedirect,
    'file:': serveFile
};

function serveResource(req, res, resource, callback) {
    // TODO Handle priority, fallbacks, etc.
    var uri = Object.keys(resource.urls)[0];

    var parsedURI = url.parse(uri, false /* query */, false /* // host */);
    var protocol = parsedURI.protocol;

    if (!hasOwn(protocolHandlers, protocol)) {
        callback(new Error("Unknown protocol: " + parsedURI.protocol));
    }

    setResourceHeaders(res, resource);

    var handler = protocolHandlers[protocol];
    handler(req, res, uri, callback);
}

exports.resourceHeaders = resourceHeaders;
exports.setResourceHeaders = setResourceHeaders;
exports.serveResource = serveResource;
