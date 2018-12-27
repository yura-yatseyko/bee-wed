const express = require('express');
var bodyParser = require('body-parser');
const lodash = require('lodash');
var async = require("async");

const LIMIT = Number(10);

const {ObjectID} = require('mongodb');

const {User} = require('../../models/user.model');
const {HubAd} = require('../../models/hub-ad.model');
const {Message} = require('../../models/message.model');
const {Favorite} = require('../../models/favorite.model');
const {Payment} = require('../../models/payment.model');
const {SupplierType} = require('../../models/supplier-type.model');

var {authenticate} = require('../../middleware/admin-authenticate');

const router = express.Router();

router.use(bodyParser.json());

router.get('/cms/users/bridegroom', authenticate, async (req, res) => {
    var body = lodash.pick(req.query, ['searchText', 'page']);

    let page = Number(body.page) - Number(1);

    var count = 0;

    var query = {
        kind: "BrideGroomUser"
    }

    try {
        let users = await User.find(query).exec();
        count = users.length;
    } catch (err) {
        console.log(err);
    }

    if (body.searchText != undefined) {
        if (body.searchText.length > 0) {
            query.name = { $regex: body.searchText }
        }
    }

    User.find(query).skip(page * LIMIT).limit(LIMIT).then((users) => {
        var modifiedUsers = [];
        users.forEach(function(user) {
            let newUser = {
                _id: user._id,
                email: user.email,
                name: user.name,
                registerDate: user._id.getTimestamp().getTime(),
                weddingDate: user.weddingDate,
                weddingVenue: user.weddingVenue
            }

            modifiedUsers.push(newUser);
        });
        res.status(200).send({
            success: true,
            data: {
                amount: count,
                users: modifiedUsers
            }
        });
    }).catch((e) => {
        res.status(400).send();
    });
});

router.get('/cms/users/supplier', authenticate, async (req, res) => {
    var body = lodash.pick(req.query, ['searchText', 'supplierType', 'page']);

    let page = Number(body.page) - Number(1);

    var count = 0;

    var query = {
        kind: "SupplierUser"
    }

    try {
        let users = await User.find(query).exec();
        count = users.length;
    } catch (err) {
        console.log(err);
    }

    try {
        if (body.searchText != undefined) {
            if (body.searchText.length > 0) {
                query.name = { $regex: body.searchText }
            }
        }

        if (body.supplierType != undefined) {
            let supplierType = await SupplierType.findOne({
                _id : new ObjectID(body.supplierType)
            }).exec();

            query.supplierType = supplierType
        }

        User.find(query).skip(page * LIMIT).limit(LIMIT).then((users) => {
            var modifiedUsers = [];
            users.forEach(function(user) {
                let newUser = {
                    _id: user._id,
                    email: user.email,
                    name: user.name,
                    registerDate: user._id.getTimestamp().getTime(),
                    supplierType: user.supplierType,
                    phone: user.phone,
                    websiteURL: user.websiteURL,
                }
    
                modifiedUsers.push(newUser);
            });
            res.status(200).send({
                success: true,
                data: {
                    amount: count,
                    users: modifiedUsers
                }
            });
        }).catch((e) => {
            res.status(400).send();
        });

    } catch (er) {
        res.status(400).send();
    }
});

router.delete('/cms/users', authenticate, async (req, res) => {
    try {
        await User.deleteOne({
            _id: new ObjectID(req.body._id)
        }).exec();

        await HubAd.deleteMany({
            _creator: new ObjectID(req.body._id)
        }).exec();

        await Message.deleteMany({
            $or: [
                {
                    sender: new ObjectID(req.body._id),
                },
                {
                    receiver: new ObjectID(req.body._id)
                }
            ]
        }).exec();

        await Favorite.deleteMany({
            $or: [
                {
                    senderID: new ObjectID(req.body._id),
                },
                {
                    likedUserID: new ObjectID(req.body._id)
                }
            ]
        }).exec();

        await Payment.deleteMany({
            _creator: new ObjectID(req.body._id)
        }).exec();

        res.status(200).send({
            success: true,
            data: {
            }
        });
    } catch (err) {
        res.status(400).send(err);
    }
});

module.exports = router;