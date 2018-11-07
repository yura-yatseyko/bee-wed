const express = require('express');
const _ = require('lodash');
var multer  = require('multer');
var multerS3 = require('multer-s3')

const AWS = require('aws-sdk');
const s3 = new AWS.S3({
  accessKeyId: 'AKIAJHGEXJMRN3TM2ZIA',
  secretAccessKey: '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'
});

var errorHandling = require('../middleware/errorHandling');

const {ObjectID} = require('mongodb');
const {User, BrideGroomUser, SupplierUser} = require('../models/user.model');
const {SupplierType} = require('../models/supplier-type.model');

const router = express.Router();

var upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'beewed',
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    contentDisposition: 'inline',
    metadata: function (req, file, cb) {
      cb(null, {fieldName: file.fieldname});
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + file.originalname)
    }
  })
});

var brideGroomUpload = upload.single('avatarImage');

router.post('/signup/bridegroom', brideGroomUpload, (req, res) => {  
  var body = _.pick(req.body, ['email', 'password', 'name', 'weddingDate', 'weddingVenue']);
  var brideGroomUser = new BrideGroomUser(body);

  if (req.file) {
    brideGroomUser.avatarUrl.location = req.file.location;
    brideGroomUser.avatarUrl.key = req.file.key;
    console.log(req.file);
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
        supplierUser.avatarUrl.location = req.files['avatarImage'][0].location;
        supplierUser.avatarUrl.key = req.files['avatarImage'][0].key;
      }
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