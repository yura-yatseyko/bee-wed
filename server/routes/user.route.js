const express = require('express');
const _ = require('lodash');
var bodyParser = require('body-parser');

const {User, BrideGroomUser, SupplierUser} = require('../models/user.model');
var {authenticate} = require('../middleware/authenticate');

const router = express.Router();

router.use(bodyParser.json());

router.post('/user/updateStatus', authenticate, (req, res) => {
    var status = req.body.status;
    
    req.user.updateUserStatus(status).then((user) => {
        res.status(200).send({
            success: true,
            data: user
        });
      }, () => {
        res.status(400).send();
      });
});



module.exports = router;