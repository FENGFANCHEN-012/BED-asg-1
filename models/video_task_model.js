// models/video_task_model.js
const sql    = require('mssql');
const config = require('../dbConfig');

module.exports = {
  async getAll() {
    const pool = await new sql.ConnectionPool(config).connect();
    try {
      const r = await pool.request()
        .query('SELECT * FROM video_tasks ORDER BY category, created_at');
      return r.recordset;
    } finally {
      await pool.close();
    }
  },

  async getById(taskId) {
    const pool = await new sql.ConnectionPool(config).connect();
    try {
      const r = await pool.request()
        .input('task_id', sql.Int, taskId)
        .query('SELECT * FROM video_tasks WHERE task_id = @task_id');
      return r.recordset[0];
    } finally {
      await pool.close();
    }
  }
};
