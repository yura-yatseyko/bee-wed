const mongoose = require('mongoose')
require('mongoose-double')(mongoose);

const { MessageSchema } = require('./message.model');

var ChatSchema = new mongoose.Schema({
    message: {
        type: MessageSchema,
        default: null,
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    senderNeedReedMessages: {
        type: Number,
        default: 0,
    },
    receiverNeedReedMessages: {
        type: Number,
        default: 0,
    }
});

var Chat = mongoose.model('Chat', ChatSchema);
module.exports = {Chat};