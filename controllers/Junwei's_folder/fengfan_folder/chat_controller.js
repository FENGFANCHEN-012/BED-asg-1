const chatModel = require('../../models/fengfan_folder/chat_model'); 




async function getChatHistory(req, res) {
  const { senderId, receiverId } = req.params;
  
  try {
    const messages = await chatModel.getChatHistory(senderId, receiverId);
    return res.json(messages);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return res.status(500).json({ error: 'Failed to fetch chat history' });
  }
}


async function sendMessage(req, res) {
  const { sender_id, receiver_id, message } = req.body;
  
  try {
    await chatModel.sendMessage(sender_id, receiver_id, message);
    return res.status(200).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({ error: 'Failed to send message' });
  }
}

module.exports = {
  getChatHistory,
  sendMessage
};
