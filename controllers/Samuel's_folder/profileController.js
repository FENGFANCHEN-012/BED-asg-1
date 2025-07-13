// controllers/profileController.js
const profileModel = require("../models/profileModel");

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

async function createProfile(req, res) {
  // IMPORTANT: In a real application, userId should come from an authenticated session/token,
  // not directly from req.body. For this example, it's still assumed to be in body.
  const { userId, name, hobbies, age, description } = req.body;

  try {
    // It's still good practice to re-check name uniqueness here as a safeguard
    // against potential race conditions, even though primary validation is in middleware.
    const existingProfile = await profileModel.getProfileByName(name.trim());
    if (existingProfile) {
      return res.status(409).json({ error: "This profile name is already taken. Please choose another." });
    }

    const newProfile = await profileModel.createProfile(userId, { name: name.trim(), hobbies, age, description });
    res.status(201).json({ message: "Profile created successfully!", profile: newProfile });

  } catch (error) {
    console.error("Controller error creating profile:", error);
    // Handle specific database errors, e.g., foreign key constraint violation if userId doesn't exist
    if (error.message && error.message.includes("FOREIGN KEY constraint")) {
      return res.status(400).json({ error: "Invalid user ID provided. User must exist." });
    }
    res.status(500).json({ error: "Internal server error during profile creation." });
  }
}

async function getAllProfiles(req, res) {
  try {
    const profiles = await profileModel.getAllProfiles();
    res.status(200).json(profiles);
  } catch (error) {
    console.error("Controller error getting all profiles:", error);
    res.status(500).json({ error: "Internal server error fetching profiles." });
  }
}

async function getProfileById(req, res) {
  // userId is attached to req by validateProfileId middleware
  const userId = req.params.id;
  try {
    const profile = await profileModel.getProfileByUserId(userId);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found for this user ID." });
    }
    res.status(200).json(profile);
  } catch (error) {
    console.error("Controller error getting profile by ID:", error);
    res.status(500).json({ error: "Internal server error fetching profile." });
  }
}

async function updateProfile(req, res) {
  // userId is attached to req by validateProfileId middleware
  const userId = req.params.id;
  // profileInfo is validated by validateProfile middleware
  const profileInfo = req.body;

  try {
    // Check if the profile exists before attempting to update
    const existingProfile = await profileModel.getProfileByUserId(userId);
    if (!existingProfile) {
      return res.status(404).json({ message: "Profile not found for this user ID." });
    }

    // Optional: If name is being updated, check for uniqueness against other profiles (excluding current user's)
    if (profileInfo.name && profileInfo.name.trim() !== existingProfile.name) {
      const nameConflict = await profileModel.getProfileByName(profileInfo.name.trim());
      // Ensure the conflicting name doesn't belong to the current user's profile
      if (nameConflict && nameConflict.user_id !== userId) {
        return res.status(409).json({ error: "The new profile name is already taken by another user." });
      }
    }

    const updatedProfile = await profileModel.updateProfile(userId, profileInfo);
    res.status(200).json({ message: "Profile updated successfully!", profile: updatedProfile });
  } catch (error) {
    console.error("Controller error updating profile:", error);
    res.status(500).json({ error: "Internal server error updating profile." });
  }
}

async function deleteProfile(req, res) {
  // userId is attached to req by validateProfileId middleware
  const userId = req.params.id;
  try {
    const deleted = await profileModel.deleteProfile(userId);
    if (!deleted) {
      return res.status(404).json({ message: "Profile not found for this user ID." });
    }
    res.status(204).send(); // No content for successful deletion
  } catch (error) {
    console.error("Controller error deleting profile:", error);
    res.status(500).json({ error: "Internal server error deleting profile." });
  }
}


module.exports = {
  checkProfileName,
  createProfile,
  getAllProfiles,
  getProfileById,
  updateProfile,
  deleteProfile,
};
