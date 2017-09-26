import HttpStatus from 'http-status';

import APIError from '../helpers/APIError';
import Source from '../models/source';
import Scraper from '../models/scraper';
import Post from '../models/post';
import logging from '../helpers/Log';
import { addCronJob } from '../helpers/Cron';

const register = async (req, res, next) => {
  const args = req.swagger.params.body.value;
  // validate source
  try {
    req.source = await Source.get(args.source);
  } catch (err) {
    return next(err);
  }

  // validate scraper
  try {
    req.scraper = await Scraper.getOne({
      baseUrl: args.baseUrl,
    });

    if (req.scraper) {
      if (req.scraper.status === 'success') {
        throw new APIError('Scraper exists!', HttpStatus.CONFLICT, true);
      } else {
        // update
        await req.scraper.extend({
          name: args.name,
          baseUrl: args.baseUrl,
          version: args.version,
          frequency: args.frequency,
          source: req.source._id,
        }).updateByUser();
      }
    } else {
      // create one
      req.scraper = new Scraper({
        name: args.name,
        baseUrl: args.baseUrl,
        version: args.version,
        frequency: args.frequency,
        source: req.source._id,
      });

      await req.scraper.createByUser();
    }
  } catch (err) {
    return next(err);
  }

  addCronJob(req.scraper);

  // create log
  logging({
    scraper: req.scraper._id,
    type: 'register',
    status: 'success',
  });

  req.scraper = req.scraper.securedInfo();
  req.scraper.source = req.source._id;

  return res.json(req.scraper);
};

const upload = async (req, res, next) => {
  const baseUrl = req.headers['scraper-base-url'];
  const posts = req.swagger.params.body.value;

  try {
    req.scraper = await Scraper.getOne({
      baseUrl,
    });
    if (!req.scraper) {
      console.log('@scraper not exists');
      return true;
    }
  } catch (err) {
    return next(err);
  }

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
        source: req.scraper.source,
      });

      newPost.createByUser();
    }
  });

  // create log
  logging({
    scraper: req.scraper._id,
    type: 'responseData',
    status: 'success',
  });

  return res.json({
    message: 'Done',
  });
};

export {
  register,
  upload,
};
