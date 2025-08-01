const chatModel = require('../../../models/fengfan_folder/chat_model');
const db = require('../../../db');

jest.mock('../../../db', () => ({
  query: jest.fn(),
}));

describe('chatModel', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getChatHistory', () => {
    it('should return messages when query is successful', async () => {
      const mockData = [{ message: 'hi' }, { message: 'hello' }];
      db.query.mockResolvedValue(mockData);

      const result = await chatModel.getChatHistory('user1', 'user2');

      expect(db.query).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });

    it('should throw error if query fails', async () => {
      db.query.mockRejectedValue(new Error('DB failed'));
      await expect(chatModel.getChatHistory('u1', 'u2')).rejects.toThrow('DB failed');
    });
  });

  describe('sendMessage', () => {
    it('should insert a message successfully', async () => {
      db.query.mockResolvedValue({ affectedRows: 1 });

      const result = await chatModel.sendMessage('u1', 'u2', 'hello');

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT'),
        ['u1', 'u2', 'hello']
      );
      expect(result).toEqual({ affectedRows: 1 });
    });
  });

});