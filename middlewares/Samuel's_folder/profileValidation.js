// middlewares/profileValidation.js
const Joi = require("joi");

// Schema for validating the profile name check
const profileNameSchema = Joi.object({
  name: Joi.string().min(1).max(100).required().messages({
    "string.base": "Profile name must be a string.",
    "string.empty": "Profile name cannot be empty.",
    "string.min": "Profile name must be at least 1 character long.",
    "string.max": "Profile name cannot exceed 100 characters.",
    "any.required": "Profile name is required.",
  }),
});

// Schema for validating the full profile creation data
const createProfileSchema = Joi.object({
  userId: Joi.number().integer().positive().required().messages({
    "number.base": "User ID must be a number.",
    "number.integer": "User ID must be an integer.",
    "number.positive": "User ID must be a positive number.",
    "any.required": "User ID is required.",
  }),
  name: Joi.string().min(1).max(100).required().messages({
    "string.base": "Profile name must be a string.",
    "string.empty": "Profile name cannot be empty.",
    "string.min": "Profile name must be at least 1 character long.",
    "string.max": "Profile name cannot exceed 100 characters.",
    "any.required": "Profile name is required.",
  }),
  hobbies: Joi.string().max(500).allow('').messages({ // Allow empty string for no hobbies
    "string.base": "Hobbies must be a string.",
    "string.max": "Hobbies description cannot exceed 500 characters.",
  }),
  age: Joi.number().integer().min(1).max(120).required().messages({
    "number.base": "Age must be a number.",
    "number.integer": "Age must be an integer.",
    "number.min": "Age must be at least 1.",
    "number.max": "Age cannot exceed 120.",
    "any.required": "Age is required.",
  }),
  description: Joi.string().min(1).max(1000).required().messages({
    "string.base": "Description must be a string.",
    "string.empty": "Description cannot be empty.",
    "string.min": "Description must be at least 1 character long.",
    "string.max": "Description cannot exceed 1000 characters.",
    "any.required": "Description is required.",
  }),
});

function validateProfileName(req, res, next) {
  const { error } = profileNameSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const message = error.details.map((d) => d.message).join(", ");
    return res.status(400).json({ error: message });
  }
  next();
}

function validateCreateProfile(req, res, next) {
  const { error } = createProfileSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const message = error.details.map((d) => d.message).join(", ");
    return res.status(400).json({ error: message });
  }
  next();
}
function validateProfileId(req, res, next) {
  const id = parseInt(req.params.id);
  if (isNaN(id) || id <= 0) {
    return res.status(400).json({ error: "Invalid profile ID" });
  }
  req.userId = id; 
  next();
}
module.exports = {
  validateProfileName,
  validateCreateProfile,
  validateProfileId,
};