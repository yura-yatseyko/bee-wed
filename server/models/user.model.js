const mongoose = require('mongoose')
require('mongoose-double')(mongoose);
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');
var async = require("async");

const {ObjectID} = require('mongodb');
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
  registrationTokens: [
    {
      registrationToken: {
        type: String,
        required: true
      },
      token: {
        type: String,
        required: true
      }
    }
  ],
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
  weddingDate: {
    type: Number
  },
  weddingVenue: {
    type: String
  },
  avatarUrl: {
    location: {
      type: String,
      default: null
    },
    key: {
      type: String,
      default: null
    }
  },
  status: {
    type: Boolean,
    default: false
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
    location: {
      type: String,
      default: null
    },
    key: {
      type: String,
      default: null
    }
  },
  galleryUrls: [{
    location: {
      type: String,
      default: null
    },
    key: {
      type: String,
      default: null
    }
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
  },
  dist: {
    type: SchemaTypes.Double,
    default: null
  },
  isLiked: {
    type: Boolean,
    default: false
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
    advertExpiryAlert: {
      type: Boolean,
      default: false
    }
  }
}, options);

UserSchema.methods.generateAuthToken = function () {
  var user = this;
  var access = 'auth';
  var token = jwt.sign({_id: user._id.toHexString(), access}, process.env.JWT_SECRET).toString();

  user.tokens = user.tokens.concat([{access, token}]);

  return user.save().then(() => {
    return token;
  });
};

UserSchema.methods.removeToken = function (token) {
  var user = this;

  return user.update({
    $pull: {
      tokens: {token},
      registrationTokens: {token}
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

UserSchema.methods.updateBrideGroomStatus = function (status) {
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
    user.avatarUrl.location = file.location;
    user.avatarUrl.key = file.key;
  }

  return new Promise((resolve, reject) => {
      user.save().then((doc) => {
          resolve(doc) ;
      }, () => {
          reject();
      });
  });
};

UserSchema.methods.updateSupplierData = async function (data, file) {
  
  var user = this;

  if (data.supplierType) {
    
    try {
      var supplierType = await SupplierType.findOne({
        _id : new ObjectID(data.supplierType)
      });
      
      if (supplierType) {
        user.supplierType = supplierType;
      }
    } catch(err) {
    }
  }

  if (data.name) {
    user.name = data.name;
  }

  if (data.phone) {
    user.phone = data.phone;
  }

  if (data.websiteURL) {
    user.websiteURL = data.websiteURL;
  }

  if (data.description) {
    user.description = data.description;
  }

  if (data.registrationToken) {
    user.registrationToken = data.registrationToken;
  }

  if (file) {
    user.avatarUrl.location = file.location;
    user.avatarUrl.key = file.key;
  }

  return new Promise((resolve, reject) => {
    user.save().then((doc) => {
        resolve(doc) ;
    }, () => {
        reject();
    });
  });
};

UserSchema.methods.updateSupplierNotifications = function (data) {
  var user = this;

  if (data.hasOwnProperty('newMessage')) {
    user.notifications.newMessage = data.newMessage;
  }

  if (data.hasOwnProperty('newSupplier')) {
    user.notifications.newSupplier = data.newSupplier;
  }

  if (data.hasOwnProperty('advertExpiryAlert')) {
    user.notifications.advertExpiryAlert = data.advertExpiryAlert;
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

  if (data.hasOwnProperty('newMessage')) {
    user.notifications.newMessage = data.newMessage;
  }

  if (data.hasOwnProperty('newSupplier')) {
    user.notifications.newSupplier = data.newSupplier;
  }

  if (data.hasOwnProperty('countdown')) {
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

UserSchema.methods.resetPassword = function (newPassword) {
  var user = this;

  return new Promise((resolve, reject) => {
    user.password = newPassword;
    user.save().then((doc) => {
      resolve(doc) ;
    }, () => {
      reject();
    });
  });
}

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
                          reject({code: 2});
                      });
                  }
              });
          } else {
              reject({code: 1});
          }
      });
  });
};

UserSchema.statics.findByToken = function (token) {
  var User = this;
  var decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET)
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
      return Promise.reject({code: 11});
    }

    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
          resolve(user);
        } else {
          reject({code: 2});
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
var SupplierUser = User.discriminator('SupplierUser', SupplierSchema);
var BrideGroomUser = User.discriminator('BrideGroomUser', BrideGroomSchema);


module.exports = {User, BrideGroomUser, SupplierUser};