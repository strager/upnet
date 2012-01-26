// Implementation of RFC 3339 JavaScript writer
//
// Modified from:
// http://cbas.pandion.im/2009/10/generating-rfc-3339-timestamps-in.html

// Pad `str` with 0's so it is at least `width` in length.
// Does not truncate.
function pad0(str, width) {
    str = String(str);

    while (str.length < width) {
        str = '0' + str;
    }
    return str;
}

function timestamp(d) {
    if (Object.prototype.toString.call(d) !== '[object Date]') {
        d = new Date(d);
    }

    var offset = d.getTimezoneOffset();
    return pad0(d.getFullYear(), 4)
        + "-" + pad0(d.getMonth() + 1, 2)
        + "-" + pad0(d.getDate(), 2)
        + "T" + pad0(d.getHours(), 2)
        + ":" + pad0(d.getMinutes(), 2)
        + ":" + pad0(d.getSeconds(), 2)
        + "." + pad0(d.getMilliseconds(), 3)
        + (offset > 0 ? "-" : "+")
        + pad0(Math.floor(Math.abs(offset) / 60), 2)
        + ":" + pad0(Math.abs(offset) % 60, 2);
}

module.exports = timestamp;
