import {
  getStockStats,
  addToWatchlist,
  deleteFromWatchList,
} from '../../src/actions/stocks';
import configureMockStore from 'redux-mock-store';
import ReduxThunk from 'redux-thunk';

const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
let mock = new MockAdapter(axios);

import { addAlert } from '../../src/actions/alert';
import { ibm } from '../fixtures/stats';
import {
  ADD_MISC_STOCK,
  ADD_MAPPED_PLACEHOLDER,
  REMOVE_MAPPED_STOCK,
} from '../../src/actions/types';

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
  describe('all actions', () => {
    test('should pass error to alert', async (done) => {
      mock.onAny().reply(400, { errors: [{ msg: 'Server Error' }] });
      const functions = [
        () => getStockStats('ibm'),
        () => addToWatchlist('ibm'),
        () => deleteFromWatchList('ibm'),
      ];
      for (const func of functions) {
        store = mockStore({ user: { token: '12345' } });
        await store.dispatch(func());
        const actions = store.getActions();
        const expected = [addAlert(1, 'Server Error', 'danger')];
        expect(actions).toEqual(expected);
      }
      done();
    });
  });
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
  describe('addToWatchList', () => {
    test('should call action', async (done) => {
      mock.onPost().reply(200, 'Symbol added to watchlist');
      store.dispatch(addToWatchlist('ibm')).then(() => {
        const actions = store.getActions();
        const expected = [{ type: ADD_MAPPED_PLACEHOLDER, payload: 'ibm' }];
        expect(actions).toEqual(expected);
        done();
      });
    });
  });
  describe('deleteFromWatchList', () => {
    test('should call action', async (done) => {
      mock.onDelete().reply(200, 'ibm removed from watchlist ');
      store.dispatch(deleteFromWatchList('ibm')).then(() => {
        const actions = store.getActions();
        const expected = [{ type: REMOVE_MAPPED_STOCK, payload: 'ibm' }];
        expect(actions).toEqual(expected);
        done();
      });
    });
  });
});
