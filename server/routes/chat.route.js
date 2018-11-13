const express = require('express');
const bodyParser = require('body-parser');
var multer  = require('multer');
var multerS3 = require('multer-s3')
var admin = require('firebase-admin');

var serviceAccount = require("../../beewed-17604-firebase-adminsdk-s0zgk-23a60f5f8f.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://beewed-17604.firebaseio.com"
});

var {s3} = require('../services/aws');

var {authenticate} = require('../middleware/authenticate');

const {ObjectID} = require('mongodb');

const {Message} = require('../models/message.model');

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
  
var messageFileUpload = upload.single('messageFile');

router.post('/chat/messages', authenticate, messageFileUpload, (req, res) => {    
    
    var message = new Message();
    message.message = req.body.message;
    message.createdAt = new Date();
    message.sender = req.user._id;
    message.receiver = new ObjectID(req.body.receiver);

    if (req.file) {
        message.messageFileURL.location = req.file.location;
        message.messageFileURL.key = req.file.key;
        console.log(req.file);
      }

    message.save().then((doc) => {
        // User.findOne({
        //     "_id" : new ObjectID(req.body.receiver)
        // }, function (err, result) {
        //     if (result) {
        //         var registrationToken = result.registrationToken;
        //         if (registrationToken) {
        //             var payload = {
        //                 notification: {
        //                   title: "Beewed",
        //                   body: "New message from" + req.user.name
        //                 },
        //                 data: {
        //                     sender: req.user._id,
        //                 }
        //             };

        //             var options = {
        //                 priority: "high",
        //             };

        //             admin.messaging().sendToDevice(registrationToken, payload, options)
        //             .then(function(response) {
        //                 console.log("Successfully sent message:", response);
        //             })
        //             .catch(function(error) {
        //                 console.log("Error sending message:", error);
        //             });
        //         }
        //     }
        // });

        res.send({
            success: true,
            data: doc
        });
    }, (err) => {
        res.status(400).send(err);
    });

});

router.get('/chat/messages/:receiverId', authenticate, (req, res) => {   
    var receiverId = req.params.receiverId; 
    
    Message.find({
        $or: [
            {
                sender: req.user._id,
                receiver: new ObjectID(receiverId)
            },
            {
                sender: new ObjectID(receiverId),
                receiver: req.user._id
            }
        ]
    }).then((messages) => {
        res.send({
            success: true,
            data: messages
        });
    }, (err) => {
        res.status(400).send(err);
    });
});

router.get('/chat', authenticate, (req, res) => {   

    Message.find({ $or: [
        { 'sender': req.user._id },
        { 'receiver': req.user._id }
    ]})
    .sort({
        createdAt: -1
    })
    .populate('sender', 'name avatarUrl status')
    .populate('receiver', 'name avatarUrl status')
    .then((messages) => {
        var chats = [];

        messages.forEach(function(msg) {
            var found = chats.find(function(element) {
                
                let val1 = msg.sender.equals(element.sender._id) && msg.receiver._id.equals(element.receiver._id);
                let val2 = msg.sender.equals(element.receiver._id) && msg.receiver._id.equals(element.sender._id);
                
                return val1 || val2;
            });             

            if (!found) {
                chats.push(msg);
            }
        });
        res.send({
            success: true,
            data: chats
        });
    }, (err) => {
        res.status(400).send(err);
    });
});

module.exports = router;