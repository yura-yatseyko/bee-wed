const express = require('express');
const bodyParser = require('body-parser');
const lodash = require('lodash');

var {authenticate} = require('../../middleware/admin-authenticate');

const router = express.Router();
router.use(bodyParser.json());

router.post('/cms/notifications/send', authenticate, (req, res) => {
    var body = lodash.pick(req.body, ['message', 'sendTo']); 
    
    console.log(body);

    res.status(200).send({
        success: true,
        data: {
        }
    });

});

module.exports = router;