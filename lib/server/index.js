var http = require('http');
var url = require('url');

var server = require('./server');
var resource = require('./resource');
var hasOwn = require('../util/hasOwn');
var metafileDB = require('./db/metafile');
var metalink = require('./metalink');
var auth = require('./auth');
var urilist = require('../util/urilist');

var PORT = 18420;
var HOST = null;

function error(err, res, status) {
    res.writeHead(status || err.status || 500, {
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

function PUT_record(req, res) {
    switch (req.headers["content-type"]) {
    case "application/metalink4+json":
        // TODO
        res.writeHead(500);
        res.end();
        break;

    case "text/uri-list":
        urilist.read(req, function (err, uris) {
            if (err) return error(err, res);

            // TODO Handle multiple URI's
            metafileDB.addByURI(uris[0])
                .then(function (mfile) {
                    // FIXME What content type???
                    res.writeHead(200, { "content-type": "text/uri-list" });
                    res.end(metalink.fileToURN(mfile) + "\n");
                })
                .fail(function (err) {
                    error(err, res);
                });
        });
        req.resume();
        break;

    default:
        res.writeHead(415);
        res.end();
        break;
    }
}

function PUT(req, res) {
    if (req.url === "/record") {
        auth.http.record(req, res, function (err, isAuthenticated) {
            if (err) return error(err, res);

            if (isAuthenticated) {
                PUT_record(req, res);
            }
        });
    } else {
        res.writeHead(405);
        res.end();
    }
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
    "PUT": PUT,
    "HEAD": HEAD
};

http.createServer(function (req, res) {
    req.pause();

    if (!hasOwn(methodHandlers, req.method)) {
        res.writeHead(501, { });
        res.end();
        return;
    }

    var handler = methodHandlers[req.method];
    handler(req, res);
}).listen(PORT, HOST);

console.log("Listening on %s:%d", HOST || "*", PORT);
