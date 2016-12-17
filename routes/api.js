var express = require('express');
var router = express.Router();
var JsonDB = require('node-json-db');

var rpio = require('rpio');

var db = new JsonDB(__dirname + '/db', true, true);
console.log(db);
var relays = db.getData("/");
console.log(relays);

rpio.open(3, rpio.OUTPUT, rpio.HIGH);

var user = { "username": "admin", "password": "admin" };

router.get('/test', function (req, res, next) {
    res.send('API');
});

router.post('/control', function (req, res) {
    //if (!req.headers) return res.sendStatus(400);
    if (!req.body) return res.sendStatus(400);
    if (authenticate(req.headers.username, req.headers.password) == true) {
        toggleRelay(res, req.body.relay, req.body.state);
    } else res.sendStatus(400);
});

router.post('/add', function (req, res) {
    if (!req.body) return res.sendStatus(400);
    if (authenticate(req.headers.username, req.headers.password) == true) {
        if(req.body.name && req.body.pin) {
            var relay = {
                "name":req.body.name,
                "pin":req.body.pin,
                "state":1
            }
            db.push('/relays[]',relay);
            res.sendStatus(200);
        } else res.sendStatus(400);
        
    } else res.sendStatus(400);
});

router.post('/login', function (req, res) {
    var result = {"success":false};
    if (authenticate(req.headers.username, req.headers.password) == true) {
        var result = {"success":true};
    }
    res.send(result);
});

router.get('/read', function (req, res) {
    if (authenticate(req.headers.username, req.headers.password) == true) {
        res.send(rpio.read(3) ? 'high' : 'low');
    } else res.sendStatus(400);
});

var authenticate = function (username, password) {
    if (username == user.username && password == user.password) {
        return true;
    } else return false;
}

var toggleRelay = function (res, relay, state) {
    if (state == 1) {
        rpio.write(relay, rpio.HIGH);
        return res.sendStatus(200);
    } else if (state == 0) {
        rpio.write(relay, rpio.LOW);
        return res.sendStatus(200);
    } else return res.sendStatus(400);
}

module.exports = router;