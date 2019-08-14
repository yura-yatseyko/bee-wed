const express = require('express');
const lodash = require('lodash');
var bodyParser = require('body-parser');
var multer  = require('multer');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var multerS3 = require('multer-s3');
var knox = require('knox-s3');

var {s3} = require('../services/aws');

var errorHandling = require('../middleware/errorHandling');
var {authenticate} = require('../middleware/authenticate');

var s3Proxy  = require('s3-proxy');

const {User, BrideGroomUser, SupplierUser} = require('../models/user.model');

const router = express.Router();

var aws = require('knox').createClient({
    key: 'AKIAYPSQVX7JARIHULYT',
    secret: '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',
    bucket: 'beewedbucketapp'
  })

var upload = multer({
    storage: multerS3({
      s3: s3,
      size: multerS3.length,
      bucket: process.env.S3_BUCKET,
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
var supplierUpload = upload.fields([{name: 'avatarImage'}, {name: 'coverImage'}])
var supplierGalleryUpload = upload.fields([{name: 'galleryImage'}])

router.use(bodyParser.json());

// router.get('/image/*', s3Proxy({
//     bucket: 'beewedbucketapp',
//     accessKeyId: 'AKIAYPSQVX7JARIHULYT',
//     secretAccessKey: 'rXS8dp23tJZzvH3gvksTIjKjWbxCa',
//     overrideCacheControl: 'max-age=100000',
//     defaultKey: 'index.html'
//   }));

router.get('/image/:id', function (req, res, next) {
  
    aws.get('/' + req.params.id)
    .on('error', next)
    .on('response', function (resp) {
      if (resp.statusCode !== 200) {
        var err = new Error()
        err.status = 404
        next(err)
        return
      }
  
      res.setHeader('Content-Length', resp.headers['content-length'])
      res.setHeader('Content-Type', 'binary/octet-stream')
      res.setHeader('Connection', 'keep-alive')
      res.setHeader('Accept-Ranges', 'bytes')
  
      // cache-control?
      // etag?
      // last-modified?
      // expires?
  
      if (req.fresh) {
        res.statusCode = 304
        res.end()
        return
      }
  
      if (req.method === 'HEAD') {
        res.statusCode = 200
        res.end()
        return
      }
  
      resp.pipe(res)
    });
});

// router.get('/image/1561496114693VIDEO_20190625_215458.mp4', function(req, res) {
//   var headers = {
//       'Content-Length': res.headers['content-length'],
//       'Content-Type': res.headers['content-type']
//   };
//   client.putStream(res, '/1561496114693VIDEO_20190625_215458.mp4', headers, function(err, res){
//     // check `err`, then do `res.pipe(..)` or `res.resume()` or whatever.
//   });
// });

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
            Bucket: process.env.S3_BUCKET, 
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

router.post('/user/supplier/updateLiveGPSFlag', authenticate, (req, res) => {
    var liveGPSEnabled = req.body.liveGPSEnabled;
    
    req.user.updatesSupplierGPSFlagEnabled(liveGPSEnabled).then((user) => {
        res.status(200).send({
            success: true,
            data: user
        });
      }, () => {
        res.status(400).send();
      });
});

router.post('/user/supplier/updateLocation', authenticate, (req, res) => {
    var lat = parseFloat(req.body.lat);
    var lng = parseFloat(req.body.lng);
    
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

router.post('/user/updateRegistrationToken', authenticate, (req, res) => {
    let token = req.token;

    req.user.registrationTokens = req.user.registrationTokens.filter(function( obj ) {
        return obj.token !== token;
    });
    

    let registrationToken = req.body.registrationToken;
    let platform = req.body.platform;
    req.user.registrationTokens = req.user.registrationTokens.concat([{platform, registrationToken, token}]);

    req.user.save().then((doc) => {
        res.send({
          success: true,
          data: doc
        });
    }).catch((e) => {
        res.status(400).send(errorHandling.bridegroomSignUpErrorHandling(e));
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
    var body = lodash.pick(req.body, ['name', 'phone', 'websiteURL', 'description', 'registrationToken', 'supplierType', 'supplierLocation']);

    var objects = [];

    if (req.files['avatarImage']) {
        if (req.files['avatarImage'].length > 0) {
            objects.push({
                Key: req.user.avatarUrl.key
            });
        }
    }

    if (req.files['coverImage']) {
        if (req.files['coverImage'].length > 0) {
            objects.push({
                Key: req.user.coverUrl.key
            });
        }
    }
    
    if (objects.length > 0) {
        var params = {
            Bucket: 'beewed', 
            Delete: {
              Objects: objects,
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

    req.user.updateSupplierData(body, req.files).then((user) => {
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
            var transporter = nodemailer.createTransport(smtpTransport({
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                auth: {
                  user: process.env.EMAIL,
                  pass: process.env.EMAIL_PASSWORD
                }
            }));
    
            var mailOptions = {
                from: process.env.EMAIL,
                to: user.email,
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
            res.status(400).send(errorHandling.resetPasswordErrorHandling(12));
        }); 
    }).catch((e) => {
        res.status(400).send(errorHandling.resetPasswordErrorHandling(11));
    });
});

module.exports = router;