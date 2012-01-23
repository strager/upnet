var http = require('http');
var url = require('url');

var server = require('./server');

var PORT = 18420;
var HOST = null;

http.createServer(function (req, res) {
    server.tryServe(req, res, {
        uri: 'http://__me__' + req.url, // FIXME Probably not the safest...
        allow: {
            'http:': true,
            'file:': false
        }
    }, function (err) {
        if (err) {
            res.writeHead(err.status || '500', {
                'content-type': 'text/plain'
            });
            res.end("An error occurred:\n" + String(err.stack || err));
            return;
        }

        // Do nothing
    });
}).listen(PORT, HOST);

console.log("Listening on %s:%d", HOST || "*", PORT);
