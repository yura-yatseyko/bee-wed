var mongoose = require('mongoose');

var SupplierTypeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  }
});

var SupplierType = mongoose.model('SupplierType', SupplierTypeSchema);
module.exports = {SupplierType, SupplierTypeSchema};