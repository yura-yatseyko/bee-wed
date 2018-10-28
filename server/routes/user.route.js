const express = require('express');
const lodash = require('lodash');
var bodyParser = require('body-parser');
var multer  = require('multer');
var nodemailer = require('nodemailer');

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

router.post('/user/bridegroom/updateNotifications', authenticate, (req, res) => {    
    req.user.updateBrideGroomNotifications(req.body).then((user) => {
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

router.post('/user/resetpassword', authenticate, (req, res) => {  
    var newPassword = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 8; i++)
        newPassword += possible.charAt(Math.floor(Math.random() * possible.length));

    req.user.resetPassword(newPassword).then((user) => {
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'beewedbox@gmail.com',
              pass: 'beewedbox1111'
            }
        });

        var mailOptions = {
            from: 'beewedbox@gmail.com',
            to: req.user.email,
            subject: 'Resetting password!',
            text: 'New password: ' + newPassword
        };

        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                res.status(400).send(error);
            } else {
                res.status(200).send({
                    success: true,
                    data: {
                        message: "New password was sent to your email."
                    }
                });
            }
        });
      }, () => {
        res.status(400).send();
      });   
});

module.exports = router;