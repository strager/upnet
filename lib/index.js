var http = require('http');
var url = require('url');

var server = require('./server');
var resource = require('./resource');

var PORT = 18420;
var HOST = null;

http.createServer(function (req, res) {
    function error(err) {
        res.writeHead(err.status || '500', {
            'content-type': 'text/plain'
        });

        // FIXME Development only; should log to syslog or something
        res.end("An error occurred:\n" + String(err.stack || err) + "\n");
    }

    var parsedURL = url.parse(req.url, false /* query */, false /* // host */);

    if (parsedURL.pathname === '/magnet:') {
        resource.find({
            uri: parsedURL.path.slice(1), // Full magnet URI without leading /
            allow: {
                'magnet:': true,
                'http:': false,
                'file:': false
            }
        }, function (err, resource) {
            if (err) return error(err);

            server.serveResource(req, res, resource, function (err) {
                if (err) return error(err);

                // Do nothing
            });
        });
    } else {
        // Unknown; 404
        res.writeHead('404', { 'content-type': 'text/plain' });
        res.end("Not found\n");
    }
}).listen(PORT, HOST);

console.log("Listening on %s:%d", HOST || "*", PORT);
