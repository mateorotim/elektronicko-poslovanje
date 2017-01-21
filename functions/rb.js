var exports = module.exports = {};

var JsonDB = require('node-json-db');
var rpio = require('rpio');
var db = new JsonDB(__dirname + '/db', true, true);

var pins = [3, 5, 7, 8, 10, 11, 12, 13, 16, 18, 19, 21, 22, 23, 24, 26, 29, 31, 32, 33, 35, 36, 37, 38, 40]

var findRelay = function (name) {
    var data = db.getData("/");
    var i = 0;
    if (data.relays) {
        for (let relay of data.relays) {
            if (relay.name == name) {
                return i;
            }
            i++;
        }
    }
    return null;
}

exports.auth = function (req) {
    var data = db.getData("/");
    if (data.users) {
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
        return res.send(data.relays);
    }
}

exports.addRelay = function (req, res) {
    var relay = {
        "name": req.body.name,
        "pin": req.body.pin,
        "state": req.body.state
    }
    if (findRelay(relay.name) !== null) {
        return res.send({
            "added": false,
            "reason": "already exists"
        });
    } else {
        for (let i = 0; i < pins.length; i++) {
            if (relay.pin === pins[i]) {
                var data = db.getData("/");
                for (let j = 0; j < data.relays.length; j++) {
                    if (relay.pin === data.relays[j].pin) {
                        return res.send({
                            "added": false,
                            "reason": "pin already in use"
                        });
                    }
                }
                db.push('/relays[]', relay);
                rpioOpen(relay.pin, relay.state);
                return res.send({ "added": true });
            }
        }
        return res.send({
            "added": false,
            "reason": "invalid pin"
        });
    }
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

exports.removeRelay = function (req, res) {
    var relayIndex = findRelay(req.body.name);
    if (relayIndex !== null) {
        rpio.close(req.body.pin)
        db.delete('/relays[' + relayIndex + ']');
        console.log('relay removed');
        return res.send({
            "success": true
        });
    } else return res.sendStatus(400);
}

exports.listUsers = function (res) {
    var data = db.getData("/");
    if (data.users && data.users.length > 0) {
        let users = [];
        for (let user of data.users) {
            users.push({
                username: user.username,
                password: ''
            });
        }
        return res.send(users);
    }
}

exports.addUser = function (req, res) {
    let user = {
        username: req.body.username,
        password: req.body.password
    }
    let userIndex = findUser(user.username);
    if (userIndex == null) {
        db.push('/users[]', user);
        return res.send({
            "added": true
        });
    } else if (userIndex != null) {
        return res.send({
            "added": false,
            "reason": 'user already exists'
        });
    } else res.sendStatus(400);
}

exports.removeUser = function (req, res) {
    if (req.body.name != 'admin') {
        let userIndex = findUser(req.body.username);
        if (userIndex != null) {
            db.delete('/users[' + userIndex + ']');
            console.log('user', req.body.username, 'removed');
            return res.send({
                "removed": true
            });
        } else return res.sendStatus(400);
    } else return res.sendStatus(400);
}

exports.updateUser = function (req, res) {
    let user = {
        username: req.body.username,
        password: req.body.password
    }
    let userIndex = findUser(user.username);
    if (userIndex != null) {
        db.push('/users[' + userIndex + ']', user);
        console.log('user', user.username, 'updated');
        return res.send({
            "updated": true
        });
    } else return res.sendStatus(400);
}

var findUser = function (name) {
    var data = db.getData("/");
    var i = 0;
    if (data.users) {
        for (let user of data.users) {
            if (user.username == name) {
                return i;
            }
            i++;
        }
    }
    return null;
}

exports.listCameras = function (res) {
    var data = db.getData("/");
    if (data.cameras && data.cameras.length > 0) {
        return res.send(data.cameras);
    }
}

exports.addCamera = function (req, res) {
    let camera = {
        name: req.body.name,
        ip: req.body.ip
    }
    let cameraIndex = findCamera(camera.name);
    if (cameraIndex == null) {
        db.push('/cameras[]', camera);
        return res.send({
            "added": true
        });
    } else if (cameraIndex != null) {
        return res.send({
            "added": false,
            "reason": 'camera already exists'
        });
    } else res.sendStatus(400);
}

exports.removeCamera = function (req, res) {
    let cameraIndex = findCamera(req.body.name);
    if (cameraIndex != null) {
        db.delete('/cameras[' + cameraIndex + ']');
        console.log('camera', req.body.name, 'removed');
        return res.send({
            "removed": true
        });
    } else return res.sendStatus(400);
}

var findCamera = function (name) {
    var data = db.getData("/");
    var i = 0;
    if (data.cameras) {
        for (let camera of data.cameras) {
            if (camera.name == name) {
                return i;
            }
            i++;
        }
    }
    return null;
}
