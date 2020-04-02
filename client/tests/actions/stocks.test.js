import { getStockStats } from '../../src/actions/stocks';
import configureMockStore from 'redux-mock-store';
import ReduxThunk from 'redux-thunk';
import moxios from 'moxios';
import { ibm } from '../fixtures/stats';
import { ADD_STOCK_DATA } from '../../src/actions/types';
const mockStore = configureMockStore([ReduxThunk]);

let store;
beforeEach(() => {
  store = mockStore({ stockData: {} });
  moxios.install();
});

afterEach(() => {
  moxios.uninstall();
});

describe('stock action tests', () => {
  describe('getStockStats', () => {
    test('returns correct data', async done => {
      moxios.stubRequest('/api/stocks/ibm', { response: ibm });
      store.dispatch(getStockStats('ibm')).then(() => {
        const actions = store.getActions();
        expect(actions).toEqual([{ type: ADD_STOCK_DATA, payload: ibm }]);
        done();
      });
    });
  });
});
