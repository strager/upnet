var hasOwn = require('./hasOwn');

function isMatch(query, data) {
    var key;
    for (key in query) {
        if (!hasOwn(query, key)) {
            continue;
        }

        if (data[key] !== query[key]) {
            return false;
        }
    }

    return true;
}

function router(routes, failure) {
    // Deep clone
    routes = routes.map(function (route) {
        return route.slice();
    });

    return function route(data /* args... */) {
        var args = Array.prototype.slice.call(arguments, 1);

        var i;
        for (i = 0; i < routes.length; ++i) {
            var route = routes[i];
            var query = route[0];
            var fn = route[1];

            if (isMatch(query, data)) {
                return fn.apply(this, args);
            }
        }

        throw new Error("Match exhausted");
    };
}

exports.isMatch = isMatch;
exports.router = router;
