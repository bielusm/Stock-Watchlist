module.exports = async () => {
  await global._mongoServer.stop();
};
