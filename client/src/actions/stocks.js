import { setAlert } from './alert';
import { ADD_STOCK_DATA } from './types';
import { sendRequest } from '../util/requests';

export const getStockStats = symbol => async (dispatch, getState) => {
  try {
    const url = `/api/stocks/${symbol}`;
    const config = {
      method: 'get',
      headers: { 'x-auth-token': getState.token }
    };
    let res = await sendRequest(url, config);
    dispatch({ type: ADD_STOCK_DATA, payload: res.data });
  } catch (error) {
    if (error.response) {
      error.response.data.errors.forEach(error => {
        dispatch(setAlert(error.msg, 'danger'));
      });
    } else console.error(error);
  }
};
