// models/video_watch_model.js
const sql    = require('mssql');
const config = require('../dbConfig');

module.exports = {
  // has the user already watched this task?
  async hasWatched(userId, taskId) {
    const pool = await new sql.ConnectionPool(config).connect();
    try {
      const r = await pool.request()
        .input('user_id', sql.Int, userId)
        .input('task_id', sql.Int, taskId)
        .query(`
          SELECT 1
            FROM video_watches
           WHERE user_id = @user_id
             AND task_id = @task_id
        `);
      return r.recordset.length > 0;
    } finally {
      await pool.close();
    }
  },

  // fetch list of task_ids the user has watched
  async getWatchedTasks(userId) {
    const pool = await new sql.ConnectionPool(config).connect();
    try {
      const r = await pool.request()
        .input('user_id', sql.Int, userId)
        .query(`
          SELECT task_id
            FROM video_watches
           WHERE user_id = @user_id
        `);
      return r.recordset;  // array of { task_id }
    } finally {
      await pool.close();
    }
  },

  // record a new watch (no transaction)
  async recordWatch(userId, taskId) {
    const pool = await new sql.ConnectionPool(config).connect();
    try {
      await pool.request()
        .input('user_id', sql.Int, userId)
        .input('task_id', sql.Int, taskId)
        .query(`
          INSERT INTO video_watches(user_id, task_id)
          VALUES(@user_id, @task_id)
        `);
    } finally {
      await pool.close();
    }
  }
};
