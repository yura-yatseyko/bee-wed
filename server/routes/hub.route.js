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
const {Payment} = require('../models/payment.model');

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
        HubAd.findOne({
          '_id': doc._id
        })
        .populate('_creator', 'name supplierType avatarUrl phone status')
        .then((hubAd) => {
          
          var payment = new Payment();
          payment.createdAt = new Date();
          payment.price = result.price;
          payment.description = result.title + " advert";
          payment._creator = req.user._id;

          payment.save();

          res.send({
            success: true,
            data: hubAd
          });
        }, (err) => {
          res.status(400).send(err);
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

              var payment = new Payment();
              payment.createdAt = new Date();
              payment.price = result.price;
              payment.description = result.title + " advert prolongation";
              payment._creator = req.user._id;

              payment.save();

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
  .populate('_creator', 'name supplierType avatarUrl phone status')
  .then((hubAds) => {
    var userHubAds = [];
    var otherHubAds = [];
    var i = 0;

    hubAds.forEach(function(hubAd) {
      if (Number(new Date()) < hubAd.expireAt) {

        let diffInSeconds = (Number(new Date()) - Number(hubAd._creator.lastVisit)) / 1000;
        if (diffInSeconds < 300) {
          hubAd._creator.status = true;
        } else {
          hubAd._creator.status = false;
        }

        if (req.user._id == hubAd._creator._id) {
          userHubAds.push(hubAd);
        } else {
          otherHubAds.push(hubAd);
        }
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