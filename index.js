var express = require('express');
var app = express();
var bodyParser = require('body-parser');

var jsonParser = bodyParser.json({ type: 'application/json'});

var rpio = require('rpio');

rpio.open(3, rpio.OUTPUT, rpio.HIGH);
var user = {"username":"admin","password":"admin"};
app.post('/control', jsonParser, function (req, res) {
  if (!req.body) return res.sendStatus(400);
  var username = req.headers.username;
  var password = req.headers.password;
  if(username == user.username && password == user.password){
    toggleRelay(res, req.body.relay, req.body.state);
  } else res.sendStatus(400);
})

app.get('/', function (req, res) {
  res.send('Hello World!');
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})

var toggleRelay = function(res, relay, state){ 
  if(state == 1){ 
    rpio.write(relay, rpio.HIGH);
    return res.sendStatus(200);
  } else if(state==0){ 
    rpio.write(relay, rpio.LOW);
    return res.sendStatus(200);
  } else return res.sendStatus(400);
}