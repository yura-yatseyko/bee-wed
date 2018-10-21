var mongoose = require('mongoose');

var FavoriteSchema = new mongoose.Schema({
    senderID: {
        type: mongoose.Schema.Types.ObjectId,
    },
    likedUserID: {
        type: mongoose.Schema.Types.ObjectId,
    }
});

var Favorite = mongoose.model('Favorite', FavoriteSchema);

module.exports = {Favorite};