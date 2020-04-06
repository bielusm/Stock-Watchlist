const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true },
  hash: { type: String, required: true },
  watchlist: { type: Array },
});

const UserModel = mongoose.model('User', UserSchema);
module.exports = UserModel;
