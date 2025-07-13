// controllers/userController.js
const bcrypt = require("bcrypt");
const userModel = require("../models/userModel"); // Adjust path if necessary

async function signup(req, res) {
  const { email, password } = req.body;

  // Basic validation (more robust validation should be done via middleware)
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in the database via the model
    const newUserId = await userModel.createUser(email, hashedPassword);

    // Respond with success message and new user ID
    res.status(201).json({ message: "User registered successfully.", userId: newUserId });
  } catch (error) {
    console.error("Signup controller error:", error);
    // Check for specific errors, e.g., duplicate email
    if (error.message && error.message.includes("Violation of UNIQUE KEY constraint")) {
      return res.status(409).json({ error: "Email already registered." });
    }
    res.status(500).json({ error: "Internal server error during registration." });
  }
}

module.exports = {
  signup,
};
