const Mongoose = require('./db/mongoose.js');

const Schema = Mongoose.Schema;

const scraperSchema = new Mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  frequency: {
    type: String,
    required: true,
    trim: true,
  },
  source: {
    type: Schema.ObjectId,
    ref: 'Source',
    required: true,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  url: {
    type: String,
    required: true,
    trim: true,
  },
});

scraperSchema.method({
  securedInfo() {
    const { _id, name, version, frequency, source, isActive, url } = this;

    return {
      id: _id,
      name,
      version,
      frequency,
      source,
      isActive,
      url,
    };
  },
});

scraperSchema.statics = {
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
  if (Mongoose.models.Scraper) {
    return Mongoose.model('Scraper');
  } else {
    return Mongoose.model('Scraper', scraperSchema);
  }
};

module.exports = initColl();
