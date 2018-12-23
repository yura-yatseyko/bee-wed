const express = require('express');

var {authenticate} = require('../../middleware/admin-authenticate');

var errorHandling = require('../../middleware/cmsErrorHandling');

const router = express.Router();

router.delete('/cms/logout', authenticate, (req, res) => {
    req.admin.removeToken(req.token).then(() => {
      res.status(200).send({
          success: true,
          data: {
          }
      });
    }, () => {
      res.status(400).send(errorHandling.notAuthorizedErrorHandling());
    });
});

module.exports = router;