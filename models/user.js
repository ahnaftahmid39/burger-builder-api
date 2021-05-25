const { Schema, model } = require('mongoose');
const jwt = require('jsonwebtoken');
const joi = require('joi');

const userSchema = Schema({
  email: {
    type: String,
    required: true,
    maxlength: 255,
    minlength: 8,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    maxlength: 1024,
    minlength: 5,
  },
  name: {
    type: String,
    maxlength: 100,
    minlength: 5,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
});
userSchema.methods.getJWT = function () {
  return jwt.sign(
    { _id: this._id, email: this.email, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};
const validateUser = (user) => {
  const schema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().min(5).max(255).required(),
    name: joi.string(),
  });
  return schema.validate(user);
}

module.exports.User = model('User', userSchema);
module.exports.validate = validateUser;