import stocksReducer, { initialState } from '../../src/reducers/stocks';
import {
  RESET_STATE,
  ADD_MISC_STOCK,
  ADD_MAPPED_PLACEHOLDER,
  ADD_MAPPED_STOCK,
  REMOVE_MAPPED_STOCK,
  MAPPED_STOCK_LOADED,
  MAPPED_STOCK_LOADING,
} from '../../src/actions/types';
import { AAPL, ibm } from '../fixtures/stats';
describe('stocks reducer tests', () => {
  test(RESET_STATE, () => {
    expect(
      stocksReducer({ miscStocks: { ...ibm } }, { type: RESET_STATE })
    ).toEqual(initialState);
  });
  test(ADD_MISC_STOCK, () => {
    let res = stocksReducer(undefined, { type: ADD_MISC_STOCK, payload: ibm });
    expect(res.miscStocks).toEqual(expect.objectContaining({ ibm }));
    res = stocksReducer(res, { type: ADD_MISC_STOCK, payload: AAPL });
    expect(res.miscStocks).toEqual(expect.objectContaining({ ibm, AAPL }));
  });
  test(ADD_MAPPED_PLACEHOLDER, () => {
    let res = stocksReducer(undefined, {
      type: ADD_MAPPED_PLACEHOLDER,
      payload: 'ibm',
    });
    expect(res.mappedStocks).toEqual(
      expect.objectContaining({ ibm: { loading: true, symbol: 'ibm' } })
    );
    res = stocksReducer(res, { type: ADD_MAPPED_PLACEHOLDER, payload: 'AAPL' });
    expect(res.mappedStocks).toEqual(
      expect.objectContaining({
        ibm: { loading: true, symbol: 'ibm' },
        AAPL: { loading: true, symbol: 'AAPL' },
      })
    );
  });

  test(ADD_MAPPED_STOCK, () => {
    let res = stocksReducer(undefined, {
      type: ADD_MAPPED_PLACEHOLDER,
      payload: 'ibm',
    });
    res = stocksReducer(res, {
      type: ADD_MAPPED_PLACEHOLDER,
      payload: 'AAPL',
    });

    res = stocksReducer(res, {
      type: ADD_MAPPED_STOCK,
      payload: ibm,
    });

    expect(res.mappedStocks).toEqual({
      ibm,
      AAPL: { symbol: 'AAPL', loading: true },
    });
  });
  test(REMOVE_MAPPED_STOCK, () => {
    let res = stocksReducer(undefined, {
      type: ADD_MAPPED_PLACEHOLDER,
      payload: 'ibm',
    });
    res = stocksReducer(res, {
      type: ADD_MAPPED_PLACEHOLDER,
      payload: 'AAPL',
    });

    res = stocksReducer(res, {
      type: ADD_MAPPED_STOCK,
      payload: ibm,
    });

    res = stocksReducer(res, {
      type: REMOVE_MAPPED_STOCK,
      payload: 'AAPL',
    });

    expect(res.mappedStocks).toEqual({
      ibm,
    });
  });

  test(MAPPED_STOCK_LOADING, () => {
    expect(
      stocksReducer(undefined, { type: MAPPED_STOCK_LOADING })
        .mappedStocksLoading
    ).toEqual(true);
  });
  test(MAPPED_STOCK_LOADED, () => {
    let res = stocksReducer(undefined, { type: MAPPED_STOCK_LOADING });
    expect(
      stocksReducer(res, { type: MAPPED_STOCK_LOADED }).mappedStocksLoading
    ).toEqual(false);
  });
});
