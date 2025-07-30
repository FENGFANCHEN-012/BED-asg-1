const groupChatModel = require("../../models/fengfan_folder/group_chat_model");

async function getGroupChatHistory(req, res) {
  const { groupId } = req.params;

  try {
    const messages = await groupChatModel.getGroupChatHistory(parseInt(groupId));
    return res.json(messages);
  } catch (error) {
    console.error('Error fetching group chat history:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch group chat history' });
  }
}

async function sendGroupMessage(req, res) {
  const { group_id, sender_id, message } = req.body;

  if (!group_id || !sender_id || !message || message.trim() === '') {
    return res.status(400).json({ error: 'Missing or invalid required fields' });
  }

  try {
    const newMessage = await groupChatModel.sendGroupMessage(parseInt(group_id), parseInt(sender_id), message.trim());
    return res.status(200).json({ message: 'Group message sent successfully', chat_id: newMessage.chat_id });
  } catch (error) {
    console.error('Error sending group message:', error);
    return res.status(500).json({ error: error.message || 'Failed to send group message' });
  }
}

async function getGroupInfo(req, res) {
  const { groupId } = req.params;

  try {
    const groupInfo = await groupChatModel.getGroupInfo(parseInt(groupId));
    return res.json(groupInfo);
  } catch (error) {
    console.error('Error fetching group info:', error);
    return res.status(404).json({ error: error.message || 'Failed to fetch group info' });
  }
}

async function getGroupMembers(req, res) {
  const { groupId } = req.params;

  try {
    const members = await groupChatModel.getGroupMembers(parseInt(groupId));
    return res.json(members);
  } catch (error) {
    console.error('Error fetching group members:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch group members' });
  }
}

module.exports = {
  getGroupChatHistory,
  sendGroupMessage,
  getGroupInfo,
  getGroupMembers
};