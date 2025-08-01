require("dotenv").config();
const express = require("express");
const path = require("path");
const sql = require("mssql");
const dbConfig = require("./dbConfig");

// for eventbrite API (if used)
// const { syncEvents } = require('./src/eventbrite-sync');

// Import Google Cloud Translation API
const { TranslationServiceClient } = require('@google-cloud/translate').v3beta1;
const translationClient = new TranslationServiceClient();
const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
const location = 'global';

// Controllers and Middlewares
const profileController = require("./controllers/profileController");
const {validateRegisterProfile, validateUpdateProfile, validateProfileId } = require("./middlewares/profileValidation");
const userController = require("./controllers/userController");
const { verifyJWT } = require("./middlewares/authMiddleware")

// Fengfan's controllers (assuming these paths are correct)
const UserProfileController = require("./controllers/fengfan_folder/user_profile_controller")
const EventController = require("./controllers/fengfan_folder/event_controller.js");
const groupController = require("./controllers/fengfan_folder/group_controller.js");
const friendController = require("./controllers/fengfan_folder/friend_controller.js");
const chatController = require("./controllers/fengfan_folder/chat_controller.js");
const groupChatController = require("./controllers/fengfan_folder/group_chat_controller.js");
const mailboxController = require('./controllers/fengfan_folder/message_controller.js');

// JunWei's controllers (assuming these paths are correct and they are uncommented if used)
// const weatherController = require('./controllers/weathercontroller');
// const caloriesController = require('./controllers/caloriescontroller');

const app = express();
const port = process.env.PORT || 3000;



// Redirect root URL to signin.html FIRST, before serving static files
app.get("/", (req, res) => {
    res.redirect("/signin.html");
});

// Serve static files from the 'public' directory AFTER the root redirect
app.use(express.static(path.join(__dirname, 'public')));


// Routes
// Full Profile Management Routes -----------------------------------------------------------------------------------------------------------------------



// e.g., validateUser, similar to validateStudent)
app.post("/signup",userController.signup);




// ✅ Manage Medication
app.get("/medications", medController.getAllMedications);
app.get("/medications/:id", validateId, medController.getMedicationById);
app.post("/medications", validateMedication, medController.createMedication);




// Fengfan ---------------------------------------------

//Samuel
// Routes for a logged-in user to manage their OWN profile
app.get("/profiles/me", verifyJWT, profileController.getOwnProfile);
app.put("/profiles/me", verifyJWT, validateUpdateProfile, profileController.updateOwnProfile);

// Public User Registration (defaults to 'member' role)
app.post("/users", validateRegisterProfile, userController.registerUser);

// User Login
app.post("/users/login", userController.loginUser);

// Admin-only route for creating users with specified roles
app.post("/users/admin-register", verifyJWT, validateRegisterProfile, userController.adminRegisterUser);

// Admin-only routes for user/profile management
app.get("/users/profiles", verifyJWT, userController.getAllProfiles);
app.delete("/users/profiles/:id", verifyJWT, validateProfileId, userController.deleteUser);

// Logout route
app.post("/users/logout", verifyJWT, userController.logoutUser);

// Translation Endpoint
app.post("/translate", verifyJWT, async (req, res) => {
    const { text, targetLanguageCode } = req.body;

    if (!text || !targetLanguageCode) {
        return res.status(400).json({ error: "Text and target language are required." });
    }

    if (!projectId) {
        console.error("GOOGLE_CLOUD_PROJECT_ID environment variable is not set.");
        return res.status(500).json({ error: "Server configuration error: Google Cloud Project ID missing." });
    }

    try {
        const request = {
            parent: `projects/${projectId}/locations/${location}`,
            contents: [text],
            targetLanguageCode: targetLanguageCode,
        };

        const [response] = await translationClient.translateText(request);
        const translatedText = response.translations[0].translatedText;

        res.status(200).json({ translatedText });

    } catch (error) {
        console.error("Error calling Google Cloud Translation API:", error);
        res.status(500).json({ error: "Failed to translate text. Please try again later." });
    }
});
//------------------------------------------------------------------------------------------------------------------------------




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
