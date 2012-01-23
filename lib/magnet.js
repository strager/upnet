var url = require('url');

function serveMagnet(req, res, magnetURI) {
    res.writeHead('200', { 'content-type': 'text/plain' });
    console.log("Serving contents of magnet URI %s", magnetURI);
    res.end("Serving " + magnetURI);
    // TODO
}

exports.serve = serveMagnet;
