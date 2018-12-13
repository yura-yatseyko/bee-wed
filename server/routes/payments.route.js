const express = require('express');
const bodyParser = require('body-parser');

var {authenticate} = require('../middleware/authenticate');

const {Payment} = require('../models/payment.model');

const router = express.Router();
router.use(bodyParser.json());

router.get('/payments', authenticate, (req, res) => {    
    Payment.find({
        _creator: req.user._id
    })
    .sort({
        createdAt: -1
    })
    .then((payments) => {
        res.send({
            success: true,
            data: payments
        });
    }, (err) => {
        res.status(400).send(err);
    });
});

module.exports = router;