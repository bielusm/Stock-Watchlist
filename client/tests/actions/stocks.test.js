import {
  getStockStats,
  addToWatchlist,
  deleteFromWatchlist,
  getWatchlist,
  getStockStatsForAllStocks,
  refreshCurrentForWatchlist,
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
  SET_STOCK_VALUE,
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
        () =>
          refreshCurrentForWatchlist({
            ibm: { symbol: 'ibm', currentValue: 10 },
            aapl: { symbol: 'aapl', currentValue: 5 },
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
      mock.onGet('/api/stocks/ibm/stats').replyOnce(200, ibm);
      mock.onGet('/api/stocks/ibm/curr').replyOnce(200, { currentValue: 90 });
      store.dispatch(getStockStats('ibm')).then(() => {
        const actions = store.getActions();
        expect(actions).toEqual([
          { type: ADD_MISC_STOCK, payload: { ...ibm, currentValue: 90 } },
        ]);
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
      mock
        .onGet('/api/stocks/ibm/stats')
        .replyOnce(200, ibm)
        .onGet('/api/stocks/AAPL/stats')
        .replyOnce(200, AAPL);
      mock
        .onGet('/api/stocks/ibm/curr')
        .replyOnce(200, { currentValue: 90 })
        .onGet('/api/stocks/AAPL/curr')
        .replyOnce(200, { currentValue: 50 });
      const stocks = {
        ibm: { loading: true, symbol: 'ibm' },
        AAPL: { loading: true, symbol: 'AAPL' },
      };
      store.dispatch(getStockStatsForAllStocks(stocks)).then(() => {
        const actions = store.getActions();
        expect(actions).toEqual([
          { type: ADD_MAPPED_STOCK, payload: { ...ibm, currentValue: 90 } },
          { type: ADD_MAPPED_STOCK, payload: { ...AAPL, currentValue: 50 } },
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

  describe('refreshCurrentForWatchlist', () => {
    test('should call curr for each stock', async (done) => {
      mock.onGet('/api/stocks/ibm/curr').replyOnce(200, { currentValue: 50 });
      mock.onGet('/api/stocks/aapl/curr').replyOnce(200, { currentValue: 25 });

      const watchlist = {
        ibm: { symbol: 'ibm', currentValue: 10 },
        aapl: { symbol: 'aapl', currentValue: 5 },
      };

      store.dispatch(refreshCurrentForWatchlist(watchlist)).then(() => {
        const actions = store.getActions();
        const expected = [
          {
            type: SET_STOCK_VALUE,
            payload: { symbol: 'ibm', currentValue: 50 },
          },
          {
            type: SET_STOCK_VALUE,
            payload: { symbol: 'aapl', currentValue: 25 },
          },
        ];
        expect(actions).toEqual(expected);
        done();
      });
    });
  });
});
