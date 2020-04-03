import axios from 'axios';
import { sleep } from './sleep';

export const sendRequest = async (url, config, iteration = 0) => {
  try {
    const res = await axios(url, config);
    return res;
  } catch (error) {
    if (error.response.status === 429 && iteration < 1) {
      await sleep(60000);
      return await sendRequest(url, config, ++iteration);
    } else throw error;
  }
};
