require("dotenv").config();
const express = require("express");
const path = require("path");
const sql = require("mssql");
const cors = require("cors");
const dotenv = require("dotenv");
const dbConfig = require("./dbConfig");
// for eventbrite API
const eventbriteController = require('./src/controllers/eventbriteController');

//Validations-----------------------------------------------------------------------------------------------------------------------------------
//const profileController = require("./controllers/Samuel's_folder/profileController");
//const { validateProfileName, validateCreateProfile, validateProfileId } = require("./middlewares/profileValidation"); // Import all new validation middleware
//const userController = require("./controllers/userController");


// fengfan

const UserProfileController = require("./controllers/fengfan_folder/user_profile_controller")
const EventController = require("./controllers/fengfan_folder/event_controller.js"); // import Event Controller
const groupController = require("./controllers/fengfan_folder/group_controller.js"); // import Group Controller
const friendController = require("./controllers/fengfan_folder/friend_controller.js");
const chatController = require("./controllers/fengfan_folder/chat_controller.js");
const groupChatController = require("./controllers/fengfan_folder/group_chat_controller.js");
const mailboxController = require('./controllers/fengfan_folder/message_controller.js'); 
const { fetchAndSyncOrgEvents } = require("./src/services/eventbrite.js");

// Create Express app-----------------------------------------------------------------------------------------------------------------------------------
const app = express();
const port = process.env.PORT || 3000;
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

app.use(cors());
app.use(express.json());

// Middleware (Parsing request bodies)-----------------------------------------------------------------------------------------------------------------------------------
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies
// --- Add other general middleware here (e.g., logging, security headers) ---
app.use(express.static(path.join(__dirname, 'public'))); //




// Routes
// Full Profile Management Routes -----------------------------------------------------------------------------------------------------------------------
//app.get("/profiles", profileController.getAllProfiles); // Get all profiles
//app.get("/profiles/:id", profileController.getProfileById); // Get profile by userId
//app.post("/profiles", validateCreateProfile, profileController.createProfile); // Create profile 
//app.put("/profiles/:id", validateCreateProfile, profileController.updateProfile); // Update profile by userId
//app.delete("/profiles/:id", profileController.deleteProfile); // Delete profile by userId
//------------------------------------------------------------------------------------------------------------------------------


// e.g., validateUser, similar to validateStudent)
//app.post("/signup",userController.signup);




// ✅ Manage Medication
//app.get("/medications", medController.getAllMedications);
//app.get("/medications/:id", validateId, medController.getMedicationById);
//app.post("/medications", validateMedication, medController.createMedication);




// Fengfan ---------------------------------------------
// user
app.get("/profiles/recommended/:user_id", UserProfileController.getRecommendedProfiles);
app.get("/profile/:user_id",UserProfileController.getInfo)
app.put("/profile/:user_id",UserProfileController.updateHobby)
// event


// event brite
app.get('/users/me/organizations',eventbriteController.fetchAndSyncOrgEvents)
app.get('/eventbrite/fetch-org-events', eventbriteController.fetchAndSyncOrgEvents);
app.get('/sync', fetchAndSyncOrgEvents);

//app.use('/my_organ', eventbriteRoutes.fetchMyOrganization);
//app.use('/my_organ', eventbriteRoutes.fetchMyOrganization);



app.get("/user/event/:user_id", EventController.getUserEvent);
app.get("/event/:event_id", EventController.getEventDetails);
app.get("/getEvent", EventController.fetchEvent);
app.post("/user_event", EventController.signUpEvent); // Endpoint to sign up for an event
app.delete("/user_event", EventController.cancelEvent);// Endpoint to cancel an event
app.get("/user_event/status", EventController.checkUserEventStatus); // Endpoint to check user event status
// group
app.get("/group/:user_id", groupController.getUserGroups);
app.get("/detail/group/:group_id",groupController.getgroupById)
// add group member
app.post('/group-members', groupController.addGroupMember);
app.post('/group-owner', groupController.addGroupOwner);
app.get("/member/:group_id", groupController.getGroupMember)
app.get("/member/detail/:user_id", groupController.getMemberDetail);
app.get("/group/:group_id/members/profile", groupController.getGroupMemberProfiles);
app.delete("/group/:group_id",groupController.deleteGroup)
app.put("/group/:group_id", groupController.updateGroup);
app.post('/create/groups', groupController.createGroup);
// friend
app.get('/friends/:user_id', friendController.getFriend);
app.delete('/friends/:user_id/:friend_id', friendController.removeFriend);
app.get('/friends/:user_id/:friend_id', friendController.getFriendInfo);
app.post('/friends/:user_id/:friend_id', friendController.addFriend);
app.put('/friends/:user_id/:friend_id', friendController.updateFriendInfo);
// chat
app.get('/private-chat/:senderId/:receiverId', chatController.getChatHistory);
app.post('/private-chat', chatController.sendMessage);
// group chat
app.get('/group-chat/:groupId', groupChatController.getGroupChatHistory);
app.post('/group-chat/send', groupChatController.sendGroupMessage);
app.get('/group-info/:groupId', groupChatController.getGroupInfo);
app.get('/group-members/:groupId', groupChatController.getGroupMembers);
// message
app.get('/mailbox/:user_id', mailboxController.getMailboxMessages);
//---------------------------------------------

// NDJW ---------------------------------------------
// Calories Tracker APIs
//const caloriesController = require('./controllers/caloriescontroller');
//app.get('/api/graph', caloriesController.getGraphData);
//app.get('/api/history', caloriesController.getHistory);
//app.get('/api/food/search', caloriesController.searchFood);
//app.post('/api/food/add', caloriesController.addFoodEntry);
//app.delete('/api/food/delete/:id', caloriesController.deleteFoodEntry);
//app.put('/api/food/update-time/:id', caloriesController.updateMealTime);
//app.get('/api/food/recommend', caloriesController.getRecommendedFoods);

// Weather Alert APIs
//const weatherController = require('./controllers/weathercontroller');
//app.post('/api/alerts', weatherController.saveAlertPreference);
//app.get('/api/alerts', weatherController.getUserAlerts);
//app.delete('/api/alerts/:id', weatherController.deleteAlert);
//app.delete('/api/alerts', weatherController.deleteAllUserAlerts);
//---------------------------------------------------



























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


