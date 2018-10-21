const express = require('express');
const bodyParser = require('body-parser');
var {mongoose} = require('../db/mongoose');

const {SupplierLocation} = require('../models/supplier-location.model');

const router = express.Router();
router.use(bodyParser.json());

router.post('/supplier/locations', (req, res) => {    
    var supplierLocation = new SupplierLocation({
        title: req.body.title,
        location: {
            lat: req.body.lat,
            lng: req.body.lng
        }
    });
    
    supplierLocation.save().then((doc) => {
        res.send({
            success: true,
            data: doc
        });
    }, (err) => {
        res.status(400).send(err);
    });
});

router.get('/supplier/locations', (req, res) => {
    SupplierLocation.find().then((supplierLocations) => {
        res.send({
            success: true,
            data: supplierLocations
        });
    }, (err) => {
        res.status(400).send(err);
    });
});

module.exports = router;