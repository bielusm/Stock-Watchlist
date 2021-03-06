import { setAlert } from './alert';
import {
  ADD_MISC_STOCK,
  ADD_MAPPED_PLACEHOLDER,
  REMOVE_MAPPED_STOCK,
  MAPPED_STOCK_LOADING,
  MAPPED_STOCK_LOADED,
  ADD_MAPPED_STOCK,
  SET_STOCK_VALUE,
} from './types';
import { sendRequest } from '../util/requests';

export const refreshCurrentForWatchlist = (watchlist) => async (dispatch) => {
  for (const key of Object.keys(watchlist)) {
    let symbol = watchlist[key].symbol;
    await dispatch(getCurrentValue(symbol));
  }
};

const getCurrentValue = (symbol) => async (dispatch, getState) => {
  try {
    const url = `/api/stocks/${symbol}/curr`;
    const config = {
      method: 'get',
      headers: { 'x-auth-token': getState().user.token },
    };
    const currentValue = (await sendRequest(url, config)).data.currentValue;
    dispatch({ type: SET_STOCK_VALUE, payload: { symbol, currentValue } });
  } catch (error) {
    if (error.response) {
      error.response.data.errors.forEach((error) => {
        dispatch(setAlert(error.msg, 'danger'));
      });
    } else console.error(error);
  }
};

export const getStockStatsForAllStocks = (stocks) => async (dispatch) => {
  for (const key of Object.keys(stocks)) {
    let symbol = stocks[key].symbol;
    await dispatch(getStockStats(symbol, false));
  }
};

export const getWatchlist = () => async (dispatch, getState) => {
  dispatch({ type: MAPPED_STOCK_LOADING });
  try {
    const url = `/api/watchlist`;
    const config = {
      method: 'get',
      headers: { 'x-auth-token': getState().user.token },
    };
    let res = await sendRequest(url, config);
    res.data.forEach((symbol) => {
      dispatch({ type: ADD_MAPPED_PLACEHOLDER, payload: symbol });
    });
    dispatch({ type: MAPPED_STOCK_LOADED });
  } catch (error) {
    if (error.response) {
      error.response.data.errors.forEach((error) => {
        dispatch(setAlert(error.msg, 'danger'));
      });
    } else console.error(error);
  }
};

export const deleteFromWatchlist = (symbol) => async (dispatch, getState) => {
  try {
    const url = `/api/watchlist/${symbol}`;
    const config = {
      method: 'delete',
      headers: { 'x-auth-token': getState().user.token },
    };
    let res = await sendRequest(url, config);
    dispatch({ type: REMOVE_MAPPED_STOCK, payload: symbol });
  } catch (error) {
    if (error.response) {
      error.response.data.errors.forEach((error) => {
        dispatch(setAlert(error.msg, 'danger'));
      });
    } else console.error(error);
  }
};

export const addToWatchlist = (symbol) => async (dispatch, getState) => {
  try {
    const url = `/api/watchlist`;
    const config = {
      method: 'post',
      headers: { 'x-auth-token': getState().user.token },
      data: { symbol },
    };
    let res = await sendRequest(url, config);
    dispatch({ type: ADD_MAPPED_PLACEHOLDER, payload: symbol });
  } catch (error) {
    if (error.response) {
      error.response.data.errors.forEach((error) => {
        dispatch(setAlert(error.msg, 'danger'));
      });
    } else console.error(error);
  }
};

export const getStockStats = (symbol, misc = true) => async (
  dispatch,
  getState
) => {
  const action = misc ? ADD_MISC_STOCK : ADD_MAPPED_STOCK;
  try {
    let url = `/api/stocks/${symbol}/stats`;
    const config = {
      method: 'get',
      headers: { 'x-auth-token': getState().user.token },
    };
    let res = await sendRequest(url, config);
    url = `/api/stocks/${symbol}/curr`;
    const currentValue = (await sendRequest(url, config)).data.currentValue;
    dispatch({ type: action, payload: { ...res.data, currentValue } });
  } catch (error) {
    if (error.response) {
      error.response.data.errors.forEach((error) => {
        if (error.msg === `Invalid API call, possibly wrong symbol ${symbol}`)
          dispatch({ type: action, payload: { symbol, invalid: true } });
        dispatch(setAlert(error.msg, 'danger'));
      });
    } else console.error(error);
  }
};
