var exports = module.exports = {};

var JsonDB = require('node-json-db');
var rpio = require('rpio');
var db = new JsonDB('../database/db', true, true);

exports.auth = function (req) {
    var data = db.getData("/");
    if(data.users){
        for (let user of data.users) {
            if (user.username == req.headers.username && user.password == req.headers.password) {
                return true;
            }
        }
        return false;
    } else console.log('database empty');
}

exports.rpioWrite = function (req, res) {
    var relayIndex = findRelay(req.body.name);
    if (relayIndex === null) {
        console.log("Can't find relay");
        return res.send(400);
    } else {
        var relay = {
            "name": req.body.name,
            "pin": req.body.pin,
            "state": 1
        }
        if (relay.state === 1) {
            rpio.write(relay.pin, rpio.LOW);
            console.log("pin %s set to HIGH", relay.pin);
            db.push('/relays[' + relayIndex + ']', relay);
            return res.send({
                "toggled": true,
                "name": relay.name,
                "pin": relay.pin,
                "state": "HIGH"
            });
        } else if (relay.state === 0) {
            rpio.write(relay.pin, rpio.HIGH);
            console.log("pin %s set to LOW", relay.pin);
            db.push('/relays[' + relayIndex + ']', relay);
            return res.send({
                "toggled": true,
                "name": relay.name,
                "pin": relay.pin,
                "state": "LOW"
            });
        } else {
            console.log("Bad pin state!");
            return res.send(400);
        }
    }
}

exports.readRelays = function (res) {
    var data = db.getData("/");
    if (data.relays && data.relays.length > 0) {
        res.send(data.relays);
    }
}

exports.addRelay = function (req, res) {
    var relay = {
        "name": req.body.name,
        "pin": req.body.pin,
        "state": 1
    }
    if (findRelay(relay.name) === null) {
        res.send({
            "added": false,
            "reason": "already exists"
        });
    } else {
        db.push('/relays[]', relay);
        rpioOpen(relay.pin, relay.state);
        res.send({ "added": true });
    }
}

exports.findRelay = function (name) {
    var data = db.getData("/");
    var i = 0;
    for (let relay of data.relays) {
        if (relay.name == name) {
            return i;
        }
        i++;
    }
    return null;
}

var rpioOpen = function (pin, state) {
    if (state === 1) {
        rpio.open(pin, rpio.OUTPUT, rpio.LOW);
        console.log("pin %s set to OUTPUT and HIGH", pin);
    } else if (state === 0) {
        rpio.open(pin, rpio.OUTPUT, rpio.HIGH);
        console.log("pin %s set to OUTPUT and LOW", pin);
    } else console.log("Bad pin state!");
}

exports.pinInit = function () {
    var data = db.getData("/");
    console.log(data.relays);
    if (data.relays && data.relays.length > 0) {
        for (let relay of data.relays) {
            rpioOpen(relay.pin, relay.state);
        }
    }
}
