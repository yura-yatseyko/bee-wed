var mongoose = require('mongoose');

mongoose.Promise = global.Promise;

mongoose.set('useCreateIndex', true)
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/BeeWedApp', { useNewUrlParser: true });

module.exports = {mongoose};