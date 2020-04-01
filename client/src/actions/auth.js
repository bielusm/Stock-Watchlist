import axios from 'axios';
import { setAlert } from './alert';
import { SET_TOKEN, RESET_STATE } from './types';

export const setToken = token => ({ type: SET_TOKEN, payload: token });

export const logout = () => dispatch => {
  dispatch({ type: RESET_STATE });
  window.localStorage.removeItem('token');
};

export const login = data => async dispatch => {
  try {
    const body = JSON.stringify(data);
    const config = { headers: { 'content-type': 'application/json' } };
    const res = await axios.post('/api/users/login', body, config);
    window.localStorage.setItem('token', res.data.token);
    dispatch(setToken(res.data.token));
  } catch (error) {
    if (error.response) {
      error.response.data.errors.forEach(error => {
        dispatch(setAlert(error.msg, 'danger'));
      });
    } else console.error(error);
  }
};

export const register = data => async dispatch => {
  try {
    const body = JSON.stringify(data);
    const config = { headers: { 'content-type': 'application/json' } };
    const res = await axios.post('/api/users', body, config);
    window.localStorage.setItem('token', res.data.token);
    dispatch(setToken(res.data.token));
  } catch (error) {
    if (error.response) {
      error.response.data.errors.forEach(error => {
        dispatch(setAlert(error.msg, 'danger'));
      });
    } else console.error(error);
  }
};
