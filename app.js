require("dotenv").config();
const express = require("express");
const path = require("path");
const sql = require("mssql");
const cors = require("cors");
const dotenv = require("dotenv");
const dbConfig = require("./dbConfig");
//Validations-----------------------------------------------------------------------------------------------------------------------------------
const profileController = require("./controllers/profileController");
const { validateProfileName, validateCreateProfile, validateProfileId } = require("./middlewares/profileValidation"); // Import all new validation middleware
const userController = require("./controllers/userController");

const EventController = require("./controllers/event_controller"); // import Event Controller
const groupController = require("./controllers/group_controller"); // import Group Controller
// Create Express app-----------------------------------------------------------------------------------------------------------------------------------
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Middleware (Parsing request bodies)-----------------------------------------------------------------------------------------------------------------------------------
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies
// --- Add other general middleware here (e.g., logging, security headers) ---
app.use(express.static(path.join(__dirname, 'public'))); //




// Routes
// Full Profile Management Routes -----------------------------------------------------------------------------------------------------------------------
app.get("/profiles", profileController.getAllProfiles); // Get all profiles
app.get("/profiles/:id", profileController.getProfileById); // Get profile by userId
app.post("/profiles", validateCreateProfile, profileController.createProfile); // Create profile 
app.put("/profiles/:id", validateCreateProfile, profileController.updateProfile); // Update profile by userId
app.delete("/profiles/:id", profileController.deleteProfile); // Delete profile by userId
//------------------------------------------------------------------------------------------------------------------------------

// e.g., validateUser, similar to validateStudent)
app.post("/signup",userController.signup);




// ✅ Manage Medication
app.get("/medications", medController.getAllMedications);
app.get("/medications/:id", validateId, medController.getMedicationById);
app.post("/medications", validateMedication, medController.createMedication);


// event

app.get("/event/getEvent", EventController.fetchEvent);
app.post("/user_event", EventController.signUpEvent); // Endpoint to sign up for an event
app.delete("/user_event", EventController.cancelEvent);// Endpoint to cancel an event
app.get("/user_event/status", EventController.checkUserEventStatus); // Endpoint to check user event status

// group
app.get("/group/:user_id", groupController.getUserGroups); // Endpoint to get all groups
// Endpoint to delete a group

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Server is gracefully shutting down");
  try {
    await sql.close();
    console.log("Database connections closed");
  } catch (err) {
    console.error("Error closing database connections:", err);
  }
  process.exit(0);
});

// Start server
app.listen(port, async () => {
  console.log(`Server running on port ${port}`);

  // Database Connection Test
  try {
    const pool = await sql.connect(dbConfig);
    console.log("Database connected successfully!");
  } catch (err) {
    console.error("Database connection failed:", err.message);
  }
});


