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
        type: mongoose.Schema.Types.ObjectId
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

var Message = mongoose.model('Message', MessageSchema);
module.exports = {Message};