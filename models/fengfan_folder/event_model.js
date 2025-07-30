const sql = require("mssql");
const dbConfig = require("../../dbConfig.js");



// In event_model.js
async function getUserEvent(userId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
      SELECT e.* 
      FROM event_signup es
      JOIN Event e ON es.event_id = e.event_id
      WHERE es.user_id = @userId
    `;
    const result = await connection.request()
      .input("userId", sql.Int, userId) // Match @userId
      .query(query);
    return result.recordset;
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
    const query = "SELECT * FROM Event WHERE event_id = @eventId";
    const result = await connection.request()
      .input("eventId", sql.Int, eventId) // Match @eventId
      .query(query);
    return result.recordset[0];
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

async function signUpEvent(eventId, userId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    
    // Check if already signed up
    const checkQuery = "SELECT * FROM event_signup WHERE event_id = @eventId AND user_id = @userId";
    const checkResult = await connection.request()
      .input("eventId", sql.Int, eventId)
      .input("userId", sql.Int, userId)
      .query(checkQuery);
    
    if (checkResult.recordset.length > 0) {
      throw new Error("User is already signed up for this event");
    }

    const insertQuery = "INSERT INTO event_signup (event_id, user_id, status) VALUES (@eventId, @userId, 'signed_up')";
    const result = await connection.request()
      .input("eventId", sql.Int, eventId)
      .input("userId", sql.Int, userId)
      .query(insertQuery);
    
    return result.rowsAffected > 0;
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


// In event_model.js
async function cancelEvent(eventId, userId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
      DELETE FROM event_signup 
      WHERE event_id = @eventId 
        AND user_id = @userId
    `;
    const request = connection.request();
    request.input("eventId", sql.Int, eventId); // Match @eventId
    request.input("userId", sql.Int, userId); // Match @userId
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


// In event_model.js
async function checkUserEventStatus(userId, eventId) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = "SELECT status FROM event_signup WHERE user_id = @userId AND event_id = @eventId";
    const result = await connection.request()
      .input("userId", sql.Int, userId) // Match @userId
      .input("eventId", sql.Int, eventId) // Match @eventId
      .query(query);
    
    if (result.recordset.length > 0) {
      return result.recordset[0].status; // Return "signed_up"
    } else {
      return "not_signed_up";
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










