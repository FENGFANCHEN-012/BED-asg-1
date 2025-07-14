const eventModel = require("../models/event_model");
const sql = require("mssql"); 
const dbConfig = require("../dbConfig");
// Get all books
async function signUpEvent(req, res) {
  try {
    const { event_id, user_id ,status} = req.body;
    if (!event_id || !user_id) {
      return res.status(400).json({ error: "Event ID and User ID are required" });
    }

    const result = await eventModel.signUpEvent(event_id, user_id);
    if (result) {
      res.status(201).json({ message: "Successfully signed up for the event" });
    } else {
      res.status(500).json({ error: "Failed to sign up for the event" });
    }
  }
    catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({ error: "Error signing up for event" });
    }
}



// Get book by ID
async function cancelEvent(req, res) {
   try {
    const { event_id, user_id } = req.body;
    
    if (!event_id || !user_id) {
      return res.status(400).json({ error: "Event ID and User ID are required" });
    }

    const result = await eventModel.cancelEvent(event_id, user_id);
    
    if (result.success) {
      res.status(200).json({ message: result.message });
    } else {
      res.status(404).json({ error: result.message });
    }
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error deleting event registration" });
  }
}

// fetch events
async function fetchEvent(req, res) {
  try {
    const events = await eventModel.fetchEvents();
    res.status(200).json(events);

  }
  catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error fetching events" });
  }
}

async function checkUserEventStatus(req, res) {

  try {
    const { event_id, user_id } = req.query;
    
    if (!event_id || !user_id) {
      return res.status(400).json({ 
        error: "Event ID and User ID are required" 
      });
    }

    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('event_id', sql.Int, event_id)
      .input('user_id', sql.Int, user_id)
      .query(`
        SELECT status 
        FROM event_signup 
        WHERE event_id = @event_id AND user_id = @user_id
      `);

    if (result.recordset.length > 0) {
      res.json({ 
        status: result.recordset[0].status 
      });
    } else {
      res.json({ 
        status: "cancelled" 
      });
    }
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ 
      error: "Error checking event status" 
    });
  }
}


module.exports = {
    signUpEvent,
    cancelEvent,
    fetchEvent,
    checkUserEventStatus,
    
};