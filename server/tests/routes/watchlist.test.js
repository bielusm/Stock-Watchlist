const { seedUser } = require('../fixtures/users');
const {
  seedDatabase,
  disconnect,
  connect,
} = require('../fixtures/seedDatabase');
const UserModel = require('../../models/User');

let token = '';

const request = require('supertest');
const app = require('../../app');

const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
let mock = new MockAdapter(axios);

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

describe('watchlist tests', () => {
  describe('private route testing', () => {
    test('should give proper error', async (done) => {
      const testRoutes = [
        {
          url: '/api/watchlist',
          method: 'post',
          data: { symbol: 'ibm' },
        },
        { url: '/api/watchlist/ibm', method: 'delete', data: undefined },
      ];
      testAuth(testRoutes, done);
    });
  });
  describe('POST api/watchlist', () => {
    test('should add symbol to watchlist', async (done) => {
      let watchlist = (await UserModel.findOne({ email: seedUser.email }))
        .watchlist;
      expect(watchlist).toHaveLength(0);
      let res = await request(app)
        .post('/api/watchlist')
        .set('x-auth-token', token)
        .send({ symbol: 'ibm' });
      watchlist = Array.from(
        (await UserModel.findOne({ email: seedUser.email })).watchlist
      );

      expect(watchlist).toHaveLength(1);
      expect(watchlist).toEqual(['ibm']);

      res = await request(app)
        .post('/api/watchlist')
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
        .post('/api/watchlist')
        .set('x-auth-token', token)
        .send({ symbol: 'ibm' });
      watchlist = Array.from(
        (await UserModel.findOne({ email: seedUser.email })).watchlist
      );

      expect(watchlist).toHaveLength(1);
      expect(watchlist).toEqual(['ibm']);

      res = await request(app)
        .post('/api/watchlist')
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
        .post('/api/watchlist')
        .set('x-auth-token', token);
      const errors = res.body.errors;
      expect(errors.length).toEqual(1);
      expect(errors[0].msg).toEqual('symbol is required');
      done();
    });
  });

  describe('DELETE api/watchlist/symbol', () => {
    test('should remove value from watchlist', async (done) => {
      let res = await request(app)
        .post('/api/watchlist')
        .set('x-auth-token', token)
        .send({ symbol: 'ibm' });
      res = await request(app)
        .post('/api/watchlist')
        .set('x-auth-token', token)
        .send({ symbol: 'aaa' });
      res = await request(app)
        .post('/api/watchlist')
        .set('x-auth-token', token)
        .send({ symbol: 'AAPL' });

      let watchlist = Array.from(
        (await UserModel.findOne({ email: seedUser.email })).watchlist
      );
      expect(watchlist).toHaveLength(3);

      res = await request(app)
        .delete('/api/watchlist/aaa')
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
        .post('/api/watchlist')
        .set('x-auth-token', token)
        .send({ symbol: 'ibm' });
      res = await request(app)
        .post('/api/watchlist')
        .set('x-auth-token', token)
        .send({ symbol: 'aaa' });
      res = await request(app)
        .post('/api/watchlist')
        .set('x-auth-token', token)
        .send({ symbol: 'AAPL' });

      let watchlist = Array.from(
        (await UserModel.findOne({ email: seedUser.email })).watchlist
      );
      expect(watchlist).toHaveLength(3);

      res = await request(app)
        .delete('/api/watchlist/WHO')
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
