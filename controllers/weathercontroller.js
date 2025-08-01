const sql = require('mssql');
require('dotenv').config();
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
console.log('Loaded DB config:', rawConfig);

// Patch the config structure for mssql
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
 * Save a new weather alert preference
 * Body: { user_id, weather_type, alert_time }
 */
exports.saveAlertPreference = async (req, res) => {
  const { user_id, weather_type, alert_time } = req.body;

  if (!user_id || !weather_type || !alert_time) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const pool = await poolPromise;

    await pool.request()
      .input('user_id', sql.Int, user_id)
      .input('weather_type', sql.VarChar, weather_type)
      .input('alert_time', sql.Int, alert_time)
      .query(`
        INSERT INTO WeatherAlerts (user_id, weather_type, alert_time)
        VALUES (@user_id, @weather_type, @alert_time)
      `);

    res.status(200).json({ message: 'Alert preference saved successfully' });
  } catch (err) {
    console.error('Error saving alert preference:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get all alerts for a specific user
 * Query param: ?user_id=1
 */
exports.getUserAlerts = async (req, res) => {
  const userId = parseInt(req.query.user_id);

  if (!userId) {
    return res.status(400).json({ error: 'Missing user_id in query' });
  }

  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input('user_id', sql.Int, userId)
      .query(`
        SELECT id, weather_type, alert_time, created_at
        FROM WeatherAlerts
        WHERE user_id = @user_id
        ORDER BY created_at DESC
      `);

    const formatted = result.recordset.map(alert => {
      const storedTime = new Date(alert.created_at);
      const correctedTime = new Date(storedTime.getTime() - 8 * 60 * 60 * 1000);
      const formattedTime = correctedTime.toLocaleString('en-SG', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      return { ...alert, created_at: formattedTime };
    });

    res.status(200).json(formatted);
  } catch (err) {
    console.error('Error fetching user alerts:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Delete a specific alert by its ID
 * Route param: /api/alerts/:id
 */
exports.deleteAlert = async (req, res) => {
  const alertId = parseInt(req.params.id);

  if (!alertId) {
    return res.status(400).json({ error: 'Missing or invalid alert ID' });
  }

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, alertId)
      .query(`DELETE FROM WeatherAlerts WHERE id = @id`);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    res.status(200).json({ message: 'Alert deleted successfully' });
  } catch (err) {
    console.error('Error deleting alert:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Delete all alerts for a specific user
 * Query param: ?user_id=1
 */
exports.deleteAllUserAlerts = async (req, res) => {
  const userId = parseInt(req.query.user_id);

  if (!userId) {
    return res.status(400).json({ error: 'Missing user_id' });
  }

  try {
    const pool = await poolPromise;

    await pool.request()
      .input('user_id', sql.Int, userId)
      .query('DELETE FROM WeatherAlerts WHERE user_id = @user_id');

    res.status(200).json({ message: 'All alerts deleted successfully.' });
  } catch (err) {
    console.error('Error deleting all alerts:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
