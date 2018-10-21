const mongoose = require('mongoose')
require('mongoose-double')(mongoose);

var SchemaTypes = mongoose.Schema.Types;

var SupplierLocationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  location: {
    lat: {
      type: SchemaTypes.Double,
      default: 0.0
    },
    lng: {
      type: SchemaTypes.Double,
      default: 0.0
    }
  }
});

var SupplierLocation = mongoose.model('SupplierLocation', SupplierLocationSchema);
module.exports = {SupplierLocation, SupplierLocationSchema};