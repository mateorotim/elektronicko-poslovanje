var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var api = require('./routes/api');

app.use(express.static(__dirname + '/public'));

app.use(bodyParser.json());

app.use('/', index);
app.use('/api/v1', api);

app.listen(3000, function () {
  console.log('Server listening on port 3000!')
});