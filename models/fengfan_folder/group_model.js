const sql = require('mssql');
const dbConfig = require('../../dbConfig');


async function getUserGroups(user_id) {
    let pool;
    try {
        pool = await sql.connect(dbConfig);
        
        const query = `
            SELECT 
    g.group_id,
    g.name,
    g.description,
    g.photo_url,
    g.owner_id,
    g.create_date,
    g.member_count,
    g.is_public,
    gm.role,
    gm.join_date
FROM Groups g
JOIN GroupMembers gm ON g.group_id = gm.group_id
WHERE gm.user_id = @user_id
        `;
        
        const result = await pool.request()
            .input('user_id', sql.Int, user_id)
            .query(query);
            
        return result.recordset;
        
    } catch (error) {
        console.error("Database error in getUserGroups:", error);
        throw error;
    } finally {
        if (pool) await pool.close();
    }
}

async function createGroup({ name, description, owner_id, photo_url, is_public,member_count }) {


    function getCurrentDateTime() {
    const now = new Date();
    
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');  
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}
  let pool;
  try {
    pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('name', sql.NVarChar(100), name)
      .input('description', sql.NVarChar(500), description || null)
      .input('owner_id', sql.Int, owner_id)
      .input('photo_url', sql.NVarChar(sql.MAX), photo_url || null)
      .input('is_public', sql.Bit, is_public || 1)
      .input('create_date',sql.DATETIME2(0),getCurrentDateTime())
         .input('member_count',sql.INT,member_count)
      .query(`
        INSERT INTO Groups (name, description, owner_id, photo_url, is_public,member_count, create_date)
        VALUES (@name, @description, @owner_id, @photo_url, @is_public,@member_count, GETDATE());
        SELECT SCOPE_IDENTITY() as group_id;
      `);

    return result.recordset[0].group_id;
  } finally {
    if (pool) await pool.close();
  }
}
async function getGroupDetails(group_id) {
    let pool;
    try {
        pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('group_id', sql.Int, group_id)
            .query(`
                SELECT 
                    g.*,
                    (SELECT COUNT(*) FROM GroupMembers 
                     WHERE group_id = g.group_id AND is_active = 1) as member_count
                FROM Groups g
                WHERE g.group_id = @group_id
            `);
        return result.recordset[0] || null;
    } finally {
        if (pool) await pool.close();
    }
}

async function getGroupMember(group_id){
let connection
try{
    connection = await sql.connect(dbConfig)
    let request = connection.request();
  
    
    let query = `SELECT * from  GroupMembers  where group_id = @group_id`
      request.input("group_id",sql.Int,group_id)
      let result = await request.query(query)
    
    return result.recordset;
}
catch(error){
    console.error(error)
}
}
async function getMemberDetail(user_id){
    let connection
try{
    connection = await sql.connect(dbConfig)
    let request = connection.request();
  
    
    let query = `SELECT 
    Users.user_id,
    Users.username,
    Users.email,
    Profiles.name,
    Profiles.age,
    Profiles.hobbies,
    Profiles.profile_picture,
    Profiles.description
FROM GroupMembers
INNER JOIN Users ON GroupMembers.user_id = Users.user_id
INNER JOIN Profiles ON Users.user_id = Profiles.user_id
WHERE Users.user_id = @user_id

`
      request.input("user_id",sql.Int,user_id)
       
      let result = await request.query(query)
    
    return result.recordset[0];
}
catch(error){
    console.error(error)
}
}
async function getGroupMemberProfiles(group_id) {
    let pool;
    try {
        pool = await sql.connect(dbConfig);
        const request = pool.request().input("group_id", sql.Int, group_id);

        const result = await request.query(`
            SELECT 
                u.user_id,
                u.username,
                p.name,
                p.age,
                p.profile_picture,
                p.description,
                gm.role,
                gm.join_date
            FROM GroupMembers gm
            JOIN Users u ON gm.user_id = u.user_id
            JOIN Profiles p ON u.user_id = p.user_id
            WHERE gm.group_id = @group_id
        `);

        return result.recordset;
    } catch (error) {
        console.error("Error in getGroupMemberProfiles:", error);
        throw error;
    } finally {
        if (pool) await pool.close();
    }
}

async function updateGroup(group_id, name, description, photo_url) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("group_id", sql.Int, group_id)
      .input("name", sql.NVarChar(100), name)
      .input("description", sql.NVarChar(500), description)
      .input("photo_url", sql.NVarChar(sql.MAX), photo_url)
      .query(`
        UPDATE Groups
        SET name = @name, description = @description, photo_url = @photo_url
        WHERE group_id = @group_id
      `);

    return result.rowsAffected[0] > 0;
  } catch (err) {
    throw err;
  }
}

async function deleteGroup(groupId) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const transaction = new sql.Transaction(connection);
        await transaction.begin();
        
        try {
            const request = new sql.Request(transaction);
            
            // 使用模板字符串直接嵌入值（不推荐用于生产环境）
            await request.query(`DELETE FROM GroupChats WHERE group_id = ${groupId}`);
            await request.query(`DELETE FROM GroupMembers WHERE group_id = ${groupId}`);
            await request.query(`DELETE FROM GroupAnnouncements WHERE group_id = ${groupId}`);
            await request.query(`DELETE FROM Groups WHERE group_id = ${groupId}`);
            
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
async  function  getgroupById(group_id){
    let pool;
    try {
        pool = await sql.connect(dbConfig);
        const request = pool.request().input("group_id", sql.Int, group_id);

        const result = await request.query(`
            SELECT 
               * from Groups WHERE group_id = @group_id
        `);

        return result.recordset;
    } catch (error) {
        console.error("We can't get group detail for you", error);
        throw error;
    } finally {
        if (pool) await pool.close();
    }
}
  
async function addGroupOwner(group_id,user_id,role){
let pool;
  try {
    pool = await sql.connect(dbConfig);
    
   
    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    
    try {
      const request = new sql.Request(transaction);
      const result = await request
        .input('group_id', sql.Int, group_id)
        .input('user_id', sql.Int, user_id)
             .input('role', sql.VarChar(10), role)
        .query(`
          INSERT INTO GroupMembers (group_id, user_id, role)
          VALUES (@group_id, @user_id, @role)
        `);
      
      await transaction.commit();
      return true;
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (error) {
    console.error('Database error in addGroupMember:', {
      group_id,
      user_id,
      error: error.message,
      code: error.code
    });
    throw error;
  } finally {
    if (pool) await pool.close();
  }
}

async function addGroupMember( group_id, user_id, role ) {
  let pool;
  try {
 
    group_id = parseInt(group_id);
    user_id = parseInt(user_id);
    
    if (isNaN(group_id)) throw new Error(`Invalid group_id: ${group_id} (type: ${typeof group_id})`);
    if (isNaN(user_id))throw new Error(`Invalid user_id: ${user_id}`);

    pool = await sql.connect(dbConfig);
    
    
    const request = pool.request()
      .input('group_id', sql.Int, group_id)
      .input('user_id', sql.Int, user_id)
      .input('role', sql.VarChar(10), role);

    await request.query(`
      INSERT INTO GroupMembers (group_id, user_id, role)
      VALUES (@group_id, @user_id, @role)
    `);
    
    return true;
  } catch (error) {
    console.error('Database Error Details:', {
      inputParams: { group_id, user_id, role },
      dbError: error.message,
      stack: error.stack
    });
    throw error;
  } finally {
    if (pool) await pool.close();
  }
}

async function checkUserExists(user_id) {
  let pool;
  try {
    pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('user_id', sql.Int, user_id)
      .query('SELECT 1 FROM Users WHERE user_id = @user_id');
    return result.recordset.length > 0;
  } finally {
    if (pool) await pool.close();
  }
}

async function checkGroupMember(group_id, user_id) {
  let pool;
  try {
    pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('group_id', sql.Int, group_id)
      .input('user_id', sql.Int, user_id)
      .query('SELECT 1 FROM GroupMembers WHERE group_id = @group_id AND user_id = @user_id');
    return result.recordset.length > 0;
  } finally {
    if (pool) await pool.close();
  }
}
// Add other model functions
module.exports = {
    getUserGroups,
   
    getGroupDetails,
    getGroupMember,
    getMemberDetail,
    updateGroup,
    getGroupMemberProfiles,
    deleteGroup,
    getgroupById,
    createGroup,
    addGroupMember,
    addGroupOwner,
    checkUserExists,
    checkGroupMember,
   
   
};