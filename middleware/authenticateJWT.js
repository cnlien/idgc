const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');

const SECRET = process.env.JWT_SECRET;  // Get the secret from the environment

// Middleware to check JWT
const authenticateJWT = expressJwt({
    secret: SECRET,
    algorithms: ['HS256'],
    credentialsRequired: true,
    getToken: function fromHeaderOrQuerystring(req) {
        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
            return req.headers.authorization.split(' ')[1];
        } else if (req.query && req.query.token) {
            return req.query.token;
        }
        return null;
    }
});

module.exports = authenticateJWT;
