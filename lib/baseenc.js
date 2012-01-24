var BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
var BASE16_CHARS = '0123456789abcdef';

// FIXME Unsure if this works properly if radixA/radixB is
// not a POT or ^-1 POT
function baseA_to_baseB_partial(radixA, A_CHARS, radixB, B_CHARS) {
    function aToDigit(x) {
        return A_CHARS.indexOf(x);
    }

    function digitToB(x) {
        return B_CHARS.charAt(x);
    }

    return function baseA_to_baseB(baseA) {
        var digitsA = baseA.split('').reverse().map(aToDigit);

        var digitsB = [ ];
        var mod = 1;
        var acc = 0;

        var i;
        for (i = 0; i < digitsA.length; ++i) {
            acc += digitsA[i] * mod;
            mod *= radixA;

            while (mod >= radixB) {
                // wtb ASM div instruction =[
                var div = Math.floor(acc / radixB);
                var rem = acc - div * radixB;

                digitsB.push(rem);
                acc = div;
                mod = Math.floor(mod / radixB);
            }
        }

        if (mod > 1) {
            digitsB.push(acc);
        }

        return digitsB.map(digitToB).reverse().join('');
    };
}

var base16_to_base32 = baseA_to_baseB_partial(16, BASE16_CHARS, 32, BASE32_CHARS);
var base32_to_base16 = baseA_to_baseB_partial(32, BASE32_CHARS, 16, BASE16_CHARS);

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
    to32: base16_to_base32,
    to64: compose(base16_to_buffer, buffer_to_base64)
};

exports.from32 = {
    toBuffer: compose(base32_to_base16, base16_to_buffer),
    to16: base32_to_base16,
    to64: compose(base32_to_base16, base16_to_buffer, buffer_to_base64)
};

function toStringPartial(/* ... */) {
    var args = arguments;
    return function toString(x) {
        return x.toString.apply(x, args);
    };
}

exports.fromBuffer = {
    to16: toStringPartial('hex')
};
