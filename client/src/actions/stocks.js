import { setAlert } from './alert';
import {
  ADD_MISC_STOCK,
  ADD_MAPPED_PLACEHOLDER,
  REMOVE_MAPPED_STOCK,
  MAPPED_STOCK_LOADING,
  MAPPED_STOCK_LOADED,
  ADD_MAPPED_STOCK,
} from './types';
import { sendRequest } from '../util/requests';

export const getStockStatsForAllStocks = (stocks) => async (
  dispatch,
  getState
) => {
  try {
    for (const key of Object.keys(stocks)) {
      const url = `/api/stocks/${stocks[key].symbol}`;
      const config = {
        method: 'get',
        headers: { 'x-auth-token': getState().user.token },
      };
      let res = await sendRequest(url, config);
      dispatch({ type: ADD_MAPPED_STOCK, payload: res.data });
    }
  } catch (error) {
    if (error.response) {
      error.response.data.errors.forEach((error) => {
        dispatch(setAlert(error.msg, 'danger'));
      });
    } else console.error(error);
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
  try {
    const url = `/api/stocks/${symbol}`;
    const config = {
      method: 'get',
      headers: { 'x-auth-token': getState().user.token },
    };
    let res = await sendRequest(url, config);
    if (misc) dispatch({ type: ADD_MISC_STOCK, payload: res.data });
    else dispatch({ type: ADD_MAPPED_STOCK, payload: res.data });
  } catch (error) {
    if (error.response) {
      error.response.data.errors.forEach((error) => {
        dispatch(setAlert(error.msg, 'danger'));
      });
    } else console.error(error);
  }
};
