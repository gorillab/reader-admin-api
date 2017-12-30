const Mongoose = require('./db/mongoose.js');

const Schema = Mongoose.Schema;

const postSchema = new Mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    trim: true,
  },
  image: {
    type: String,
    trim: true,
  },
  url: {
    type: String,
    trim: true,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  source: {
    type: Schema.ObjectId,
    ref: 'Source',
  },
  meta: {
    numViewed: {
      type: Number,
      min: 0,
      default: 0,
    },
    numSaved: {
      type: Number,
      min: 0,
      default: 0,
    },
    numShared: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  host: {
    type: String,
    trim: true,
    required: true,
  },
  path: {
    type: String,
    trim: true,
    required: true,
  },
});

postSchema.method({
  securedInfo() {
    const { _id, title, content, image, url, source, meta } = this;

    return {
      id: _id,
      title,
      content,
      image,
      url,
      source,
      meta,
    };
  },
});

postSchema.statics = {
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
  if (Mongoose.models.Post) {
    return Mongoose.model('Post');
  } else {
    return Mongoose.model('Post', postSchema);
  }
};

module.exports = initColl();
