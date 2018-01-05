require('dotenv').config();

const { NOT_FOUND } = require('http-status-codes');

const { router, get, post, put, del } = require('./helpers/custom-microrouter');

const sourceController = require('./source.controller');
const sourceMiddleware = require('./source.middleware');

const error404 = (req, res) => {
  res.send(NOT_FOUND, {
    code: NOT_FOUND,
    message: 'Not found',
  });
};

module.exports = router(
  get('/sources', sourceController.getList),
  post('/sources', sourceMiddleware.validate(sourceController.create)),
  get('/sources/:id', sourceController.getDetails),
  put('/sources/:id', sourceMiddleware.validate(sourceController.update)),
  del('/sources/:id', sourceController.remove),

  // not found
  get('/*', error404),
);
