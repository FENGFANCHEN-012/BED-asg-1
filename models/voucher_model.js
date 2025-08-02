const sql = require('mssql');
const config = require('../dbConfig');

module.exports = {
  async listAll() {
    const pool = await new sql.ConnectionPool(config).connect();
    try {
      const r = await pool.request().query('SELECT * FROM vouchers');
      return r.recordset;
    } finally {
      await pool.close();
    }
  },

  async getById(voucherId) {
    const pool = await new sql.ConnectionPool(config).connect();
    try {
      const r = await pool.request()
        .input('voucher_id', sql.Int, voucherId)
        .query('SELECT * FROM vouchers WHERE voucher_id = @voucher_id');
      return r.recordset[0];
    } finally {
      await pool.close();
    }
  }
};
