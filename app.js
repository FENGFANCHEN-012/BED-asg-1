const express = require("express");
const path = require('path');
const sql = require("mssql"); 
const dotenv = require("dotenv");
const dbConfig = require("./dbConfig");
dotenv.config();

const userController = require("./controllers/userController");
// Create Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware (Parsing request bodies)
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies
// --- Add other general middleware here (e.g., logging, security headers) ---
app.use(express.static(path.join(__dirname, 'public'))); //




// User Signup Route
// (Note: For a production app, you'd typically add a validation middleware here,
// e.g., validateUser, similar to validateStudent)
app.post("/signup",userController.signup);

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Server is gracefully shutting down");
  await sql.close();
  console.log("Database connections closed");
  process.exit(0);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
