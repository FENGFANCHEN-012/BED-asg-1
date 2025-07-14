const sql = require('mssql');
const dbConfig = require('../dbConfig');


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




async function createGroup(name, owner_id, description, is_public) {
    let pool;
    try {
        pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('name', sql.NVarChar(100), name)
            .input('owner_id', sql.Int, owner_id)
            .input('description', sql.NVarChar(500), description || null)
            .input('is_public', sql.Bit, is_public)
            .query(`
                INSERT INTO Groups (name, owner_id, description, is_public)
                OUTPUT INSERTED.*
                VALUES (@name, @owner_id, @description, @is_public)
            `);
        
        // Add owner as member
        await pool.request()
            .input('group_id', sql.Int, result.recordset[0].group_id)
            .input('user_id', sql.Int, owner_id)
            .input('role', sql.VarChar(10), 'owner')
            .query(`
                INSERT INTO GroupMembers (group_id, user_id, role)
                VALUES (@group_id, @user_id, @role)
            `);
            
        return result.recordset[0];
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

// Add other model functions
module.exports = {
    getUserGroups,
    createGroup,
    getGroupDetails,
   
};
