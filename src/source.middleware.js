const Joi = require('joi');
const Validation = require('micro-joi');

const validate = Validation(Joi.object({
  title: Joi.string().required(),
  frequency: Joi.string().required(),
  url: Joi.string().required(),
  isActive: Joi.boolean().required(),
}));

module.exports = {
  validate,
};
