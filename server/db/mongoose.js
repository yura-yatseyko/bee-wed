var mongoose = require('mongoose');

mongoose.Promise = global.Promise;

mongoose.set('useCreateIndex', true)
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });

run().then(() => console.log('done')).catch(error => console.error(error.stack));

async function run() {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });
}

module.exports = {mongoose};