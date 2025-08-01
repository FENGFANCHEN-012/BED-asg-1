// models/caloriesmodel.js
const sql = require('mssql');
const dbConfig = require("../dbConfig");

async function getTodayCalories(userId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    request.input('userId', sql.Int, userId);

    const query = `
      SELECT SUM(total_calories) AS total_calories
      FROM daily_calorie_intake
      WHERE user_id = @userId AND date = CAST(GETDATE() AS DATE);
    `;
    const result = await request.query(query);
    return result.recordset[0];
  } catch (error) {
    console.error("Error in caloriesModel.getTodayCalories:", error);
    throw error;
  } finally {
    if (connection) connection.close();
  }
}

async function getUserAge(userId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    request.input('userId', sql.Int, userId);

    const query = 'SELECT age FROM Profiles WHERE user_id = @userId'; // Assuming age is in Profiles table
    const result = await request.query(query);
    return result.recordset[0]?.age || 0;
  } catch (error) {
    console.error("Error in caloriesModel.getUserAge:", error);
    throw error;
  } finally {
    if (connection) connection.close();
  }
}

async function getRecommendedCaloriesByAge(age) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    request.input('age', sql.Int, age);

    const query = `
      SELECT recommended_calories
      FROM recommended_calories
      WHERE @age BETWEEN age_min AND age_max;
    `;
    const result = await request.query(query);
    return result.recordset[0]?.recommended_calories || 0;
  } catch (error) {
    console.error("Error in caloriesModel.getRecommendedCaloriesByAge:", error);
    throw error;
  } finally {
    if (connection) connection.close();
  }
}

async function getDailyHistory(userId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    request.input('userId', sql.Int, userId);

    const query = `
      SELECT intake_id AS id, time, food_name, total_calories
      FROM daily_calorie_intake
      JOIN food_items ON daily_calorie_intake.food_id = food_items.food_id
      WHERE user_id = @userId AND date = CAST(GETDATE() AS DATE)
      ORDER BY time;
    `;
    const result = await request.query(query);
    return result.recordset;
  } catch (error) {
    console.error("Error in caloriesModel.getDailyHistory:", error);
    throw error;
  } finally {
    if (connection) connection.close();
  }
}

async function searchFoodItems(query) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    request.input('q', sql.NVarChar, `%${query}%`);

    const sqlQuery = `
      SELECT TOP 5 food_id, food_name, calories_per_unit
      FROM food_items
      WHERE food_name LIKE @q;
    `;
    const result = await request.query(sqlQuery);
    return result.recordset;
  } catch (error) {
    console.error("Error in caloriesModel.searchFoodItems:", error);
    throw error;
  } finally {
    if (connection) connection.close();
  }
}

async function getCaloriesPerUnit(foodId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    request.input('food_id', sql.Int, foodId);

    const query = 'SELECT calories_per_unit FROM food_items WHERE food_id = @food_id';
    const result = await request.query(query);
    return result.recordset[0]?.calories_per_unit || null;
  } catch (error) {
    console.error("Error in caloriesModel.getCaloriesPerUnit:", error);
    throw error;
  } finally {
    if (connection) connection.close();
  }
}

async function addFoodEntry(entryData) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    request.input('user_id', sql.Int, entryData.user_id);
    request.input('meal_type', sql.NVarChar, entryData.meal_type);
    request.input('food_id', sql.Int, entryData.food_id);
    request.input('quantity', sql.Int, entryData.quantity);
    request.input('total_calories', sql.Int, entryData.total_calories);
    request.input('time', sql.NVarChar(8), entryData.time);

    const query = `
      INSERT INTO daily_calorie_intake
      (user_id, date, meal_type, food_id, quantity, total_calories, time)
      VALUES (@user_id, CAST(GETDATE() AS DATE), @meal_type, @food_id, @quantity, @total_calories, @time);
    `;
    const result = await request.query(query);
    return result.rowsAffected[0] > 0;
  } catch (error) {
    console.error("Error in caloriesModel.addFoodEntry:", error);
    throw error;
  } finally {
    if (connection) connection.close();
  }
}

async function deleteEntry(entryId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    request.input('id', sql.Int, entryId);

    const query = 'DELETE FROM daily_calorie_intake WHERE intake_id = @id;';
    const result = await request.query(query);
    return result.rowsAffected[0] > 0;
  } catch (error) {
    console.error("Error in caloriesModel.deleteEntry:", error);
    throw error;
  } finally {
    if (connection) connection.close();
  }
}

async function updateEntryTime(entryId, newTime) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    request.input('id', sql.Int, entryId);
    request.input('time', sql.NVarChar(8), newTime);

    const query = 'UPDATE daily_calorie_intake SET time = @time WHERE intake_id = @id;';
    const result = await request.query(query);
    return result.rowsAffected[0] > 0;
  } catch (error) {
    console.error("Error in caloriesModel.updateEntryTime:", error);
    throw error;
  } finally {
    if (connection) connection.close();
  }
}

async function getRecommendedFood(maxCalories) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    request.input('max', sql.Int, maxCalories);

    const query = `
      SELECT TOP 5 food_name, calories_per_unit
      FROM food_items
      WHERE calories_per_unit <= @max
      ORDER BY calories_per_unit DESC;
    `;
    const result = await request.query(query);
    return result.recordset;
  } catch (error) {
    console.error("Error in caloriesModel.getRecommendedFood:", error);
    throw error;
  } finally {
    if (connection) connection.close();
  }
}

module.exports = {
  getTodayCalories,
  getUserAge,
  getRecommendedCaloriesByAge,
  getDailyHistory,
  searchFoodItems,
  getCaloriesPerUnit,
  addFoodEntry,
  deleteEntry,
  updateEntryTime,
  getRecommendedFood
};
