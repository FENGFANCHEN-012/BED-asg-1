const sql = require('mssql');
require('dotenv').config(); // Load .env before anything else
const model = require('../model/caloriesmodel.js');

// Build and patch the config manually
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
    console.log('Connected to MSSQL');
    return pool;
  })
  .catch(err => {
    console.error('Database connection failed:', err);
    throw err;
  });

/**
 * Get total calories for graph (with recommended calories)
 */
exports.getGraphData = async (req, res) => {
  const userId = req.query.user_id;
  if (!userId) return res.status(400).send('Missing user_id');

  try {
    const result = await model.getTodayCalories(userId);
    const totalCalories = result?.total_calories || 0;

    const pool = await poolPromise;

    const ageResult = await pool.request()
      .input('userId', sql.Int, userId)
      .query('SELECT age FROM users WHERE user_id = @userId');
    const age = ageResult.recordset[0]?.age || 0;

    const recResult = await pool.request()
      .input('age', sql.Int, age)
      .query(`
        SELECT recommended_calories 
        FROM recommended_calories 
        WHERE @age BETWEEN age_min AND age_max
      `);

    const recommended = recResult.recordset[0]?.recommended_calories || 0;

    res.json({ totalCalories, recommended });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching graph data');
  }
};

/**
 * Get today's calorie intake history 
 */
exports.getHistory = async (req, res) => {
  const userId = req.query.user_id;
  if (!userId) return res.status(400).send('Missing user_id');

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT intake_id AS id, time, food_name, total_calories
        FROM daily_calorie_intake
        JOIN food_items ON daily_calorie_intake.food_id = food_items.food_id
        WHERE user_id = @userId AND date = CAST(GETDATE() AS DATE)
        ORDER BY time
      `);

    const formattedResult = result.recordset.map(item => {
      let formattedTime = '00:00';

      if (typeof item.time === 'string') {
        formattedTime = item.time.substring(0, 5); // 'HH:mm'
      } else if (item.time instanceof Date) {
        formattedTime = item.time.toISOString().substring(11, 16); // 'HH:mm'
      }

      return { ...item, time: formattedTime };
    });

    res.json(formattedResult);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching history');
  }
};

/**
 * Search food items
 */
exports.searchFood = async (req, res) => {
  const q = req.query.q;
  if (!q) return res.json([]);

  try {
    const pool = await poolPromise;
    const qTrimmed = q.trim();

    const result = await pool.request()
      .input('q', sql.NVarChar, `%${qTrimmed}%`)
      .query(`
        SELECT TOP 5 food_id, food_name, calories_per_unit 
        FROM food_items 
        WHERE food_name LIKE @q
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error searching food');
  }
};

/**
 * Add food entry
 */
exports.addFoodEntry = async (req, res) => {
  const { user_id, meal_type, food_id, quantity, time } = req.body;

  if (!user_id || !meal_type || !food_id || !quantity || !time) {
    return res.status(400).send('Missing fields');
  }

  try {
    const pool = await poolPromise;

    const foodResult = await pool.request()
      .input('food_id', sql.Int, food_id)
      .query('SELECT calories_per_unit FROM food_items WHERE food_id = @food_id');

    const caloriesPerUnit = foodResult.recordset[0]?.calories_per_unit;
    if (!caloriesPerUnit) return res.status(404).send('Food not found');

    const totalCalories = caloriesPerUnit * quantity;
    const formattedTime = time.length === 5 ? `${time}:00` : time;

    await pool.request()
      .input('user_id', sql.Int, user_id)
      .input('meal_type', sql.NVarChar, meal_type)
      .input('food_id', sql.Int, food_id)
      .input('quantity', sql.Int, quantity)
      .input('total_calories', sql.Int, totalCalories)
      .input('time', sql.NVarChar(8), formattedTime)
      .query(`
        INSERT INTO daily_calorie_intake 
        (user_id, date, meal_type, food_id, quantity, total_calories, time)
        VALUES (@user_id, CAST(GETDATE() AS DATE), @meal_type, @food_id, @quantity, @total_calories, @time)
      `);

    res.send('Food entry added successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error adding food entry');
  }
};

/**
 * Delete entry by ID
 */
exports.deleteFoodEntry = async (req, res) => {
  const entryId = req.params.id;
  if (!entryId) return res.status(400).send('Missing entry ID');

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.Int, entryId)
      .query('DELETE FROM daily_calorie_intake WHERE intake_id = @id');

    res.send('Entry deleted');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting entry');
  }
};

/**
 * Update meal time
 */
exports.updateMealTime = async (req, res) => {
  const id = req.params.id;
  const { time } = req.body;

  if (!id || !time) {
    return res.status(400).send('Missing fields');
  }

  try {
    const formattedTime = time.length === 5 ? `${time}:00` : time;

    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.Int, id)
      .input('time', sql.NVarChar(8), formattedTime)
      .query('UPDATE daily_calorie_intake SET time = @time WHERE intake_id = @id');

    res.send('Time updated successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating time');
  }
};

/**
 * Get food recommendations
 */
exports.getRecommendedFoods = async (req, res) => {
  const maxCalories = parseInt(req.query.max);
  if (!maxCalories || maxCalories <= 0) return res.json([]);

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('max', sql.Int, maxCalories)
      .query(`
        SELECT TOP 5 food_name, calories_per_unit 
        FROM food_items 
        WHERE calories_per_unit <= @max
        ORDER BY calories_per_unit DESC
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching food recommendations');
  }
};
