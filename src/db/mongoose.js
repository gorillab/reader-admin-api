const Mongoose = require('mongoose');

const mongooseDefaultFields = require('./../helpers/mongo/mongoose-default-fields');
const mongooseDefaultIndexes = require('./../helpers/mongo/mongoose-default-indexes');
const mongooseDocExtend = require('./../helpers/mongo/mongoose-doc-extend');
const mongooseDocMethodsOverride = require('./../helpers/mongo/mongoose-doc-methods-override');

Mongoose.Promise = global.Promise;
Mongoose.plugin(mongooseDefaultFields);
Mongoose.plugin(mongooseDefaultIndexes);
Mongoose.plugin(mongooseDocExtend);
Mongoose.plugin(mongooseDocMethodsOverride);

const options = {
  server: {
    auto_reconnect: true,
    socketOptions: {
      keepAlive: 1,
    },
  },
};

try {
  Mongoose.connect(process.env.MONGO_URL, options);          // starting a db connection
} catch (err) {
  Mongoose.createConnection(process.env.MONGO_URL, options); // starting another db connection
}

module.exports = Mongoose;
