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
  baseUrl: {
    type: String,
    required: true,
    trim: true,
  },
  version: {
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
  status: {
    type: String,
    required: true,
    default: 'failed',
    enum: ['success', 'failed'],
  },
});

scraperSchema.method({
  securedInfo() {
    const { _id, name, baseUrl, version, frequency, source, status } = this;

    return {
      id: _id,
      name,
      baseUrl,
      version,
      frequency,
      source,
      status,
    };
  },
});


scraperSchema.statics = {
  async get(id) {
    const scraper = await this.findById(id).exec();
    if (!scraper) {
      throw new APIError('No such scraper exists!', HttpStatus.NOT_FOUND, true);
    }
    return scraper;
  },
  getOne(query) {
    return this.findOne(query).exec();
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
