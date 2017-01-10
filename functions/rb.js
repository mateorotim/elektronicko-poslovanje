var exports = module.exports = {};

var JsonDB = require('node-json-db');
var rpio = require('rpio');
var db = new JsonDB(__dirname + '/db', true, true);

var pins = [3,5,7,8,10,11,12,13,14,16,18,19,21,22,23,24,26,29,31,32,33,35,36,37,38,40]

var findRelay = function (name) {
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
        return res.sendStatus(400);
    } else {
        var data = db.getData("/");
        var relay = data.relays[relayIndex];
        relay.state = req.body.state;
        if (relay.state === true) {
            rpio.write(relay.pin, rpio.LOW);
            console.log("pin %s set to HIGH", relay.pin);
            db.push('/relays[' + relayIndex + ']', relay);
            return res.send({
                "toggled": true,
                "name": relay.name,
                "pin": relay.pin,
                "state": "HIGH"
            });
        } else if (relay.state === false) {
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
            return res.sendStatus(400);
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
        "state": req.body.state
    }
    if (findRelay(relay.name) !== null) {
        res.send({
            "added": false,
            "reason": "already exists"
        });
    } else {
        for(let i = 0; i < pins.length; i++){
            if(relay.pin === pins[i]){
                var data = db.getData("/");
                for(let j = 0; j < data.relays.length; j++){
                    if(relay.pin === relays[j].pin){
                        res.send({
                            "added": false,
                            "reason": "pin already in use"
                        });
                        break;
                    }
                }
                db.push('/relays[]', relay);
                rpioOpen(relay.pin, relay.state);
                res.send({ "added": true });
                break;
            }
        }
        res.send({
            "added": false,
            "reason": "invalid pin"
        });
    }
}

var checkPin = function (pin) {

}

var rpioOpen = function (pin, state) {
    if (state === true) {
        rpio.open(pin, rpio.OUTPUT, rpio.LOW);
        console.log("pin %s set to OUTPUT and HIGH", pin);
    } else if (state === false) {
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

exports.changeRelay = function (req, res){
    var relayIndex = findRelay(req.body.name);
    if(relayIndex !== null){
        var data = db.getData("/");
        var relay = data.relays[relayIndex];
        relay.pin = req.body.pin;
        rpio.close(relay.pin)
        rpioOpen(relay.pin, relay.state);
        db.push('/relays[' + relayIndex + ']', relay);
        res.send({
            "changed": true,
            "name": relay.name,
            "pin": relay.pin,
            "state": relay.state
        });
    } else res.sendStatus(400);
}
