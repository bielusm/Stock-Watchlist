const mongoose = require('mongoose');
const SymbolSchema = new mongoose.Schema({
  symbol: { type: String, required: true, unique: true },
  date: { type: Date, required: true },
  stockStats: { type: Object, required: true },
});

const Symbol = mongoose.model('Symbol', SymbolSchema);
module.exports = Symbol;
