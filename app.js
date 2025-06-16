const express = require("express");
const path = require('path');
const sql = require("mssql"); // Assuming you've installed mssql
const dotenv = require("dotenv");
const dbConfig = require("./dbConfig");
dotenv.config();

const Controller = require("./controllers/studentControllers");
const {
  validateStudent,
  validateStudentId,
} = require("./middlewares/studentValidation"); // import Book Validation Middleware

// Create Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware (Parsing request bodies)
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies
// --- Add other general middleware here (e.g., logging, security headers) ---

app.use(express.static(path.join(__dirname, 'public'))); //




app.get("/students", validateStudent,studentController.getAllStudents);
app.get("/students/:id", validateStudentId,studentController.getStudentById); // Use validateBookId middleware
app.post("/students", validateStudent, studentController.createStudent); // Use validateBook middleware
// Add routes for PUT/DELETE if implemented, applying appropriate middleware
app.put("/students/:id",validateStudentId, validateStudent, studentController.updateStudent)
app.delete("/students/:id",validateStudentId,  studentController.deleteStudent)
// Start server

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


