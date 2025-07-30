const friendModel = require("../../models/fengfan_folder/friend_model");

async function getFriend(req, res) {
  try {
    const userId = req.params.user_id;
    const friends = await friendModel.getFriend(userId);
    res.status(200).json(friends);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to get friends" });
  }
}

async function removeFriend(req, res) {
  try {
    const userId = parseInt(req.params.user_id);
    const friendId = parseInt(req.params.friend_id);
    
    if (isNaN(userId) || isNaN(friendId)) {
      return res.status(400).json({ error: "Invalid user ID or friend ID" });
    }

    const success = await friendModel.removeFriend(userId, friendId);
    if (!success) return res.status(404).json({ error: "Friend not found" });
    res.status(200).json({ message: "Friend removed" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to remove friend" });
  }
}
async function getFriendInfo(req, res) {
  try {
    const { user_id, friend_id } = req.params;
    const friendInfo = await friendModel.getFriendInfo(user_id, friend_id);
    if (!friendInfo) {
      res.status(404).json({ error: "Friend not found" });
    } else {
      res.status(200).json(friendInfo);
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to get friend info" });
  }
}


async function updateFriendInfo(req, res) {
  try {
    const { user_id, friend_id } = req.params;
    const { nick_name, description } = req.body;

    await friendModel.updateFriendInfo(user_id, friend_id, nick_name, description);
    res.status(200).json({ message: "Friend info updated" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to update friend info" });
  }
}
async function addFriend(req,res){
try {
        const userId = parseInt(req.params.user_id);
        const friendId = parseInt(req.params.friend_id);
        
        if (isNaN(userId) || isNaN(friendId)) {
            return res.status(400).json({ 
                success: false,
                error: "Invalid user IDs" 
            });
        }

        const result = await friendModel.addFriendDirectly(userId, friendId);
        
        if (result.alreadyFriends) {
            return res.status(200).json({
                success: true,
                message: `You are already friends (status: ${result.status})`
            });
        }
        
        res.status(201).json({ 
            success: true,
            message: "Friend added successfully" 
        });
    } catch (error) {
        console.error('Controller error:', error);
        

        if (error.message.includes('parameter name') && error.message.includes('already been declared')) {
            return res.status(400).json({
                success: false,
                error: "Database error: Parameter conflict. Please try again."
            });
        }
        
        res.status(400).json({ 
            success: false,
            error: error.message 
        });
    }
  }
module.exports = {
  getFriend,
  removeFriend,
  updateFriendInfo,
  getFriendInfo,addFriend
};