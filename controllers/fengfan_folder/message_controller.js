const mailboxModel = require('../../models/fengfan_folder/message_model.js'); // Adjusted path to match your example

async function getMailboxMessages(req, res) {
    try {
        const userId = parseInt(req.params.user_id); // Match naming convention
        if (isNaN(userId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }
        const messages = await mailboxModel.getMessagesByUserId(userId);
        res.status(200).json(messages);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to get mailbox messages' });
    }
}


async function getMailboxMessages(req, res) {
    try {
        const userId = parseInt(req.params.user_id);
        if (isNaN(userId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }
        const messages = await mailboxModel.getMessagesByUserId(userId);
        res.status(200).json(messages);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to get mailbox messages' });
    }
}

module.exports = { getMailboxMessages };