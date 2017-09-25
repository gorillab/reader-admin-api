import { healthCheck, fetch } from '../helpers/Cron';

const load = () => {
  healthCheck();
  fetch();
};

export default load;
