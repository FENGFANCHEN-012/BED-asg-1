const sql = require("mssql");
const dbConfig = require("../dbConfig"); // Assuming dbConfig is in the parent directory

async function createUser(email, hashedPassword) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    request.input("email", sql.NVarChar, email);
    request.input("hashedPassword", sql.NVarChar, hashedPassword);

    const query = `
      INSERT INTO Users (email, password_hash) -- Changed 'password' to 'password_hash' here
      VALUES (@email, @hashedPassword);
      SELECT SCOPE_IDENTITY() AS user_id;
    `;
    const result = await request.query(query);
    const newUserId = result.recordset[0].user_id;
    return newUserId; // Return the ID of the newly created user
  } catch (error) {
    console.error("Error creating user in model:", error);
    throw error; // Re-throw to be caught by the controller
  } finally {
    if (connection) connection.close();
  }
}

// You might want to add a function to get a user by email for login later
// async function getUserByEmail(email) { ... }

module.exports = {
  createUser,
  // getUserByEmail,
};