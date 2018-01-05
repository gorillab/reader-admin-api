const { NOT_FOUND, INTERNAL_SERVER_ERROR, OK } = require('http-status-codes');
const { json } = require('micro');

const arrayDiff = require('./helpers/array-diff');
const Source = require('./source.model');

const BLACK_LIST = ['isDeleted'];

const getList = async (req, res) => {
  const select = req.query.select
    ? arrayDiff(req.query.select.split(','), BLACK_LIST).join(' ')
    : 'name frequency isActive url';
  const limit = req.query.limit ? +req.query.limit : 25;
  const {
    page = 0,
    skip = page && page > 0 ? (page - 1) * limit : 0,
    search,
    sort = '-created.at',
  } = req.query;

  const query = {
    isDeleted: false,
  };

  if (search) {
    const q = `%${search}%`;
    query.$or = [{
      name: {
        $like: q,
      },
    }];
  }

  const populate = [];

  const sources = await Source.list({
    select,
    limit,
    skip,
    sort,
    query,
    populate,
  });

  res.send(OK, sources);
};

const getDetails = async (req, res) => {
  const { id: _id } = req.params;
  const query = {
    _id,
    isDeleted: false,
  };

  const source = await Source.getOne({
    query,
  });

  if (!source) {
    return res.send(NOT_FOUND, {
      code: NOT_FOUND,
      message: 'source not found',
    });
  }

  return res.send(OK, source);
};

const create = async (req, res) => {
  const { name, frequency, isActive, url } = await json(req);
  try {
    const source = new Source({
      name,
      frequency,
      isActive,
      url,
    });

    await source.createByUser(req.user);

    res.send(OK, source.securedInfo());
  } catch (err) {
    res.send(INTERNAL_SERVER_ERROR, {
      code: INTERNAL_SERVER_ERROR,
      message: 'Create source failed!',
    });
  }
};

const update = async (req, res) => {
  const { id: _id } = req.params;
  const { name, frequency, url, isActive } = await json(req);

  const source = await Source.findOne({
    _id,
    isDeleted: false,
  }).exec();

  if (!source) {
    return res.send(NOT_FOUND, {
      code: NOT_FOUND,
      message: 'source not found',
    });
  }

  try {
    await source.extend({
      name,
      frequency,
      isActive,
      url,
    }).updateByUser(req.user);
  } catch (err) {
    return res.send(INTERNAL_SERVER_ERROR, {
      code: INTERNAL_SERVER_ERROR,
      message: 'can not update source',
    });
  }

  return res.send(OK, source);
};

const remove = async (req, res) => {
  const { id: _id } = req.params;

  const source = await Source.findOne({
    _id,
    isDeleted: false,
  }).exec();

  if (!source) {
    return res.send(NOT_FOUND, {
      code: NOT_FOUND,
      message: 'source not found',
    });
  }

  try {
    await source.extend({
      isDeleted: true,
    }).updateByUser(req.user);
  } catch (err) {
    return res.send(INTERNAL_SERVER_ERROR, {
      code: INTERNAL_SERVER_ERROR,
      message: 'can not delete source',
    });
  }

  return res.send(OK, 'Ok');
};

module.exports = {
  getList,
  getDetails,
  create,
  update,
  remove,
};
