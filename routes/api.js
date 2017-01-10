var express = require('express');
var router = express.Router();
var rb = require('../functions/rb.js')

rb.pinInit();

router.get('/test', function (req, res, next) {
    res.send('API');
});

router.post('/control', function (req, res) {
    if (rb.auth(req)) {
        rb.rpioWrite(req, res);
    } else res.sendStatus(400);
});

router.post('/add', function (req, res) {
    if (rb.auth(req)) {
        rb.addRelay(req, res);
    } else res.sendStatus(400);
});

router.post('/remove', function (req, res) {
    if (rb.auth(req)) {
        rb.removeRelay(req, res);
    } else res.sendStatus(400);
});

router.get('/login', function (req, res) {
    if (rb.auth(req)) {
        res.send({ "success": true });
    } else res.send({ "success": false });
});

router.get('/read', function (req, res) {
    if (rb.auth(req)) {
        rb.readRelays(res);
    } else res.sendStatus(400);
});

router.get('/listUsers', function (req, res) {
    if (rb.auth(req)) {
        rb.listUsers(res);
    } else res.sendStatus(400);
});

router.post('/addUser', function (req, res) {
    if (rb.auth(req)) {
        rb.addUser(req, res);
    } else res.sendStatus(400);
});

router.post('/removeUser', function (req, res) {
    if (rb.auth(req)) {
        rb.removeUser(req, res);
    } else res.sendStatus(400);
});

router.post('/updateUser', function (req, res) {
    if (rb.auth(req)) {
        rb.updateUser(req, res);
    } else res.sendStatus(400);
});

module.exports = router;