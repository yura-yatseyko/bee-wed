const express = require('express');

var {authenticate} = require('../middleware/authenticate');

const router = express.Router();

router.delete('/logout', authenticate, (req, res) => {
    req.user.removeToken(req.token).then(() => {
      res.status(200).send({
          success: true,
          data: {
          }
      });
    }, () => {
      res.status(400).send();
    });
});

module.exports = router;