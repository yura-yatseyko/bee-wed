const express = require('express');
const _ = require('lodash');
var bodyParser = require('body-parser');

var {authenticate} = require('../middleware/authenticate');

const {Subscription} = require('../models/subscription.model');

const router = express.Router();
router.use(bodyParser.json());


module.exports = router;