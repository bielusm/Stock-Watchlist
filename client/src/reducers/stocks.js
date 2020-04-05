import { RESET_STATE, ADD_MISC_STOCK } from '../actions/types';
export const initialState = {
  miscStocks: {},
};

const stocks = (state = initialState, action) => {
  const { type, payload } = action;
  switch (type) {
    case ADD_MISC_STOCK:
      return {
        ...state,
        miscStocks: { ...state.stockData, ...payload },
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
