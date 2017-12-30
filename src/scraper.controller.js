const { NOT_FOUND, INTERNAL_SERVER_ERROR, OK } = require('http-status-codes');
const { json } = require('micro');

const arrayDiff = require('./helpers/array-diff');
const Scraper = require('./scraper.model');
const { addScraperJob, removeScraperJob } = require('./helpers/scraper-cron');

const BLACK_LIST = ['isDeleted'];

const getList = async (req, res) => {
  const select = req.query.select
    ? arrayDiff(req.query.select.split(','), BLACK_LIST).join(' ')
    : 'name frequency source isActive url';
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

  const scrapers = await Scraper.list({
    select,
    limit,
    skip,
    sort,
    query,
    populate,
  });

  res.send(OK, scrapers);
};

const getDetails = async (req, res) => {
  const { id: _id } = req.params;

  const scraper = await Scraper.getOne({
    _id,
    isDeleted: false,
  });

  if (!scraper) {
    return res.send(NOT_FOUND, {
      code: NOT_FOUND,
      message: 'scraper not found',
    });
  }

  return res.send(OK, scraper);
};

const create = async (req, res) => {
  const { name, frequency, source, isActive, url } = await json(req);
  try {
    const scraper = new Scraper({
      name,
      frequency,
      source,
      isActive,
      url,
    });

    await scraper.createByUser(req.user);

    if (isActive) {
      addScraperJob(scraper);
    }

    res.send(OK, scraper.securedInfo());
  } catch (err) {
    res.send(INTERNAL_SERVER_ERROR, {
      code: INTERNAL_SERVER_ERROR,
      message: 'Create scraper failed!',
    });
  }
};

const update = async (req, res) => {
  const { id: _id } = req.params;
  const { name, frequency, url, isActive } = await json(req);

  const scraper = await Scraper.findOne({
    _id,
    isDeleted: false,
  }).exec();

  if (!scraper) {
    return res.send(NOT_FOUND, {
      code: NOT_FOUND,
      message: 'scraper not found',
    });
  }

  if (!scraper.isActive && isActive) {
    removeScraperJob(scraper);
  } else if (isActive) {
    addScraperJob(scraper);
  }

  try {
    await scraper.extend({
      name,
      frequency,
      isActive,
      url,
    }).updateByUser(req.user);
  } catch (err) {
    return res.send(INTERNAL_SERVER_ERROR, {
      code: INTERNAL_SERVER_ERROR,
      message: 'can not update scraper',
    });
  }

  return res.send(OK, scraper);
};

const remove = async (req, res) => {
  const { id: _id } = req.params;

  const scraper = await Scraper.findOne({
    _id,
    isDeleted: false,
  }).exec();

  if (!scraper) {
    return res.send(NOT_FOUND, {
      code: NOT_FOUND,
      message: 'scraper not found',
    });
  }

  if (scraper.isActive) {
    removeScraperJob(scraper);
  }

  try {
    await scraper.extend({
      isDeleted: true,
    }).updateByUser(req.user);
  } catch (err) {
    return res.send(INTERNAL_SERVER_ERROR, {
      code: INTERNAL_SERVER_ERROR,
      message: 'can not delete source',
    });
  }

  return res.send(OK, scraper);
};

module.exports = {
  getList,
  getDetails,
  create,
  update,
  remove,
};
