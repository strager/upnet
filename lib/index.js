var http = require('http');

var server = http.createServer(function (req, res) {
    res.writeHead('200', { 'content-type': 'text/plain' });
    res.end('Hello world');
});

var PORT = 18420;
server.listen(PORT);
console.log("Listening on :%d", PORT);
