var mongoose = require('mongoose');

var SupplierType = mongoose.model('SupplierType', {
  title: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  }
});

module.exports = {SupplierType};