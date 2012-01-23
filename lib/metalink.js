/* Metalink JSON format
 *
 * This format is based on [RFC5854] and is incomplete.
 *
 * Based upon the second example of Section 1.1 of [RFC5854].
 *

    {
        "published": "2009-05-15T12:23:23Z",
        "files": {
            "example.ext": {
                "size": "14471447",
                "hashes": {
                    "sha-256": "f0ad929cd259957e160ea442eb80986b5f01..."
                },
                "urls": {
                    "ftp://ftp.example.com/example.ext": {
                        "priority": 1,
                    },
                    "http://example.com/example.ext": {
                        "priority": 1
                    }
                },
                "metaurls": {
                    "http://example.com/example.ext.torrent": {
                        "priority": 2,
                        "mediatype": "torrent"
                    }
                }
            },
            "example2.ext": {
                "size": 14471447,
                "hashes": {
                    "sha-256": "2f548ce50c459a0270e85a7d63b2383c5523..."
                },
                "urls": {
                    "ftp://ftp.example.com/example2.ext": {
                        "priority": 1
                    },
                    "http://example.com/example2.ext": {
                        "priority": 1
                    }
                },
                "metaurls": {
                    "http://example.com/example2.ext.torrent": {
                        "priority": 2
                    }
                }
            }
        }
    }

 *
 */
