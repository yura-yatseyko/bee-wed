const mongoose = require('mongoose')
require('mongoose-double')(mongoose);

var MessageSchema = new mongoose.Schema({
    message: {
        type: String
    },
    createdAt: {
        type: Number
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    messageFileURL: {
        location: {
          type: String,
          default: null
        },
        key: {
          type: String,
          default: null
        }
    },
    isRead: {
        type: Boolean,
        default: false
    }
});

var Message = mongoose.model('Message', MessageSchema);
module.exports = {Message};