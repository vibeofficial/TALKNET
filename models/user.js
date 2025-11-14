const { Schema, model } = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = Schema({
  fullname: { type: String, required: true, trim: true },
  username: { type: String, trim: true, lowercase: true, default: '' },
  email: { type: String, required: true, lowercase: true, trim: true, unique: true },
  password: { type: String, required: true, trim: true },
  phoneNumber: { type: String, required: true, unique: true, trim: true },
  profile: { url: { type: String, trim: true, default: '' }, publicId: { type: String, trim: true, default: '' } },
  role: { type: String, lowercase: true, trim: true, enum: ['user', 'admin'], default: 'user' },
  isVerified: { type: Boolean, default: false },
  isLoggedIn: { type: Boolean, default: false },
  loginAttempt: { type: Number, default: 4 }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const hashPassword = await bcrypt.hash(this.password, await bcrypt.genSalt(10));
  this.password = hashPassword;
  next();
})

const userModel = model('users', userSchema);

module.exports = userModel;