import Mongoose from 'mongoose';
import HttpStatus from 'http-status';
import APIError from '../helpers/APIError';

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
  async get(id) {
    const source = await this.findById(id).exec();

    return source || new APIError('No such source exists!', HttpStatus.NOT_FOUND, true);
  },
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
