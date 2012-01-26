var hasOwn = require('./hasOwn');

var apiKeys = Object.create(null);
apiKeys['asdfasdasfasfkdshfdhflheuiofheufhdsf'] = true;

function boolAuth(apiKeys) {
    return function (authData, callback) {
        process.nextTick(function () {
            if (!authData.token) {
                callback(null, false);
                return;
            }

            if (!hasOwn(apiKeys, authData.token)) {
                callback(null, false);
                return;
            }

            callback(null, true);
        });
    };
}

var HTTP_AUTHENTICATE_TYPE = 'X-UpNet';
var HTTP_WWW_AUTHENTICATE = HTTP_AUTHENTICATE_TYPE;

function parseHttpAuthData(authorization) {
    var parts = authorization.split(' ');
    if (parts[0] !== HTTP_AUTHENTICATE_TYPE) {
        throw new Error(HTTP_AUTHENTICATE_TYPE + " authorization must be used");
    }

    var authToken = parts[1];
    if (!authToken) {
        throw new Error("Missing authorization token");
    }

    return {
        token: authToken
    };
}

function httpAuth(apiKeys) {
    var test = boolAuth(apiKeys);

    return function (req, res, callback) {
        function authFail(message) {
            message = message || "Unauthorized\n";
            res.writeHead(401, { 'www-authenticate': HTTP_WWW_AUTHENTICATE });
            res.end(message);

            callback(null, false);
        }

        if (!hasOwn(req.headers, 'authorization')) {
            authFail();
            return;
        }

        var authData;
        try {
            var authorization = req.headers['authorization'];
            authData = parseHttpAuthData(authorization);
        } catch (e) {
            authFail(e.message + "\n");
            return;
        }

        test(authData, function (err, isAuthenticated) {
            if (err) return callback(err);

            if (isAuthenticated) {
                callback(null, true);
            } else {
                authFail();
            }
        });
    };
}

exports.http = {
    record: httpAuth(apiKeys)
};

exports.bool = {
    record: boolAuth(apiKeys)
};
