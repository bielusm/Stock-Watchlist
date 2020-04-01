import { SET_TOKEN, RESET_STATE } from '../actions/types';

export const initialState = {
  token: null,
  authenticated: false
};

const user = (state = initialState, action) => {
  const { type, payload } = action;
  switch (type) {
    case SET_TOKEN:
      return {
        ...state,
        token: payload,
        authenticated: true
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

export default user;
