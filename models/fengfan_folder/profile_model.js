const sql = require('mssql');
const dbConfig = require('../../dbConfig');


   
    async function getRecommendedProfiles(userId) {
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            
          
            const userHobbyQuery = `
                SELECT hobbies FROM Profiles WHERE user_id = @userId
            `;
            const userHobbyResult = await connection.request()
                .input('userId', sql.Int, userId)
                .query(userHobbyQuery);
            
            if (!userHobbyResult.recordset[0] || !userHobbyResult.recordset[0].hobbies) {
                return [];
            }
            
            const userHobbies = userHobbyResult.recordset[0].hobbies;
            
            
            const query = `
                SELECT 
                    p.user_id, 
                    p.name, 
                    p.hobbies, 
                    p.profile_picture,
                    p.description,
                    p.detail,
                    p.age,
                    p.hobby_description,
                    (
                        SELECT COUNT(*) 
                        FROM STRING_SPLIT(p.hobbies, ',') AS ph
                        WHERE EXISTS (
                            SELECT 1 FROM STRING_SPLIT(@userHobbies, ',') AS uh 
                            WHERE LTRIM(RTRIM(uh.value)) = LTRIM(RTRIM(ph.value))
                        )
                    ) AS match_score
                FROM Profiles p
                WHERE p.user_id != @userId
                ORDER BY match_score DESC, p.name ASC
            `;
            
            const result = await connection.request()
                .input('userId', sql.Int, userId)
                .input('userHobbies', sql.NVarChar, userHobbies)
                .query(query);
                
            return result.recordset;
        } catch (error) {
            console.error('Error in getRecommendedProfiles:', error);
            throw error;
        } finally {
            if (connection) await connection.close();
        }
    }


async function updateHobby(user_id,profile_id,hobby,detail,description){
     let pool;
        try {
            pool = await sql.connect(dbConfig);
            
            const query = `
                UPDATE Profiles
                SET 
                    hobbies = @hobbies,
                    detail = @detail,
                    hobby_description = @hobby_description,
                    updated_at = GETDATE()
                WHERE user_id = @user_id and profile_id = @profile_id
               
            `;
            
            const result = await pool.request()
                .input('hobbies', sql.NVarChar(sql.MAX), hobby)
                .input('detail', sql.NVarChar(sql.MAX), detail)
                .input('hobby_description', sql.NVarChar(sql.MAX), description)
                .input('user_id', sql.Int, user_id)
                .input('profile_id',sql.Int,profile_id)
                .query(query);

          

            
        } finally {
            if (pool) await pool.close();
        }
    }



async function getInfo(friend_id){
   let connection;
   try{
    connection = await sql.connect(dbConfig)
    query = `SELECT *
    from Profiles WHERE user_id = @user_id`
    const result = await connection.request().input("user_id",sql.Int,friend_id).query(query)
    return  result.recordset;
   }
   catch(error){
    console.log(error)
   }
}

    async function getRecommendedProfiles(userId) {
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            
           
            const userHobbyQuery = `
                SELECT hobbies FROM Profiles WHERE user_id = @userId
            `;
            const userHobbyResult = await connection.request()
                .input('userId', sql.Int, userId)
                .query(userHobbyQuery);
            
            if (!userHobbyResult.recordset[0] || !userHobbyResult.recordset[0].hobbies) {
                return [];
            }
            
            const userHobbies = userHobbyResult.recordset[0].hobbies;
            
         
            const query = `
                SELECT 
                    p.user_id, 
                    p.name, 
                    p.hobbies, 
                    p.profile_picture,
                    p.description,
                    p.detail,
                    p.age,
                    p.hobby_description,
                    (
                        SELECT COUNT(*) 
                        FROM STRING_SPLIT(p.hobbies, ',') AS ph
                        WHERE EXISTS (
                            SELECT 1 FROM STRING_SPLIT(@userHobbies, ',') AS uh 
                            WHERE LTRIM(RTRIM(uh.value)) = LTRIM(RTRIM(ph.value))
                        )
                    ) AS match_score
                FROM Profiles p
                WHERE p.user_id != @userId
                ORDER BY match_score DESC, p.name ASC
            `;
            
            const result = await connection.request()
                .input('userId', sql.Int, userId)
                .input('userHobbies', sql.NVarChar, userHobbies)
                .query(query);
                
            return result.recordset;
        } catch (error) {
            console.error('Error in getRecommendedProfiles:', error);
            throw error;
        } finally {
            if (connection) await connection.close();
        }
    }


module.exports = {
   getRecommendedProfiles,
    updateHobby,
   getInfo,
};