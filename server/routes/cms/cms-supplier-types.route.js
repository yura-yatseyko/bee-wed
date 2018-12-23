const express = require('express');
const bodyParser = require('body-parser');

const {SupplierType} = require('../../models/supplier-type.model');

var {authenticate} = require('../../middleware/admin-authenticate');

const router = express.Router();
router.use(bodyParser.json());

router.post('/cms/supplier/types', authenticate, (req, res) => {    
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

router.get('/cms/supplier/types', authenticate, (req, res) => {
    SupplierType.find().then((supplierTypes) => {
        res.send({
            success: true,
            data: supplierTypes
        });
    }, (err) => {
        res.status(400).send(err);
    });
});

router.delete('/cms/supplier/types', authenticate, (req, res) => {
    SupplierType.deleteOne({
        _id: req.body._id
    }).then(() => {
        res.send({
            success: true,
            data: {}
        });
    }, (err) => {
        res.status(400).send(err);
    });
});

router.put('/cms/supplier/types', authenticate, (req, res) => { 
    SupplierType.updateOne({
        _id: req.body._id
    }, {
        $set: { title : req.body.title }
    }).then(() => {
        SupplierType.findOne({
            _id: req.body._id
        }).then((doc) => {
            res.send({
                success: true,
                data: doc
            });
        }, (err) => {
            res.status(400).send(err);
        });
    }, (err) => {
        res.status(400).send(err);
    });
});

module.exports = router;