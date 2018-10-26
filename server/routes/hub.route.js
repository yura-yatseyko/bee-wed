const express = require('express');
const lodash = require('lodash');
var multer  = require('multer');

var {authenticate} = require('../middleware/authenticate');

const {HubAd} = require('../models/hub-ad.model');

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
    
});

module.exports = router;