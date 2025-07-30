const groupModel = require("../../models/fengfan_folder/group_model");

async function getUserGroups(req, res) {
    try {
        const { user_id } = req.params;
        
        if (!user_id || isNaN(user_id)) {
            return res.status(400).json({
                success: false,
                message: "Valid user ID is required"
            });
        }

        const groups = await groupModel.getUserGroups(user_id);
        
        res.status(200).json({
            success: true,
            data: groups
        });
        
    } catch (error) {
        console.error("Error fetching user groups:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching user groups",
            error: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
}


// Create new group

// In controllers/group_controller.js
async function createGroup(req, res) {
  try {
    const { name, description, owner_id, photo_url, is_public,member_count} = req.body;
    
    if (!name || !owner_id) {
      return res.status(400).json({ 
        error: 'Group name and owner ID are required' 
      });
    }

    const groupId = await groupModel.createGroup({
  name,
  description,
  owner_id,
  photo_url,
  is_public,
  member_count: member_count || 1
}
    );

    res.status(201).json({ 
      success: true,
      group_id: groupId,
      message: 'Group created successfully'
    });
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to create group' 
    });
  }
}
// Get group details with member count






async function addGroupOwner(req,res){
 try {
    const { group_id, user_id, role } = req.body;
    
 
    if (!group_id || isNaN(group_id)) {
      return res.status(400).json({ error: 'Invalid group ID' });
    }
    if (!user_id || isNaN(user_id)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

   
   
    const result = await groupModel.addGroupOwner(
      group_id,
      user_id,
      role,
    );

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    console.error('Error in addGroupMember:', {
      params: req.body,
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      error: 'Failed to add group member',
      details: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
}


async function addGroupMember(req, res) {
  try {
    let { group_id, user_id, role } = req.body;

    const result = await groupModel.addGroupMember(
      group_id,
      user_id,
      role 
    );

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    console.error('Full Error Context:', {
      timestamp: new Date().toISOString(),
      errorDetails: {
        message: error.message,
        stack: error.stack,
        rawError: error
      },
      requestBody: req.body
    });
    res.status(500).json({ 
      error: 'Database operation failed',
      details: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
}



async function getGroupDetails(req, res) {
    try {
        const { group_id } = req.params;
        const group = await groupModel.getGroupDetails(group_id);
        
        if (!group) {
            return res.status(404).json({
                success: false,
                message: "Group not found"
            });
        }
        
        res.status(200).json({
            success: true,
            data: group
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching group details",
            error: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
}


async function getGroupMember(req,res)
{
try{
    const {group_id} = req.params;
    const member = await groupModel.getGroupMember(group_id);
    if (!member) {
            return res.status(404).json({
                success: false,
                message: "Member not found"
            });
        }
        
        res.status(200).json({
            success: true,
            data: member
        });
}
catch(error){
    console.error
}
}

async function  getgroupById(req,res){
     try {
        const { group_id } = req.params;
        const group = await groupModel.getgroupById(group_id);
        
        if (!group) {
            return res.status(404).json({
                success: false,
                message: "Group not found"
            });
        }
        
        res.status(200).json({
            success: true,
            data: group
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching group details",
            error: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
}
async function getMemberDetail(req, res) {
    try {
        const { user_id,group_id } = req.params;
        const member = await groupModel.getMemberDetail(user_id,group_id);
        
        if (!member || member.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
      
        res.status(200).json({
            success: true,
            data: member
        });
    } catch(error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error fetching user details"
        });
    }
}

async function updateGroup(req, res) {
  const groupId = parseInt(req.params.group_id);
  const { name, description, photo_url } = req.body;

  if (!groupId || isNaN(groupId)) {
    return res.status(400).json({ error: "Invalid groupId" });
  }

  if (!name || !description) {
    return res.status(400).json({ error: "Name and description are required" });
  }



  try {
    const updated = await groupModel.updateGroup(groupId, name, description, photo_url);
    if (!updated) return res.status(500).json({ error: "Update failed" });

    res.json({ success: true, message: "Group updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getGroupMemberProfiles(req, res) {
    const { group_id } = req.params;
    try {
        const members = await groupModel.getGroupMemberProfiles(group_id);
        res.json({ success: true, data: members });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

async function deleteGroup(req, res) {
   try {
        const groupId = parseInt(req.params.group_id);
        if (isNaN(groupId)) {
            return res.status(400).json({ error: "Invalid group ID" });
        }

        const result = await groupModel.deleteGroup(groupId);
        
        if (result.success) {
            res.status(200).json({ message: "Group deleted successfully" });
        } else {
            res.status(500).json({ error: "Failed to delete group" });
        }
    } catch (error) {
        console.error('Error deleting group:', error);
        
        if (error.number === 547) {
            return res.status(400).json({ 
                error: "Cannot delete group because it still contains related data" 
            });
        }
        
        res.status(500).json({ 
            error: error.message || "Error deleting group" 
        });
    }
}




module.exports = {
  getUserGroups,
    createGroup,
    getGroupDetails,
    getGroupMember,
    getMemberDetail,
    updateGroup,
    getGroupMemberProfiles,
    deleteGroup,
    getgroupById,
    createGroup,
   addGroupMember,
   addGroupOwner,
    
};