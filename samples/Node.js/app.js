process.env.TMPDIR = 'tmp'; // to avoid the EXDEV rename error, see http://stackoverflow.com/q/21071303/76173

var express = require('express');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var flow = require('./flow-node.js')('tmp');
var fs = require('fs');
var app = express();

// Configure access control allow origin header stuff
var ACCESS_CONTROLL_ALLOW_ORIGIN = false;

// Host most stuff in the public folder
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/../../src'));

// Handle uploads through Flow.js
app.post('/upload', multipartMiddleware, function(req, res) {
  flow.post(req, function(status, filename, original_filename, identifier) {
    console.log('POST', status, original_filename, identifier);
    if (status == 'done') {
      // Assemble Chunks
      var stream = fs.createWriteStream('uploads/' + identifier);
      flow.write(identifier, stream);
      // Clean chunks after the file is assembled
      flow.clean(identifier);
    }
    if (ACCESS_CONTROLL_ALLOW_ORIGIN) {
      res.header("Access-Control-Allow-Origin", "*");
    }
    
    if(status==='done'){

            var s = fs.createWriteStream('./uploads/' + filename);
            s.on('finish', function() {

                res.status(200).send();

            });

            flow.write(identifier, s, {end: true});
    } else {
    	res.status(/^(partly_done|done)$/.test(status) ? 200 : 500).send();
    }
    

  });
});


app.options('/upload', function(req, res){
  console.log('OPTIONS');
  if (ACCESS_CONTROLL_ALLOW_ORIGIN) {
    res.header("Access-Control-Allow-Origin", "*");
  }
  res.status(200).send();
});

// Handle status checks on chunks through Flow.js
app.get('/upload', function(req, res) {
  flow.get(req, function(status, filename, original_filename, identifier) {
    console.log('GET', status);
    if (ACCESS_CONTROLL_ALLOW_ORIGIN) {
      res.header("Access-Control-Allow-Origin", "*");
    }

    if (status == 'found') {
      status = 200;
    } else {
      status = 204;
    }

    res.status(status).send();
  });
});

app.get('/download/:identifier/:name', function(req, res) {
   res.download('uploads/' +req.params.identifier, req.params.name);
});

app.listen(3000, function(){
	console.log('Server Started...');
});
