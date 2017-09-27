import Fetch from 'node-fetch';
import { CronJob } from 'cron';
import logging from './Log';

import Scraper from '../models/scraper';

const scraperJobs = new Map();

const addCronJob = ({ _id, frequency, baseUrl, version }) => {
  const scraperId = _id.toString();
  if (scraperJobs.has(scraperId)) {
    scraperJobs.get(scraperId).stop();
    scraperJobs.delete(scraperId);
  }

  scraperJobs.set(scraperId, new CronJob(frequency, async () => { // eslint-disable-line
    try {
      await Fetch(`${baseUrl}/${version}/fetch`);

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

const removeCronJob = ({ _id }) => {
  const scraperId = _id.toString();
  if (scraperJobs.has(scraperId)) {
    scraperJobs.get(scraperId).stop();
    scraperJobs.delete(scraperId);
  }
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
          await Fetch(`${scraper.baseUrl}/health`);
          record.status = 'success';
        } catch (err) {
          // eslint-disable-next-line no-console
          console.log(err);
          // remove cron
          removeCronJob(scraper);
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
