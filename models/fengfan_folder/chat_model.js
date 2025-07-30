const sql = require('mssql');
const dbConfig = require('../../dbConfig');

async function getChatHistory(sender_id, receiver_id) {
  let connection;
  try {
    // Await the connection to the database
    connection = await sql.connect(dbConfig);

    const query = `
      SELECT sender_id, receiver_id, message, sent_at
      FROM PrivateChats
      WHERE (sender_id = @sender_id AND receiver_id = @receiver_id)
         OR (sender_id = @receiver_id AND receiver_id = @sender_id)
      ORDER BY sent_at;
    `;

    // Send the query to the database
    const result = await connection.request()
      .input('sender_id', sql.Int, sender_id)
      .input('receiver_id', sql.Int, receiver_id)
      .query(query);
    
    return result.recordset; // Return the chat history
  } catch (error) {
    console.log('Error fetching chat history:', error);
    throw new Error('Failed to fetch chat history'); // Rethrow for proper handling
  } finally {
    // Close the connection when done
    if (connection) {
      await connection.close();
    }
  }
}

async function sendMessage(sender_id, receiver_id, message) {
  let connection;
  try {
    // Await the connection to the database
    connection = await sql.connect(dbConfig);

    const query = `
      INSERT INTO PrivateChats (sender_id, receiver_id, message)
      VALUES (@sender_id, @receiver_id, @message);
    `;

    // Send the query to the database
    await connection.request()
      .input('sender_id', sql.Int, sender_id)
      .input('receiver_id', sql.Int, receiver_id)
      .input('message', sql.NVarChar, message)
      .query(query);

  } catch (error) {
    console.log('Error sending message:', error);
    throw new Error('Failed to send message'); // Rethrow for proper handling
  } finally {
    // Close the connection when done
    if (connection) {
      await connection.close();
    }
  }
}

module.exports = {
  getChatHistory,
  sendMessage
};
