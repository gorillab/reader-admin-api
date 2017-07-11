import Mongoose from 'mongoose';

const Schema = Mongoose.Schema;

const logSchema = new Mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
  },
  scraper: {
    type: Schema.ObjectId,
    ref: 'Scraper',
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['requestData', 'responseData', 'register', 'healthCheck'],
  },
  status: {
    type: String,
    required: true,
    enum: ['success', 'failed'],
  },
});

logSchema.statics = {
  list({ query, page, sort, limit, select }) {
    return this.find(query || {})
    .sort(sort || '-created.at')
    .select(select || '')
    .skip((limit || 0) * (page || 0))
    .limit(limit || 0)
    .exec();
  },
};

export default Mongoose.model('Log', logSchema);
