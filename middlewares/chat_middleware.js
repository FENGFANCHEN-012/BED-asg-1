const Joi = require('joi');


const sendMessageSchema = Joi.object({
  sender_id: Joi.number().integer().required(),
  receiver_id: Joi.number().integer().required(),
  message: Joi.string().trim().min(1).required()
});


const chatHistoryParamsSchema = Joi.object({
  senderId: Joi.string().required(),
  receiverId: Joi.string().required()
});

function validateSendMessage(req, res, next) {
  const { error } = sendMessageSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
}

function validateChatHistoryParams(req, res, next) {
  const { error } = chatHistoryParamsSchema.validate(req.params);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
}

module.exports = {
  validateSendMessage,
  validateChatHistoryParams
};