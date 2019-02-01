const express = require('express');
const _ = require('lodash');
var bodyParser = require('body-parser');

var errorHandling = require('../middleware/errorHandling');

const {User, BrideGroomUser, SupplierUser} = require('../models/user.model');

const router = express.Router();

router.use(bodyParser.json());

router.post('/signin', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);
  
    User.findByCredentials(body.email, body.password).then((user) => {
      return user.generateAuthToken().then((token) => {
        let registrationToken = req.body.registrationToken;
        let platform = req.body.platform;
        user.registrationTokens = user.registrationTokens.concat([{platform, registrationToken, token}]);

        let access = false;

        const trialInSeconds = 1209600;
        const userCreatedAt = user._id.getTimestamp().getTime() / 1000;
        const now = (new Date()).getTime() / 1000;
        const diff = now - userCreatedAt;

        if (diff < trialInSeconds) {
          access = true;
        } else if (user.subscription.expireAt > now) {
          access = true;
        }

        user.subscription.expireAt = parseInt(user.subscription.expireAt, 10);;
        user.subscription.access = access;

        user.save().then((doc) => {
          res.header('x-auth', token).send({
            success: true,
            data: doc
        });
        }).catch((e) => {
          res.status(400).send(errorHandling.bridegroomSignUpErrorHandling(e));
        });
      });
    }).catch((e) => {
      res.status(400).send(errorHandling.signInErrorHandling(e));
    });
});

module.exports = router;