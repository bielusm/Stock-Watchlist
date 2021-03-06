import axios from 'axios';
import { sleep } from './sleep';

export const sendRequest = async (url, config, iteration = 0) => {
  try {
    const res = await axios(url, config);
    return res;
  } catch (error) {
    if (error.response) {
      if (error.response.status === 429 && iteration < 3) {
        await sleep(60000);
        return await sendRequest(url, config, ++iteration);
      }
    }
    throw error;
  }
};
