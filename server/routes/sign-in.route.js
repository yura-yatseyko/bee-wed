const express = require('express');
const _ = require('lodash');
var bodyParser = require('body-parser');

const {User, BrideGroomUser, SupplierUser} = require('../models/user.model');

const router = express.Router();

router.use(bodyParser.json());

router.post('/signin', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);
  
    User.findByCredentials(body.email, body.password).then((user) => {
      return user.generateAuthToken().then((token) => {
        res.header('x-auth', token).send({
            success: true,
            data: user
        });
      });
    }).catch((e) => {
      res.status(400).send();
    });
});

module.exports = router;