const Mongoose = require('./db/mongoose.js');

const sourceSchema = new Mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  url: {
    type: String,
    required: true,
    trim: true,
  },
});

sourceSchema.method({
  securedInfo() {
    const { _id, title, url } = this;

    return {
      id: _id,
      title,
      url,
    };
  },
});

sourceSchema.statics = {
  getOne({ select = '', query = {}, populate = '' }) {
    return this.findOne(query)
    .select(select)
    .populate(populate);
  },
  list({ query = {}, skip = 0, sort = '-created.at', limit = 0, select = '', populate = '' }) {
    return this.find(query || {})
    .sort(sort)
    .select(select)
    .skip(skip)
    .limit(limit)
    .populate(populate);
  },
};

const initColl = () => {
  if (Mongoose.models.Source) {
    return Mongoose.model('Source');
  } else {
    return Mongoose.model('Source', sourceSchema);
  }
};

module.exports = initColl();
