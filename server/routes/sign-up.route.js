const express = require('express');
const _ = require('lodash');
const {ObjectID} = require('mongodb');
var multer  = require('multer');

var errorHandling = require('../middleware/errorHandling');

const {User, BrideGroomUser, SupplierUser} = require('../models/user.model');
const {SupplierType} = require('../models/supplier-type.model');

const router = express.Router();

router.use('/uploads', express.static('uploads'));

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, new Date().toISOString() + file.originalname);
  }
});

const upload = multer({storage: storage});

var brideGroomUpload = upload.single('avatarImage');

router.post('/signup/bridegroom', brideGroomUpload, (req, res) => {  
  var body = _.pick(req.body, ['email', 'password', 'name', 'weddingDate', 'weddingVenue']);
  var brideGroomUser = new BrideGroomUser(body);

  if (req.file) {
    brideGroomUser.avatarUrl = req.file.path;
  }
  
  brideGroomUser.save().then(() => {
    return brideGroomUser.generateAuthToken();
  }).then((token) => {
    res.header('x-auth', token).send({
        success: true,
        data: brideGroomUser
    });
  }).catch((e) => {
    res.status(400).send(errorHandling.bridegroomSignUpErrorHandling(e));
  });
});

var supplierUpload = upload.fields([{name: 'avatarImage'}, {name: 'galleryImage'}])

router.post('/signup/supplier', supplierUpload, (req, res) => {
  var body = _.pick(req.body, ['email', 'password', 'name', 'phone', 'websiteURL', 'description']);
  
  var supplierUser = new SupplierUser(body);

  SupplierType.findOne({
    '_id': new ObjectID(req.body.supplierType)
  }, function (err, result) {
    if (err) {
      supplierUser.supplierType = null;
    } else {
      supplierUser.supplierType = result;
    }

    if (req.files['avatarImage']) {
      if (req.files['avatarImage'].length > 0) {
        supplierUser.avatarUrl = req.files['avatarImage'][0].path;
      }
    }
  
    if (req.files['galleryImage']) {
      req.files['galleryImage'].forEach(function(element) {
        supplierUser.galleryUrls.push(element.path);
      });
    }
    
    supplierUser.save().then(() => {
      return supplierUser.generateAuthToken();
    }).then((token) => {
      res.header('x-auth', token).send({
          success: true,
          data: supplierUser
      });
    }).catch((e) => {
      res.status(400).send(errorHandling.supplierSignUpErrorHandling(e));
    });
    
  });
});

module.exports = router;