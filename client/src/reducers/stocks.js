import { RESET_STATE, ADD_STOCK_DATA } from '../actions/types';
export const initialState = {
  stockData: {}
};

const stocks = (state = initailState, action) => {
  const { type, payload } = action;
  switch (type) {
    case ADD_STOCK_DATA:
      return {
        ...state,
        stockData: { ...state.stockData, ...payload }
      };
    case RESET_STATE:
      return {
        ...state,
        ...initialState
      };
    default:
      return state;
  }
};

export default stocks;
