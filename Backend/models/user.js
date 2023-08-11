const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    userName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (value) => {
          // Validate email format using a regular expression
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        },
        message: 'Invalid email format',
      },
    },
    password: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: true,
    },
    dateOfBirth: {
      type: Date,
      required: false,
    },
    address: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },
    phoneNumber: {
      type: String,
    },
    profileImage: {
      type: String,
    },
    role: {
      type: String,
      enum: ['User', 'Admin'],
      default: 'User',
    },
    resetToken: String,
    resetTokenExpiration: Date,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  });

const User = mongoose.model('User', userSchema);

module.exports = User;