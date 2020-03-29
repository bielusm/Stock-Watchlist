process.env.NODE_ENV = 'test';

const mongoose = require('mongoose');
const User = require('../../models/User');
const server = require('../../app');
const request = require('supertest');
const { testUser, seedUser } = require('../fixtures/users');
const {
  seedDatabase,
  connect,
  disconnect
} = require('../fixtures/seedDatabase');

describe('Users', () => {
  beforeAll(async () => {
    await connect();
    await seedDatabase();
  });

  afterAll(async () => {
    await disconnect();
  });

  beforeEach(async () => {
    await seedDatabase();
  });

  describe('POST api/users', () => {
    it('Should register user', async () => {
      const res = await request(server)
        .post('/api/users')
        .send(testUser)
        .expect(200)
        .expect('Content-Type', /json/);

      expect(res.body.token);
      user = await User.findOne({ email: testUser.email });
      expect(user);
      expect(user.email).toEqual(testUser.email);
      expect(user.hash);
    });

    it('Should not allow duplicate user', async () => {
      let res = await request(server)
        .post('/api/users')
        .send(testUser);
      res = await request(server)
        .post('/api/users')
        .send(testUser)
        .expect(400)
        .expect('Content-Type', /json/);

      const errors = res.body.errors;
      expect(errors.length).toEqual(1);
      expect(errors[0].msg).toEqual('User already exists');
    });

    it('Should not allow bad input', async () => {
      let res = await request(server)
        .post('/api/users')
        .expect(400)
        .expect('Content-Type', /json/);
      let errors = res.body.errors;

      expect(errors.length).toEqual(2);
      expect(errors[0].msg).toEqual('email is required');
      expect(errors[1].msg).toEqual('password is required');

      res = await request(server)
        .post('/api/users')
        .send({
          email: 'aa',
          password: ''
        })
        .expect(400)
        .expect('Content-Type', /json/);

      errors = res.body.errors;
      expect(errors.length).toEqual(2);
      expect(errors[0].msg).toEqual('email is required');
      expect(errors[1].msg).toEqual('password is required');
    });
  });

  describe('/api/login', () => {
    it('Should login user', async () => {
      res = await request(server)
        .post('/api/users/login')
        .send(seedUser)
        .expect(200)
        .expect('Content-Type', /json/);
      expect(res.body.token);
    });

    it('Should not allow wrong password', async () => {
      res = await request(server)
        .post('/api/users/login')
        .send({ email: seedUser.email, password: '123' })
        .expect(401)
        .expect('Content-Type', /json/);

      errors = res.body.errors;
      expect(errors.length).toEqual(1);
      expect(errors[0].msg).toEqual('Username or password is incorrect');
    });

    it('Should not allow invalid email', async () => {
      res = await request(server)
        .post('/api/users/login')
        .send({ email: 'fakeemail@fake.com', password: '123' })
        .expect(400)
        .expect('Content-Type', /json/);

      errors = res.body.errors;
      expect(errors.length).toEqual(1);
      expect(errors[0].msg).toEqual('User does not exist');
    });

    it('Should not allow invalid body', async () => {
      res = await request(server)
        .post('/api/users/login')
        .send({ email: null, password: false })
        .expect(400)
        .expect('Content-Type', /json/);

      let errors = res.body.errors;
      expect(errors.length).toEqual(2);
      expect(errors[0].msg).toEqual('email is required');
      expect(errors[1].msg).toEqual('password is required');
    });
  });
});
