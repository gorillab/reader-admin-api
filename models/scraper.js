import Mongoose from 'mongoose';

const Schema = Mongoose.Schema;

const scraperSchema = new Mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  apiUrl: {
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
});

scraperSchema.method({
  securedInfo() {
    const { _id, name, apiUrl, frequency, source } = this;

    return {
      id: _id,
      name,
      apiUrl,
      frequency,
      source,
    };
  },
});


scraperSchema.statics = {
  list({ query, page, sort, limit, select }) {
    return this.find(query || {})
    .sort(sort || '-created.at')
    .select(select || '')
    .skip((limit || 0) * (page || 0))
    .limit(limit || 0)
    .exec();
  },
};

export default Mongoose.model('Scraper', scraperSchema);
