const sql = require("mssql");
const dbConfig = require("../dbConfig");

// Get all users (existing function)
async function getAllUsers(){
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const query = `SELECT user_id, username, email, role FROM Users`; // Explicitly select user_id
        const result = await connection.request().query(query);
        return result.recordset;
    }catch(error){
        console.error("Database error: ", error);
        throw error;
    }finally{
        if (connection){
            try{
                await connection.close();
            }catch(closeError){
                console.error("Error closing connection: ", closeError);
            }
        }
    }
}

// Get user by username (existing function)
async function getUserByUsername(username){
    let connection;
    try{
        connection = await sql.connect(dbConfig);
        const query = "SELECT user_id, username, email, passwordHash, role FROM Users WHERE username = @username"; // Explicitly select user_id
        const request = connection.request();
        request.input("username", username);
        const result = await request.query(query);

        if (result.recordset.length === 0){
            return null // User not found
        }

        return result.recordset[0];
    }catch(error){
        console.error("Database error: ",  error);
        throw error;
    }finally{
        if(connection){
            try{
                await connection.close();
            }catch(closeError){
                console.error("Error closing connection: ", closeError);
            }
        }
    }
}

// Create new user (existing function)
async function createUser(userData){
    let connection;
    try{
        connection = await sql.connect(dbConfig);
        // Changed 'id' to 'user_id' in the SELECT statement for SCOPE_IDENTITY()
        const query =
          "INSERT INTO Users (username, email, passwordHash, role) VALUES (@username, @email, @passwordHash, @role); SELECT user_id FROM Users WHERE user_id = SCOPE_IDENTITY();";
        const request = connection.request();
        request.input("username", userData.username);
        request.input("email", userData.email);
        request.input("passwordHash", userData.passwordHash);
        request.input("role", userData.role)
        const result = await request.query(query); // Changed 'result' to 'const result'

        // The result.recordset[0] will now contain { user_id: ... }
        const newUserId = result.recordset[0].user_id;
        // Fetch the complete user object using the new user_id
        return await getUserByUsername(userData.username); // Re-fetch the user to get all details including user_id
    }catch(error){
        console.error("Database error: ", error);
        throw error;
    }finally{
        if (connection){
            try{
                await connection.close();
            }catch(closeError){
                console.error("Error closing connection: ", closeError);
            }
        }
    }
}

// Delete user by ID (existing function)
async function deleteUserById(user_id){ // Parameter name changed to user_id
    let connection;
    try{
        connection = await sql.connect(dbConfig);
        const query = "DELETE FROM Users WHERE user_id = @user_id"; // Column name changed to user_id
        const request = connection.request();
        request.input("user_id", user_id); // Input parameter name changed to user_id
        const result = await request.query(query);

        return result.rowsAffected > 0; // Indicate success based on affected rows
    }catch(error){
        console.error("Database error: ", error);
        throw error;
    }finally{
        if(connection){
            try{
                await connection.close();
            }
            catch(closeError){
                console.error("Error closing connection: ", closeError);
            }
        }
    }
}

// New function to add a token to the blacklist
async function addRevokedToken(token, expirationDate) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const query = `
            INSERT INTO RevokedTokens (token_id, expiration_date)
            VALUES (@token_id, @expiration_date);
        `;
        const request = connection.request();
        request.input("token_id", sql.NVarChar, token); // Store the token itself or a unique ID from it
        request.input("expiration_date", sql.DateTime, new Date(expirationDate * 1000)); // Convert Unix timestamp to Date object
        await request.query(query);
        return true;
    } catch (error) {
        console.error("Database error adding revoked token: ", error);
        throw error;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (closeError) {
                console.error("Error closing connection: ", closeError);
            }
        }
    }
}

// New function to check if a token is blacklisted
async function isTokenRevoked(token) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const query = `
            SELECT COUNT(*) AS count
            FROM RevokedTokens
            WHERE token_id = @token_id AND expiration_date > GETDATE(); -- Only consider tokens not yet expired
        `;
        const request = connection.request();
        request.input("token_id", sql.NVarChar, token);
        const result = await request.query(query);
        return result.recordset[0].count > 0;
    } catch (error) {
        console.error("Database error checking revoked token: ", error);
        throw error;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (closeError) {
                console.error("Error closing connection: ", closeError);
            }
        }
    }
}


module.exports = {
    getAllUsers,
    getUserByUsername,
    createUser,
    deleteUserById, // Exported with new parameter name
    addRevokedToken,
    isTokenRevoked,
}