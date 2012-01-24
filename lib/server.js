var url = require('url');
var fs = require('fs');

var hasOwn = require('./hasOwn');

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

    var handler = protocolHandlers[protocol];
    handler(req, res, uri, callback);
}

exports.serveResource = serveResource;
