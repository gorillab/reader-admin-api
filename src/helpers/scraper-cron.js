const Fetch = require('node-fetch');
const { CronJob } = require('cron');

const Scraper = require('./../scraper.model.js');
const Post = require('./../post.model.js');
const URL = require('url');


const scraperJobs = new Map();

const addScraperJob = async ({ _id, frequency, url: scraperUrl, source }) => {
  const scraperId = _id.toString();
  if (scraperJobs.has(scraperId)) {
    scraperJobs.get(scraperId).stop();
    scraperJobs.delete(scraperId);
  }

  scraperJobs.set(scraperId, new CronJob(frequency, async () => { // eslint-disable-line

    const res = await Fetch(scraperUrl);
    const posts = await res.json();

    for (const { content, title = content, image, url } of posts) {
      if (title) {
        const postUrl = URL.parse(url) || {};
        const {
          hostname: host,
          pathname: path,
        } = postUrl;

        const post = await Post.findOne({
          isDeleted: false,
          host,
          path,
        });

        if (!post) {
          const newPost = new Post({
            title,
            content,
            image,
            url,
            host,
            path,
            source,
          });
          await newPost.createByUser();
        } else {
          post.created.at = new Date();
          await post.updateByUser();
        }
      }
    }
  }, null, true, 'Asia/Ho_Chi_Minh'));
};

const removeScraperJob = ({ _id }) => {
  const scraperId = _id.toString();
  if (scraperJobs.has(scraperId)) {
    scraperJobs.get(scraperId).stop();
    scraperJobs.delete(scraperId);
  }
};

const loadScraperJobs = async () => {
  const query = {
    isDeleted: false,
    isActive: true,
  };

  const scrapers = await Scraper.list({
    query,
  });

  scrapers.forEach((scraper) => {
    addScraperJob(scraper);
  });
};

module.exports = {
  addScraperJob,
  removeScraperJob,
  loadScraperJobs,
};
