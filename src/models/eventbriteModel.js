//////// correct version


const sql = require('mssql');
const dbConfig = require('../../dbConfig');

let pool;

async function initializePool() {
  try {
    if (!pool) {
      pool = new sql.ConnectionPool(dbConfig);
      await pool.connect();
      console.log('Database connection pool initialized');
    }
    return pool;
  } catch (error) {
    console.error('Failed to initialize database pool:', error);
    throw error;
  }
}

async function initializeDatabase() {
  const pool = await initializePool();
  
  try {
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Event' AND xtype='U')
      BEGIN
        CREATE TABLE Event (
          event_id INT IDENTITY(1,1) PRIMARY KEY,
          external_id VARCHAR(255) UNIQUE,
          name VARCHAR(255) NOT NULL,
          location VARCHAR(255),
          time DATETIME,
          description TEXT,
          image NVARCHAR(MAX),
          start DATETIME NOT NULL,
          [end] DATETIME NOT NULL,
          url NVARCHAR(255),
          status NVARCHAR(50) NOT NULL,
          fee VARCHAR(50),
          type VARCHAR(100)
        );
      END
    `);
    console.log('Database table initialized or verified');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

/**
 * Sync events to the database, ignoring duplicates based on external_id
 */
async function syncEvents(events) {
  const pool = await initializePool();
  
  try {
    await initializeDatabase();

    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    console.log('Transaction begun');

    try {
      let insertedCount = 0;
      let updatedCount = 0;
      for (const event of events) {
        console.log(`Processing event with external_id: ${event.external_id}, start: ${event.start}, end: ${event.end}`);
        const request = new sql.Request(transaction);
        
        const startDate = new Date(event.start);
        const endDate = new Date(event.end);
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          console.warn(`Invalid date for event ${event.external_id}: start=${event.start}, end=${event.end}, skipping...`);
          continue;
        }

        await request
          .input('external_id', sql.VarChar, event.external_id)
          .input('name', sql.VarChar, event.name)
          .input('location', sql.VarChar, event.location)
          .input('time', sql.DateTime, event.time ? new Date(event.time) : null)
          .input('description', sql.Text, event.description)
          .input('image', sql.NVarChar(sql.MAX), event.image)
          .input('start', sql.DateTime, startDate)
          .input('end', sql.DateTime, endDate)
          .input('url', sql.NVarChar, event.url)
          .input('status', sql.NVarChar, event.status)
          .input('fee', sql.VarChar, event.fee)
          .input('type', sql.VarChar, event.type)
          .query(`
            MERGE INTO Event AS target
            USING (SELECT @external_id AS external_id, @name AS name, @location AS location, @time AS time, @description AS description, 
                          @image AS image, @start AS start, @end AS [end], @url AS url, @status AS status, @fee AS fee, @type AS type) AS source
            ON target.external_id = source.external_id
            WHEN MATCHED THEN
              UPDATE SET 
                name = source.name,
                location = source.location,
                time = source.time,
                description = source.description,
                image = source.image,
                start = source.start,
                [end] = source.[end],
                url = source.url,
                status = source.status,
                fee = source.fee,
                type = source.type
            WHEN NOT MATCHED THEN
              INSERT (external_id, name, location, time, description, image, start, [end], url, status, fee, type)
              VALUES (source.external_id, source.name, source.location, source.time, source.description, source.image, 
                      source.start, source.[end], source.url, source.status, source.fee, source.type);
          `);

        const checkResult = await request.query('SELECT @@ROWCOUNT AS affectedRows');
        if (checkResult.recordset[0].affectedRows === 1) {
          insertedCount++;
          console.log(`Inserted/Updated event with external_id: ${event.external_id}`);
        }
      }
      await transaction.commit();
      console.log('Transaction committed');
      console.log(`Successfully synced ${insertedCount} events (total processed: ${events.length})`);
    } catch (error) {
      await transaction.rollback();
      console.error('Transaction error:', error.message, error.stack);
      throw error;
    }
  } catch (error) {
    console.error('Sync error:', error.message, error.stack);
    throw error;
  }
}

/**
 * Get all events from the database
 */
async function getAllEvents() {
  const pool = await initializePool();
  
  try {
    const result = await pool.request().query(`
      SELECT * FROM Event ORDER BY start DESC
    `);
    return result.recordset;
  } catch (error) {
    console.error('Get all events error:', error.message, error.stack);
    throw error;
  }
}

// Cleanup on process exit
process.on('SIGTERM', async () => {
  if (pool) {
    await pool.close();
    console.log('Database connection pool closed');
  }
  process.exit(0);
});

module.exports = {
  initializeDatabase,
  syncEvents,
  getAllEvents
};