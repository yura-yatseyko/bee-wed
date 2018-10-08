const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');
const {ObjectID} = require('mongodb');
var {mongoose} = require('../db/mongoose');
var multer  = require('multer');

const {User, BrideGroomUser, SupplierUser} = require('../models/user.model');

const router = express.Router();

router.use('/uploads', express.static('uploads'));
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, new Date().toISOString() + file.originalname);
  }
});
const upload = multer({storage: storage});

router.post('/signup/bridegroom', upload.single('avatarImage'), (req, res) => {
  console.log(req.file);
  
  var body = _.pick(req.body, ['email', 'password', 'name', 'birthdayDate', 'weddingDate', 'weddingVenue']);
  var brideGroomUser = new BrideGroomUser(body);
  brideGroomUser.avatarUrl = req.file.path;
    
  brideGroomUser.save().then(() => {
    return brideGroomUser.generateAuthToken();
  }).then((token) => {
    res.header('x-auth', token).send({
        success: true,
        data: brideGroomUser
    });
  }).catch((e) => {
    res.status(400).send(e);
  });
});

router.post('/signup/supplier', (req, res) => {
  var body = _.pick(req.body, ['email', 'password', 'name', 'phone', 'websiteURL', 'description']);
  var supplierUser = new SupplierUser(body);
  supplierUser.supplierType = new ObjectID(req.body.supplierType)
  supplierUser.role = 'SUPPLIER'
  
  supplierUser.save().then(() => {
    return supplierUser.generateAuthToken();
  }).then((token) => {
    res.header('x-auth', token).send({
        success: true,
        data: supplierUser
    });
  }).catch((e) => {
    res.status(400).send(e);
  });
});

module.exports = router;