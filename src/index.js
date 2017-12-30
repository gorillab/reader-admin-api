require('dotenv').config();

const { NOT_FOUND } = require('http-status-codes');

const { router, get, post, put, del } = require('./helpers/custom-microrouter');

const scraperController = require('./scraper.controller');
const scraperMiddleware = require('./scraper.middleware');

const sourceController = require('./source.controller');
const sourceMiddleware = require('./source.middleware');

// run bin
require('./bin');

const error404 = (req, res) => {
  res.send(NOT_FOUND, {
    code: NOT_FOUND,
    message: 'Not found',
  });
};

module.exports = router(
  // source
  get('/sources', sourceController.getList),
  post('/sources', scraperMiddleware.validate(sourceController.create)),
  get('/sources/:id', sourceController.getDetails),
  put('/sources/:id', sourceMiddleware.validate(sourceController.update)),
  del('/sources/:id', sourceController.remove),

  // scraper
  get('/scrapers', scraperController.getList),
  post('/scrapers', scraperMiddleware.validate(scraperController.create)),
  get('/scrapers/:id', scraperController.getDetails),
  put('/scrapers/:id', scraperMiddleware.validate(scraperController.update)),
  del('/scrapers/:id', scraperController.remove),

  // not found
  get('/*', error404),
);
