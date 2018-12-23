const mongoose = require('mongoose')
require('mongoose-double')(mongoose);

const jwt = require('jsonwebtoken');

var AdminSchema = new mongoose.Schema({
    tokens: [{
        access: {
          type: String,
          required: true
        },
        token: {
          type: String,
          required: true
        }
    }],
});

AdminSchema.methods.generateAuthToken = function () {
    var admin = this;
    var access = 'auth';
    var token = jwt.sign({_id: admin._id.toHexString(), access}, process.env.JWT_SECRET).toString();
  
    admin.tokens = admin.tokens.concat([{access, token}]);
  
    return admin.save().then(() => {
      return token;
    });
};

AdminSchema.statics.findByToken = function (token) {
    var Admin = this;
    var decoded;
  
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (e) {
      return Promise.reject();
    }
  
    return Admin.findOne({
      '_id': decoded._id,
      'tokens.token': token,
      'tokens.access': 'auth'
    });
};

AdminSchema.methods.removeToken = function (token) {
    var admin = this;
  
    return admin.update({
      $pull: {
        tokens: {token}
      }
    });
};

var Admin = mongoose.model('Admin', AdminSchema);
module.exports = {Admin};