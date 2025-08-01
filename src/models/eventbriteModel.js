const sql = require('mssql');
const { getDBConnection } = require('../config/db');

async function syncEvents(events) {
  let pool;
  try {
    pool = await getDBConnection();
    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    try {
      for (const event of events) {
        await transaction.request()
          .input('id', sql.NVarChar, event.id)
          .input('name', sql.NVarChar, event.name.text)
          .input('description', sql.NVarChar, event.description.text || '')
          .input('start', sql.DateTime, new Date(event.start.utc))
          .input('end', sql.DateTime, new Date(event.end.utc))
          .input('url', sql.NVarChar, event.url)
          .input('status', sql.NVarChar, event.status || 'unknown')
          .query(`
            MERGE INTO eventbrite_events AS target
            USING (SELECT @id AS id, @name AS name, @description AS description, @start AS start, @end AS [end], @url AS url, @status AS status) AS source
            ON target.id = source.id
            WHEN MATCHED THEN
              UPDATE SET name = source.name, description = source.description, start = source.start, [end] = source.[end], url = source.url, status = source.status
            WHEN NOT MATCHED THEN
              INSERT (id, name, description, start, [end], url, status)
              VALUES (source.id, source.name, source.description, source.start, source.[end], source.url, source.status);
          `);
        console.log(`存储事件：${event.name.text} (状态：${event.status})`);
      }
      await transaction.commit();
      console.log(`同步 ${events.length} 个事件到数据库`);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('数据库同步错误：', error.message);
    throw error;
  } finally {
    if (pool) await pool.close();
    console.log('MSSQL 连接已关闭');
  }
}

module.exports = { 
  syncEvents };