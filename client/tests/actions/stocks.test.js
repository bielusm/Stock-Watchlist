import {
  getStockStats,
  addToWatchlist,
  deleteFromWatchlist,
  getWatchlist,
  getStockStatsForAllStocks,
} from '../../src/actions/stocks';
import configureMockStore from 'redux-mock-store';
import ReduxThunk from 'redux-thunk';

const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
let mock = new MockAdapter(axios);

import { addAlert } from '../../src/actions/alert';
import { ibm, AAPL } from '../fixtures/stats';
import {
  ADD_MISC_STOCK,
  ADD_MAPPED_PLACEHOLDER,
  REMOVE_MAPPED_STOCK,
  MAPPED_STOCK_LOADING,
  MAPPED_STOCK_LOADED,
  ADD_MAPPED_STOCK,
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
        () => deleteFromWatchlist('ibm'),
        getWatchlist,
        () =>
          getStockStatsForAllStocks({
            ibm: { loading: true, symbol: 'ibm' },
            AAPL: { loading: true, symbol: 'AAPL' },
          }),
      ];
      for (const func of functions) {
        store = mockStore({ user: { token: '12345' } });
        await store.dispatch(func());
        const actions = store.getActions();
        const expected = [addAlert(1, 'Server Error', 'danger')];
        expect(actions).toEqual(expect.arrayContaining(expected));
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

    test('should set action based on misc value', async (done) => {
      mock.onGet().reply(200, ibm);

      await store.dispatch(getStockStats('ibm'));
      await store.dispatch(getStockStats('ibm', false));
      const actions = store.getActions();
      const expected = [
        { type: ADD_MISC_STOCK, payload: ibm },
        { type: ADD_MAPPED_STOCK, payload: ibm },
      ];
      expect(actions).toEqual(expected);
      done();
    });

    test('should set stock invalid when invalid symbol given', async (done) => {
      mock.onGet().replyOnce(400, {
        errors: [{ msg: `Invalid API call, possibly wrong symbol TSE:AAPL` }],
      });
      store.dispatch(getStockStats('TSE:AAPL')).then(() => {
        const actions = store.getActions();
        expect(actions).toEqual([
          {
            type: ADD_MISC_STOCK,
            payload: { invalid: true, symbol: 'TSE:AAPL' },
          },
          addAlert(
            1,
            'Invalid API call, possibly wrong symbol TSE:AAPL',
            'danger'
          ),
        ]);
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
      store.dispatch(deleteFromWatchlist('ibm')).then(() => {
        const actions = store.getActions();
        const expected = [{ type: REMOVE_MAPPED_STOCK, payload: 'ibm' }];
        expect(actions).toEqual(expected);
        done();
      });
    });
  });

  describe('getWatchlist', () => {
    test('should only call loading actions', async (done) => {
      mock.onGet().reply(200, []);
      store.dispatch(getWatchlist()).then(() => {
        const actions = store.getActions();
        expect(actions).toEqual([
          { type: MAPPED_STOCK_LOADING },
          { type: MAPPED_STOCK_LOADED },
        ]);
        done();
      });
    });
    test('should call action for each watchlist item', async (done) => {
      mock.onGet().reply(200, ['ibm', 'aaa', 'AAPL']);
      store.dispatch(getWatchlist()).then(() => {
        const actions = store.getActions();
        const expected = [
          { type: MAPPED_STOCK_LOADING },
          { type: ADD_MAPPED_PLACEHOLDER, payload: 'ibm' },
          { type: ADD_MAPPED_PLACEHOLDER, payload: 'aaa' },
          { type: ADD_MAPPED_PLACEHOLDER, payload: 'AAPL' },
          { type: MAPPED_STOCK_LOADED },
        ];
        expect(actions).toEqual(expected);
        done();
      });
    });
  });

  describe('getStockStatsForAllStocks', () => {
    test('should get data for each stock and call action', async (done) => {
      mock.onGet().replyOnce(200, ibm).onGet().replyOnce(200, AAPL);
      const stocks = {
        ibm: { loading: true, symbol: 'ibm' },
        AAPL: { loading: true, symbol: 'AAPL' },
      };
      store.dispatch(getStockStatsForAllStocks(stocks)).then(() => {
        const actions = store.getActions();
        expect(actions).toEqual([
          { type: ADD_MAPPED_STOCK, payload: ibm },
          { type: ADD_MAPPED_STOCK, payload: AAPL },
        ]);
        done();
      });
    });

    test('should call nothing when empty array given', async (done) => {
      store.dispatch(getStockStatsForAllStocks([])).then(() => {
        const actions = store.getActions();
        expect(actions).toEqual([]);
        done();
      });
    });

    test('should set stock invalid when invalid symbol given', async (done) => {
      mock.onGet().replyOnce(400, {
        errors: [{ msg: `Invalid API call, possibly wrong symbol TSE:AAPL` }],
      });
      const stocks = {
        AAPL: { loading: true, symbol: 'TSE:AAPL' },
      };
      store.dispatch(getStockStatsForAllStocks(stocks)).then(() => {
        const actions = store.getActions();
        expect(actions).toEqual([
          {
            type: ADD_MAPPED_STOCK,
            payload: { invalid: true, symbol: 'TSE:AAPL' },
          },
          addAlert(
            1,
            'Invalid API call, possibly wrong symbol TSE:AAPL',
            'danger'
          ),
        ]);
        done();
      });
    });
  });
});
