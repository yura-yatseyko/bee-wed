const express = require('express');
const lodash = require('lodash');
var bodyParser = require('body-parser');

var {authenticate} = require('../middleware/authenticate');

const {Subscription} = require('../models/subscription.model');

const router = express.Router();
router.use(bodyParser.json());

router.post('/subscriptions', (req, res) => {
    var body = lodash.pick(req.body, ['title', 'days', 'price', 'inAppPurchaseIdentifierIOS', 'inAppPurchaseIdentifierAndroid']);
  
    var subscription = new Subscription(body);
  
    subscription.save().then((doc) => {
      res.send({
          success: true,
          data: doc
        });
    }, (err) => {
        res.status(400).send(err);
    });
});

router.get('/subscriptions', authenticate, (req, res) => {    
    Subscription.find().then((subscriptions) => {
        subscriptions.forEach(element => {
        element.price = element.price.value.toFixed(2);
      });

      let trialPeriod = true;
      let expireAt = 0;

      if (req.user.subscription.expireAt != 0) {
        trialPeriod = false;
        expireAt = parseInt(req.user.subscription.expireAt, 10);
      }

      res.send({
        success: true,
        data: {
            subscriptions,
            trialPeriod,
            expireAt
        }
      });
    }, (err) => {
        res.status(400).send(err);
    });
});

router.get('/isUserSubscribed', authenticate, (req, res) => {
    const trialInSeconds = 1209600;

    const userCreatedAt = req.user._id.getTimestamp().getTime() / 1000;
    const now = (new Date()).getTime() / 1000;

    const diff = now - userCreatedAt;

    if (diff < trialInSeconds && req.user.subscription.expireAt == 0) {
        res.send({
            success: true,
            data: {
                access: true,
                trialPeriod: true,
                subscriptions: []
            }
        });
    } else {
        if (req.user.subscription.expireAt < now) {
            Subscription.find().then((subscriptions) => {
                res.send({
                    success: true,
                    data: {
                        access: false,
                        trialPeriod: false,
                        subscriptions: subscriptions
                    }
                });
            }, (err) => {
                res.status(400).send(err);
            });
        } else {
            res.send({
                success: true,
                data: {
                    access: true,
                    trialPeriod: false,
                    subscriptions: []
                }
            });
        }
    }
});

router.post('/subscribe', authenticate, async (req, res) => {
    var body = lodash.pick(req.body, ['subscriptionId']);

    let subscription;
    try {
        subscription = await Subscription.findOne({
          _id : body.subscriptionId
        });
    } catch(err) {        
    }

    if (subscription) {
        const now = (new Date()).getTime() / 1000;
    
        let subscribtionExpireAtFromNow = now + subscription.days * 86400;

        if (req.user.subscription != undefined) {
            if (req.user.subscription.expireAt == 0) {
                req.user.subscription.expireAt = subscribtionExpireAtFromNow;
            } else {
                req.user.subscription.expireAt += subscription.days * 86400;
            }
        } else {
            req.user.subscription.expireAt = subscribtionExpireAtFromNow;
        }

        req.user.save().then((doc) => {
            res.send({
                success: true,
                data: {
                    subscription: {
                        expireAt: parseInt(doc.subscription.expireAt, 10),
                        access: true,
                        trialPeriod: false,
                        title: subscription.title
                    }
                }
            });
        }, (err) => {
            res.status(400).send(err);
        });
    } else {
        res.status(400).send({
            success: false,
            data: {}
        });
    }
});

module.exports = router;