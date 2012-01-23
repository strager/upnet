var magnet = require('./magnet');

var database = Object.create(null); // Empty dictionary
database.sha1 = Object.create(null);

database.sha1['asdf'] = [ 'file:///alt/home/mg/.vimrc' ];

function lookUpLocal(urn) {
    if (urn.sha1) {
        return database.sha1[urn.sha1] || null;
    }

    return null;
}

exports.lookUpLocal = lookUpLocal;
