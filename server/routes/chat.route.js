const express = require('express');
const bodyParser = require('body-parser');

var {authenticate} = require('../middleware/authenticate');

const {ObjectID} = require('mongodb');

const {Message} = require('../models/message.model');

const router = express.Router();
router.use(bodyParser.json());

router.post('/chat/messages', authenticate, (req, res) => {    
    var message = new Message();
    message.message = req.body.message;
    message.createdAt = new Date();
    message.sender = req.user._id;
    message.receiver = new ObjectID(req.body.receiver);

    message.save().then((doc) => {
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
        'sender': req.user._id,
        'receiver': new ObjectID(receiverId)
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
    Message.find({
        'sender': req.user._id,
    })
    .distinct('receiver', function(error, receiverIds) {
        var chats = [];
        var i = 0;

        receiverIds.forEach(function(receiverId) {
            Message
            .findOne({
                sender: req.user._id,
                receiver: new ObjectID(receiverId)
            })
            .sort({
                createdAt: -1
            })
            .populate('receiver', 'name avatarUrl status')
            .exec(function (err, result) {
                if (result) {
                    chats.push(result);
                }

                i++;

                if (receiverIds.length == i) {
                    res.send({
                        success: true,
                        data: chats
                    });
                }
            });
        });
    });
});

module.exports = router;