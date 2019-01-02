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
        user.registrationTokens = user.registrationTokens.concat([{registrationToken, token}]);

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