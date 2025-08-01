const sql = require('mssql');
const dbConfig = require('../../dbConfig');

async function getFriend(userId) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT 
  u.user_id, 
  p.name, 
  p.hobbies, 

 
  uf.nick_name,  
  
  p.description AS profile_description
FROM UserFriends uf
JOIN Users u ON uf.friend_id = u.user_id
JOIN Profiles p ON u.user_id = p.user_id
WHERE uf.user_id = @userId AND uf.status = 'accepted'
      `);
    return result.recordset;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
}

  async function  addFriend(userId, friendId) {
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            
       
            const checkQuery = `
                SELECT 1 FROM UserFriends 
                WHERE (user_id = @userId AND friend_id = @friendId)
                OR (user_id = @friendId AND friend_id = @userId)
            `;
            const checkResult = await connection.request()
                .input('userId', sql.Int, userId)
                .input('friendId', sql.Int, friendId)
                .query(checkQuery);
            
            if (checkResult.recordset.length > 0) {
                throw new Error('You are already friends');
            }
            
            
            const transaction = new sql.Transaction(connection);
            await transaction.begin();
            
            try {
                const request = new sql.Request(transaction);
                
           
                await request.input('userId', sql.Int, userId)
                    .input('friendId', sql.Int, friendId)
                    .query(`
                        INSERT INTO UserFriends (user_id, friend_id, status)
                        VALUES (@userId, @friendId, 'accepted')
                    `);
                
              
                await request.input('userId', sql.Int, friendId)
                    .input('friendId', sql.Int, userId)
                    .query(`
                        INSERT INTO UserFriends (user_id, friend_id, status)
                        VALUES (@userId, @friendId, 'accepted')
                    `);
                
                await transaction.commit();
                return true;
            } catch (err) {
                await transaction.rollback();
                throw err;
            }
        } catch (error) {
            console.error('Error in addFriendDirectly:', error);
            throw error;
        } finally {
            if (connection) await connection.close();
        }
    
    }
async function addFriendDirectly(userId, friendId) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        

        const checkQuery = `
            SELECT status FROM UserFriends 
            WHERE (user_id = @userId AND friend_id = @friendId)
            OR (user_id = @friendId AND friend_id = @userId)
        `;
        const checkResult = await connection.request()
            .input('userId', sql.Int, userId)
            .input('friendId', sql.Int, friendId)
            .query(checkQuery);
        
        if (checkResult.recordset.length > 0) {
            return { alreadyFriends: true, status: checkResult.recordset[0].status };
        }
        
     
        const transaction = new sql.Transaction(connection);
        await transaction.begin();
        
        try {
            const request = new sql.Request(transaction);
            
         
            await request.input('userId1', sql.Int, userId)
                       .input('friendId1', sql.Int, friendId)
                       .query(`
                           INSERT INTO UserFriends (user_id, friend_id, status)
                           VALUES (@userId1, @friendId1, 'accepted')
                       `);
            
            await request.input('userId2', sql.Int, friendId)
                       .input('friendId2', sql.Int, userId)
                       .query(`
                           INSERT INTO UserFriends (user_id, friend_id, status)
                           VALUES (@userId2, @friendId2, 'accepted')
                       `);
            
            await transaction.commit();
            return { success: true };
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (error) {
        console.error('Database error:', error);
        throw error;
    } finally {
        if (connection) await connection.close();
    }
}
async function removeFriend(userId, friendId) {
  const pool = await sql.connect(dbConfig);
  const request = pool.request();
  
  request.input('userId', sql.Int, userId);
  request.input('friendId', sql.Int, friendId);
  
  const result = await request.query(`
    DELETE FROM UserFriends 
    WHERE (user_id = @userId AND friend_id = @friendId)
    OR (user_id = @friendId AND friend_id = @userId);
    SELECT @@ROWCOUNT as rowsAffected;
  `);
  
  return result.recordset[0].rowsAffected > 0;
}



async function getFriendInfo(userId, friendId) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .input('friendId', sql.Int, friendId)
      
      .query(`
        SELECT nick_name, description
        FROM  UserFriends
        WHERE user_id = @userId AND friend_id = @friendId
      `);
    return result.recordset[0];
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
}


async function updateFriendInfo(userId, friendId, nick_name, description) {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input('userId', sql.Int, userId)
      .input('friendId', sql.Int, friendId)
      .input('nick_name', sql.NVarChar, nick_name)
      .input('description', sql.NVarChar, description)
      .query(`
        UPDATE UserFriends
        SET nick_name = @nick_name, description = @description
        WHERE user_id = @userId AND friend_id = @friendId
      `);
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
}





module.exports = {
  getFriend,addFriend,addFriendDirectly,
  removeFriend,updateFriendInfo,getFriendInfo,
};