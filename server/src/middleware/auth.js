const jwt = require('jsonwebtoken');
const config = require('../config');

function readToken(req) {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) {
    return header.slice(7);
  }
  return req.body && req.body.token ? req.body.token : '';
}

function attachUser(req, res, next) {
  const token = readToken(req);
  if (!token) {
    req.user = null;
    return next();
  }
  try {
    req.user = jwt.verify(token, config.jwtSecret);
  } catch (err) {
    req.user = null;
  }
  next();
}

function signToken(openid) {
  return jwt.sign({ openid }, config.jwtSecret, { expiresIn: '30d' });
}

module.exports = { attachUser, signToken };
