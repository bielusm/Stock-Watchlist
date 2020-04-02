import stocksReducer, { initialState } from '../../src/reducers/stocks';
import { RESET_STATE, ADD_STOCK_DATA } from '../../src/actions/types';
import { aaa, ibm } from '../fixtures/stats';
describe('stocks reducer tests', () => {
  test('RESET_STATE', () => {
    expect(
      stocksReducer({ stockData: { ...ibm } }, { type: RESET_STATE })
    ).toEqual(initialState);
  });
  test('ADD_STOCK_DATA', () => {
    expect(
      stocksReducer(
        { stockData: { ...ibm } },
        { type: ADD_STOCK_DATA, payload: aaa }
      ).stockData
    ).toEqual(expect.objectContaining({ ...ibm, ...aaa }));
  });
});
