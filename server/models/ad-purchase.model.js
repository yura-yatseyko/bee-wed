const mongoose = require('mongoose')
require('mongoose-double')(mongoose);

var SchemaTypes = mongoose.Schema.Types;

var AdPurchaseSchema = new mongoose.Schema({
    title: {
      type: String
    },
    days: {
      type: Number
    },
    price: {
      type: SchemaTypes.Double
    },
    inAppPurchaseIdentifierIOS: {
      type: String
    },
    inAppPurchaseIdentifierAndroid: {
      type: String
    }
});

var AdPurchase = mongoose.model('AdPurchase', AdPurchaseSchema);
module.exports = {AdPurchase};