
const express = require("express");
const path = require('path');
const sql = require("mssql"); 
const dotenv = require("dotenv");
dotenv.config();
const dbConfig = require("./dbConfig");


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
// Start server
app.listen(port, async () => {
  console.log(`Server running on port ${port}`);

  // --- Database Connection Test ---
  try {
    // Attempt to connect to the database
    const pool = await sql.connect(dbConfig);
    console.log("Database connected successfully!");
    // You can store the pool if you want to reuse it, or close it if this is just a test
    // For a real application, you'd typically keep the pool open and manage connections
    // pool.close(); // Close if this is just a one-time test
  } catch (err) {
    console.error("Database connection failed:", err.message);
  }
  // --- End Database Connection Test ---
});


