const mongoose = require('mongoose')
require('mongoose-double')(mongoose);

var SchemaTypes = mongoose.Schema.Types;

var PaymentSchema = new mongoose.Schema({
    description: {
        type: String
    },
    createdAt: {
        type: Number
    },
    price: {
        type: SchemaTypes.Double
    },
    _creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

var Payment = mongoose.model('Payment', PaymentSchema);
module.exports = {Payment};