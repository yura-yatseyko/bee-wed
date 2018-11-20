const express = require('express');
const bodyParser = require('body-parser');
var multer  = require('multer');
var multerS3 = require('multer-s3')
var admin = require('firebase-admin');

var serviceAccount = require("../../beewed-17604-firebase-adminsdk-s0zgk-c0ee9ff835.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://beewed-17604.firebaseio.com"
});

var {s3} = require('../services/aws');

var {authenticate} = require('../middleware/authenticate');

const {ObjectID} = require('mongodb');

const {Message} = require('../models/message.model');
const {User} = require('../models/user.model');

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
    }

    message.save().then((doc) => {
        User.findOne({
            "_id" : new ObjectID(req.body.receiver)
        }, function (err, result) {
            if (result) {
                var registrationToken = 'e-_TvaSEcjs:APA91bGU5NUQIvkyGODcCf-mz3I8yzkCXukDNNBU05IEej-V7rYVRwC8QU-0AY1DBYSQ6mW0caDjYWKnjr8Jv-YscenNxqDiOikyzjWEZY-lScSTi14WEV0xmRFejV-slW8KlcHTlipK';
        
                var payload = {
                    // notification: {
                    //   title: "Beewed",
                    //   body: "New message from" + req.user.name
                    // },
                    data: {
                        action: 'MESSAGE',
                        message: req.body.message,
                        _id: result._id.toString(),
                        kind: result.kind,
                        name: result.name,
                        phone: result.phone ? result.phone : "",
                        avatarUrl: result.avatarUrl.location ? result.avatarUrl.location : ""
                    }
                };

                console.log(payload);

                var options = {
                    priority: "high",
                };

                result.registrationTokens.forEach(function(rt) {
                    console.log(rt.registrationToken);
                    
                    admin.messaging().sendToDevice(rt.registrationToken, payload, options)
                        .then(function(response) {
                         console.log("Successfully sent message:", response);
                        })
                        .catch(function(error) {
                            console.log("Error sending message:", error);
                        });
                });
            }
        });

        Message.findOne({
            '_id': doc._id
        })
        .populate('sender', 'name phone')
        .populate('receiver', 'name phone')
        .then((message) => {
            res.send({
                success: true,
                data: message
            });
        }, (err) => {
            res.status(400).send(err);
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
    })
    .populate('sender', 'name phone')
    .populate('receiver', 'name phone')
    .then((messages) => {
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
    .populate('sender', 'name avatarUrl status phone')
    .populate('receiver', 'name avatarUrl status phone')
    .then((messages) => {
        var chats = [];

        var found = false;

        messages.forEach(function(msg) {
            if (chats.length > 0) {
                found = chats.find(function(element) {

                    if (req.user._id.equals(msg.sender._id)) {
                        return element.chatWithUser._id.equals(msg.receiver._id);
                    } else {
                        return element.chatWithUser._id.equals(msg.sender._id);
                    }
                });  
            }
            if (!found) {
                var newMessage = Object.create({});
                newMessage.messageFileURL = msg.messageFileURL;
                newMessage.message = msg.message;
                newMessage._id = msg._id;
                newMessage.createdAt = msg.createdAt;
                if (req.user._id.equals(msg.sender._id)) {
                    newMessage.chatWithUser = msg.receiver;
                } else {
                    newMessage.chatWithUser = msg.sender;
                }
                chats.push(newMessage);
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