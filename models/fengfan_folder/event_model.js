const sql = require("mssql");
const dbConfig = require("../../dbConfig.js");



// In event_model.js
async function getUserEvent(userId) { // Only need userId parameter
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
      SELECT e.* 
      FROM event_signup es
      JOIN Event e ON es.event_id = e.event_id
      WHERE es.user_id = @user_id
    `;
    const result = await connection.request()
      .input("user_id", sql.Int, userId)
      .query(query);
    return result.recordset;
  } catch(error) {
    console.log(error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}
async function fetchEvents() {
  let connection;   
    try {   
    connection = await sql.connect(dbConfig);
      const query = "SELECT * FROM Event";
      const result = await connection.request().query(query);
      return result.recordset;// Return the list of events
    }   
catch (error) {
      console.error("Database error:", error);
      throw error; 
    
    }}
// In event_model.js
async function getEventDetails(eventId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = "SELECT * FROM Event WHERE event_id = @event_id";
    const result = await connection.request()
      .input("event_id", sql.Int, eventId)
      .query(query);
    return result.recordset[0]; // Return the first (and only) event
  } catch(error) {
    console.log(error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}

async function signUpEvent(eventId, userId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = "INSERT INTO event_signup (event_id, user_id, status) VALUES (@event_id, @user_id, 'signed_up')";
    const result = await connection.request()
      .input("event_id", sql.Int, eventId)
        .input("user_id", sql.Int, userId)          // change the id name
        .input("status", sql.VarChar, "signed_up")
      .query(query);
    return result.rowsAffected > 0; // Return true if the insert was successful
  } 
  
  catch (error) {
    console.error("Database error:", error);
    throw error;
  }
  
  finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}


// In event_model.js
async function cancelEvent(eventId, userId) { // Same name but now does DELETE
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    
    const query = `
      DELETE FROM event_signup 
      WHERE event_id = @event_id 
        AND user_id = @user_id
    `;
    
    const request = connection.request();
    request.input("event_id", sql.Int, eventId);
    request.input("user_id", sql.Int, userId);
    
    const result = await request.query(query);

    if (result.rowsAffected[0] > 0) {
      return { success: true, message: "Event registration deleted successfully." };
    }
    return { 
      success: false, 
      message: "Event registration not found." 
    };
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}

// Export (keep same names so controller doesn't need changes)


async function checkUserEventStatus(userId, eventId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = "SELECT status FROM event_signup WHERE user_id = @userId AND event_id = @eventId";
    const result = await connection.request()
      .input("user_id", sql.Int, userId)
      .input("event_id", sql.Int, eventId)
      .query(query);
    
    if (result.recordset.length > 0) {
      return result.recordset[0]; // Return the status of the user for the event
    } else {
      return { status: "not_signed_up" }; // User has not signed up for the event
    }
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}

module.exports = {
signUpEvent,
cancelEvent,
fetchEvents,
  checkUserEventStatus,
  getUserEvent,
      getEventDetails,

};










