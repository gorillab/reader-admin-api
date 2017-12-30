const Mongoose = require('./../db/mongoose');
const { loadScraperJobs } = require('./../helpers/scraper-cron');

Mongoose.connection.on('connected', () => {
  loadScraperJobs();
});
