const sqlite3 = require('sqlite3')
const db = new sqlite3.Database('../idgc.db')
module.exports = db
