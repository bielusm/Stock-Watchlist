import alertReducer, { initialState } from '../../src/reducers/alert';
import { RESET_STATE } from '../../src/actions/types';

describe('alert reducer tests', () => {
  test('RESET_STATE', () => {
    expect(
      alertReducer(
        { alerts: [{ id: 1, message: 'alert', color: 'success' }] },
        { type: RESET_STATE }
      )
    ).toEqual(initialState);
  });
});
