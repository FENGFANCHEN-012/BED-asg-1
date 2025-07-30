const sql = require('mssql');
const dbConfig = require('../../dbConfig');

async function getMessagesByUserId(user_id) {
    let connection;
    try {
        // Await the connection to the database
        connection = await sql.connect(dbConfig);

        const query = `
            SELECT mail_box_id, user_id, message, receive_date
            FROM MailBox
            WHERE user_id = @user_id
            ORDER BY receive_date DESC;
        `;

        // Send the query to the database
        const result = await connection.request()
            .input('user_id', sql.Int, user_id)
            .query(query);

        return result.recordset; // Return the messages
    } catch (error) {
        console.log('Error fetching mailbox messages:', error);
        throw new Error('Failed to fetch mailbox messages'); // Rethrow for proper handling
    } finally {
        // Close the connection when done
        if (connection) {
            await connection.close();
        }
    }
}


async function sendMessagesToUsers(user_ids, message) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const query = `
            INSERT INTO MailBox (user_id, message, receive_date)
            VALUES (@user_id, @message, GETDATE());
        `;
        for (const user_id of user_ids) {
            await connection.request()
                .input('user_id', sql.Int, user_id)
                .input('message', sql.NVarChar, message)
                .query(query);
        }
    } catch (error) {
        console.log('Error sending mailbox messages:', error);
        throw new Error('Failed to send mailbox messages');
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}
module.exports = { getMessagesByUserId,sendMessagesToUsers};