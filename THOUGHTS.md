Resumable upload solutions:
 1. On client side generate file id.
    Lookup in localStorage for file offset.
    If found, continue to upload from it.

    Pros:
      No unnecessary requests
    Cons:
      Information might be expired
      No duplicate file uploads

 2. On client side generate file id.
    Request file information on server-side

    Pros:
      Build it server side validation
    Cons:
      Complexity

 3. Server generates file id with GET request
    Cons:
      Complexity
      More requests

 Best solution - no 1, with some requirements:
    To take advantage of server-side validation we need:
      - Async file validation.
        - Solution, always invalidate all added files and add them then possible
      - Async chunk validation.
        - TBD

