const mongoose = require('mongoose')
require('mongoose-double')(mongoose);

var RemovedMessageSchema = new mongoose.Schema({
    removedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    removedWith: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

var RemovedMessage = mongoose.model('RemovedMessage', RemovedMessageSchema);
module.exports = {RemovedMessage};