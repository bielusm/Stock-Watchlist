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

const { testAuth } = require('./testUtils');

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
      ];
      testAuth(testRoutes, done);
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

      mock
        .onGet()
        .replyOnce(200, require('../fixtures/stocks/globalQuoteIbm.json'));
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
});
