const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const errorFormater = require('./errorFormater');
const auth = require('../middleware/auth');
const axios = require('axios');
const {
  getLast52,
  getExtremes,
  getCurrentValue
} = require('../stocks/stockCalculations');

//@route GET api/stocks
//@desc Get stocks for symbol
//@access Private
router.get('/:symbol', [auth], async (req, res) => {
  const { ALPHA_VANTAGE_KEY } = process.env;
  const { symbol } = req.params;
  try {
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
    return res.status(200).send(statData);
  } catch (error) {
    const { message } = error;
    if (message.includes('5 calls per minute'))
      return res
        .status('400')
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
