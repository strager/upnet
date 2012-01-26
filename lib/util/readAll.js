function readAll(stream, callback) {
    // FIXME Security issue: buffer can become infinitely large
    var buffer = '';
    stream.on('data', function (data) {
        buffer += data;
    });
    stream.on('end', function () {
        callback(null, buffer);
    });
    stream.on('error', function (err) {
        callback(err);
    });
}

module.exports = readAll;
