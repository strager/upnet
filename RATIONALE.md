# UpNet rationale

## What's wrong?

The problem lies in the Internet's tendency to rely on authorative sources.

When you want to look at a resource (an image, a video, a document, some blog
post, or anything else which can be digitally recorded as a file), you most
often refer to that resource by a name.  This is almost always a URI; "`funny
picture.jpeg`" or "`http://www.youtube.com/watch?v=dQw4w9WgXcQ`".  There are
major flaws with this approach:

1.  The underlying resource may change.  A Youtube video may be deleted, or the
    funny picture may be edited and re-saved.

    If a server is hacked, a domain name taken over by the government, the
    resource name becomes invalid (or at least does not reference the resource
    intended).  This is either very unfortunate or a security risk.

2.  Another resource may be have the same name.  There may be 30 unique
    resources named "`funny picture.jpeg`"; it is difficult to identify which
    resource is desired.  Forgery of resources becomes trivial because of this
    flaw.

3.  The name of the resource may change.  A Youtube video can be copied to
    Vimeo, but remain the exact same video.  The funny picture can be renamed or
    uploaded as-is to a different service.

    If the resource under the name is changed or deleted, the desired resource
    may still exists, but only under a different name.  In addition, multiple
    names may refer to the exact same resource.

4.  It is impossible to, given a resource, find possible names for that
    resource.  Reverse image searches are gaining in popularity, but such
    techniques are not suitable for archives and encrypted documents, for
    example, and rely on the name being public.

    If a resource is newly-created, it must almost always be given a new name
    for others to use the resource.  Recently, however, there have been online
    services (such as Google Docs) which solve this complication.

5.  Very often, named resources to URL's are not portable.  A Youtube link
    actually links to a document containing the desired resource (video), not
    the resource itself.  In addition, the desired resource may be difficult to
    download or copy and archive.  If the original author intends for the
    resource to be copied as well as consumed, it often needs to be uploaded to
    multiple services (thus have multiple resource names).

## What's better?

Several of the problems with URI's can be solved by referring to resources by
their contents.  However, often the contents of a resource are not useful for
identifying the resource.  (Instead of linking a video to a friend, you would
need to embed a copy of the video!)

It would be better to condense the entire resource into a sequence of characters
suitable for transfer while still uniquely identifying the resource.
Cryptographic hashes do just this.  When a hashing algorithm is performed on a
resource, a constant, reproduceable identifier results.  Such algorithms have
applications in security and data integrity, and can easily be applied to
resource identification as well.

Here, we will refer to a URN as a name for a resource determined using a
cryptographic hash (i.e. the hash is part of the URN).  URN's have the following
benefits over resource names such as a URL:

1.  Resources cannot be forged[1].  After obtaining a resource, that resource
    can be hashed and compared to the URN.  There is no third-party providing
    the hashes (and thus the data integrity).

    If any change is made to the resource, the resource cannot possibly have the
    same hash[1], thus cannot have the same URN.

2.  Multiple copies of a resource all have the same URN.  There are no
    discrepencies.  This means that any copy of the resource can be used to
    create a URN if a URN is "lost" or unknown.  This also means that all
    resources (with or without a URN) can be given a URN which uniquely
    identifies that resource[1].

3.  Resources are not owned because URN's are not owned.  If Youtube providing a
    resource is shut down, or the resource is removed from Youtube, the resource
    still may be available and accessible.  Of course, if the resource was never
    copied, the resource will be lost forever.  (If a image was made and no one
    was around to see it, did it ever exist?)

However, URN's have some fundamental problems of their own:

1.  It is impossible to retrieve a resource identified by a URN without any more
    information.

2.  A changing resource cannot be described using a URN.

    For example, the front page of a news blog is poorly suited for
    cryptographic hash identification because the hash can only identify the
    front page at one specific state.

    A live radio stream is also poorly suited for a URN unless it is recorded in
    full (or split into pieces) before it is named.

3.  A URN can only describe one resource, not a collection of resources.  A URN
    cannot describe a modern web page or web site, or a directory listing, for
    example.

4.  A URN cannot contain certain types of metadata[2], such as resource creation
    date, original author, copyright information, or the resource's MIME type.

## What works?

UpNet is a piece of software which connects the accessibility of URI's and the
sturdiness of URN's through the power of peer-to-peer networking.

Technologies such as Bittorrent and Bitcoin thrive on the notion of a
*distributed database*.  With this database, no entity owns information;
information is shared among most or all participants of the distributed
database.  Such a database can be used to connect *metalinks*.  A metalink can
serve as a connection between a URI and a URN.

For example, say a URN of `urn:sha1:IXPHZLXB5RDCED6OOAD2KDM3A2D3TE4M` is known,
and the resource the URN refers to is desired.  A query of the metalink database
may return a result of
`https://raw.github.com/strager/upnet/9010e884c9/.gitignore` as well as a
MD5 hash of `mg@stravvy:~/Projects/upnet` and a content length of 38 bytes.  It
may even yield Bittorrent magnet URI's, other HTTP and FTP mirrors, and
copyright and licensing information.

UpNet has three roles in this system:

1.  UpNet is an HTTP end-point for querying the distributed database.  This
    allows existing technology build upon HTTP to utilize some of the features
    of the distributed database.

    For example, if an UpNet HTTP end-point is being hosted at
    `http://example.com/upnet/`, a request to
    `http://example.com/upnet/magnet:?xt=urn:sha1:IXPHZLXB5RDCED6OOAD2KDM3A2D3TE4M`
    may result in the content being served directly.  If the server does not
    have the resource itself available, or can for whatever reason not serve the
    resource, it can query the distributed database for the file and redirect
    the connecting HTTP client to another end-point or mirror.  In this example,
    the client could be redirected to
    `https://raw.github.com/strager/upnet/9010e884c9/.gitignore`.

2.  UpNet is an implementation of the distributed database itself.

    (This feature is up for debate and has not yet been decided upon or
    finalized.)

3.  UpNet allows for other, pre-existing distributed databases to be accessed.
    The popular Gnutella network, used famously by Limewire, can be queried by
    UpNet to allow for distributed mirroring of resource contents.

[1] Blah blah collisions FIXME  
[2] Blah blah `kt` FIXME
