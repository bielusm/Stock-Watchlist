const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const axios = require('axios');
const {
  getLast52,
  getExtremes,
  getCurrentValue,
} = require('../stocks/stockCalculations');
const SymbolModel = require('../models/Symbol');
const moment = require('moment');

//@route GET api/stocks
//@desc Get stocks for symbol
//@access Private
router.get('/:symbol', [auth], async (req, res) => {
  const { ALPHA_VANTAGE_KEY } = process.env;
  const { symbol } = req.params;
  try {
    //check DB Cache delete if val too old
    let databaseData = await SymbolModel.findOne({ symbol });
    if (databaseData) {
      const { date, stockStats, _id } = databaseData;
      if (moment().isSame(date, 'day')) return res.status(200).send(stockStats);
      await SymbolModel.findByIdAndDelete({ _id });
    }
    let result = await axios.get(
      `https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY&symbol=${symbol}&apikey=${ALPHA_VANTAGE_KEY}`
    );
    if (result.data.Note !== undefined) throw new Error(result.data.Note);
    if (result.data['Error Message'] !== undefined)
      throw new Error(result.data['Error Message']);

    const last52 = getLast52(result.data['Weekly Time Series']);
    const stats = getExtremes(last52);

    result = await axios.get(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_KEY}`
    );
    if (result.data.Note !== undefined) throw new Error(result.data.Note);
    if (result.data['Error Message'] !== undefined)
      throw new Error(result.data['Error Message']);

    const currentValue = getCurrentValue(result.data['Global Quote']);
    const statData = {};
    statData[symbol] = { currentValue, stats, last52 };
    let databaseSymbol = new SymbolModel({
      date: moment.now(),
      symbol,
      stockStats: statData,
    });
    await databaseSymbol.save();
    return res.status(200).send(statData);
  } catch (error) {
    const { message } = error;
    if (message.includes('5 calls per minute'))
      return res
        .status('429')
        .json({ errors: [{ msg: 'Too many api calls' }] });
    if (message.includes('Invalid API call'))
      return res
        .status('400')
        .json({ errors: [{ msg: 'Invalid API call, possibly wrong symbol' }] });
    console.error(message);
    return res.status(400).json({ errors: [{ msg: 'Server Error' }] });
  }
});

module.exports = router;
