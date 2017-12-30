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

try {
  Mongoose.connect(process.env.MONGO_URL);          // starting a db connection
} catch (err) {
  Mongoose.createConnection(process.env.MONGO_URL); // starting another db connection
}

module.exports = Mongoose;
