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

2.  Another resource may be have the same name as the resource.  There may be
    30 unique resources named "`funny picture.jpeg`"; it is difficult to
    identify which resource is desired.  Forgery of resources becomes trivial
    because of this flaw.

3.  The name of the resource may change.  A Youtube video can be copied to
    Vimeo, but remain the exact same video.  The funny picture can be renamed
    or uploaded as-is to a different service.

    If the resource under the name is changed or deleted, the desired resource
    may still exists, but only under a different name.  In addition, multiple
    names may refer to the exact same resource.


