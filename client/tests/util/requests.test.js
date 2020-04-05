const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
let mock = new MockAdapter(axios);
import { sendRequest } from '../../src/util/requests';
import { ibm } from '../fixtures/stats';

const url = `/api/stocks/ibm`;
const config = {
  method: 'get',
  headers: { 'x-auth-token': '12345' },
};

afterEach(() => {
  mock.reset();
});

jest.mock('../../src/util/sleep.js', () => ({
  __esModule: true,
  sleep: jest.fn().mockResolvedValue(),
}));

describe('sendRequests tests', () => {
  test('returns data on success', async (done) => {
    mock.onGet().reply(200, ibm);
    expect((await sendRequest(url, config)).data).toEqual(ibm);
    done();
  });
  test('throws on error', async (done) => {
    mock.onGet().networkError();
    await expect(sendRequest(url, config)).rejects.toThrow('Network Error');
    done();
  });

  test('works on one retry', async (done) => {
    mock
      .onGet()
      .replyOnce(429, { errors: [{ msg: 'Too many api calls' }] })
      .onGet()
      .replyOnce(200, ibm);
    expect((await sendRequest(url, config)).data).toEqual(ibm);
    done();
  });

  test('throws on two retries', async (done) => {
    mock.onGet().reply(429, { errors: [{ msg: 'Too many api calls' }] });
    await expect(sendRequest(url, config)).rejects.toThrow(
      'Request failed with status code 429'
    );
    done();
  });

  test('throws on generic error', async (done) => {
    mock.onGet().reply(400, { errors: [{ msg: 'No Token In Header' }] });
    await expect(sendRequest(url, config)).rejects.toThrow(
      'Request failed with status code 400'
    );
    done();
  });
});
