// models/weatherModel.js
const sql = require('mssql');
const dbConfig = require("../dbConfig");

async function saveAlert(userId, weatherType, alertTime) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    request.input('user_id', sql.Int, userId);
    request.input('weather_type', sql.VarChar, weatherType);
    request.input('alert_time', sql.Int, alertTime);

    const query = `
      INSERT INTO WeatherAlerts (user_id, weather_type, alert_time)
      VALUES (@user_id, @weather_type, @alert_time);
    `;
    const result = await request.query(query);
    return result.rowsAffected[0] > 0;
  } catch (error) {
    console.error("Error in weatherModel.saveAlert:", error);
    throw error;
  } finally {
    if (connection) connection.close();
  }
}

async function getAlertsByUserId(userId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    request.input('user_id', sql.Int, userId);

    const query = `
      SELECT id, weather_type, alert_time, created_at
      FROM WeatherAlerts
      WHERE user_id = @user_id
      ORDER BY created_at DESC;
    `;
    const result = await request.query(query);
    return result.recordset;
  } catch (error) {
    console.error("Error in weatherModel.getAlertsByUserId:", error);
    throw error;
  } finally {
    if (connection) connection.close();
  }
}

async function deleteAlertById(alertId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    request.input('id', sql.Int, alertId);

    const query = `DELETE FROM WeatherAlerts WHERE id = @id;`;
    const result = await request.query(query);
    return result.rowsAffected[0] > 0;
  } catch (error) {
    console.error("Error in weatherModel.deleteAlertById:", error);
    throw error;
  } finally {
    if (connection) connection.close();
  }
}

async function deleteAllAlertsByUserId(userId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    request.input('user_id', sql.Int, userId);

    const query = `DELETE FROM WeatherAlerts WHERE user_id = @user_id;`;
    const result = await request.query(query);
    return result.rowsAffected[0] > 0;
  } catch (error) {
    console.error("Error in weatherModel.deleteAllAlertsByUserId:", error);
    throw error;
  } finally {
    if (connection) connection.close();
  }
}

module.exports = {
  saveAlert,
  getAlertsByUserId,
  deleteAlertById,
  deleteAllAlertsByUserId
};
