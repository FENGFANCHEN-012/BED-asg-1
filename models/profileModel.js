// models/profileModel.js
const sql = require("mssql");
const dbConfig = require("../dbConfig");

async function getProfileByName(name) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    request.input("name", sql.NVarChar, name);
    const result = await request.query("SELECT * FROM Profiles WHERE name = @name");
    return result.recordset[0]; // Returns the profile if found, undefined otherwise
  } catch (error) {
    console.error("Error checking profile name:", error);
    throw error;
  } finally {
    if (connection) connection.close();
  }
}

async function getProfileByUserId(userId) { // Parameter name remains 'userId' for clarity
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const request = connection.request();
        request.input("user_id", sql.Int, userId); // Input parameter name changed to user_id
        const result = await request.query("SELECT * FROM Profiles WHERE user_id = @user_id"); // Column name changed to user_id
        return result.recordset[0];
    } catch (error) {
        console.error("Error retrieving profile by user ID:", error);
        throw error;
    } finally {
        if (connection) connection.close();
    }
}


async function createProfile(userId, profileInfo) { // Parameter name remains 'userId' for clarity
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    request.input("user_id", sql.Int, userId); // Input parameter name changed to user_id
    request.input("name", sql.NVarChar, profileInfo.name);
    request.input("hobbies", sql.NVarChar, profileInfo.hobbies); // Store as string
    request.input("age", sql.Int, profileInfo.age);
    request.input("description", sql.NVarChar, profileInfo.description);

    const query = `
      INSERT INTO Profiles (user_id, name, hobbies, age, description)
      VALUES (@user_id, @name, @hobbies, @age, @description); -- Column name changed to user_id
    `;
    await request.query(query);
    return await getProfileByUserId(userId); // Return the newly created profile
  } catch (error) {
    console.error("Error creating profile:", error);
    throw error;
  } finally {
    if (connection) connection.close();
  }
}

async function updateProfile(userId, profileInfo) { // Parameter name remains 'userId' for clarity
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    request.input("user_id", sql.Int, userId); // Input parameter name changed to user_id
    request.input("name", sql.NVarChar, profileInfo.name);
    request.input("hobbies", sql.NVarChar, profileInfo.hobbies);
    request.input("age", sql.Int, profileInfo.age);
    request.input("description", sql.NVarChar, profileInfo.description);

    const query = `
      UPDATE Profiles
      SET name = @name, hobbies = @hobbies, age = @age, description = @description, updated_at = GETDATE()
      WHERE user_id = @user_id; -- Column name changed to user_id
    `;
    await request.query(query);
    return await getProfileByUserId(userId); // Return the updated profile
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  } finally {
    if (connection) connection.close();
  }
}


async function deleteProfile(userId) { // Parameter name remains 'userId' for clarity
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    request.input("user_id", sql.Int, userId); // Input parameter name changed to user_id
    const result = await request.query("DELETE FROM Profiles WHERE user_id = @user_id"); // Column name changed to user_id
    return result.rowsAffected[0] > 0; // Returns true if at least one row was affected
  } catch (error) {
    console.error("Error deleting profile:", error);
    throw error;
  } finally {
    if (connection) connection.close();
  }
}

module.exports = {
  getProfileByName,
  getProfileByUserId,
  createProfile,
  updateProfile,
  deleteProfile,
};