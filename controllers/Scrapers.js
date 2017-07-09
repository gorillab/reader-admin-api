import MiddelwaresWrapper from '../helpers/RouteMiddlewaresWrapper';
import * as Scrapers from './ScrapersService';


export const createPosts = MiddelwaresWrapper(Scrapers.createPosts);

export const register = MiddelwaresWrapper(Scrapers.register);
