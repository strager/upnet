var http = require('http');
var url = require('url');

var server = http.createServer(function (req, res) {
    var parsedURL = url.parse(req.url, false /* query */, false /* // host */);

    var server, magnetURI;
    switch (parsedURL.pathname) {
    case '/magnet:':
        server = require('./magnet');
        magnetURI = parsedURL.path.slice(1);
        break;
    default:
        server = null;
        break;
    }

    if (server) {
        server.serve(req, res, magnetURI);
    } else {
        res.writeHead('404', { 'content-type': 'text/plain' });
        res.end("Not found");
    }
});

var PORT = 18420;
server.listen(PORT);
console.log("Listening on :%d", PORT);
