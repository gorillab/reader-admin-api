import Fetch from 'node-fetch';
import { CronJob } from 'cron';
import logging from './Log';

import Scraper from '../models/scraper';

const scraperJobs = new Map();

const addCronJob = ({ _id, frequency, apiUrl }) => {
  if (scraperJobs.has(_id.toString())) {
    scraperJobs.get(_id.toString()).stop();
    scraperJobs.delete(_id.toString());
  }

  scraperJobs.set(_id.toString(), new CronJob(frequency, async () => { // eslint-disable-line
    try {
      await Fetch(`${apiUrl}/fetch`);

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

// health cron
const healthCheck = () => {
  setInterval(async () => {
    try {
      const query = {
        isDeleted: false,
      };

      const scrapers = await Scraper.list({
        query,
      });

      scrapers.forEach(async (scraper) => {
        const record = {
          scraper: scraper._id,
          type: 'healthCheck',
          status: 'failed',
        };
        try {
          await Fetch(`${scraper.apiUrl}/health`);
        } catch (err) {
          console.log(err);
        }
        logging(record);

        scraper.extend({
          status: record.status,
        }).updateByUser();
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err);
    }
  }, 60 * 1000);
};

// fetch cron
const fetch = async () => {
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
    // eslint-disable-next-line no-console
    console.log(err);
  }
};

export {
  addCronJob,
  healthCheck,
  fetch,
};
