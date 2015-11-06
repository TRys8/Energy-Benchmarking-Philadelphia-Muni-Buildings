var express = require('express');
var path = require('path');
var app = express();

var port = 9000;

app.use('/', express.static(path.resolve(__dirname, '..')));

app.listen(port);
console.log('Ready on port ' + port);
