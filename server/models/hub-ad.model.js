const mongoose = require('mongoose')
require('mongoose-double')(mongoose);

var SchemaTypes = mongoose.Schema.Types;

var HubAdSchema = new mongoose.Schema({
    mediaFile: {
      location: {
        type: String,
        default: null
      },
      key: {
        type: String,
        default: null
      }
    },
    description: {
      type: String
    },
    createdAt: {
      type: Number
    },
    expireAt: {
      type: Number
    },
    _creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
  }
});

var HubAd = mongoose.model('HubAd', HubAdSchema);
module.exports = {HubAd};