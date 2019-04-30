const express = require('express');
const lodash = require('lodash');
var bodyParser = require('body-parser');

var {authenticate} = require('../middleware/authenticate');

const {Subscription} = require('../models/subscription.model');
const {Payment} = require('../models/payment.model');
const {User} = require('../models/user.model');
var {ObjectID} = require('mongodb');

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
        expireAt = req.user.subscription.expireAt;
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
    const trialInSeconds = 1209600000;

    const userCreatedAt = req.user._id.getTimestamp().getTime();
    const now = (new Date()).getTime();

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
                subscriptions.forEach(element => {
                    element.price = element.price.value.toFixed(2);
                });
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
        const now = new Date();
        let subscribtionExpireAtFromNow = Number(now) + Number(subscription.days) * Number(86400000);

        if (req.user.subscription != undefined) {
            if (req.user.subscription.expireAt == 0) {
                req.user.subscription.expireAt = subscribtionExpireAtFromNow;
            } else {
                req.user.subscription.expireAt += Number(subscription.days) * Number(86400000);
            }
        } else {
            req.user.subscription.expireAt = subscribtionExpireAtFromNow;
        }

        req.user.save().then((doc) => {
            var payment = new Payment();
            payment.createdAt = new Date();
            payment.price = subscription.price;
            payment.description = subscription.title + " Subscription";
            payment._creator = req.user._id;
          
            payment.save();

            res.send({
                success: true,
                data: {
                    subscription: {
                        expireAt: doc.subscription.expireAt,
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

// router.post('/updateSubscriptions', async (req, res) => {    
//     var params = {
//         kind: "SupplierUser"
//     };

//     try {
//         let suppliers = await User.find(params).exec();
        
//         var arr = [];

//         const now = new Date();
//         let subscribtionExpireAtFromNow = Number(now) + Number(92) * Number(86400000);
        
//         for (let index = 0; index < suppliers.length; index++) {
//             const element = suppliers[index];
//             let payment = await Payment.findOne({
//                 _creator: new ObjectID(element._id),
//                 description: '6 Months Subscription'
//             }).exec();

//             if (payment) {
//                 arr.push({
//                     id: element._id,
//                     subscription: '6 Months Subscription',
//                     expireAt: element.subscription.expireAt
//                 });
//                 element.subscription.expireAt += Number(182) * Number(86400000);
//             } else {
//                 arr.push({
//                     id: element._id,
//                     subscription: '',
//                     expireAt: 0
//                 });
//                 element.subscription.expireAt = subscribtionExpireAtFromNow;
//             }

//             await element.save();
//         }
        
//         res.send({
//             success: true,
//             data: arr
//         });

//     } catch(err) {        
//     }
// });

module.exports = router;