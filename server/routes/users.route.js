const express = require('express');
var bodyParser = require('body-parser');
const queryString = require('query-string');
var geodist = require('geodist')

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

        var sortedSuppliers = [];

        var lat = null;
        var lon = null;

        if (req.query.userLat && req.query.userLng) {
            lat = req.query.userLat;
            lon = req.query.userLng;
        } else if (req.query.locationLat && req.query.locationLng) {
            lat = req.query.locationLat;
            lon = req.query.locationLng;
        }

        if (lat && lon) {
            var location = { lat, lon };

            suppliers.forEach(function(supplier) {
                var supplierLocation = {
                    lat: supplier.currentLocation.lat,
                    lon: supplier.currentLocation.lng
                };

                var dist = geodist(location, supplierLocation, {exact: true, unit: 'km'}) 
                supplier.dist = dist;

                sortedSuppliers.push(supplier);
            });

            sortedSuppliers.sort(function (a, b) {
                return a.dist > b.dist;
            });
            
        } else {
            sortedSuppliers.push.apply(sortedSuppliers, suppliers);
        }

        res.send({
            success: true,
            data: sortedSuppliers
        });
    }, (err) => {
        res.status(400).send(err);
    });
});

router.get('/users/:id', authenticate, (req, res) => {
    var id = req.params.id;

    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    User.findById(id).then((user) => {
        if (!user) {
          return res.status(404).send();
        }

        var lat = null;
        var lon = null;

        if (req.query.userLat && req.query.userLng) {
            lat = req.query.userLat;
            lon = req.query.userLng;
        }

        if (lat && lon && user.currentLocation && user.currentLocation) {
            var location = { lat, lon };

            var userLocation = {
                lat: user.currentLocation.lat,
                lon: user.currentLocation.lng
            };

            var dist = geodist(location, userLocation, {exact: true, unit: 'km'}) 
            user.dist = dist;

            res.send({
                success: true,
                data: user
            });
        } else {
            res.send({
                success: true,
                data: user
            });
        }
    }).catch((e) => {
        res.status(400).send();
    });
});

module.exports = router;