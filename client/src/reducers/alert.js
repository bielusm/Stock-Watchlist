import { ADD_ALERT, REMOVE_ALERT, RESET_STATE } from '../actions/types';

export const initialState = {
  alerts: []
};

const alert = (state = initialState, action) => {
  const { type, payload } = action;
  switch (type) {
    case ADD_ALERT:
      return { ...state, alerts: [...state.alerts, payload] };
    case REMOVE_ALERT:
      return {
        ...state,
        alerts: state.alerts.filter(alert => alert.id !== payload)
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

export default alert;
