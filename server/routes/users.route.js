const express = require('express');
var bodyParser = require('body-parser');
const queryString = require('query-string');
var geodist = require('geodist');
var waterfall = require('async-waterfall');

const {ObjectID} = require('mongodb');
const {User} = require('../models/user.model');
const {Favorite} = require('../models/favorite.model');
const {SupplierType} = require('../models/supplier-type.model');
var {authenticate} = require('../middleware/authenticate');

const router = express.Router();

router.use(bodyParser.json());

router.get('/users/suppliers/export', (req, res) => {    
    var params = {
        kind: "SupplierUser"
    };

    User.find(params).then((suppliers) => {
        var emails = "";

        for (let index = 0; index < suppliers.length; index++) {
            const element = suppliers[index];
            emails = emails + element.email + ", ";
        }

        res.send({
            success: true,
            data: emails
        });
    }, (err) => {
        res.status(400).send(err);
    });
});

router.get('/users/suppliers', authenticate, (req, res) => {
    var params = {
        kind: "SupplierUser"
    };

    waterfall([
        function(callback) {
            if (req.query.typeID) {
                SupplierType.findOne({
                    "_id" : new ObjectID(req.query.typeID)
                }, function (err, result) {
                    if (result) {
                        callback(null, result);
                    } else {
                        callback(null, null);
                    }
                });
            } else {
                callback(null, null);
            }
        },
        function(supplierType, callback) {
            if (supplierType) {
                params.supplierType = supplierType;
            }

            User.find(params).then((suppliers) => {

                var sortedSuppliers = [];
    
                var userLat = null;
                var userLon = null;
    
                var lat = null;
                var lon = null;

                if (req.query.userLat && req.query.userLng) {
                    userLat = req.query.userLat;
                    userLon = req.query.userLng;
                }
                
                if (req.query.locationLat && req.query.locationLng) {
                    lat = req.query.locationLat;
                    lon = req.query.locationLng;
                } else if (req.query.userLat && req.query.userLng) {
                    lat = req.query.userLat;
                    lon = req.query.userLng;
                } 

                if (req.query.blLat && req.query.blLng && req.query.trLat && req.query.trLng) {
                    var blLat = req.query.blLat;
                    var blLng = req.query.blLng;
                    var trLat = req.query.trLat;
                    var trLng = req.query.trLng;
                    
                    suppliers.forEach(function(supplier) {
                        var supplierLocation = {
                            lat: supplier.currentLocation.lat,
                            lon: supplier.currentLocation.lng
                        };

                        if (supplier.supplierLocation && !supplier.liveGPSEnabled) {
                            supplierLocation = {
                                lat: supplier.supplierLocation.location.lat,
                                lon: supplier.supplierLocation.location.lng
                            };
                        }
        
                        var isInBounds = false;
        
                        var isLongInRange = false;
                        if (trLng < blLng) {
                            isLongInRange = supplierLocation.lon >= blLng || supplierLocation.lon <= trLng;
                        } else {
                            isLongInRange = supplierLocation.lon >= blLng && supplierLocation.lon <= trLng;
                        }
                        
                        isInBounds = supplierLocation.lat >= blLat  &&  supplierLocation.lat <= trLat  &&  isLongInRange;
        
                        if (isInBounds) {
                            if (userLat && userLon) {
                                var location = { 
                                    lat: userLat,
                                    lon: userLon
                                };
                                var dist = geodist(location, supplierLocation, {exact: true, unit: 'km'})
                                supplier.dist = dist;
                            }

                            let diffInSeconds = (Number(new Date()) - Number(supplier.lastVisit)) / 1000;

                            if (diffInSeconds < 300) {
                                supplier.status = true;
                            } else {
                                supplier.status = false;
                            }
        
                            sortedSuppliers.push(supplier);
                        }
                    });
        
                    sortedSuppliers.sort(function (a, b) {
                        return a.dist > b.dist;
                    });
                } else if (lat && lon) {
                    var location = { lat, lon };
        
                    suppliers.forEach(function(supplier) {
                        var supplierLocation = {
                            lat: supplier.currentLocation.lat,
                            lon: supplier.currentLocation.lng
                        };

                        if (supplier.supplierLocation && !supplier.liveGPSEnabled) {
                            supplierLocation = {
                                lat: supplier.supplierLocation.location.lat,
                                lon: supplier.supplierLocation.location.lng
                            };
                        }
        
                        var dist = geodist(location, supplierLocation, {exact: true, unit: 'km'}) 
                        supplier.dist = dist;

                        let diffInSeconds = (Number(new Date()) - Number(supplier.lastVisit)) / 1000;

                        if (diffInSeconds < 300) {
                            supplier.status = true;
                        } else {
                            supplier.status = false;
                        }

                        if (dist < 15) {
                            sortedSuppliers.push(supplier);
                        }                        
                    });
        
                    sortedSuppliers.sort(function (a, b) {
                        return a.dist > b.dist;
                    });
                    
                } else {
                    sortedSuppliers.push.apply(sortedSuppliers, suppliers);
                }

                var newRes = [];

                for (let index = 0; index < sortedSuppliers.length; index++) {
                    const el = sortedSuppliers[index];

                    const now = (new Date()).getTime();

                    var isSubscribed = false;

                    if (el.subscription) {
                        if (el.subscription.expireAt < now) {
                        } else {
                            isSubscribed = true;
                        }
                    }

                    if (isSubscribed) {
                        newRes.push(el);
                    }
                    
                }

                callback(null, newRes);
            }, (err) => {
                callback(err, null);
                res.status(400).send(err);
            });
        }
      ], function (err, result) {
          if (err) {
            res.status(400).send(err);
          } else {
            Favorite.find({
                senderID: req.user._id
            }).then((favorites) => {

                var newRes = [];

                result.forEach(function(el) {
                    favorites.forEach(function(favorite) {
                        if (favorite.likedUserID.equals(el._id)) {
                            el.isLiked = true;
                        }
                    });
                    newRes.push(el);
                });

                res.send({
                    success: true,
                    data: newRes
                });

            }, (err) => {
                res.send({
                    success: true,
                    data: result
                });
            });
          }
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

        let diffInSeconds = (Number(new Date()) - Number(user.lastVisit)) / 1000;

        if (diffInSeconds < 300) {
            user.status = true;
        } else {
            user.status = false;
        }

        Favorite.findOne({
            senderID: req.user._id,
            likedUserID: user._id
        }, function (err, result) {
            if (result) {
                user.isLiked = true;
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

                if (user.supplierLocation && !user.liveGPSEnabled) {
                    userLocation = {
                        lat: user.supplierLocation.location.lat,
                        lon: user.supplierLocation.location.lng
                    };
                }

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
        });
    }).catch((e) => {
        res.status(400).send();
    });
});

module.exports = router;