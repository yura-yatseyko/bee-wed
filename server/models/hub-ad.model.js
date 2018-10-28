const mongoose = require('mongoose')
require('mongoose-double')(mongoose);

var SchemaTypes = mongoose.Schema.Types;

var HubAdSchema = new mongoose.Schema({
    mediaFile: {
      type: String
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
      required: true
  }
});

var HubAd = mongoose.model('HubAd', HubAdSchema);
module.exports = {HubAd};