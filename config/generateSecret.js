module.exports = function generateSecret() {
  const crypto = require('crypto')
  const secret = crypto.randomBytes(64).toString('hex')
  return secret
}
