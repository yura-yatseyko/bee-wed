const express = require('express');
const lodash = require('lodash');
var multer  = require('multer');
var multerS3 = require('multer-s3')

var {authenticate} = require('../middleware/authenticate');
var {s3} = require('../services/aws');

const {ObjectID} = require('mongodb');

const {User} = require('../models/user.model');
const {HubAd} = require('../models/hub-ad.model');
const {AdPurchase} = require('../models/ad-purchase.model');

const router = express.Router();

var upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'beewedbucket',
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

var mediaFile = upload.single('mediaFile');

router.post('/hub', authenticate, mediaFile, (req, res) => {

  AdPurchase.findOne({
    '_id': new ObjectID(req.body.adPurchase)
  }, function (err, result) {
    if (result) {
      var hubAd = new HubAd();
      hubAd.description = req.body.description;

      var createdAt = new Date();
      var expireAt = Number(createdAt) + Number(result.days) * Number(86400000);

      hubAd.createdAt = createdAt;
      hubAd.expireAt = expireAt;
      hubAd._creator = req.user._id

      if (req.file) {
        hubAd.mediaFile.location = req.file.location;
        hubAd.mediaFile.key = req.file.key;
        console.log(req.file);
      }

      hubAd.save().then((doc) => {
        res.send({
            success: true,
            data: doc
          });
      }, (err) => {
          res.status(400).send(err);
      });
    }
  }); 
});

router.post('/hub/prolongate', authenticate, (req, res) => {
  AdPurchase.findOne({
    '_id': new ObjectID(req.body.adPurchase)
  }, function (err, result) {
    if (result) {
      HubAd.findOne({
        '_id': new ObjectID(req.body.hubAd)
      }, function (err, hubAd) {
        if (hubAd) {
          if (hubAd._creator.equals(req.user._id)) {
            var expireAt = Number(hubAd.expireAt) + Number(result.days) * Number(86400000);
            hubAd.expireAt = expireAt;

            hubAd.save().then((doc) => {
              res.send({
                  success: true,
                  data: doc
                });
            }, (err) => {
                res.status(400).send(err);
            });
          } else {
            res.status(400).send();
          }
        }
      });
    }
  }); 
});

router.get('/hub', authenticate, (req, res) => {
  HubAd.find({
  })
  .populate('_creator', 'name supplierType avatarUrl phone')
  .then((hubAds) => {
    var userHubAds = [];
    var otherHubAds = [];
    var i = 0;

    hubAds.forEach(function(hubAd) {
      if (req.user._id == hubAd._creator) {
        userHubAds.push(hubAd);
      } else {
        otherHubAds.push(hubAd);
      }

      i++;

      userHubAds.sort(function (a, b) {
        return a.createdAt < b.createdAt;
      });

      otherHubAds.sort(function (a, b) {
        return a.createdAt < b.createdAt;
      });

      if (hubAds.length == i) {
        res.send({
          success: true,
          data: userHubAds.concat(otherHubAds)
        });
      }
    });
  }, (err) => {
    res.status(400).send(err);
  });
});

router.post('/hub/adpurchases', (req, res) => {
  var body = lodash.pick(req.body, ['title', 'days', 'price']);

  var adPurchase = new AdPurchase(body);

  adPurchase.save().then((doc) => {
    res.send({
        success: true,
        data: doc
      });
  }, (err) => {
      res.status(400).send(err);
  });
});

router.get('/hub/adpurchases', authenticate, (req, res) => {
  AdPurchase.find().then((adPurchases) => {
      res.send({
          success: true,
          data: adPurchases
      });
  }, (err) => {
      res.status(400).send(err);
  });
});

module.exports = router;