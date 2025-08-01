const sql = require('mssql');

const config = {
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  server: process.env.SQL_SERVER,
  database: process.env.SQL_DATABASE,
  options: {
    encrypt: true,
    trustServerCertificate: true, 
  },
};

async function getDBConnection() {
  try {
    const pool = await sql.connect(config);
    console.log('Connected to MSSQL');
    return pool;
  } catch (error) {
    console.error('MSSQL connection error:', error.message);
    throw error;
  }
}

module.exports = { getDBConnection };