const sql = require('mssql');
const dbConfig = require('../../dbConfig');

class GroupChatModel {
  async getGroupChatHistory(groupId) {
    let connection;
    try {
      connection = await sql.connect(dbConfig);
      const query = `
        SELECT 
          gc.chat_id,
          gc.group_id,
          gc.sender_id,
          u.username AS sender_name,
          p.name AS sender_display_name,
          p.profile_picture,
          gc.message,
          gc.sent_at
        FROM GroupChats gc
        JOIN Users u ON gc.sender_id = u.user_id
        LEFT JOIN Profiles p ON u.user_id = p.user_id
        WHERE gc.group_id = @groupId
        ORDER BY gc.sent_at ASC;
      `;
      const result = await connection.request()
        .input('groupId', sql.Int, groupId)
        .query(query);
      return result.recordset;
    } catch (error) {
      console.error('Error fetching group chat history:', error);
      throw new Error('Failed to fetch group chat history');
    } finally {
      if (connection) await connection.close();
    }
  }

  async sendGroupMessage(groupId, senderId, message) {
    let connection;
    try {
      connection = await sql.connect(dbConfig);

      // Validate group membership
      const membershipQuery = `
        SELECT 1
        FROM GroupMembers
        WHERE group_id = @groupId AND user_id = @senderId AND is_active = 1;
      `;
      const membershipResult = await connection.request()
        .input('groupId', sql.Int, groupId)
        .input('senderId', sql.Int, senderId)
        .query(membershipQuery);

      if (membershipResult.recordset.length === 0) {
        throw new Error('User is not an active member of this group');
      }

      const query = `
        INSERT INTO GroupChats (group_id, sender_id, message, sent_at)
        OUTPUT INSERTED.chat_id, INSERTED.group_id, INSERTED.sender_id, INSERTED.message, INSERTED.sent_at
        VALUES (@groupId, @senderId, @message, GETDATE());
      `;
      const result = await connection.request()
        .input('groupId', sql.Int, groupId)
        .input('senderId', sql.Int, senderId)
        .input('message', sql.NVarChar, message)
        .query(query);

      // Update group's last_activity
      await connection.request()
        .input('groupId', sql.Int, groupId)
        .query(`UPDATE Groups SET last_activity = GETDATE() WHERE group_id = @groupId`);

      return result.recordset[0];
    } catch (error) {
      console.error('Error sending group message:', error);
      throw new Error(error.message || 'Failed to send group message');
    } finally {
      if (connection) await connection.close();
    }
  }

  async getGroupInfo(groupId) {
    let connection;
    try {
      connection = await sql.connect(dbConfig);
      const query = `
        SELECT 
          g.group_id,
          g.name,
          g.description,
          g.photo_url,
          g.owner_id,
          u.username AS owner_name
        FROM Groups g
        JOIN Users u ON g.owner_id = u.user_id
        WHERE g.group_id = @groupId;
      `;
      const result = await connection.request()
        .input('groupId', sql.Int, groupId)
        .query(query);

      if (result.recordset.length === 0) {
        throw new Error('Group not found');
      }
      return result.recordset[0];
    } catch (error) {
      console.error('Error fetching group info:', error);
      throw new Error('Failed to fetch group info');
    } finally {
      if (connection) await connection.close();
    }
  }

  async getGroupMembers(groupId) {
    let connection;
    try {
      connection = await sql.connect(dbConfig);
      const query = `
        SELECT 
          gm.user_id,
          u.username,
          p.name AS display_name,
          p.profile_picture,
          gm.role
        FROM GroupMembers gm
        JOIN Users u ON gm.user_id = u.user_id
        LEFT JOIN Profiles p ON u.user_id = p.user_id
        WHERE gm.group_id = @groupId AND gm.is_active = 1;
      `;
      const result = await connection.request()
        .input('groupId', sql.Int, groupId)
        .query(query);
      return result.recordset;
    } catch (error) {
      console.error('Error fetching group members:', error);
      throw new Error('Failed to fetch group members');
    } finally {
      if (connection) await connection.close();
    }
  }
}

module.exports = new GroupChatModel();