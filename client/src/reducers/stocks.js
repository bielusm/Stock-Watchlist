import {
  RESET_STATE,
  ADD_MISC_STOCK,
  ADD_MAPPED_PLACEHOLDER,
  ADD_MAPPED_STOCK,
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
        ...state,
        mappedStocks: { ...state.mappedStocks, ...newObj },
      };
    }

    case ADD_MAPPED_STOCK:
      return {
        ...state,
        mappedStocks: { ...state.mappedStocks, ...payload },
      };

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
