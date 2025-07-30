const sql = require('mssql');
require('dotenv').config(); // Load environment variables

// Build the config manually to avoid depending on dbConfig.js
const rawConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  trustServerCertificate: true,
  options: {
    port: parseInt(process.env.DB_PORT),
    connectionTimeout: 60000,
  }
};

const config = {
  ...rawConfig,
  options: {
    ...rawConfig.options,
    trustServerCertificate: rawConfig.trustServerCertificate ?? true,
    encrypt: rawConfig.options?.encrypt ?? false,
  }
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('Connected to MSSQL (from model)');
    return pool;
  })
  .catch(err => {
    console.error('Database connection failed (from model):', err);
    throw err;
  });

/**
 * Get total calories consumed today for a user
 */
exports.getTodayCalories = async (userId) => {
  const pool = await poolPromise;

  const result = await pool.request()
    .input('userId', sql.Int, userId)
    .query(`
      SELECT SUM(total_calories) AS total_calories 
      FROM daily_calorie_intake 
      WHERE user_id = @userId AND date = CAST(GETDATE() AS DATE)
    `);

  return result.recordset[0];
};

/**
 * Delete a food entry by intake_id
 */
exports.deleteEntry = async (intakeId) => {
  const pool = await poolPromise;

  await pool.request()
    .input('intakeId', sql.Int, intakeId)
    .query('DELETE FROM daily_calorie_intake WHERE intake_id = @intakeId');
};

/**
 * Update the time of a food entry (24h format: HH:mm:ss)
 */
exports.updateEntryTime = async (intakeId, newTime) => {
  const pool = await poolPromise;

  await pool.request()
    .input('intakeId', sql.Int, intakeId)
    .input('newTime', sql.NVarChar(8), newTime)
    .query('UPDATE daily_calorie_intake SET time = @newTime WHERE intake_id = @intakeId');
};

/**
 * Get recommended food items below the remaining calorie limit
 */
exports.getRecommendedFood = async (remainingCalories) => {
  const pool = await poolPromise;

  const result = await pool.request()
    .input('remaining', sql.Int, remainingCalories)
    .query(`
      SELECT food_id, food_name, calories_per_unit 
      FROM food_items 
      WHERE calories_per_unit <= @remaining 
      ORDER BY calories_per_unit ASC
    `);

  return result.recordset;
};
