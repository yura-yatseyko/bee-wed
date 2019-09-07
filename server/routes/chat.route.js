const express = require('express');
const bodyParser = require('body-parser');
var multer  = require('multer');
var multerS3 = require('multer-s3')

var {s3} = require('../services/aws');
let firebaseAdmin = require('../services/firebase-admin');

var {authenticate} = require('../middleware/authenticate');

const {ObjectID} = require('mongodb');

const {Message} = require('../models/message.model');
const {Chat} = require('../models/chat.model');
const {RemovedMessage} = require('../models/removed-message.model');
const {User} = require('../models/user.model');

const router = express.Router();

var upload = multer({
    storage: multerS3({
      s3: s3,
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
  
var messageFileUpload = upload.single('messageFile');

router.post('/chat/messages', authenticate, messageFileUpload, async (req, res) => {    
    
    var message = new Message();
    message.message = req.body.message;
    message.createdAt = new Date();
    message.sender = req.user._id;
    message.receiver = new ObjectID(req.body.receiver);

    try {
        await RemovedMessage.deleteOne({
            $or: [
                {
                    removedBy: req.user._id,
                    removedWith: new ObjectID(req.body.receiver)
                },
                {
                    removedBy: new ObjectID(req.body.receiver),
                    removedWith: req.user._id
                }
            ]
        }).then(() => {}, (err) => {});
    } catch (err) {

    }

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
                      title: req.user.name,
                      body: req.body.message ? req.body.message : "",
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

                if (result.notifications.newMessage) {
                    result.registrationTokens.forEach(function(rt) {
                        firebaseAdmin.sendPushNotification(payloadAndroid, payloadIOS, rt.registrationToken, rt.platform);
                    });
                } 
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
router.get('/chat-edited', authenticate, async (req, res) => {
    Message.find()
    .sort({
        createdAt: -1
    }).then(async (messages) => {

        for (let i = 0; i < messages.length; i++) {
            const message = messages[i];

            let chat = null;
            try {
                chat = await Chat.find({ $or: [
                    { $and: [
                        { 'sender': message.sender },
                        { 'receiver': message.receiver }
                    ]},
                    { $and: [
                        { 'sender': message.receiver },
                        { 'receiver': message.sender }
                    ]}
                ]}).exec();
            } catch (error) {                
            }

            if (chat.length == 0) {
                let newChat = new Chat();
                newChat.message = message;
                newChat.sender = message.sender;
                newChat.receiver = message.receiver;

                try {
                    await newChat.save().exec();
                } catch (error) {
                }
            }
        }

        res.send({
            success: true
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
        for (let index = 0; index < messages.length; index++) {
            var found = false;
            const msg = messages[index];
            if (chats.length > 0) {
                for (let j = 0; j < chats.length; j++) {
                    const element = chats[j];

                    if (req.user._id.equals(msg.sender._id)) {
                        if (element.chatWithUser._id.equals(msg.receiver._id)) {
                            found = true;
                            break;
                        }
                    } else {
                        if (element.chatWithUser._id.equals(msg.sender._id)) {
                            found = true;
                            break;
                        }
                    }
                    
                } 
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

                let deleted = false;
                try {
                    await RemovedMessage.find({
                        removedBy: req.user._id,
                        removedWith: new Object(newMessage.chatWithUser._id)
                    }).then((removedMessages) => {
                        if (removedMessages.length > 0) {
                            deleted = true;
                        }
                    });
                } catch (err) {
                }
                
                if (!deleted) {
                    chats.push(newMessage);
                }
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
    }).distinct('sender', async function(error, ids) {

        var chats = [];

        for (let index = 0; index < ids.length; index++) {
            const element = ids[index];
            let deleted = false;
                try {
                    await RemovedMessage.find({
                        removedBy: req.user._id,
                        removedWith: element
                    }).then((removedMessages) => {
                        if (removedMessages.length > 0) {
                            deleted = true;
                        }
                    });
                } catch (err) {
                }
                
                if (!deleted) {
                    chats.push(element);
                }
        }

        if (error) {
            res.status(400).send(error);
        } else {
            res.send({
                success: true,
                data: {
                    badgeCount: chats.length,
                    ids: ids,
                }
            });
        }
    });
});

router.delete('/chat/:chatWithId', authenticate, async (req, res) => {
    var chatWithId = req.params.chatWithId;

    var removedMessage = new RemovedMessage();
    removedMessage.removedBy = req.user._id;
    removedMessage.removedWith = new ObjectID(chatWithId);

    removedMessage.save().then((doc) => {
        res.send({
            success: true,
            data: doc
        });
    }, (err) => {
        res.status(400).send(err);
    });
});

module.exports = router;