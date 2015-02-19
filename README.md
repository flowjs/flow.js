### Contribute!
This is an early version of flow.js. It is still missing most of its features,
so please contribute. All crazy ideas are welcome!

Feature list:

  * Chunk uploads (Chunk size depends on connection speed)
  * Preprocessing (Zip, Resize, ...)
  * Client side validation (Invalid extension, ...)
  * Server side validation (Not enough space, Invalid user, ...)
  * Fault tolerance (Checksum validation, Retry on server crash, ...)
  * Pause, Resume, Avg. file speed calculation, Progress
  * (Optional, for later) Files balancing and uploading to multiple targets(servers) at once.
  * Server side api should be simple and easy to adapt with any other client side language
  * ~~Batch uploads (can upload many files in one request)~~ useless, adds lots of compexity without any benefits

## Flow.js

Flow.js is a JavaScript library providing multiple simultaneous, stable and resumable uploads via the HTML5 File API.

Flow.js does not have any external dependencies other than the `HTML5 File API`. Currently, this means that support is limited to Firefox 4+, Chrome 11+, Safari 6+ and Internet Explorer 10+.

Library follows simple file upload protocol, which can be easily implemented in any language. One of this protocol design goals is to make it simple for mobile and browser clients to use it. Server side just exposes common api, which can be easily adopted and used as public api.

The library is designed to introduce fault-tolerance into the upload of large files through HTTP. This is done by splitting each file into small chunks. Then, whenever the upload of a chunk fails, uploading is retried until the procedure completes. This allows uploads to automatically resume uploading after a network connection is lost either locally or to the server. Additionally, it allows for users to pause, resume and even recover uploads without losing state because only the currently uploading chunks will be aborted, not the entire upload.

## Contribution

To ensure consistency throughout the source code, keep these rules in mind as you are working:

* All features or bug fixes must be tested by one or more specs.

* We love functions and closures and, whenever possible, prefer them over objects.

* We follow the rules contained in [Google's JavaScript Style Guide](http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml) with an exception we wrap all code at 100 characters.


## Installing development dependencies
1. To clone your Github repository, run:

        git clone git@github.com:<github username>/flow.js.git

2. To go to the Flow.js directory, run:

        cd flow.js

3. To add node.js dependencies

        npm install

## Build
 
    grunt build

## Testing

Our unit and integration tests are written with Jasmine and executed with Karma. To run all of the
tests on Chrome run:

    grunt karma:watch

Or choose other browser

    grunt karma:watch --browsers=Firefox,Chrome

Browsers should be comma separated and case sensitive.

To re-run tests just change any source or test file.

Automated tests is running after every commit at travis-ci.

### Running test on sauceLabs

1. Connect to sauce labs https://saucelabs.com/docs/connect
2. `grunt  test --sauce-local=true --sauce-username=**** --sauce-access-key=***`

other browsers can be used with `--browsers` flag, available browsers: sl_opera,sl_iphone,sl_safari,sl_ie10,sl_chorme,sl_firefox
