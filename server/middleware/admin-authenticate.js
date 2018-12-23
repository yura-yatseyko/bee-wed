var {Admin} = require('./../models/admin.model');

var errorHandling = require('./cmsErrorHandling');

var authenticate = (req, res, next) => {
  var token = req.header('x-auth');

  Admin.findByToken(token).then((admin) => {
    if (!admin) {
      return Promise.reject();
    }

    req.admin = admin;
    req.token = token;
    next();
  }).catch((e) => {
    res.status(401).send(errorHandling.notAuthorizedErrorHandling());
  });
};

module.exports = {authenticate}