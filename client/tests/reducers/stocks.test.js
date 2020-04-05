import stocksReducer, { initialState } from '../../src/reducers/stocks';
import {
  RESET_STATE,
  ADD_MISC_STOCK,
  ADD_MAPPED_PLACEHOLDER,
} from '../../src/actions/types';
import { aaa, ibm } from '../fixtures/stats';
describe('stocks reducer tests', () => {
  test('RESET_STATE', () => {
    expect(
      stocksReducer({ miscStocks: { ...ibm } }, { type: RESET_STATE })
    ).toEqual(initialState);
  });
  test(ADD_MISC_STOCK, () => {
    let res = stocksReducer(undefined, { type: ADD_MISC_STOCK, payload: ibm });
    expect(res.miscStocks).toEqual(expect.objectContaining({ ...ibm }));
    res = stocksReducer(res, { type: ADD_MISC_STOCK, payload: aaa });
    expect(res.miscStocks).toEqual(expect.objectContaining({ ...ibm, ...aaa }));
  });
  test(ADD_MAPPED_PLACEHOLDER, () => {
    let res = stocksReducer(undefined, {
      type: ADD_MAPPED_PLACEHOLDER,
      payload: 'ibm',
    });
    expect(res.mappedStocks).toEqual(
      expect.objectContaining({ ibm: { loading: true } })
    );
    res = stocksReducer(res, { type: ADD_MAPPED_PLACEHOLDER, payload: 'aaa' });
    expect(res.mappedStocks).toEqual(
      expect.objectContaining({
        ibm: { loading: true },
        aaa: { loading: true },
      })
    );
  });
});
