//Add user//
const { sql, poolPromise } = require('../db');

async function createUser(email, passwordHash) {
  const pool = await poolPromise;
  return pool
    .request()
    .input('Email', sql.NVarChar, email)
    .input('PasswordHash', sql.NVarChar, passwordHash)
    .query('INSERT INTO Users (email, password_hash) VALUES (@Email, @PasswordHash)');
}

module.exports = { createUser };
