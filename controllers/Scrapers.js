import MiddelwaresWrapper from '../helpers/RouteMiddlewaresWrapper';
import * as Scrapers from './ScrapersService';
import scraperMockData from '../mock-data/scraper.json';


export const createPosts = process.env.NODE_ENV === 'mock' ? (req, res) => {
  res.json({
    message: 'Done',
  });
} : MiddelwaresWrapper(Scrapers.createPosts);

export const register = process.env.NODE_ENV === 'mock' ? (req, res) => {
  res.json(scraperMockData.item);
} : MiddelwaresWrapper(Scrapers.register);
