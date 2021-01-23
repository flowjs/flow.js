const jsdom_class = require("jsdom").JSDOM,
      jsdom = new jsdom_class();

global.Blob = jsdom.window.Blob;
global.File = jsdom.window.File;
global.XMLHttpRequest = jsdom.window.XMLHttpRequest;
global.FormData = jsdom.window.FormData;
global.Element = jsdom.window.Element;
global.window = jsdom.window;
global.document = window.document;

global.sinon = require('sinon');
global.Flow = require('../dist/flow.js');
