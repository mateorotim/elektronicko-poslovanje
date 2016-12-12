var express = require('express');
var router = express.Router();

var rpio = require('rpio');
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

router.post('/login', function (req, res) {
    var result = {"success":false};
    if (authenticate(req.headers.username, req.headers.password) == true) {
        var result = {"success":true};
    }
    res.send(result);
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