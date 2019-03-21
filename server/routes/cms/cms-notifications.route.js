const express = require('express');
const bodyParser = require('body-parser');
const lodash = require('lodash');

var {authenticate} = require('../../middleware/admin-authenticate');
let firebaseAdmin = require('../../services/firebase-admin');

const {User, BrideGroomUser, SupplierUser} = require('../../models/user.model');

const router = express.Router();
router.use(bodyParser.json());

router.post('/cms/notifications/send', authenticate, (req, res) => {
    var body = lodash.pick(req.body, ['message', 'sendTo']); 

    var payloadAndroid = {
        data: {
          type: "admin_message",
          message: body.message,
          name: "BeeWed",
        }
      };
    
    var payloadIOS = {
        notification: {
          title: "BeeWed",
          body: body.message,
          sound: 'default',
        },
        data: {
          type: "admin_message",
        }
    };

    if (body.sendTo === '1') {
        SupplierUser.find().then((users) => {
            users.forEach(function(user) {
                user.registrationTokens.forEach(function(rt) {
                    firebaseAdmin.sendPushNotification(payloadAndroid, payloadIOS, rt.registrationToken, rt.platform);
                });
            });
        });
    } else if (body.sendTo === '2') {
        BrideGroomUser.find().then((users) => {
            users.forEach(function(user) {
                user.registrationTokens.forEach(function(rt) {
                    firebaseAdmin.sendPushNotification(payloadAndroid, payloadIOS, rt.registrationToken, rt.platform);
                });
            });
        });
    } else {
        User.find().then((users) => {
            users.forEach(function(user) {
                user.registrationTokens.forEach(function(rt) {
                    firebaseAdmin.sendPushNotification(payloadAndroid, payloadIOS, rt.registrationToken, rt.platform);
                });
            });
        });
    }

    res.status(200).send({
        success: true,
        data: {
        }
    });

});

module.exports = router;