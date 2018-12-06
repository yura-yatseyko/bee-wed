const express = require('express');
const bodyParser = require('body-parser');
const queryString = require('query-string');
var geodist = require('geodist')

var {ObjectID} = require('mongodb');
var {authenticate} = require('../middleware/authenticate');
const {Favorite} = require('../models/favorite.model');
const {User} = require('../models/user.model');

const router = express.Router();
router.use(bodyParser.json());

router.post('/favorites', authenticate, (req, res) => {    
    var favorite = new Favorite();

    favorite.senderID = req.user._id;
    favorite.likedUserID = new ObjectID(req.body.userID);
    
    favorite.save().then((doc) => {
        res.send({
            success: true,
            data: doc
        });
    }, (err) => {
        res.status(400).send(err);
    });
});

router.delete('/favorites', authenticate, (req, res) => {
    Favorite.remove({
        senderID: req.user._id,
        likedUserID: new ObjectID(req.body.userID)
    }, function(err) {
        if (err) {
            res.status(400).send(err);
        } else {
            res.send({
                success: true,
                data: {}
            });
        }
    });
});

router.get('/favorites', authenticate, (req, res) => {

    var userLat = null;
    var userLon = null;

    if (req.query.userLat && req.query.userLng) {
        userLat = req.query.userLat;
        userLon = req.query.userLng;
    }

    Favorite.find({
        senderID: req.user._id
    }).then((favorites) => {

        if (favorites.length == 0) {
            res.send({
                success: true,
                data: []
            });
        } else {
            var favoritesUsers = [];
            var i = 0;

            favorites.forEach(function(favorite) {
                User.findOne({
                    '_id': favorite.likedUserID
                }, function (err, result) {
                    if (result) {

                        let diffInSeconds = (Number(new Date()) - Number(result.lastVisit)) / 1000;

                        if (diffInSeconds < 300) {
                            result.status = true;
                        } else {
                            result.status = false;
                        }

                        if (userLat, userLon) {
                            var supplierLocation = {
                                lat: result.currentLocation.lat,
                                lon: result.currentLocation.lng
                            };

                            var location = { 
                                lat: userLat,
                                lon: userLon
                            };
            
                            var dist = geodist(location, supplierLocation, {exact: true, unit: 'km'}) 
                            result.dist = dist;
                        }
                        result.isLiked = true;
                        favoritesUsers.push(result);
                    }

                    i++;

                    if (i == favorites.length) {
                        favoritesUsers.sort(function (a, b) {
                            return a.dist > b.dist;
                        });

                        res.send({
                            success: true,
                            data: favoritesUsers
                        });
                    }
                });
            });
        }
    }, (err) => {
        res.status(400).send(err);
    });
});


module.exports = router;