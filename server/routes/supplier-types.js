const express = require('express');
const bodyParser = require('body-parser');
var {mongoose} = require('./../db/mongoose');

const {SupplierType} = require('./../models/supplier-type');

const router = express.Router();
router.use(bodyParser.json());

router.post('/supplier/types', (req, res) => {    
    var supplierType = new SupplierType({
        title: req.body.title,
    });
    
    supplierType.save().then((doc) => {
        res.send({
            success: true,
            data: doc
        });
    }, (err) => {
        res.status(400).send(err);
    });
});

router.get('/supplier/types', (req, res) => {
    SupplierType.find().then((supplierTypes) => {
        res.send({
            success: true,
            data: supplierTypes
        });
    }, (err) => {
        res.status(400).send(err);
    });
});

module.exports = router;