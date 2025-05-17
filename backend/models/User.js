const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    default: null,
  },
  firstname: {
    type: String,
    default: null,
  },
  lastname: {
    type: String,
    default: null,
  },
  role: {
    type: String,
    default: `user`,
  },
  bankAccount: {
    bankName: { type: String, default: null },
    accountName: { type: String, default: null },
    accountNumber: { type: String, default: null }
  },
  phonenumber: {
    type: String,
    default: null,
  },
  links: {
    pop_up: { type: String, default: null },
    lot: { type: String, default: null },
    rank: { type: String, default: null }
  },
  cardType: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    default: null,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  timestamps: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
