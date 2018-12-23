const express = require('express');
const _ = require('lodash');
var bodyParser = require('body-parser');

const {Admin} = require('../../models/admin.model');

var errorHandling = require('../../middleware/cmsErrorHandling');

const router = express.Router();

router.use(bodyParser.json());

router.post('/cms/signin', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);

    if (body.email === process.env.ADMIN_EMAIL && body.password === process.env.ADMIN_PASSWORD) {
        Admin.remove({}).exec();

        let admin = Admin();

        admin.generateAuthToken().then((token) => {
            admin.save().then((doc) => {
                res.header('x-auth', token).send({
                    success: true,
                    data: doc
                });
            }).catch((e) => {
                res.status(400).send(errorHandling.signInErrorHandling());
            });
        });
    } else {
        res.status(400).send(errorHandling.signInErrorHandling());
    }
});

module.exports = router;