const { MongoMemoryServer } = require('mongodb-memory-server-core');

module.exports = async () => {
  global._mongoServer = new MongoMemoryServer();
  process.env['MONGO_URL'] = await global._mongoServer.getUri();
  process.env['JWT_SECRET'] = 'TEST_SECRET';
};
