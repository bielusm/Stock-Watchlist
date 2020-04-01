import userReducer, { initialState } from '../../src/reducers/user';
import { RESET_STATE } from '../../src/actions/types';

describe('user reducer tests', () => {
  test('RESET_STATE', () => {
    expect(
      userReducer({ token: 12345, authenticated: true }, { type: RESET_STATE })
    ).toEqual(initialState);
  });
});
