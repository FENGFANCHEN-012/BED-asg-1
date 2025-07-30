const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const userModel = require("../models/userModel");
const profileModel = require("../models/profileModel");

// Get all user profiles
async function getAllProfiles(req, res){
    try {
        const users = await userModel.getAllUsers();
        res.json(users);
    }catch(error){
        console.error("Controller error: ", error);
        res.status(500).json({error: "Error retrieving user profiles"});
    }
}

// Get user by username (used internally or by specific routes)
async function getUserByUsername(req, res){
    try{
        const username = req.body.username; // Assuming username comes from body for this specific use
        const user = await userModel.getUserByUsername(username);
        if (!user){
            return res.status(404).json({error: "User not found"});
        }
        res.json(user);
    }catch(error){
        console.error("Controller error: ", error);
        res.status(500).json({error: "Error retrieving user"});
    }
}

// Public registration: New members sign up with 'member' role by default
async function registerUser(req, res){
    const {username, email, password, name, hobbies, age, description} = req.body;
    const role = "member"; // Default role for public sign-ups

    try{
        if(!username || !password || !name || !email || !age){ // Basic validation
            return res.status(400).json({error: "Username, email, password, profile name, and age are required."});
        }
        if (password.length < 6){
            return res.status(400).json({error: "Password must be at least 6 characters"});
        }

        const existingUser = await userModel.getUserByUsername(username);
        if(existingUser){
            return res.status(400).json({message: "Username already exists"});
        }

        const hashedPassword = await bcrypt.hash(password, 10); // Salt rounds: 10

        const newUser = await userModel.createUser({
            username,
            email,
            passwordHash: hashedPassword,
            role,
        });

        // Use newUser.user_id as the ID for profile creation
        const newProfile = await profileModel.createProfile(newUser.user_id, {
            name,
            hobbies,
            age,
            description,
        });

        res.status(201).json({
            message: "User registered and profile created successfully",
            user: newUser,
            profile: newProfile
        });
    }catch(error){
        console.error("Controller error during public registration: ", error);
        // Check for specific errors like duplicate username from the model
        if (error.message && error.message.includes('duplicate key')) { // Example for MSSQL unique constraint error
             return res.status(400).json({ error: "Username already exists." });
        }
        res.status(500).json({error: "Error creating user or profile"});
    }
}

// Admin-only registration: Admin can create users with specified roles
async function adminRegisterUser(req, res){
    // This function assumes req.user is set by verifyJWT and req.user.role is 'admin'
    const {username, email, password, role, name, hobbies, age, description} = req.body;

    try{
        // Validation handled by validateRegisterProfile middleware
        const hashedPassword = await bcrypt.hash(password, 10); // Salt rounds: 10

        const newUser = await userModel.createUser({
            username,
            email,
            passwordHash: hashedPassword,
            role, // Use the role provided by admin
        });

        // Use newUser.user_id as the ID for profile creation
        const newProfile = await profileModel.createProfile(newUser.user_id, {
            name,
            hobbies,
            age,
            description,
        });

        res.status(201).json({
            message: `User '${username}' created with role '${role}' and profile successfully`,
            user: newUser,
            profile: newProfile
        });
    }catch(error){
        console.error("Controller error during admin user creation: ", error);
        // Check for specific errors like duplicate username from the model
        if (error.message && error.message.includes('duplicate key')) { // Example for MSSQL unique constraint error
             return res.status(400).json({ error: "Username already exists." });
        }
        res.status(500).json({error: "Error creating user or profile by admin"});
    }
}


// User login (existing function)
async function loginUser(req, res) {
    const {username, password} = req.body;

    try{
        const user = await userModel.getUserByUsername(username);
        if(!user){
            return res.status(401).json({message: "Invalid credentials"});
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch){
            return res.status(401).json({message: "Invalid credentials"});
        }

        const payload = {
            user_id: user.user_id, // Standardized to user_id
            role: user.role,
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {expiresIn: "3600s"}); // Expires in 1 hour

        return res.status(200).json({token, role: user.role}); // Also return role for client-side redirection
    }catch(err){
        console.error(err);
        return res.status(500).json({message: "Internal server error"});
    }
}

// Delete a user profile (existing function)
async function deleteUser(req, res) {
    try {
        const userIdToDelete = parseInt(req.params.id); // Renamed for clarity, still comes from :id param
        if (isNaN(userIdToDelete)) {
            return res.status(400).json({ error: "Invalid user ID provided." });
        }

        const profileDeleted = await profileModel.deleteProfile(userIdToDelete);
        if (!profileDeleted) {
            console.warn(`No profile found for user ID ${userIdToDelete}, proceeding with user deletion.`);
        }

        const userDeleted = await userModel.deleteUserById(userIdToDelete);
        if (!userDeleted) {
            return res.status(404).json({ error: "User not found!" });
        }
        res.status(200).json({ message: `User with user_id ${userIdToDelete} and associated profile deleted successfully` }); // Standardized message
    } catch (error) {
        console.error("Controller error: ", error);
        res.status(500).json({ error: "Error deleting user and/or profile" });
    }
}

// Logout function (existing)
async function logoutUser(req, res) {
    try {
        const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
        if (!token) {
            return res.status(400).json({ message: "No token provided." });
        }

        const decoded = jwt.decode(token);
        if (!decoded || !decoded.exp) {
            return res.status(400).json({ message: "Invalid token format or missing expiration." });
        }

        await userModel.addRevokedToken(token, decoded.exp);
        res.status(200).json({ message: "Logged out successfully." });
    } catch (error) {
        console.error("Controller error during logout: ", error);
        res.status(500).json({ error: "Error during logout." });
    }
}

module.exports = {
    getAllProfiles,
    getUserByUsername,
    registerUser,
    adminRegisterUser,
    loginUser,
    deleteUser,
    logoutUser,
};
