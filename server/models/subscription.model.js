const mongoose = require('mongoose')
require('mongoose-double')(mongoose);

var SchemaTypes = mongoose.Schema.Types;

var SubscriptionSchema = new mongoose.Schema({
    title: {
      type: String
    },
    price: {
      type: SchemaTypes.Double
    },
    operationSystem: {
        type: String
    },
    inAppPurchaseIdentifier: {
        type: String
    }
});

var Subscription = mongoose.model('Subscription', SubscriptionSchema);
module.exports = {Subscription};