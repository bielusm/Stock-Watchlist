const request = require('supertest');
const app = require('../../app');

const testAuth = async (testRoutes, done) => {
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
};

module.exports = { testAuth };
