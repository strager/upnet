var http = require('http');
var url = require('url');

var server = require('./server');
var resource = require('./resource');
var hasOwn = require('./hasOwn');

var PORT = 18420;
var HOST = null;

function error(err, res) {
    res.writeHead(err.status || 500, {
        "content-type": "text/plain"
    });

    // FIXME Development only; should log to syslog or something
    res.end("An error occurred:\n" + String(err.stack || err) + "\n");
}

function getMagnetURI(uri) {
    var parsedURI = url.parse(uri, false /* query */, false /* // host */);

    if (parsedURI.pathname === "/magnet:") {
        return parsedURI.path.slice(1); // Full magnet URI without leading /
    } else {
        return null;
    }
}

function GET_magnet(req, res, magnetURI) {
    resource.find({
        uri: magnetURI,
        allow: {
            "magnet:": true,
            "http:": false,
            "file:": false
        }
    }, function (err, resource) {
        if (err) return error(err, res);

        server.serveResource(req, res, resource, function (err) {
            if (err) return error(err, res);

            // Do nothing
        });
    });
}

function GET(req, res) {
    var magnetURI = getMagnetURI(req.url);
    if (magnetURI !== null) {
        GET_magnet(req, res, magnetURI);
        return;
    }

    // Unknown; 404
    res.writeHead(404, { "content-type": "text/plain" });
    res.end("Not found\n");
}

function HEAD_magnet(req, res, magnetURI) {
    // FIXME this is half-duplicated from GET_magnet
    resource.find({
        uri: magnetURI,
        allow: {
            "magnet:": true,
            "http:": false,
            "file:": false
        }
    }, function (err, resource) {
        if (err) return error(err, res);

        res.writeHead(200, server.resourceHeaders(resource));
        res.end();
    });
}

function HEAD(req, res) {
    // FIXME this is half-duplicated from GET
    var magnetURI = getMagnetURI(req.url);
    if (magnetURI !== null) {
        HEAD_magnet(req, res, magnetURI);
        return;
    }

    // Unknown; 404
    res.writeHead(404, { "content-type": "text/plain" });
    res.end("Not found\n");
}

var methodHandlers = {
    "GET": GET,
    //"PUT": PUT,
    "HEAD": HEAD
};

http.createServer(function (req, res) {
    if (!hasOwn(methodHandlers, req.method)) {
        res.writeHead(501, { });
        res.end();
        return;
    }

    var handler = methodHandlers[req.method];
    handler(req, res);
}).listen(PORT, HOST);

console.log("Listening on %s:%d", HOST || "*", PORT);
