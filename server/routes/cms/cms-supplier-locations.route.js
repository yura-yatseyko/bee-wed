const express = require('express');
const bodyParser = require('body-parser');
const lodash = require('lodash');

const {SupplierLocation} = require('../../models/supplier-location.model');

var {authenticate} = require('../../middleware/admin-authenticate');

const router = express.Router();
router.use(bodyParser.json());

router.post('/cms/supplier/locations', authenticate, (req, res) => {    
    var supplierLocation = new SupplierLocation({
        title: req.body.title,
        location: {
            lat: parseFloat(req.body.lat),
            lng: parseFloat(req.body.lng)
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

router.get('/cms/supplier/locations', authenticate, (req, res) => {
    var body = lodash.pick(req.body, ['searchText']);

    var query = {
    }

    if (body.searchText != undefined) {
        query.title = { $regex: body.searchText }
    }

    SupplierLocation.find(query).then((supplierLocations) => {
        res.send({
            success: true,
            data: supplierLocations
        });
    }, (err) => {
        res.status(400).send(err);
    });
});

router.delete('/cms/supplier/locations', authenticate, (req, res) => {
    SupplierLocation.deleteOne({
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

router.put('/cms/supplier/locations', authenticate, (req, res) => { 
    SupplierLocation.updateOne({
        _id: req.body._id
    }, {
        $set: { 
            title : req.body.title, 
            'location.lat': parseFloat(req.body.lat),
            'location.lng': parseFloat(req.body.lng)
        }
    }).then(() => {
        SupplierLocation.findOne({
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