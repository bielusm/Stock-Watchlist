import {
  RESET_STATE,
  ADD_MISC_STOCK,
  ADD_MAPPED_PLACEHOLDER,
  ADD_MAPPED_STOCK,
  REMOVE_MAPPED_STOCK,
  MAPPED_STOCK_LOADING,
  MAPPED_STOCK_LOADED,
  SET_STOCK_VALUE,
} from '../actions/types';
export const initialState = {
  miscStocks: {},
  mappedStocks: {},
  mappedStocksLoading: false,
};
import { omit } from 'lodash';

const stocks = (state = initialState, action) => {
  const { type, payload } = action;
  switch (type) {
    case SET_STOCK_VALUE:
      const { symbol, currentValue } = payload;
      return {
        ...state,
        mappedStocks: {
          ...state.mappedStocks,
          [symbol]: { ...state.mappedStocks[symbol], currentValue },
        },
      };

    case MAPPED_STOCK_LOADING:
      return {
        ...state,
        mappedStocksLoading: true,
      };

    case MAPPED_STOCK_LOADED:
      return {
        ...state,
        mappedStocksLoading: false,
      };

    case ADD_MAPPED_PLACEHOLDER:
      const newObj = {};
      newObj[payload] = { symbol: payload, loading: true };
      return {
        ...state,
        mappedStocks: { ...state.mappedStocks, ...newObj },
      };

    case ADD_MAPPED_STOCK:
      const key = payload.symbol;
      return {
        ...state,
        mappedStocks: {
          ...state.mappedStocks,
          ...{ [payload.symbol]: payload },
        },
      };

    case REMOVE_MAPPED_STOCK:
      return {
        ...state,
        mappedStocks: omit(state.mappedStocks, payload),
      };

    case ADD_MISC_STOCK:
      return {
        ...state,
        miscStocks: { ...state.miscStocks, ...{ [payload.symbol]: payload } },
      };
    case RESET_STATE:
      return {
        ...state,
        ...initialState,
      };
    default:
      return state;
  }
};

export default stocks;
