const { seedUser } = require('../fixtures/users');
const {
  seedDatabase,
  disconnect,
  connect,
} = require('../fixtures/seedDatabase');
const SymbolModel = require('../../models/Symbol');
const UserModel = require('../../models/User');

let token = '';

const request = require('supertest');
const app = require('../../app');

const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
let mock = new MockAdapter(axios);

const moment = require('moment');

beforeAll(async () => {
  await connect();
  await seedDatabase();
});

afterAll(async () => {
  await disconnect();
});

beforeEach(async () => {
  await seedDatabase();
  res = await request(app).post('/api/users/login').send(seedUser);
  token = res.body.token;
});

afterEach(() => {
  mock.reset();
});

describe('stocks route', () => {
  describe('test private routes', () => {
    test('should give proper error', async (done) => {
      const testRoutes = [
        { url: '/api/stocks/ibm', method: 'get', data: undefined },
        {
          url: '/api/stocks/watchlist',
          method: 'post',
          data: { symbol: 'ibm' },
        },
        { url: '/api/stocks/watchlist/ibm', method: 'delete', data: undefined },
      ];
      for (const route of testRoutes) {
        const { url, method, data } = route;
        let res = [];
        switch (method) {
          case 'get':
            res[0] = await request(app).get(url).send(data).expect(400);
            res[1] = await request(app)
              .get(url)
              .set('x-auth-token', 'adhwdawdad')
              .send(data)
              .expect(401);
            break;
          case 'post':
            res[0] = await request(app).post(url).send(data).expect(400);
            res[1] = await request(app)
              .post(url)
              .set('x-auth-token', 'adhwdawdad')
              .send(data)
              .expect(401);
            break;
          case 'delete':
            res[0] = await request(app).delete(url).send(data).expect(400);
            res[1] = await request(app)
              .delete(url)
              .set('x-auth-token', 'adhwdawdad')
              .send(data)
              .expect(401);
            break;
        }

        let errors = res[0].body.errors;
        expect(errors.length).toEqual(1);
        expect(errors[0].msg).toEqual('No Token In Header');

        errors = res[1].body.errors;
        expect(errors.length).toEqual(1);
        expect(errors[0].msg).toEqual('Not authorized');
      }
      done();
    });
  });

  describe('API frequency test', () => {
    test('returns propper warning', async (done) => {
      const testRoutes = [
        {
          url: '/api/stocks/ibm',
          method: 'get',
          data: undefined,
          apiUrl: `https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY&symbol=$ibm&apikey=${process.env.ALPHA_VANTAGE_KEY}`,
        },
      ];
      for (route of testRoutes) {
        mock.onAny().reply(200, {
          Note:
            'Thank you for using Alpha Vantage! Our standard API call frequency is 5 calls per minute and 500 calls per day. Please visit https://www.alphavantage.co/premium/ if you would like to target a higher API call frequency.',
        });
        const { url, method, data } = route;
        let res;
        switch (method) {
          case 'get':
            res = await request(app)
              .get(url)
              .set('x-auth-token', token)
              .send(data)
              .expect(429);
            break;
        }
        let errors = res.body.errors;
        expect(errors.length).toEqual(1);
        expect(errors[0].msg).toEqual('Too many api calls');
        done();
      }
    });
  });

  describe('GET /api/stocks', () => {
    const mockValidResponse = () => {
      mock
        .onGet()
        .replyOnce(200, require('../fixtures/stocks/ibmStocks.json'))
        .onGet()
        .replyOnce(200, require('../fixtures/stocks/globalQuoteIbm.json'));
    };
    test('returns stock data', async (done) => {
      mockValidResponse();
      const response = await request(app)
        .get('/api/stocks/ibm')
        .set('x-auth-token', token)
        .expect(200);
      expect(response.body).toMatchSnapshot({});
      expect(response.body.last52).toHaveLength(52);
      done();
    });
    test('should return warning with bad symbol', async (done) => {
      mock.onGet().replyOnce(200, {
        'Error Message':
          'Invalid API call. Please retry or visit the documentation (https://www.alphavantage.co/documentation/) for TIME_SERIES_WEEKLY.',
      });

      const response = await request(app)
        .get('/api/stocks/baddata')
        .set('x-auth-token', token)
        .expect(400);
      expect(response.body).toEqual({
        errors: [{ msg: 'Invalid API call, possibly wrong symbol' }],
      });
      done();
    });

    test('should add new symbol to DB', async (done) => {
      const symbol = 'ibm';
      mockValidResponse();

      let symbolData = await SymbolModel.findOne({ symbol });
      expect(!symbolData);

      const response = await request(app)
        .get('/api/stocks/ibm')
        .set('x-auth-token', token);

      symbolData = await SymbolModel.findOne({ symbol });
      expect(symbolData);
      done();
    });

    test('should not add if symbol already exists', async (done) => {
      mockValidResponse();
      let response = await request(app)
        .get('/api/stocks/ibm')
        .set('x-auth-token', token);
      const symbol = 'ibm';
      const symbolData = await SymbolModel.findOne({ symbol });

      response = await request(app)
        .get('/api/stocks/ibm')
        .set('x-auth-token', token);

      const newSymbolData = await SymbolModel.findOne({ symbol });
      expect(newSymbolData).toEqual(symbolData);
      done();
    });

    test('should overrite data if it is outdated', async (done) => {
      mockValidResponse();
      let response = await request(app)
        .get('/api/stocks/ibm')
        .set('x-auth-token', token);
      const symbol = 'ibm';
      const symbolData = await SymbolModel.findOne({ symbol });
      const date = symbolData.date;
      symbolData.date = moment(date).subtract(7, 'days');
      await symbolData.save();
      mockValidResponse();
      response = await request(app)
        .get('/api/stocks/ibm')
        .set('x-auth-token', token);
      const newSymbolData = await SymbolModel.findOne({ symbol });
      expect(newSymbolData).not.toEqual(symbolData);
      done();
    });
  });

  describe('POST api/stocks/watchlist', () => {
    test('should add symbol to watchlist', async (done) => {
      let watchlist = (await UserModel.findOne({ email: seedUser.email }))
        .watchlist;
      expect(watchlist).toHaveLength(0);
      let res = await request(app)
        .post('/api/stocks/watchlist')
        .set('x-auth-token', token)
        .send({ symbol: 'ibm' });
      watchlist = Array.from(
        (await UserModel.findOne({ email: seedUser.email })).watchlist
      );

      expect(watchlist).toHaveLength(1);
      expect(watchlist).toEqual(['ibm']);

      res = await request(app)
        .post('/api/stocks/watchlist')
        .set('x-auth-token', token)
        .send({ symbol: 'aaa' });
      watchlist = Array.from(
        (await UserModel.findOne({ email: seedUser.email })).watchlist
      );
      expect(res.text).toEqual('Symbol added to watchlist');
      expect(watchlist).toHaveLength(2);
      expect(watchlist).toEqual(['ibm', 'aaa']);
      done();
    });

    test('Ignores duplicate value', async (done) => {
      let watchlist = (await UserModel.findOne({ email: seedUser.email }))
        .watchlist;
      expect(watchlist).toHaveLength(0);
      let res = await request(app)
        .post('/api/stocks/watchlist')
        .set('x-auth-token', token)
        .send({ symbol: 'ibm' });
      watchlist = Array.from(
        (await UserModel.findOne({ email: seedUser.email })).watchlist
      );

      expect(watchlist).toHaveLength(1);
      expect(watchlist).toEqual(['ibm']);

      res = await request(app)
        .post('/api/stocks/watchlist')
        .set('x-auth-token', token)
        .send({ symbol: 'ibm' });
      watchlist = Array.from(
        (await UserModel.findOne({ email: seedUser.email })).watchlist
      );
      expect(watchlist).toHaveLength(1);
      expect(watchlist).toEqual(['ibm']);
      expect(res.text).toEqual('Symbol already exists');
      done();
    });
    test('sends proper validation errors', async (done) => {
      res = await request(app)
        .post('/api/stocks/watchlist')
        .set('x-auth-token', token);
      const errors = res.body.errors;
      expect(errors.length).toEqual(1);
      expect(errors[0].msg).toEqual('symbol is required');
      done();
    });
  });

  describe('DELETE api/stocks/watchlist/symbol', () => {
    test('should remove value from watchlist', async (done) => {
      let res = await request(app)
        .post('/api/stocks/watchlist')
        .set('x-auth-token', token)
        .send({ symbol: 'ibm' });
      res = await request(app)
        .post('/api/stocks/watchlist')
        .set('x-auth-token', token)
        .send({ symbol: 'aaa' });
      res = await request(app)
        .post('/api/stocks/watchlist')
        .set('x-auth-token', token)
        .send({ symbol: 'AAPL' });

      let watchlist = Array.from(
        (await UserModel.findOne({ email: seedUser.email })).watchlist
      );
      expect(watchlist).toHaveLength(3);

      res = await request(app)
        .delete('/api/stocks/watchlist/aaa')
        .set('x-auth-token', token);

      watchlist = Array.from(
        (await UserModel.findOne({ email: seedUser.email })).watchlist
      );
      expect(watchlist).toHaveLength(2);
      expect(watchlist).toEqual(['ibm', 'AAPL']);

      done();
    });

    test('should do nothing with invalid symbol', async (done) => {
      let res = await request(app)
        .post('/api/stocks/watchlist')
        .set('x-auth-token', token)
        .send({ symbol: 'ibm' });
      res = await request(app)
        .post('/api/stocks/watchlist')
        .set('x-auth-token', token)
        .send({ symbol: 'aaa' });
      res = await request(app)
        .post('/api/stocks/watchlist')
        .set('x-auth-token', token)
        .send({ symbol: 'AAPL' });

      let watchlist = Array.from(
        (await UserModel.findOne({ email: seedUser.email })).watchlist
      );
      expect(watchlist).toHaveLength(3);

      res = await request(app)
        .delete('/api/stocks/watchlist/WHO')
        .set('x-auth-token', token);

      watchlist = Array.from(
        (await UserModel.findOne({ email: seedUser.email })).watchlist
      );
      expect(watchlist).toHaveLength(3);
      expect(watchlist).toEqual(['ibm', 'aaa', 'AAPL']);

      done();
    });
  });
});
