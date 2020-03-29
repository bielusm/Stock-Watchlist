//code adapted from https://medium.com/dev-bits/a-guide-for-adding-jwt-token-based-authentication-to-your-single-page-nodejs-applications-c403f7cf04f4
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    //Get token from header
    const token = req.headers['x-auth-token'];
    if (!token)
      return res.status(400).json({ errors: [{ msg: 'No Token In Header' }] });

    //Verify and decrypt token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.id = decoded.id;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError)
      return res.status(401).json({ errors: [{ msg: 'Not authorized' }] });

    console.error(error);
    return res.status(400).json({ errors: [{ msg: 'Server Error' }] });
  }
};

module.exports = auth;
