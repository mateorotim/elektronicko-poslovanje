var express = require('express');
var router = express.Router();
var rb = require('../functions/rb.js')

rb.pinInit();

router.get('/test', function (req, res, next) {
    res.send('API');
});

router.post('/control', function (req, res) {
    if (!req.body) return res.sendStatus(400);
    if (rb.auth(req)) {
        rb.rpioWrite(req, res);
    } else res.sendStatus(400);
});

router.post('/add', function (req, res) {
    if (!req.body) return res.sendStatus(400);
    if (rb.auth(req)) {
        if (req.body.name || req.body.pin || req.body.state) {
            rb.addRelay(req, res);
        } else res.sendStatus(400);

    } else res.sendStatus(400);
});

router.post('/change', function (req, res) {
    if (!req.body) return res.sendStatus(400);
    if (rb.auth(req)) {
        if (req.body.name || req.body.pin) {
            console.log(req.body);
            //rb.changeRelay(req, res);
        } else res.sendStatus(400);
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

module.exports = router;