const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User.js');
const { check, validationResult } = require('express-validator');
const errorFormater = require('./errorFormater');

//@route GET api/watchlist
//@desc Get the watchlist
//@access Private
router.get('/', [auth], async (req, res) => {
  try {
    //Get user by ID
    const user = await User.findById(req.id, '-password');
    if (!user)
      return res.status(400).json({ errors: [{ msg: 'Invalid JWT Token' }] });

    return res.status(200).json(user.watchlist);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ errors: [{ msg: 'Server Error' }] });
  }
});

//@route DELETE api/watchlist/:symbol
//@desc Delete a stock from the watchlist
//@access Private
router.delete('/:symbol', [auth], async (req, res) => {
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

//@route POST api/watchlist
//@desc Add new stock to users watchlist
//@access Private
router.post('/', [auth, check('symbol').notEmpty()], async (req, res) => {
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
});

module.exports = router;
