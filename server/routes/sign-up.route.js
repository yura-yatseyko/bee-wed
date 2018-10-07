const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');
const {ObjectID} = require('mongodb');
var {mongoose} = require('../db/mongoose');

const {User} = require('../models/user.model');

const router = express.Router();
router.use(bodyParser.json());

router.post('/signup/bridegroom', (req, res) => {
  var body = _.pick(req.body, ['email', 'password', 'name', 'birthdayDate', 'weddingDate', 'weddingVenue']);
  var user = new User(body);
  user.role = 'BRIDE/GROOM'
    
  user.save().then(() => {
    return user.generateAuthToken();
  }).then((token) => {
    res.header('x-auth', token).send({
        success: true,
        data: user
    });
  }).catch((e) => {
    res.status(400).send(e);
  });
});

router.post('/signup/supplier', (req, res) => {
  var body = _.pick(req.body, ['email', 'password', 'name', 'phone', 'websiteURL', 'description']);
  var user = new User(body);
  user.supplierType = new ObjectID(req.body.supplierType)
  user.role = 'SUPPLIER'
  
  user.save().then(() => {
    return user.generateAuthToken();
  }).then((token) => {
    res.header('x-auth', token).send({
        success: true,
        data: user
    });
  }).catch((e) => {
    res.status(400).send(e);
  });
});

module.exports = router;