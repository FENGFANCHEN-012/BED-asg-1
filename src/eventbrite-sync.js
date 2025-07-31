require('dotenv').config();
const { getDBConnection } = require('./config/db');
const { fetchEvents } = require('./services/eventbrite');

async function syncEvents() {
  let pool;
  try {
    
    pool = await getDBConnection();


    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'events')
      CREATE TABLE events (
        id NVARCHAR(255) PRIMARY KEY,
        name NVARCHAR(MAX),
        description NVARCHAR(MAX),
        start DATETIME,
        [end] DATETIME,
        url NVARCHAR(255)
      )
    `);

   
    const events = await fetchEvents();

   
    for (const event of events) {
      await pool.request()
        .input('id', sql.NVarChar, event.id)
        .input('name', sql.NVarChar, event.name.text)
        .input('description', sql.NVarChar, event.description.text || '')
        .input('start', sql.DateTime, new Date(event.start.utc))
        .input('end', sql.DateTime, new Date(event.end.utc))
        .input('url', sql.NVarChar, event.url)
        .query(`
          MERGE INTO events AS target
          USING (SELECT @id AS id, @name AS name, @description AS description, @start AS start, @end AS [end], @url AS url) AS source
          ON target.id = source.id
          WHEN MATCHED THEN
            UPDATE SET name = source.name, description = source.description, start = source.start, [end] = source.[end], url = source.url
          WHEN NOT MATCHED THEN
            INSERT (id, name, description, start, [end], url)
            VALUES (source.id, source.name, source.description, source.start, source.[end], source.url);
        `);
      console.log(`Stored event: ${event.name.text}`);
    }

    console.log('Events synced successfully');
  } catch (error) {
    console.error('Error in syncEvents:', error.message);
  } finally {
    if (pool) await pool.close();
    console.log('MSSQL connection closed');
  }
}

module.exports = { syncEvents };