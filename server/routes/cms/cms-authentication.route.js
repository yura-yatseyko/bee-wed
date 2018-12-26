const express = require('express');

var {authenticate} = require('../../middleware/admin-authenticate');

const router = express.Router();

router.get('/cms/token/authentication', authenticate, (req, res) => {
    res.status(200).send({
        success: true,
        data: {
        }
    });
});

module.exports = router;