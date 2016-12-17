var express = require('express');
var router = express.Router();
var JsonDB = require('node-json-db');

var rpio = require('rpio');

var db = new JsonDB(__dirname + '/db', true, true);
console.log(db);
//temporary
var admin = {
    "username":"admin",
    "password":"21232f297a57a5a743894a0e4a801fc3"
}
db.push('/users[0]',admin);

var pinInit = function(){
    var data = db.getData("/");
    console.log(data.relays);
    if(data.relays && data.relays.length > 0){
        for(let relay of data.relays){
            rpioOpen(relay.pin, relay.state);
        }
    }
}

var rpioOpen = function(pin, state){
    if(state === 1){
        rpio.open(pin, rpio.OUTPUT, rpio.LOW);
        console.log("pin %s set to OUTPUT and HIGH", pin)
    } else if(state === 0){
        rpio.open(pin, rpio.OUTPUT, rpio.HIGH);
        console.log("pin %s set to OUTPUT and LOW", pin)
    } else console.log("Bad pin state!");
}

pinInit();

router.get('/test', function (req, res, next) {
    res.send('API');
});

router.post('/control', function (req, res) {
    if (!req.body) return res.sendStatus(400);
    if (auth(req.headers.username, req.headers.password)) {
        rpioWrite(req, req.body.pin, req.body.state);
    } else res.sendStatus(400);
});

router.post('/add', function (req, res) {
    if (!req.body) return res.sendStatus(400);
    if (auth(req.headers.username, req.headers.password)) {
        if(req.body.name && req.body.pin) {
            var relay = {
                "name":req.body.name,
                "pin":req.body.pin,
                "state":1
            }
            if(checkRelay(relay.name)){
                res.send({
                    "added":false,
                    "reason":"already exists"
                });
            } else {
                db.push('/relays[]',relay);
                rpioOpen(relay.pin, relay.state);
                res.send({"added":true});
            }
        } else res.sendStatus(400);
        
    } else res.sendStatus(400);
});

router.get('/login', function (req, res) {
    if (auth(req.headers.username, req.headers.password)) {
        res.send({"success":true});
    } else res.send({"success":false});
});

router.get('/read', function (req, res) {
    if (auth(req.headers.username, req.headers.password)) {
        var data = db.getData("/");
        if(data.relays && data.relays.length > 0){
            res.send(data.relay);
        }
    } else res.sendStatus(400);
});

var auth = function (username, password) {
    var data = db.getData("/");
    for(let user of data.users){
        if(user.username == username && user.password == password){
            return true;
        }
    }
    return false;
}

var rpioWrite = function(pin, state){
    if(state === 1){
        rpio.write(pin, rpio.LOW);
        console.log("pin %s set to HIGH", pin);
        return res.send({
            "toggled":true,
            "pin":pin,
            "state":"HIGH"
        });
    } else if(state === 0){
        rpio.write(pin, rpio.HIGH);
        console.log("pin %s set to LOW", pin);
        return res.send({
            "toggled":true,
            "pin":pin,
            "state":"LOW"
        });
    } else {
        console.log("Bad pin state!");
        return res.send(400);
    }
}

var checkRelay = function(name){
    var data = db.getData("/");
    for(let relay of data.relays){
        if(relay.name == name){
            return true;
        }
    }
    return false;
}

module.exports = router;