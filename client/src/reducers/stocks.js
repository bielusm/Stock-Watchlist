import {
  RESET_STATE,
  ADD_MISC_STOCK,
  ADD_MAPPED_PLACEHOLDER,
} from '../actions/types';
export const initialState = {
  miscStocks: {},
  mappedStocks: {},
};

const stocks = (state = initialState, action) => {
  const { type, payload } = action;
  switch (type) {
    case ADD_MAPPED_PLACEHOLDER: {
      const newObj = {};
      newObj[payload] = { loading: true };
      return {
        mappedStocks: { ...state.mappedStocks, ...newObj },
      };
    }

    case ADD_MISC_STOCK:
      return {
        ...state,
        miscStocks: { ...state.miscStocks, ...payload },
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
