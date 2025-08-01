// middlewares/profileValidation.js
const Joi = require("joi");

// Schema for validating the profile name check (if still needed as a separate check)
const profileNameSchema = Joi.object({
  name: Joi.string().min(1).max(100).required().messages({
    "string.base": "Profile name must be a string.",
    "string.empty": "Profile name cannot be empty.",
    "string.min": "Profile name must be at least 1 character long.",
    "string.max": "Profile name cannot exceed 100 characters.",
    "any.required": "Profile name is required.",
  }),
});

// Updated: Schema for validating user registration (user + profile data)
// 'role' is optional here; it will be defaulted to 'member' in registerUser
// or explicitly set by adminRegisterUser
const registerProfileSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required().messages({
    "string.base": "Username must be a string.",
    "string.alphanum": "Username must only contain alphanumeric characters.",
    "string.min": "Username must be at least 3 characters long.",
    "string.max": "Username cannot exceed 30 characters.",
    "any.required": "Username is required.",
  }),
  email: Joi.string().email().required().messages({
    "string.base": "Email must be a string.",
    "string.email": "Email must be a valid email address.",
    "any.required": "Email is required.",
  }),
  password: Joi.string().min(6).required().messages({
    "string.base": "Password must be a string.",
    "string.empty": "Password cannot be empty.",
    "string.min": "Password must be at least 6 characters long.",
    "any.required": "Password is required.",
  }),
  // Role is now OPTIONAL here, but validated if present
  role: Joi.string().valid('member', 'admin').optional().messages({ // Changed to optional()
    "any.only": "Role must be either 'member' or 'admin'.",
  }),
  name: Joi.string().min(1).max(100).required().messages({
    "string.base": "Profile name must be a string.",
    "string.empty": "Profile name cannot be empty.",
    "string.min": "Profile name must be at least 1 character long.",
    "string.max": "Profile name cannot exceed 100 characters.",
    "any.required": "Profile name is required.",
  }),
  hobbies: Joi.string().allow('').max(500).messages({
    "string.base": "Hobbies must be a string.",
    "string.max": "Hobbies cannot exceed 500 characters.",
  }),
  age: Joi.number().integer().min(1).max(120).required().messages({
    "number.base": "Age must be a number.",
    "number.integer": "Age must be an integer.",
    "number.min": "Age must be at least 1.",
    "number.max": "Age cannot exceed 120.",
    "any.required": "Age is required.",
  }),
  description: Joi.string().allow('').max(1000).messages({
    "string.base": "Description must be a string.",
    "string.max": "Description cannot exceed 1000 characters.",
  }),
});

// Schema for validating profile updates (for /profiles/me)
const updateProfileSchema = Joi.object({
  name: Joi.string().min(1).max(100).required().messages({
    "string.base": "Profile name must be a string.",
    "string.empty": "Profile name cannot be empty.",
    "string.min": "Profile name must be at least 1 character long.",
    "string.max": "Profile name cannot exceed 100 characters.",
    "any.required": "Profile name is required.",
  }),
  hobbies: Joi.string().allow('').max(500).messages({
    "string.base": "Hobbies must be a string.",
    "string.max": "Hobbies cannot exceed 500 characters.",
  }),
  age: Joi.number().integer().min(1).max(120).required().messages({
    "number.base": "Age must be a number.",
    "number.integer": "Age must be an integer.",
    "number.min": "Age must be at least 1.",
    "number.max": "Age cannot exceed 120.",
    "any.required": "Age is required.",
  }),
  description: Joi.string().allow('').max(1000).messages({
    "string.base": "Description must be a string.",
    "string.max": "Description cannot exceed 1000 characters.",
  }),
}).min(1);

function validateProfileName(req, res, next) {
  const { error } = profileNameSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const message = error.details.map((d) => d.message).join(", ");
    return res.status(400).json({ error: message });
  }
  next();
}

// This middleware will now be used for both public and admin registration,
// as the schema itself allows 'role' to be optional.
function validateRegisterProfile(req, res, next) {
  const { error } = registerProfileSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const message = error.details.map((d) => d.message).join(", ");
    return res.status(400).json({ error: message });
  }
  next();
}

function validateUpdateProfile(req, res, next) {
  const { error } = updateProfileSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const message = error.details.map((d) => d.message).join(", ");
    return res.status(400).json({ error: message });
  }
  next();
}

function validateProfileId(req, res, next) {
  const schema = Joi.object({
    id: Joi.number().integer().positive().required().messages({
      "number.base": "User ID must be a number.",
      "number.integer": "User ID must be an integer.",
      "number.positive": "User ID must be a positive number.",
      "any.required": "User ID is required.",
    }),
  });

  const { error } = schema.validate(req.params, { abortEarly: false });
  if (error) {
    const message = error.details.map((d) => d.message).join(", ");
    return res.status(400).json({ error: message });
  }
  next();
}


module.exports = {
  validateProfileName,
  validateRegisterProfile,
  validateUpdateProfile,
  validateProfileId,
};