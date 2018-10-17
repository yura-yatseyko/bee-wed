const express = require('express');
const lodash = require('lodash');
var bodyParser = require('body-parser');
var multer  = require('multer');

var {authenticate} = require('../middleware/authenticate');

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

var brideGroomUpload = upload.single('avatarImage');

router.use(bodyParser.json());

router.post('/user/supplier/updateStatus', authenticate, (req, res) => {
    var status = req.body.status;
    
    req.user.updatesSupplierStatus(status).then((user) => {
        res.status(200).send({
            success: true,
            data: user
        });
      }, () => {
        res.status(400).send();
      });
});

router.post('/user/supplier/updateLocation', authenticate, (req, res) => {
    var lat = req.body.lat;
    var lng = req.body.lng;
    
    req.user.updateSupplierLocation(lat, lng).then((user) => {
        res.status(200).send({
            success: true,
            data: user
        });
      }, () => {
        res.status(400).send();
      });
});

router.post('/user/updatePassword', authenticate, (req, res) => {
    var body = lodash.pick(req.body, ['password', 'newPassword']);
  
    req.user.updateUserPassword(body.password, body.newPassword).then((user) => {
      res.status(200).send({
          success: true,
          data: user
      });
    }, () => {
      res.status(400).send();
    });
});

// Update Bride/Groom profile data
router.post('/user/bridegroom/update', authenticate, brideGroomUpload, (req, res) => {  
    var body = lodash.pick(req.body, ['name', 'weddingDate', 'weddingVenue']);

    req.user.updateBrideGroomData(body, req.file).then((user) => {
        res.status(200).send({
            success: true,
            data: user
        });
      }, () => {
        res.status(400).send();
      });
});

module.exports = router;