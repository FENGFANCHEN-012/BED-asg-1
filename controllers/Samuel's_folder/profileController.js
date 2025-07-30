// controllers/profileController.js
const profileModel = require("../models/profileModel");
const userModel = require("../models/userModel"); // Added userModel import

async function checkProfileName(req, res) {
  const { name } = req.body; // 'name' is guaranteed to be valid by middleware

  try {
    const existingProfile = await profileModel.getProfileByName(name.trim());
    if (existingProfile) {
      return res.status(409).json({ available: false, message: "This profile name is already taken. Please choose another." });
    } else {
      return res.status(200).json({ available: true, message: "Profile name is available!" });
    }
  } catch (error) {
    console.error("Controller error checking profile name:", error);
    res.status(500).json({ error: "Internal server error during name check." });
  }
}

// Removed createProfile as it's now handled by userController.registerUser

async function getOwnProfile(req, res) {
  // userId should come from req.user.user_id (from JWT)
  const user_id = req.user.user_id; // Get user_id from the authenticated user (now directly from JWT payload)

  try {
    const profile = await profileModel.getProfileByUserId(user_id);
    if (!profile) {
      return res.status(404).json({ error: "Profile not found for this user." });
    }
    res.status(200).json(profile);
  } catch (error) {
    console.error("Controller error retrieving own profile:", error);
    res.status(500).json({ error: "Internal server error retrieving profile." });
  }
}

async function updateOwnProfile(req, res) {
  // userId should come from req.user.user_id (from JWT)
  const user_id = req.user.user_id; // Get user_id from the authenticated user (now directly from JWT payload)
  const profileInfo = req.body; // Body contains name, hobbies, age, description

  try {
    const existingProfile = await profileModel.getProfileByUserId(user_id);
    if (!existingProfile) {
      return res.status(404).json({ error: "Profile not found for this user." });
    }

    // Check for name conflict only if name is being changed and it's not the current profile's name
    if (profileInfo.name && profileInfo.name.trim() !== existingProfile.name) {
      const nameConflict = await profileModel.getProfileByName(profileInfo.name.trim());
      // Ensure the conflicting name doesn't belong to the current user's profile
      if (nameConflict && nameConflict.user_id !== user_id) {
        return res.status(409).json({ error: "The new profile name is already taken by another user." });
      }
    }

    const updatedProfile = await profileModel.updateProfile(user_id, profileInfo);
    res.status(200).json({ message: "Profile updated successfully!", profile: updatedProfile });
  } catch (error) {
    console.error("Controller error updating profile:", error);
    res.status(500).json({ error: "Internal server error updating profile." });
  }
}

// deleteProfile function is now handled by userController.deleteUser for full user deletion

module.exports = {
  checkProfileName,
  getOwnProfile, // Exported new function
  updateOwnProfile, // Exported new function
};
