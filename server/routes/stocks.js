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
const { ALPHA_VANTAGE_KEY } = process.env;

//@route GET api/stocks/symbol/stats
//@desc Get stock stats for symbol
//@access Private
router.get('/:symbol/stats', [auth], async (req, res) => {
  const { symbol } = req.params;
  let stats, last52;
  try {
    let stockStats;
    //check DB Cache delete if val too old
    let databaseData = await SymbolModel.findOne({ symbol });
    if (databaseData) {
      const { date, _id } = databaseData;
      if (!moment().isSame(date, 'day')) {
        await SymbolModel.findByIdAndDelete({ _id });
      } else stockStats = databaseData.stockStats;
    }
    if (!stockStats) {
      let result = await axios.get(
        `https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY&symbol=${symbol}&apikey=${ALPHA_VANTAGE_KEY}`
      );
      if (result.data.Note !== undefined) throw new Error(result.data.Note);
      if (result.data['Error Message'] !== undefined)
        throw new Error(result.data['Error Message']);

      last52 = getLast52(result.data['Weekly Time Series']);
      stats = getExtremes(last52);

      stockStats = { symbol, stats, last52 };

      let databaseSymbol = new SymbolModel({
        date: moment.now(),
        symbol,
        stockStats,
      });
      await databaseSymbol.save();
    } else {
      stats = stockStats.stats;
      last52 = stockStats.last52;
    }

    return res.status(200).send({ symbol, stats, last52 });
  } catch (error) {
    const { message } = error;
    if (message.includes('5 calls per minute'))
      return res
        .status('429')
        .json({ errors: [{ msg: 'Too many api calls' }] });
    if (message.includes('Invalid API call'))
      return res.status('400').json({
        errors: [{ msg: `Invalid API call, possibly wrong symbol ${symbol}` }],
      });
    console.error(error);
    return res.status(400).json({ errors: [{ msg: 'Server Error' }] });
  }
});

//@route GET api/stocks/symbol/curr
//@desc Get currentValue for symbol
//@access Private
router.get('/:symbol/curr', [auth], async (req, res) => {
  const { symbol } = req.params;
  try {
    let result = await axios.get(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_KEY}`
    );

    if (result.data.Note !== undefined) throw new Error(result.data.Note);
    if (result.data['Error Message'] !== undefined)
      throw new Error(result.data['Error Message']);

    const currentValue = getCurrentValue(result.data['Global Quote']).toFixed(
      2
    );

    return res.status(200).send({ currentValue });
  } catch (error) {
    const { message } = error;
    if (message.includes('5 calls per minute'))
      return res
        .status('429')
        .json({ errors: [{ msg: 'Too many api calls' }] });
    if (message.includes('Invalid API call'))
      return res.status('400').json({
        errors: [{ msg: `Invalid API call, possibly wrong symbol ${symbol}` }],
      });
    console.error(error);
    return res.status(400).json({ errors: [{ msg: 'Server Error' }] });
  }
});

module.exports = router;
