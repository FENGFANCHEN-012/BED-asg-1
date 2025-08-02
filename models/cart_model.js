const sql = require('mssql');
const config = require('../dbConfig');

module.exports = {
  async getCart(userId) {
    const pool = await new sql.ConnectionPool(config).connect();
    try {
      const r = await pool.request()
        .input('user_id', sql.Int, userId)
        .query(`
          SELECT vc.cart_id, vc.voucher_id, vc.quantity, v.title, v.cost_points
          FROM voucher_cart vc
          JOIN vouchers v ON vc.voucher_id = v.voucher_id
          WHERE vc.user_id = @user_id
        `);
      return r.recordset;
    } finally {
      await pool.close();
    }
  },

  async addItem(userId, voucherId, quantity = 1) {
    const pool = await new sql.ConnectionPool(config).connect();
    try {
      await pool.request()
        .input('user_id',    sql.Int, userId)
        .input('voucher_id', sql.Int, voucherId)
        .input('qty',        sql.Int, quantity)
        .query(
          `INSERT INTO voucher_cart(user_id, voucher_id, quantity)
           VALUES(@user_id, @voucher_id, @qty)`
        );
    } finally {
      await pool.close();
    }
  },

  async updateItem(cartId, quantity) {
    const pool = await new sql.ConnectionPool(config).connect();
    try {
      await pool.request()
        .input('cart_id', sql.Int, cartId)
        .input('qty',     sql.Int, quantity)
        .query(
          `UPDATE voucher_cart
           SET quantity = @qty
           WHERE cart_id = @cart_id`
        );
    } finally {
      await pool.close();
    }
  },

  async removeItem(cartId) {
    const pool = await new sql.ConnectionPool(config).connect();
    try {
      await pool.request()
        .input('cart_id', sql.Int, cartId)
        .query('DELETE FROM voucher_cart WHERE cart_id = @cart_id');
    } finally {
      await pool.close();
    }
  },

  async clearCart(userId, trx) {
    if (trx) {
      await trx.request()
        .input('user_id', sql.Int, userId)
        .query('DELETE FROM voucher_cart WHERE user_id = @user_id');
    } else {
      const pool = await new sql.ConnectionPool(config).connect();
      try {
        await pool.request()
          .input('user_id', sql.Int, userId)
          .query('DELETE FROM voucher_cart WHERE user_id = @user_id');
      } finally {
        await pool.close();
      }
    }
  }
};