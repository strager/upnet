var http = require('http');

var urilist = require('../../util/urilist');
var readAll = require('../../util/readAll');

require('../../util/extend').pollute(GLOBAL);

function record(uris, options, callback) {
    var req = http.request({
        host: options.host,
        port: options.port,
        method: 'PUT',
        path: '/record',
        headers: {
            'authorization': 'X-UpNet ' + options.apiToken,
            'content-type': 'text/uri-list' 
        }
    }, function (res) {
        if (res.statusCode !== 200) {
            readAll(res, function (err, data) {
                if (err) return callback(err);

                callback(extend(
                    new Error(data),
                    { status: res.statusCode }
                ));
            });
            res.setEncoding('utf8');
            res.resume();
            return;
        }

        urilist.read(res, callback);
    });

    req.on('error', function (err) {
        callback(err);
    });

    req.end(urilist.stringify(uris));
}

exports.record = record;

if (require.main !== module) {
    return;
}

var uris = process.argv.slice(2);

record(uris, {
    host: 'localhost',
    port: 18420,
    apiToken: 'asdfasdasfasfkdshfdhflheuiofheufhdsf'
}, function (err, uris) {
    if (err) {
        console.error("Error recording URI's:");
        console.error(err.stack);
        return;
    }

    console.log(uris.join('\n') + '\n');
});
