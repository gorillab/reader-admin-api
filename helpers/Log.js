import Log from '../models/log';

const logging = ({ scraper, type, status }) => {
  const log = new Log({
    scraper,
    type,
    status,
  });
  log.createByUser();
};

export default logging;
