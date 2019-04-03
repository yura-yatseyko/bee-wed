const express = require('express');
const _ = require('lodash');
var multer  = require('multer');
var multerS3 = require('multer-s3')

var {s3} = require('../services/aws');
let firebaseAdmin = require('../services/firebase-admin');

var errorHandling = require('../middleware/errorHandling');

const {ObjectID} = require('mongodb');
const {User, BrideGroomUser, SupplierUser} = require('../models/user.model');
const {SupplierType} = require('../models/supplier-type.model');

const router = express.Router();

var upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'beewedbucketapp',
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
  var body = _.pick(req.body, ['email', 'password', 'name', 'weddingDate', 'weddingVenue', 'isSubscribedToNewsletter']);
  var brideGroomUser = new BrideGroomUser(body);

  brideGroomUser.isSubscribedToNewsletter = body.isSubscribedToNewsletter;

  if (req.file) {
    brideGroomUser.avatarUrl.location = req.file.location;
    brideGroomUser.avatarUrl.key = req.file.key;
    console.log(req.file);
  }
  
  brideGroomUser.save().then(() => {
    return brideGroomUser.generateAuthToken();
  }).then((token) => {
    let registrationToken = req.body.registrationToken;
    let platform = req.body.platform;
    brideGroomUser.registrationTokens = brideGroomUser.registrationTokens.concat([{platform, registrationToken, token}]);

    brideGroomUser.save().then((user) => {
      res.header('x-auth', token).send({
        success: true,
        data: user
    });
    }).catch((e) => {
      res.status(400).send(errorHandling.bridegroomSignUpErrorHandling(e));
    });
  }).catch((e) => {
    res.status(400).send(errorHandling.bridegroomSignUpErrorHandling(e));
  });
});

var supplierUpload = upload.fields([{name: 'avatarImage'}, {name: 'galleryImage'}, {name: 'coverImage'}])

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

    if (req.files['coverImage']) {
      if (req.files['coverImage'].length > 0) {
        supplierUser.coverUrl.location = req.files['coverImage'][0].location;
        supplierUser.coverUrl.key = req.files['coverImage'][0].key;
      }
    }
    
    supplierUser.save().then(() => {
      return supplierUser.generateAuthToken();
    }).then((token) => {

      let registrationToken = req.body.registrationToken;
      let platform = req.body.platform;
      supplierUser.registrationTokens = supplierUser.registrationTokens.concat([{platform, registrationToken, token}]);

      supplierUser.save().then((user) => {
        var params = {
          kind: "BrideGroomUser"
        };

        var payloadAndroid = {
          data: {
            type: "new_supplier",
            id: user._id.toString(),
            message: "New supplier joined BeeWed",
            name: "BeeWed",
          }
        };
      
        var payloadIOS = {
          notification: {
            title: "BeeWed",
            body: "New supplier joined BeeWed",
            sound: 'default',
          },
          data: {
            type: "new_supplier",
            id: user._id.toString(),
          }
        };

        User.find(params).then((bridegrroms) => {
          bridegrroms.forEach(function(bridegrrom) {
            if (bridegrrom.notifications.newSupplier) {
              bridegrrom.registrationTokens.forEach(function(rt) {
                firebaseAdmin.sendPushNotification(payloadAndroid, payloadIOS, rt.registrationToken, rt.platform);
              });
            }
          });
        });

        res.header('x-auth', token).send({
          success: true,
          data: user
      });
      }).catch((e) => {
        res.status(400).send(errorHandling.bridegroomSignUpErrorHandling(e));
      });
    }).catch((e) => {
      res.status(400).send(errorHandling.supplierSignUpErrorHandling(e));
    });
    
  });
});

module.exports = router;