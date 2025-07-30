const profileModel = require("../../models/fengfan_folder/profile_model");



async function updateHobby(req,res){
try {
        const userId = req.params.user_id;
        const { profile_id ,hobbies, detail, description } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });
        }

        const updatedProfile = await profileModel.updateHobby(
            userId,profile_id , hobbies, detail, description 
        );

        res.status(200).json({
            success: true,
            data: updatedProfile
        });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({
            success: false,
            message: "Error updating profile",
            error: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
}
async function getInfo(req, res) {
    const user_id = req.params.user_id;
    try {
        const information = await profileModel.getInfo(user_id);

        // Ensure that the data is returned properly in the response
        return res.json({
            success: true,
            data: information
        });
    } catch (error) {
        console.error("Error fetching user info:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching user information",
            error: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
}

  async function getRecommendedProfiles(req, res) {
        try {
            const userId = parseInt(req.params.user_id);
            if (isNaN(userId)) {
                return res.status(400).json({ error: "Invalid user ID" });
            }

            const profiles = await profileModel.getRecommendedProfiles(userId);
            res.status(200).json(profiles);
        } catch (error) {
            console.error('Error in getRecommendedProfiles:', error);
            res.status(500).json({ error: "Failed to fetch recommended profiles" });
        }
    }

module.exports = {
  updateHobby,
  getInfo,
  getRecommendedProfiles,
    
};