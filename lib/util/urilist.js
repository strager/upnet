var readAll = require('./readAll');

function parse(string) {
    // TODO Real parsing (comments, etc.)
    // RFC 2483
    return string.split('\n')
        .filter(function (x) { return x; });
}

function stringify(uris) {
    // FIXME
    return uris.join('\n') + '\n';
}

function read(stream, callback) {
    stream.setEncoding('utf8'); // Ewww =[

    readAll(stream, function (err, data) {
        if (err) return callback(err);

        callback(null, parse(data));
    });
}

exports.parse = parse;
exports.stringify = stringify;
exports.read = read;
