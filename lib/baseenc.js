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

exports.from32 = {
    to16: base32_to_base16
};
