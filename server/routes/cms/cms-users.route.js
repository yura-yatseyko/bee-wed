const express = require('express');
var bodyParser = require('body-parser');
const lodash = require('lodash');
var async = require("async");
var mongoXlsx = require('mongo-xlsx');

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
    var queryResultCount = 0;

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

    try {
        let users = await User.find(query).exec();
        queryResultCount = users.length;
    } catch (err) {
        console.log(err);
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
                queryResultCount: queryResultCount,
                users: modifiedUsers
            }
        });
    }).catch((e) => {
        res.status(400).send();
    });
});

router.get('/cms/users/toexel', authenticate, (req, res) => {
    var conf ={};
    conf.stylesXmlFile = "styles.xml";
    conf.name = "mysheet";
    conf.cols = [{
        caption:'string',
        type:'string',
        beforeCellWrite:function(row, cellData){
             return cellData.toUpperCase();
        },
        width:28.7109375
    },{
        caption:'date',
        type:'date',
        beforeCellWrite:function(){
            var originDate = new Date(Date.UTC(1899,11,30));
            return function(row, cellData, eOpt){
                if (eOpt.rowNum%2){
                    eOpt.styleIndex = 1;
                }  
                else{
                    eOpt.styleIndex = 2;
                }
                if (cellData === null){
                  eOpt.cellType = 'string';
                  return 'N/A';
                } else
                  return (cellData - originDate) / (24 * 60 * 60 * 1000);
            } 
        }()
    },{
        caption:'bool',
        type:'bool'
    },{
        caption:'number',
        type:'number'               
    }];
    conf.rows = [
        ['pi', new Date(Date.UTC(2013, 4, 1)), true, 3.14],
        ["e", new Date(2012, 4, 1), false, 2.7182],
        ["M&M<>'", new Date(Date.UTC(2013, 6, 9)), false, 1.61803],
        ["null date", null, true, 1.414]  
    ];
    var result = nodeExcel.execute(conf);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats');
    res.setHeader("Content-Disposition", "attachment; filename=" + "Report.xlsx");
    res.end(result, 'binary');
});

router.get('/cms/users/subscribed', authenticate, async (req, res) => {
    var body = lodash.pick(req.query, ['searchText',  'page']);

    let page = Number(body.page) - Number(1);

    var count = 0;
    var queryResultCount = 0;

    var query = {
        kind: "BrideGroomUser",
        isSubscribedToNewsletter: true,
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


        try {
            let users = await User.find(query).exec();
            queryResultCount = users.length;
        } catch (err) {
            console.log(err);
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
                    queryResultCount: queryResultCount,
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

router.get('/cms/users/supplier', authenticate, async (req, res) => {
    var body = lodash.pick(req.query, ['searchText', 'supplierType', 'page']);

    let page = Number(body.page) - Number(1);

    var count = 0;
    var queryResultCount = 0;

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

        try {
            let users = await User.find(query).exec();
            queryResultCount = users.length;
        } catch (err) {
            console.log(err);
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
                    queryResultCount: queryResultCount,
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