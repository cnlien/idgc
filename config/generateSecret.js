module.exports = function generateSecret() {
  const crypto = require('crypto');
  const secret = crypto.randomBytes(64).toString('hex');
  console.log(secret)
  return secret;
};