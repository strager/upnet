var http = require('http');
var Q = require('q');

var server = require('./server');
var resource = require('./resource');
var hasOwn = require('../util/hasOwn');
var metafileDB = require('./db/metafile');
var metalink = require('../util/metalink');
var auth = require('./auth');
var urilist = require('../util/urilist');
var parse = require('../util/parse');

var PORT = 18420;
var HOST = null;

function STOP() {
    return Q.defer().promise;
}

function getMagnetURI(uri) {
    uri = parse.uri(uri);

    if (uri.pathname === "/magnet:") {
        return uri.path.slice(1); // Full magnet URI without leading /
    } else {
        return null;
    }
}

function GET_magnet(req, res, magnetURI) {
    var defer = Q.defer();

    resource.find({
        uri: magnetURI,
        allow: {
            "magnet:": true,
            "http:": false,
            "file:": false
        }
    }, function (err, resource) {
        if (err) return defer.reject(err);

        server.serveResource(req, res, resource, function (err) {
            if (err) return defer.reject(err);

            // Do nothing
            // (No resolve)
        });
    });

    return defer.promise;
}

function GET(req, res) {
    var magnetURI = getMagnetURI(req.url);
    if (magnetURI !== null) {
        return GET_magnet(req, res, magnetURI);
    }

    // Unknown; 404
    res.writeHead(404, { "content-type": "text/plain" });
    res.end("Not found\n");
    return STOP();
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
    var defer = Q.defer();

    resource.find({
        uri: magnetURI,
        allow: {
            "magnet:": true,
            "http:": false,
            "file:": false
        }
    }, function (err, resource) {
        if (err) return defer.reject(err);

        res.writeHead(200, server.resourceHeaders(resource));
        res.end();

        // (No resolve)
    });

    return defer.promise;
}

function HEAD(req, res) {
    // FIXME this is half-duplicated from GET
    var magnetURI = getMagnetURI(req.url);
    if (magnetURI !== null) {
        return HEAD_magnet(req, res, magnetURI);
    }

    // Unknown; 404
    res.writeHead(404, { "content-type": "text/plain" });
    res.end("Not found\n");
    return STOP();
}

var methodHandlers = {
    "GET": GET,
    "PUT": PUT,
    "HEAD": HEAD
};

function main() {
    http.createServer(function (req, res) {
        req.pause();

        if (!hasOwn(methodHandlers, req.method)) {
            res.writeHead(501, { });
            res.end();
            return;
        }

        var handler = methodHandlers[req.method];
        Q.when(handler(req, res))
            .fail(function (err) {
                res.writeHead(err.status || 500, {
                    "content-type": "text/plain"
                });

                // FIXME Development only; should log to syslog or something
                res.end("An error occurred:\n" + String(err.stack || err) + "\n");
            })
            .end();

    }).listen(PORT, HOST);

    console.log("Listening on %s:%d", HOST || "*", PORT);
}

if (module === require.main) {
    main();
}
