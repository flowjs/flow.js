var express = require('express');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var flow = require('./flow-node.js')('tmp/');
var app = express();

// Host most stuff in the public folder
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/../../src'));

app.use(express.bodyParser());

// Handle uploads through Flow.js
app.post('/upload', multipartMiddleware, function(req, res){
  flow.post(req, function(status, filename, original_filename, identifier){
    console.log('POST', status, original_filename, identifier);
    res.send(200, {
      // NOTE: Uncomment this funciton to enable cross-domain request.
      //'Access-Control-Allow-Origin': '*'
    });
  });
});

// Handle cross-domain requests
// NOTE: Uncomment this funciton to enable cross-domain request.
/*
  app.options('/upload', function(req, res){
  console.log('OPTIONS');
  res.send(true, {
  'Access-Control-Allow-Origin': '*'
  }, 200);
  });
*/

// Handle status checks on chunks through Flow.js
app.get('/upload', function(req, res){
  flow.get(req, function(status, filename, original_filename, identifier){
    console.log('GET', status);
    res.send(200, (status == 'found' ? 200 : 404));
  });
});

app.get('/download/:identifier', function(req, res){
	flow.write(req.params.identifier, res);
});

app.listen(3000);
