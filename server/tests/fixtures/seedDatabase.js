const mongoose = require('mongoose');
const server = require('../../app');
const { seedUser } = require('./users');
const User = require('../../models/User');
const Symbol = require('../../models/Symbol');
const request = require('supertest');

const connectToDb = async () => {
  await mongoose
    .connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
};

const fillUsers = async () => {
  // Need to go through server for hashed password
  const res = await request(server).post('/api/users').send(seedUser);
};

const seedDatabase = async () => {
  await clearDatabase();
  await fillUsers();
};

const connect = async () => {
  await connectToDb();
};

const disconnect = async () => {
  await mongoose.connection.close();
};

const clearDatabase = async () => {
  await User.deleteMany({});
  await Symbol.deleteMany({});
};

module.exports = {
  seedDatabase,
  connect,
  disconnect,
};
