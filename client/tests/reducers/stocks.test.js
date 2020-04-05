import stocksReducer, { initialState } from '../../src/reducers/stocks';
import { RESET_STATE, ADD_MISC_STOCK } from '../../src/actions/types';
import { aaa, ibm } from '../fixtures/stats';
describe('stocks reducer tests', () => {
  test('RESET_STATE', () => {
    expect(
      stocksReducer({ miscStocks: { ...ibm } }, { type: RESET_STATE })
    ).toEqual(initialState);
  });
  test(ADD_MISC_STOCK, () => {
    expect(
      stocksReducer(
        { stockData: { ...ibm } },
        { type: ADD_MISC_STOCK, payload: aaa }
      ).miscStocks
    ).toEqual(expect.objectContaining({ ...ibm, ...aaa }));
  });
});
