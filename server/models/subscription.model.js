const mongoose = require('mongoose')
require('mongoose-double')(mongoose);

var SchemaTypes = mongoose.Schema.Types;

var SubscriptionSchema = new mongoose.Schema({
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

var Subscription = mongoose.model('Subscription', SubscriptionSchema);
module.exports = {Subscription};