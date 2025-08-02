const sql = require('mssql');
const config = require('../dbConfig');

module.exports = {
  async getPoints(userId) {
    const pool = await new sql.ConnectionPool(config).connect();
    try {
      const result = await pool.request()
        .input('user_id', sql.Int, userId)
        .query('SELECT points FROM user_points WHERE user_id = @user_id');
      return result.recordset[0]?.points ?? 0;
    } finally {
      await pool.close();
    }
  },

  async addPoints(userId, delta) {
    const pool = await new sql.ConnectionPool(config).connect();
    try {
      await pool.request()
        .input('user_id', sql.Int, userId)
        .input('delta',   sql.Int, delta)
        .query(
          `UPDATE user_points
             SET points = points + @delta,
                 updated_at = GETDATE()
           WHERE user_id = @user_id;
           IF @@ROWCOUNT = 0
             INSERT INTO user_points(user_id, points)
             VALUES(@user_id, @delta);`
        );
    } finally {
      await pool.close();
    }
  },

  async deductPoints(userId, amount, trx) {
    if (trx) {
      await trx.request()
        .input('user_id', sql.Int, userId)
        .input('amt',     sql.Int, amount)
        .query(
          `UPDATE user_points
              SET points = points - @amt,
                  updated_at = GETDATE()
            WHERE user_id = @user_id
              AND points >= @amt;
           IF @@ROWCOUNT = 0
             THROW 51000, 'Insufficient points', 1;`
        );
    } else {
      const pool = await new sql.ConnectionPool(config).connect();
      try {
        await pool.request()
          .input('user_id', sql.Int, userId)
          .input('amt',     sql.Int, amount)
          .query(
            `UPDATE user_points
                SET points = points - @amt,
                    updated_at = GETDATE()
              WHERE user_id = @user_id
                AND points >= @amt;
             IF @@ROWCOUNT = 0
               THROW 51000, 'Insufficient points', 1;`
          );
      } finally {
        await pool.close();
      }
    }
  }
};
