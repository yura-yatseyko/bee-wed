const mongoose = require('mongoose')
require('mongoose-double')(mongoose);
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

const {SupplierType, SupplierTypeSchema} = require('./supplier-type.model');

var SchemaTypes = mongoose.Schema.Types;

var options = { discriminatorKey: 'kind' };

var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    minlenght: 1,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email'
    }
  },
  password: {
    type: String,
    required: true,
    minlenght: 6
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
}, options);

var BrideGroomSchema = new mongoose.Schema({
  name: {
    type: String
  },
  birthdayDate: {
    type: Number
  },
  weddingDate: {
    type: Number
  },
  weddingVenue: {
    type: String
  },
  avatarUrl: {
    type: String,
    default: null
  },
  notifications: {
    newMessage: {
      type: Boolean,
      default: false
    },
    newSupplier: {
      type: Boolean,
      default: false
    },
    countdown: {
      type: Boolean,
      default: false
    }
  }
}, options);

var SupplierSchema = new mongoose.Schema({
  name: {
    type: String
  },
  phone: {
    type: String
  },
  supplierType: {
    type: SupplierTypeSchema,
    default: null
  },
  websiteURL: {
    type: String
  },
  description: {
    type: String
  },
  avatarUrl: {
    type: String,
    default: null
  },
  galleryUrls: [{
    type: String
  }],
  status: {
    type: Boolean,
    default: false
  },
  currentLocation: {
    lat: {
      type: SchemaTypes.Double,
      default: 0.0
    },
    lng: {
      type: SchemaTypes.Double,
      default: 0.0
    }
  }
}, options);

UserSchema.methods.generateAuthToken = function () {
  var user = this;
  var access = 'auth';
  var token = jwt.sign({_id: user._id.toHexString(), access}, '1111').toString();

  user.tokens = user.tokens.concat([{access, token}]);

  return user.save().then(() => {
    return token;
  });
};

UserSchema.methods.removeToken = function (token) {
  var user = this;

  return user.update({
    $pull: {
      tokens: {token}
    }
  });
};

UserSchema.methods.updatesSupplierStatus = function (status) {
  var user = this;

  user.status = status;

  return new Promise((resolve, reject) => {
      user.save().then((doc) => {
          resolve(doc) ;
      }, () => {
          reject();
      });
  });
};

UserSchema.methods.updateSupplierLocation= function (lat, lng) {
  var user = this;

  user.currentLocation.lat = lat;
  user.currentLocation.lng = lng;

  return new Promise((resolve, reject) => {
      user.save().then((doc) => {
          resolve(doc) ;
      }, () => {
          reject();
      });
  });
};

UserSchema.methods.updateBrideGroomData = function (data, file) {
  var user = this;

  if (data.name) {
    user.name = data.name;
  }

  if (data.weddingDate) {
    user.weddingDate = data.weddingDate;
  }

  if (data.weddingVenue) {
    user.weddingVenue = data.weddingVenue;
  }

  if (file) {
    user.avatarUrl = file.path;
  }

  return new Promise((resolve, reject) => {
      user.save().then((doc) => {
          resolve(doc) ;
      }, () => {
          reject();
      });
  });
};

UserSchema.methods.updateBrideGroomNotifications = function (data) {
  var user = this;

  if (data.newMessage) {
    user.notifications.newMessage = data.newMessage;
  }

  if (data.newSupplier) {
    user.notifications.newSupplier = data.newSupplier;
  }

  if (data.countdown) {
    user.notifications.countdown = data.countdown;
  }

  return new Promise((resolve, reject) => {
      user.save().then((doc) => {
          resolve(doc) ;
      }, () => {
          reject();
      });
  });
};

UserSchema.methods.updateUserPassword = function (password, newPassword) {
  var user = this;

  return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, res) => {
          if (res) {
              bcrypt.genSalt(10, (err, salt) => {
                  if (err) {
                      reject();
                  } else {
                      user.password = newPassword;
                      user.save().then((doc) => {
                          resolve(doc) ;
                      }, () => {
                          reject();
                      });
                  }
              });
          } else {
              reject();
          }
      });
  });
};

UserSchema.statics.findByToken = function (token) {
  var User = this;
  var decoded;

  try {
    decoded = jwt.verify(token, '1111')
  } catch (e) {
    return Promise.reject();
  }

  return User.findOne({
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  });
};

UserSchema.statics.findByCredentials = function (email, password) {
  var User = this;

  return User.findOne({email}).then((user) => {
    if (!user) {
      return Promise.reject();
    }

    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
          resolve(user);
        } else {
          reject();
        }
      });
    });
  });
};

UserSchema.pre('save', function (next) {
  var user = this;

  if (user.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

var User = mongoose.model('User', UserSchema);
var BrideGroomUser = User.discriminator('BrideGroomUser', BrideGroomSchema);
var SupplierUser = User.discriminator('SupplierUser', SupplierSchema);

module.exports = {User, BrideGroomUser, SupplierUser};