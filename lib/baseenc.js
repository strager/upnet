var BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
var BASE16_CHARS = '0123456789abcdef';

function base32_to_base16(base32) {
    var digits32 = base32.split('').reverse().map(function (c) {
        return BASE32_CHARS.indexOf(c);
    });

    var digits16 = [ ];
    var bits = 0;
    var acc = 0;

    var i;
    for (i = 0; i < digits32.length; ++i) {
        acc += digits32[i] << bits;
        bits += 5;

        while (bits >= 4) {
            digits16.push(acc & 0x0F);
            acc >>>= 4;
            bits -= 4;
        }
    }

    return digits16.map(String.prototype.charAt.bind(BASE16_CHARS)).reverse().join('');
}

function base16_to_buffer(base16) {
    // TODO Padding?
    return new Buffer(base16, 'hex');
}

function buffer_to_base64(buffer) {
    return buffer.toString('base64');
}

// compose(a, b, c)(x)
// => a(b(c(x)))
function compose(/* fns... */) {
    // fns is the array of functions in order of application
    var fns = Array.prototype.slice.call(arguments).reverse();
    var initFn = fns.shift();

    return function composed() {
        return fns.reduce(function (acc, fn) {
            return fn(acc);
        }, initFn.apply(null, arguments));
    };
}

exports.from16 = {
    toBuffer: base16_to_buffer,
    to64: compose(base16_to_buffer, buffer_to_base64)
};

exports.from32 = {
    to16: base32_to_base16,
    toBuffer: compose(base32_to_base16, base16_to_buffer),
    to64: compose(base32_to_base16, base16_to_buffer, buffer_to_base64)
};
