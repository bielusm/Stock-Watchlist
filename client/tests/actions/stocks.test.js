import { getStockStats } from '../../src/actions/stocks';
import configureMockStore from 'redux-mock-store';
import ReduxThunk from 'redux-thunk';

const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
let mock = new MockAdapter(axios);

import { addAlert } from '../../src/actions/alert';
import { ibm } from '../fixtures/stats';
import { ADD_MISC_STOCK } from '../../src/actions/types';

const mockStore = configureMockStore([ReduxThunk]);

jest.mock('uuidv4', () => ({
  __esModule: true,
  uuid: jest.fn(() => 1),
}));

jest.mock('../../src/util/sleep.js', () => ({
  __esModule: true,
  sleep: jest.fn().mockResolvedValue(),
}));

let store;
beforeEach(() => {
  store = mockStore({ user: { token: '12345' } });
});

afterEach(() => {
  mock.reset();
});

describe('stock action tests', () => {
  describe('getStockStats', () => {
    test('returns correct data', async (done) => {
      mock.onGet().reply(200, ibm);
      store.dispatch(getStockStats('ibm')).then(() => {
        const actions = store.getActions();
        expect(actions).toEqual([{ type: ADD_MISC_STOCK, payload: ibm }]);
        done();
      });
    });
    test('works on too many requests', async (done) => {
      mock.onGet().reply(429, { errors: [{ msg: 'Too many api calls' }] });

      store.dispatch(getStockStats('ibm')).then(() => {
        const actions = store.getActions();
        const expected = [addAlert(1, 'Too many api calls', 'danger')];
        expect(actions).toEqual(expected);
        done();
      });
    });
  });
});
