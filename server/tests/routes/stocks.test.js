const { seedUser } = require('../fixtures/users');
const {
  seedDatabase,
  disconnect,
  connect
} = require('../fixtures/seedDatabase');

let token = '';

const request = require('supertest');
const moxios = require('moxios');
const app = require('../../app');

beforeAll(async () => {
  await connect();
  await seedDatabase();
});

afterAll(async () => {
  await disconnect();
});

beforeEach(async () => {
  await seedDatabase();
  res = await request(app)
    .post('/api/users/login')
    .send(seedUser);
  token = res.body.token;
  moxios.install();
});

afterEach(() => {
  moxios.uninstall();
});

describe('stocks route', () => {
  describe('test private routes', () => {
    test('should give proper error', async done => {
      const testRoutes = [
        { url: '/api/stocks/ibm', method: 'get', data: undefined }
      ];
      for (const route of testRoutes) {
        const { url, method, data } = route;
        let res = [];
        switch (method) {
          case 'get':
            res[0] = await request(app)
              .get(url)
              .send(data)
              .expect(400);
            res[1] = await request(app)
              .get(url)
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
    test('returns propper warning', async done => {
      const testRoutes = [
        {
          url: '/api/stocks/ibm',
          method: 'get',
          data: undefined,
          apiUrl: `https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY&symbol=$ibm&apikey=${process.env.ALPHA_VANTAGE_KEY}`
        }
      ];
      for (route of testRoutes) {
        moxios.wait(() => {
          const request = moxios.requests.mostRecent();
          request.respondWith({
            status: 200,
            response: {
              Note:
                'Thank you for using Alpha Vantage! Our standard API call frequency is 5 calls per minute and 500 calls per day. Please visit https://www.alphavantage.co/premium/ if you would like to target a higher API call frequency.'
            }
          });
        });
        const { url, method, data } = route;
        let res;
        switch (method) {
          case 'get':
            res = await request(app)
              .get(url)
              .set('x-auth-token', token)
              .send(data)
              .expect(400);
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
    test('returns stock data', async done => {
      const { ALPHA_VANTAGE_KEY } = process.env;
      moxios.stubRequest(
        `https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY&symbol=ibm&apikey=${ALPHA_VANTAGE_KEY}`,
        {
          status: 200,
          response: require('../fixtures/stocks/ibmStocks.json')
        }
      );
      moxios.stubRequest(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=ibm&apikey=${ALPHA_VANTAGE_KEY}`,
        {
          status: 200,
          response: require('../fixtures/stocks/globalQuoteIbm.json')
        }
      );

      const response = await request(app)
        .get('/api/stocks/ibm')
        .set('x-auth-token', token)
        .expect(200);
      expect(response.body).toMatchSnapshot({});
      expect(response.body.ibm.last52).toHaveLength(52);
      done();
    });
    test('should return warning with bad symbol', async done => {
      const { ALPHA_VANTAGE_KEY } = process.env;
      moxios.stubRequest(
        `https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY&symbol=${'baddata'}&apikey=${ALPHA_VANTAGE_KEY}`,
        {
          status: 200,
          response: {
            'Error Message':
              'Invalid API call. Please retry or visit the documentation (https://www.alphavantage.co/documentation/) for TIME_SERIES_WEEKLY.'
          }
        }
      );
      const response = await request(app)
        .get('/api/stocks/baddata')
        .set('x-auth-token', token)
        .expect(400);
      expect(response.body).toEqual({
        errors: [{ msg: 'Invalid API call, possibly wrong symbol' }]
      });
      done();
    });
  });
});
