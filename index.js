var express = require('express');
var app = express();

var rpio = require('rpio');

rpio.open(3, rpio.OUTPUT, rpio.HIGH);

app.get('/', function (req, res) {
  res.send('Hello World!');
})

app.get('/1', function (req, res) {
  rpio.write(3, rpio.LOW);
})

app.get('/0', function (req, res) {
  rpio.write(3, rpio.HIGH);
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
