const chatController = require('../../../controllers/fengfan_folder/chat_controller');
const chatModel = require('../../../models/fengfan_folder/chat_model');

// Mock chatModel
jest.mock('../../models/fengfan_folder/chat_model');

describe('chatController', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getChatHistory', () => {
    it('should return chat history as JSON when successful', async () => {
      const mockMessages = [
        { id: 1, sender_id: 'user1', receiver_id: 'user2', message: 'Hi' },
        { id: 2, sender_id: 'user2', receiver_id: 'user1', message: 'Hello' }
      ];
      chatModel.getChatHistory.mockResolvedValue(mockMessages);

      const req = {
        params: {
          senderId: 'user1',
          receiverId: 'user2'
        }
      };
      const res = {
        json: jest.fn()
      };

      await chatController.getChatHistory(req, res);

      expect(chatModel.getChatHistory).toHaveBeenCalledWith('user1', 'user2');
      expect(res.json).toHaveBeenCalledWith(mockMessages);
    });

    it('should handle errors and return status 500', async () => {
      chatModel.getChatHistory.mockRejectedValue(new Error('DB Error'));

      const req = {
        params: {
          senderId: 'user1',
          receiverId: 'user2'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await chatController.getChatHistory(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch chat history' });
    });
  });

  describe('sendMessage', () => {
    it('should send message and return success response', async () => {
      chatModel.sendMessage.mockResolvedValue();

      const req = {
        body: {
          sender_id: 'user1',
          receiver_id: 'user2',
          message: 'Test message'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await chatController.sendMessage(req, res);

      expect(chatModel.sendMessage).toHaveBeenCalledWith('user1', 'user2', 'Test message');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Message sent successfully' });
    });

    it('should handle errors when sending message', async () => {
      chatModel.sendMessage.mockRejectedValue(new Error('DB Error'));

      const req = {
        body: {
          sender_id: 'user1',
          receiver_id: 'user2',
          message: 'Test message'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await chatController.sendMessage(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to send message' });
    });
  });

});
