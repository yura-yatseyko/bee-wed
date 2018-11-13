const express = require('express');
const lodash = require('lodash');
var bodyParser = require('body-parser');
var multer  = require('multer');
var nodemailer = require('nodemailer');
var multerS3 = require('multer-s3')

var {s3} = require('../services/aws');

var errorHandling = require('../middleware/errorHandling');
var {authenticate} = require('../middleware/authenticate');

const {User, BrideGroomUser, SupplierUser} = require('../models/user.model');

const router = express.Router();

var upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: 'beewedbucket',
      acl: 'public-read',
      contentType: multerS3.AUTO_CONTENT_TYPE,
      contentDisposition: 'inline',
      metadata: function (req, file, cb) {
        cb(null, {fieldName: file.fieldname});
      },
      key: function (req, file, cb) {
        cb(null, Date.now().toString() + file.originalname)
      }
    })
});

var brideGroomUpload = upload.single('avatarImage');
var supplierUpload = upload.single('avatarImage');
var supplierGalleryUpload = upload.fields([{name: 'galleryImage'}])

router.use(bodyParser.json());

router.post('/user/supplier/updateGallery', authenticate, supplierGalleryUpload, (req, res) => {
    
    if (req.files) {
        if (req.files['galleryImage']) {
            req.files['galleryImage'].forEach(function(element) {
                let img = {
                    "location": element.location,
                    "key": element.key
                };
              req.user.galleryUrls.push(img);
            });
        }
    }
    
    req.user.save().then((doc) => {
        res.status(200).send({
            success: true,
            data: doc
        });
    }, () => {
        res.status(400).send();
    });
});

router.delete('/user/supplier/updateGallery', authenticate, (req, res) => {
    let imagesKeys = req.body.imagesKeys;

    if (imagesKeys.length > 0) {

        var objects = [];

        var galleryUrls = req.user.galleryUrls;

        imagesKeys.forEach(function(imageKey) {
            objects.push({Key: imageKey});
            galleryUrls = galleryUrls.filter(function(el) { return el.key != imageKey; }); 
        });

        var params = {
            Bucket: 'beewed', 
            Delete: {
              Objects: objects,
            },
        };
          
        s3.deleteObjects(params, function(err, data) {
            if (err) {
                console.log(err, err.stack);
                res.status(400).send();
            } else {
                console.log(data);

                req.user.galleryUrls = galleryUrls;

                req.user.save().then((doc) => {
                    res.status(200).send({
                        success: true,
                        data: doc
                    });
                }, () => {
                    res.status(400).send();
                });
            }
        });
    } else {
        res.status(200).send({
            success: true,
            data: req.user
        });
    }
});

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

router.post('/user/supplier/updateNotifications', authenticate, (req, res) => {    
    req.user.updateSupplierNotifications(req.body).then((user) => {
        res.status(200).send({
            success: true,
            data: user
        });
    }, () => {
        res.status(400).send();
    });
});

router.post('/user/bridegroom/updateStatus', authenticate, (req, res) => {
    var status = req.body.status;
    
    req.user.updateBrideGroomStatus(status).then((user) => {
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
    }, (e) => {
      res.status(400).send(errorHandling.updateUserPasswordErrorHandling(e));
    });
});

router.post('/user/bridegroom/update', authenticate, brideGroomUpload, (req, res) => {  
    var body = lodash.pick(req.body, ['name', 'weddingDate', 'weddingVenue']);

    if (req.file) {
        var params = {
            Bucket: 'beewed', 
            Delete: {
              Objects: [
                {
                  Key: req.user.avatarUrl.key
                }
              ],
            },
          };
          
          s3.deleteObjects(params, function(err, data) {
            if (err) {
                console.log(err, err.stack);
            } else {
                console.log(data);
            }
          });
    }

    req.user.updateBrideGroomData(body, req.file).then((user) => {
        res.status(200).send({
            success: true,
            data: user
        });
    }, () => {
        res.status(400).send();
    });
});

router.post('/user/supplier/update', authenticate, supplierUpload, (req, res) => {  
    var body = lodash.pick(req.body, ['name', 'phone', 'websiteURL', 'description', 'registrationToken', 'supplierType']);

    if (req.file) {
        var params = {
            Bucket: 'beewed', 
            Delete: {
              Objects: [
                {
                  Key: req.user.avatarUrl.key
                }
              ],
            },
          };
          
          s3.deleteObjects(params, function(err, data) {
            if (err) {
                console.log(err, err.stack);
            } else {
                console.log(data);
            }
          });
    }

    req.user.updateSupplierData(body, req.file).then((user) => {
        res.status(200).send({
            success: true,
            data: user
        });
    }, () => {
        res.status(400).send();
    });
});

router.post('/user/resetpassword', (req, res) => {  
    var newPassword = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 8; i++)
        newPassword += possible.charAt(Math.floor(Math.random() * possible.length));


    User.findOne({
        email: req.body.email
    }).then((user) => {
        if (!user) {
            res.status(400).send(errorHandling.resetPasswordErrorHandling(11));
            return;
        }

        user.resetPassword(newPassword).then((user) => {
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                  user: process.env.EMAIL,
                  pass: process.env.EMAIL_PASSWORD
                }
            });
    
            var mailOptions = {
                from: process.env.EMAIL,
                to: user.email,
                subject: 'Resetting password!',
                text: 'New password: ' + newPassword
            };
    
            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    res.status(400).send(errorHandling.resetPasswordErrorHandling(13));
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
            res.status(400).send(errorHandling.resetPasswordErrorHandling(12));
        }); 
    }).catch((e) => {
        res.status(400).send(errorHandling.resetPasswordErrorHandling(11));
    });
});

module.exports = router;