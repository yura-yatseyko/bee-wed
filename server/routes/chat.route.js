const express = require('express');
const bodyParser = require('body-parser');
var multer  = require('multer');
var multerS3 = require('multer-s3')

var {s3} = require('../services/aws');
let firebaseAdmin = require('../services/firebase-admin');

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
        
                var payloadAndroid = {
                    data: {
                        type: "new_message",
                        action: 'MESSAGE',
                        message: req.body.message ? req.body.message : "",
                        messageFileURL: doc.messageFileURL.location ? doc.messageFileURL.location : "",
                        _id: req.user._id.toString(),
                        kind: req.user.kind,
                        name: req.user.name,
                        phone: req.user.phone ? req.user.phone : "",
                        avatarUrl: req.user.avatarUrl.location ? req.user.avatarUrl.location : ""
                    }
                };

                var payloadIOS = {
                    notification: {
                      title: "BeeWed",
                      body: "New message from " + req.user.name,
                      sound: 'default',
                    },
                    data: {
                        type: "new_message",
                        action: 'MESSAGE',
                        message: req.body.message ? req.body.message : "",
                        messageFileURL: doc.messageFileURL.location ? doc.messageFileURL.location : "",
                        _id: req.user._id.toString(),
                        kind: req.user.kind,
                        name: req.user.name,
                        phone: req.user.phone ? req.user.phone : "",
                        avatarUrl: req.user.avatarUrl.location ? req.user.avatarUrl.location : ""
                    }
                };
                result.registrationTokens.forEach(function(rt) {
                    firebaseAdmin.sendPushNotification(payloadAndroid, payloadIOS, rt.registrationToken, rt.platform);
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

router.get('/chat/messages/:receiverId', authenticate, async (req, res) => {   
    var receiverId = req.params.receiverId; 

    try {
        await Message.updateMany({receiver: req.user._id, sender: new Object(receiverId)}, {isRead: true}).exec();
    } catch (err) {

    }
    
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
    .sort({
        createdAt: 1
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

router.get('/chat', authenticate, async (req, res) => {   

    Message.find({ $or: [
        { 'sender': req.user._id },
        { 'receiver': req.user._id }
    ]})
    .sort({
        createdAt: -1
    })
    .populate('sender', 'name avatarUrl status phone lastVisit')
    .populate('receiver', 'name avatarUrl status phone lastVisit')
    .then( async (messages) => {
        var chats = [];

        var found = false;

        for (let index = 0; index < messages.length; index++) {
            const msg = messages[index];
            if (chats.length > 0) {
                found = chats.find(function(element) {

                    if (!msg.sender || !req.user._id || !msg.receiver) {
                        return true
                    }

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
                let diffInSeconds = (Number(new Date()) - Number(newMessage.chatWithUser.lastVisit)) / 1000;

                if (diffInSeconds < 300) {
                    newMessage.chatWithUser.status = true;
                } else {
                    newMessage.chatWithUser.status = false;
                }
                let notReadCount = 0;
                try {
                    await Message.find({
                        receiver: req.user._id,
                        sender: new Object(newMessage.chatWithUser._id),
                        isRead: false
                    }).then((messages) => {
                        notReadCount = messages.length;
                    });
                } catch (err) {
                }

                newMessage.notReadCount = notReadCount;

                chats.push(newMessage);
            }
        };
        res.send({
            success: true,
            data: chats
        });
    }, (err) => {
        res.status(400).send(err);
    });
});

router.get('/chat/badges', authenticate, async (req, res) => {
    Message.find({
        receiver: req.user._id,
        isRead: false
    }).distinct('sender', function(error, ids) {
        if (error) {
            res.status(400).send(error);
        } else {
            res.send({
                success: true,
                data: {
                    badgeCount: ids.length
                }
            });
        }
    });
});

module.exports = router;