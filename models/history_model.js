// models/history_model.js
const sql    = require('mssql');
const config = require('../dbConfig');

module.exports = {
  // Fetch entire redemption history for a user, including cost_points
  async getHistory(userId) {
    const pool = await new sql.ConnectionPool(config).connect();
    try {
      const r = await pool.request()
        .input('user_id', sql.Int, userId)
        .query(`
          SELECT 
            h.history_id,
            h.voucher_id,
            h.voucher_title,
            h.quantity,
            h.redeemed_at,
            v.cost_points
          FROM user_voucher_history AS h
          JOIN vouchers AS v
            ON h.voucher_id = v.voucher_id
          WHERE h.user_id = @user_id
          ORDER BY h.redeemed_at DESC
        `);
      return r.recordset;
    } finally {
      await pool.close();
    }
  },

  // Log an array of items into the history table (transactional or standalone)
  async logEntries(userId, items, trx) {
    if (trx) {
      for (let item of items) {
        await trx.request()
          .input('user_id',       sql.Int,           userId)
          .input('voucher_id',    sql.Int,           item.voucher_id)
          .input('voucher_title', sql.NVarChar(100), item.title)
          .input('quantity',      sql.Int,           item.quantity)
          .query(`
            INSERT INTO user_voucher_history
              (user_id, voucher_id, voucher_title, quantity)
            VALUES
              (@user_id, @voucher_id, @voucher_title, @quantity)
          `);
      }
    } else {
      const pool = await new sql.ConnectionPool(config).connect();
      try {
        for (let item of items) {
          await pool.request()
            .input('user_id',       sql.Int,           userId)
            .input('voucher_id',    sql.Int,           item.voucher_id)
            .input('voucher_title', sql.NVarChar(100), item.title)
            .input('quantity',      sql.Int,           item.quantity)
            .query(`
              INSERT INTO user_voucher_history
                (user_id, voucher_id, voucher_title, quantity)
              VALUES
                (@user_id, @voucher_id, @voucher_title, @quantity)
            `);
        }
      } finally {
        await pool.close();
      }
    }
  }
};
