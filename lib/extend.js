var extend_ = require('node.extend');

// Oh, you think it's this easy for a shallow extend function,
// right?  Hah!  Think again!
//var extend = extend_.bind(null, false);

function extend(target /* extensions... */) {
    // jQuery.extend has this stupid idea that, if there are no
    // extensions, `target` is actually an extension of the
    // jQuery object (extend(t) => extend($, t), or something).
    // Why would you do that to a utility function?  =|
    if (arguments.length === 1) {
        return target;
    }

    // jQuery.extend's implementation is the worst ever.  It
    // can't accept `false` as its `deep` parameter.
    // Fucking hell.
    if (target === true) {
        target = { };
    }

    var extensions = Array.prototype.slice.call(arguments, 1);
    return extend_.apply(null, [ target ].concat(extensions));
}

var extendDeep = extend_.bind(null, true);

// Not smart enough for arrays
function clone(obj /* extensions... */) {
    return extend.bind(null, { }).apply(null, arguments);
}

// Not smart enough for arrays
function cloneDeep(obj /* extensions... */) {
    return extendDeep.bind(null, { }).apply(null, arguments);
}

function pollute(scopeObject) {
    extend(scopeObject, {
        extend: extend,
        extendDeep: extendDeep,
        clone: clone,
        cloneDeep: cloneDeep
    });
}

module.exports = function () {
    return extend.apply(this, arguments);
};

extend(module.exports, {
    deep: extendDeep,
    clone: clone,
    cloneDeep: cloneDeep,
    pollute: pollute
});
