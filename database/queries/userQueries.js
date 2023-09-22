const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('../idgc.db');

const findUserByID = (id, callback) => {
  db.get('SELECT * FROM Users WHERE ID = ?', [id], callback);
};

const findUserByGoogleID = (googleID, callback) => {
  db.get('SELECT * FROM Users WHERE GoogleID = ?', [googleID], callback);
};

const createUser = (user, callback) => {
  db.run(
    'INSERT INTO Users (GoogleID, DisplayName, FirstName, LastName, Email, ProfilePhotoURL) VALUES (?, ?, ?, ?, ?, ?)',
    [user.GoogleID, user.DisplayName, user.FirstName, user.LastName, user.Email, user.ProfilePhotoURL],
    callback
  );
};



module.exports = {
  findUserByGoogleID,
  createUser,
  findUserByID  
};

