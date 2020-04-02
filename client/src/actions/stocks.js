import axios from 'axios';
import { ADD_STOCK_DATA } from './types';

export const getStockStats = symbol => async (dispatch, getState) => {
  const res = await axios.get(`/api/stocks/${symbol}`, {
    headers: { 'x-auth-token': getState.token }
  });
  dispatch({ type: ADD_STOCK_DATA, payload: res.data });
};
