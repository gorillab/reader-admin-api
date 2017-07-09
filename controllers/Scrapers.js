import MiddelwaresWrapper from '../helpers/RouteMiddlewaresWrapper';
import * as Scrapers from './ScrapersService';


export const upload = MiddelwaresWrapper(Scrapers.upload);

export const register = MiddelwaresWrapper(Scrapers.register);
