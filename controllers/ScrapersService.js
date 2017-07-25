import rp from 'request-promise';
import { CronJob } from 'cron';

import Source from '../models/source';
import Scraper from '../models/scraper';
import Post from '../models/post';
import Log from '../models/log';

const scraperJobs = new Map();

// private functions
const logging = ({ scraper, type, status }) => {
  const log = new Log({
    scraper,
    type,
    status,
  });
  log.createByUser();
};
const addCronJob = ({ _id, frequency, apiUrl }) => {
  if (scraperJobs.has(_id.toString())) {
    scraperJobs.get(_id.toString()).stop();
    scraperJobs.delete(_id.toString());
  }

  scraperJobs.set(_id.toString(), new CronJob(frequency, async () => { // eslint-disable-line
    try {
      await rp(`${apiUrl}/fetch`);

      logging({
        scraper: _id,
        type: 'requestData',
        status: 'success',
      });
    } catch (err) {
      logging({
        scraper: _id,
        type: 'requestData',
        status: 'failed',
      });
    }
  }, null, true, 'America/Los_Angeles'));
};

// health check
(() => {
  setInterval(async () => {
    try {
      const query = {
        isDeleted: false,
      };

      const scrapers = await Scraper.list({
        query,
      });

      scrapers.forEach(async ({ apiUrl, _id }) => {
        try {
          await rp(`${apiUrl}/health`);

          logging({
            scraper: _id,
            type: 'healthCheck',
            status: 'success',
          });
        } catch (err) {
          logging({
            scraper: _id,
            type: 'healthCheck',
            status: 'failed',
          });
        }
      });
    } catch (err) {
      console.log(err);
    }
  }, 10000);
})();

// cronjob
(async () => {
  try {
    const query = {
      isDeleted: false,
    };

    const scrapers = await Scraper.list({
      query,
    });

    scrapers.forEach((scraper) => {
      addCronJob(scraper);
    });
  } catch (err) {
    console.log(err);
  }
})();

export const upload = ({ swagger }, res) => {
  const posts = swagger.params.body.value;

  posts.forEach(async ({ title, content, image, url, host, path }) => {
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
      });

      newPost.createByUser();
    }
  });

  // create log
  logging({
    scraper: '5964d01e5bb227eab0fb7945',
    type: 'responseData',
    status: 'success',
  });

  res.json({
    message: 'Done',
  });
};

export const register = async (req, res, next) => {
  const args = req.swagger.params.body.value;

  if (!args.source.id) {
    try {
      req.source = new Source({
        title: args.source.title,
        url: args.source.url,
      });

      await req.source.createByUser();
    } catch (err) {
      return next(err);
    }
  } else {
    try {
      req.source = await Source.get(args.source.id);
      await req.source.extend({
        title: args.source.title,
        url: args.source.url,
      }).updateByUser();
    } catch (err) {
      return next(err);
    }
  }

  // create scraper
  if (!args.id) {
    try {
      req.scraper = new Scraper({
        name: args.name,
        apiUrl: args.apiUrl,
        frequency: args.frequency,
        source: req.source._id,
      });

      await req.scraper.createByUser();
    } catch (err) {
      return next(err);
    }
  } else {
    try {
      req.scraper = await Scraper.get(args.id);
      await req.scraper.extend({
        name: args.name,
        apiUrl: args.apiUrl,
        frequency: args.frequency,
        source: req.source._id,
      }).updateByUser();
    } catch (err) {
      return next(err);
    }
  }

  addCronJob(req.scraper);

  // create log
  logging({
    scraper: req.scraper._id,
    type: 'register',
    status: 'success',
  });

  req.scraper = req.scraper.securedInfo();
  req.scraper.source = req.source.securedInfo();

  return res.json(req.scraper);
};
