const bcrypt = require('bcrypt');
const db = require('../config/db');

function createUser(name, email, profile_image, password, callback) {
  const saltRounds = 10;
  bcrypt.hash(password, saltRounds, function(err, hash) {
    if (err) {
      console.log('Error in hash:', err);
      return callback(err);
    }
    const query = {
      text: 'INSERT INTO users(name, email, profile_image, password) VALUES($1, $2, $3, $4) RETURNING *',
      values: [name, email, profile_image, hash],
    };
    db.query(query, function(err, result) {
      if (err) {
        console.log('Error in query:', err);
        return callback(err);
      }
      const user = {
        id: result.rows[0].id,
        name: result.rows[0].name,
        email: result.rows[0].email,
        profile_image: result.rows[0].profile_image,
        password: result.rows[0].password,
      };
      return callback(null, user);
    });
  });
}

function findByname(name, callback) {
  const query = {
    text: 'SELECT * FROM users WHERE name = $1',
    values: [name],
  };
  db.query(query, function(err, result) {
    if (err) return callback(err);
    if (result.rows.length === 0) return callback(null, null);

    const user = {
      name: result.rows[0].name,
      email: result.rows[0].email,
      profile_image: result.rows[0].profile_image,
      password: result.rows[0].password,
    };
    return callback(null, user);
  });
}

function verifyPassword(password, hash, callback) {
  bcrypt.compare(password, hash, function(err, result) {
    if (err) return callback(err);
    return callback(null, result);
  });
}

function getUserById(userId, callback) {
  const query = {
    text: 'SELECT * FROM users WHERE id = $1',
    values: [userId],
  };
  db.query(query, function(err, result) {
    if (err) return callback(err);
    if (result.rows.length === 0) return callback(null, null);

    const user = {
      id: result.rows[0].id,
      name: result.rows[0].name,
      email: result.rows[0].email,
      profile_image: result.rows[0].profile_image,
      password: result.rows[0].password,
    };
    return callback(null, user);
  });
}

function findByEmail(email, callback) {
  const query = {
    text: 'SELECT * FROM users WHERE email = $1',
    values: [email],
  };
  db.query(query, function(err, result) {
    if (err) return callback(err);
    if (result.rows.length === 0) return callback(null, null);

    const user = {
      id: result.rows[0].id,
      name: result.rows[0].name,
      email: result.rows[0].email,
      profile_image: result.rows[0].profile_image,
      password: result.rows[0].password,
    };
    return callback(null, user);
  });
}

module.exports = {
  createUser,
  findByname,
  verifyPassword,
  getUserById,
  findByEmail,
};
