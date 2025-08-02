const Joi = require("joi");

const medicationSchema = Joi.object({
  user_id: Joi.number().integer().required(),
  name: Joi.string().required(),
  dosage: Joi.string().required(),
  instructions: Joi.string().allow(""),
  time: Joi.string().required().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/),
  start_date: Joi.date().required(),
  end_date: Joi.date().allow(null)
});

function validateMedication(req, res, next) {
  const { error } = medicationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
}

module.exports = { validateMedication };

function validateId(req, res, next) {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid ID" });
  }
  next();
}

module.exports = {
  validateMedication,
  validateId
};