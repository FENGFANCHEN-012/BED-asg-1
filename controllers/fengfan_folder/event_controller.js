const eventModel = require("../../models/fengfan_folder/event_model.js");

// In event_controller.js
async function getUserEvent(req, res) {
  try {
    const { user_id } = req.params; // Get user_id from query params
    if (!user_id) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const events = await eventModel.getUserEvent(user_id);
    res.status(200).json(events);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error fetching user events" });
  }
}

async function signUpEvent(req, res) {
  try {
    const { event_id, user_id } = req.body;
    if (!event_id || !user_id) {
      return res.status(400).json({ error: "Event ID and User ID are required" });
    }

    const result = await eventModel.signUpEvent(event_id, user_id);
    if (result) {
      res.status(201).json({ message: "Successfully signed up for the event" });
    } else {
      res.status(500).json({ error: "Failed to sign up for the event" });
    }
  } catch (error) {
    console.error("Controller error:", error);
    res.status(400).json({ error: error.message || "Error signing up for event" });
  }
}

async function getEventDetails(req, res) {
  try {
       const eventId =req.params.event_id;
    

    const event = await eventModel.getEventDetails(eventId);
    if (event) {
      res.status(200).json(event);
    } else {
      res.status(404).json({ error: "Event not found" });
    }
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error fetching event details" });
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
    if (!req.query) {
      return res.status(400).json({ error: "Query parameters are missing" });
    }
    const { event_id, user_id } = req.query;

    if (!event_id || !user_id) {
      return res.status(400).json({ error: "Event ID and User ID are required" });
    }

    const status = await eventModel.checkUserEventStatus(user_id, event_id);
    res.json({ status });
  } catch (error) {
    console.error("Error checking event status:", error);
    res.status(500).json({ error: "Error checking event status" });
  }
}


module.exports = {
    signUpEvent,
    cancelEvent,
    fetchEvent,
    checkUserEventStatus,
    getUserEvent,
    getEventDetails,
};