const express = require('express');
var bodyParser = require('body-parser');
const queryString = require('query-string');

const {ObjectID} = require('mongodb');
const {User} = require('../models/user.model');
var {authenticate} = require('../middleware/authenticate');

const router = express.Router();

router.use(bodyParser.json());

router.get('/users/suppliers', authenticate, (req, res) => {
    var params = {
        kind: "SupplierUser"
    };

    if (req.query.typeID){
        params.supplierType = new ObjectID(req.query.typeID);
    }
    
    User.find(params).then((suppliers) => {
        res.send({
            success: true,
            data: suppliers
        });
    }, (err) => {
        res.status(400).send(err);
    });
});

module.exports = router;