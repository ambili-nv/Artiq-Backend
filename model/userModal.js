const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true },
  dob: { type: Date, required: true }, // Date of Birth
  password: { type: String, required: true },
  preferences: { type: [String], default: [] },
});

const User = mongoose.model('User', userSchema);
module.exports = User;
