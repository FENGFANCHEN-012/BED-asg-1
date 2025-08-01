require('dotenv').config();
const sql = require('mssql');
const { getDBConnection } = require('./config/db');
const { fetchMyEvents } = require('./services/eventbrite');

async function syncMyEvents() {
  let pool;
  try {
    pool = await getDBConnection();
    console.log('Connected to MSSQL');

    // Fetch events from Eventbrite
    console.log('Fetching events from Eventbrite...');
    const events = await fetchMyEvents();
    console.log(`Fetched ${events.length} events:`, events.map(e => ({ id: e.id, name: e.name?.text })));

    if (events.length === 0) {
      console.log('No events found, skipping sync');
      return;
    }

    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    try {
      let insertedCount = 0;
      let updatedCount = 0;

      for (const event of events) {
        // Validate required fields
        if (!event.id || !event.name?.text || !event.start?.utc || !event.end?.utc) {
          console.warn(`Skipping event due to missing fields: ${JSON.stringify(event)}`);
          continue;
        }

        console.log(`Processing event: ${event.name.text} (ID: ${event.id})`);
        const request = transaction.request()
          .input('id', sql.NVarChar, event.id)
          .input('name', sql.NVarChar, event.name.text)
          .input('description', sql.NVarChar, event.description?.text || '')
          .input('start', sql.DateTime, new Date(event.start.utc))
          .input('end', sql.DateTime, new Date(event.end.utc))
          .input('url', sql.NVarChar, event.url || null)
          .input('status', sql.NVarChar, event.status || 'unknown');

        // Execute MERGE and capture affected rows
        const result = await request.query(`
          MERGE INTO eventbrite_events AS target
          USING (SELECT @id AS id, @name AS name, @description AS description, @start AS start, @end AS [end], @url AS url, @status AS status) AS source
          ON target.id = source.id
          WHEN MATCHED THEN
            UPDATE SET 
              name = source.name, 
              description = source.description, 
              start = source.start, 
              [end] = source.[end], 
              url = source.url, 
              status = source.status
          WHEN NOT MATCHED THEN
            INSERT (id, name, description, start, [end], url, status)
            VALUES (source.id, source.name, source.description, source.start, source.[end], source.url, source.status);
          OUTPUT $action, inserted.id;
        `);

        const action = result.recordset[0]?.['$action'];
        const affectedId = result.recordset[0]?.['id'];
        if (action === 'INSERT') {
          insertedCount++;
          console.log(`Inserted event: ${event.name.text} (ID: ${affectedId})`);
        } else if (action === 'UPDATE') {
          updatedCount++;
          console.log(`Updated event: ${event.name.text} (ID: ${affectedId})`);
        } else {
          console.log(`No action for event: ${event.name.text} (ID: ${event.id})`);
        }
      }

      await transaction.commit();
      console.log(`Sync completed: ${insertedCount} inserted, ${updatedCount} updated, total ${events.length} events processed`);
    } catch (error) {
      await transaction.rollback();
      console.error('Transaction error:', error.message, error.stack);
      throw error;
    }
  } catch (error) {
    console.error('Error syncing my events:', error.message, error.stack);
  } finally {
    if (pool) await pool.close();
    console.log('MSSQL connection closed');
  }
}

if (require.main === module) {
  syncMyEvents().catch(console.error);
}

module.exports = { syncMyEvents };