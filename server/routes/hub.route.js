const express = require('express');
const lodash = require('lodash');
var multer  = require('multer');

var {authenticate} = require('../middleware/authenticate');

const {ObjectID} = require('mongodb');

const {User} = require('../models/user.model');
const {HubAd} = require('../models/hub-ad.model');
const {AdPurchase} = require('../models/ad-purchase.model');

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
        hubAd.mediaFile = req.file.path;
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
  }).then((hubAds) => {
    var userHubAds = [];
    var otherHubAds = [];
    var i = 0;

    hubAds.forEach(function(hubAd) {
      User.findOne({
        '_id': hubAd._creator
      }, function (err, result) {
        if (result) {
          var newHubItem = JSON.parse(JSON.stringify(hubAd));
          newHubItem.createdBy = {
            name: result.name,
            type: result.supplierType,
            avatarUrl: result.avatarUrl,
            phone: result.phone
          }
        }

        if (req.user._id == newHubItem._creator) {
          userHubAds.push(newHubItem);
        } else {
          otherHubAds.push(newHubItem);
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