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
const User = require('../models/User.js');
const moment = require('moment');
const { check, validationResult } = require('express-validator');
const errorFormater = require('./errorFormater');

//@route DELETE api/stocks/watchlist/:symbol
//@desc Delete a stock from the watchlist
//@access Private
router.delete('/watchlist/:symbol', [auth], async (req, res) => {
  try {
    const { symbol } = req.params;

    //Get user by ID
    const user = await User.findById(req.id, '-password');
    if (!user)
      return res.status(400).json({ errors: [{ msg: 'Invalid JWT Token' }] });

    user.watchlist = user.watchlist.filter((stock) => stock !== symbol);
    await user.save();
    return res.status(200).send(`${symbol} removed from watchlist`);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ errors: [{ msg: 'Server Error' }] });
  }
});

//@route POST api/stocks/watchlist
//@desc Add new stock to users watchlist
//@access Private
router.post(
  '/watchlist',
  [auth, check('symbol').notEmpty()],
  async (req, res) => {
    try {
      const errors = validationResult(req).formatWith(errorFormater);
      if (!errors.isEmpty())
        return res
          .status(400)
          .json({ errors: errors.array({ onlyFirstError: true }) });

      const { symbol } = req.body;
      //Get user by ID
      const user = await User.findById(req.id, '-password');
      if (!user)
        return res.status(400).json({ errors: [{ msg: 'Invalid JWT Token' }] });

      if (user.watchlist.includes(symbol))
        return res.status(200).send('Symbol already exists');

      user.watchlist = [...user.watchlist, symbol];
      await user.save();
      return res.status(200).send('Symbol added to watchlist');
    } catch (error) {
      console.error(error);
      return res.status(400).json({ errors: [{ msg: 'Server Error' }] });
    }
  }
);

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
    const stockStats = { symbol, currentValue, stats, last52 };
    let databaseSymbol = new SymbolModel({
      date: moment.now(),
      symbol,
      stockStats,
    });
    await databaseSymbol.save();
    return res.status(200).send(stockStats);
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
