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

async function createProfile(userId, profileInfo) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    request.input("userId", sql.Int, userId);
    request.input("name", sql.NVarChar, profileInfo.name);
    request.input("hobbies", sql.NVarChar, profileInfo.hobbies); // Store as string
    request.input("age", sql.Int, profileInfo.age);
    request.input("description", sql.NVarChar, profileInfo.description);

    const query = `
      INSERT INTO Profiles (user_id, name, hobbies, age, description)
      VALUES (@userId, @name, @hobbies, @age, @description);
      SELECT * FROM Profiles WHERE profile_id = SCOPE_IDENTITY();
    `;
    const result = await request.query(query);
    return result.recordset[0]; // Return the newly created profile
  } catch (error) {
    console.error("Error creating profile in model:", error);
    throw error;
  } finally {
    if (connection) connection.close();
  }
}

async function getAllProfiles() {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    const result = await request.query("SELECT * FROM Profiles");
    return result.recordset;
  } catch (error) {
    console.error("Error fetching all profiles:", error);
    throw error;
  } finally {
    if (connection) connection.close();
  }
}

async function getProfileByUserId(userId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    request.input("userId", sql.Int, userId);
    const result = await request.query("SELECT * FROM Profiles WHERE user_id = @userId");
    return result.recordset[0]; // Return single record
  } catch (error) {
    console.error("Error fetching profile by user ID:", error);
    throw error;
  } finally {
    if (connection) connection.close();
  }
}

async function updateProfile(userId, profileInfo) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    request.input("userId", sql.Int, userId);
    request.input("name", sql.NVarChar, profileInfo.name);
    request.input("hobbies", sql.NVarChar, profileInfo.hobbies);
    request.input("age", sql.Int, profileInfo.age);
    request.input("description", sql.NVarChar, profileInfo.description);

    const query = `
      UPDATE Profiles
      SET name = @name, hobbies = @hobbies, age = @age, description = @description, updated_at = GETDATE()
      WHERE user_id = @userId;
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


async function deleteProfile(userId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    request.input("userId", sql.Int, userId);
    const result = await request.query("DELETE FROM Profiles WHERE user_id = @userId");
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
  createProfile,
  getAllProfiles,
  getProfileByUserId,
  updateProfile,
  deleteProfile,
};
