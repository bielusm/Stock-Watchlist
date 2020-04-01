import { uuid } from 'uuidv4';
import { ADD_ALERT, REMOVE_ALERT } from '../actions/types';

export const addAlert = (id, message, color) => {
  return { type: ADD_ALERT, payload: { id, message, color } };
};

export const removeAlert = id => {
  return { type: REMOVE_ALERT, payload: id };
};

export const setAlert = (message, color) => async dispatch => {
  const id = uuid();
  dispatch(addAlert(id, message, color));

  setTimeout(() => {
    dispatch(removeAlert(id));
  }, 5000);
};
