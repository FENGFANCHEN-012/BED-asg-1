const Joi = require("joi");

const medSchema = Joi.object({
  user_id: Joi.number().required(),
  name: Joi.string().required(),
  dosage: Joi.string().required(),
  instructions: Joi.string().allow(""),
  frequency: Joi.string().required(),
  start_date: Joi.date().required(),
  end_date: Joi.date().optional(),
});

function validateMedication(req, res, next) {
  const { error } = medSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const message = error.details.map(d => d.message).join(", ");
    return res.status(400).json({ error: message });
  }
  next();
}

function validateId(req, res, next) {
  const id = parseInt(req.params.id);
  if (isNaN(id) || id <= 0) {
    return res.status(400).json({ error: "Invalid ID" });
  }
  next();
}

module.exports = { validateMedication, validateId };
