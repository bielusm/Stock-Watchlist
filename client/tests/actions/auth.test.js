import configureMockStore from 'redux-mock-store';
import ReduxThunk from 'redux-thunk';
import { logout } from '../../src/actions/auth';
import { RESET_STATE } from '../../src/actions/types';

const mockStore = configureMockStore([ReduxThunk]);
let store;
beforeEach(() => {
  store = mockStore();
});

describe('Auth action tests', () => {
  describe('logout tests', () => {
    it('should dispatch RESET_STATE and clear token', () => {
      expect(window.localStorage.setItem('token', '123456'));
      store.dispatch(logout());
      const actions = store.getActions();
      const expected = [{ type: RESET_STATE }];
      expect(actions).toEqual(expected);
      expect(window.localStorage.getItem('token')).toEqual(null);
    });
  });
});
