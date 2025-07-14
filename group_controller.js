const groupModel = require("../models/group_model");
const sql = require("mssql"); 
const dbConfig = require("../dbConfig");
// Get all books
async function  getGroupsByUser(req, res) {
  try {
    const { user_id } = req.query; // Assuming user_id is passed as a query parameter
    if (!user_id) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const groups = await groupModel.getGroupsByUser(user_id);
    res.status(200).json(groups);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error fetching groups" });
  }
}

module.exports = {
   getGroupsByUser
    
};