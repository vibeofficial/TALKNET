const { refreshToken } = require('../helper/token');
const userModel = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')
const cloudinary = require('../config/cloudinary');
const { handleFileUpload } = require('../helper/upload');


exports.getUsers = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);
    const users = await userModel.find({ role: 'user', _id: { $ne: user._id } }).select('-password -role -isVerified -isLoggedIn -loginAttempt -createdAt -updatedAt -__v').populate('friendsId');

    if (!user)
      return res.status(403).json({ message: 'Please login to continue' })

    res.status(200).json({ message: 'All users', total: users.length, data: users });
  } catch (error) {
    res.status(500).json({ message: `Cannot get users at this moment: ${error.message}` })
  }
};


exports.getUser = async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id).select('-password -role -isVerified -isLoggedIn -loginAttempt -createdAt -updatedAt -__v');
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.status(200).json({ message: 'Get user', data: user });
  } catch (error) {
    res.status(500).json({ message: `Cannot get user at this moment: ${error.message}` })
  }
};


exports.changePassword = async (req, res) => {
  try {
    const { id } = req.user;
    const { password, newPassword, confirmPassowrd } = req.body;
    const user = await userModel.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' })
    const correctPassword = await bcrypt.compare(password, user.password);
    if (!correctPassword) return res.status(400).json({ message: `Incorrect password.` });
    if (newPassword !== confirmPassowrd) return res.status(400).json({ message: 'Password do not match' });
    user.password = newPassword;
    await user.save();
    res.status(200).json({ message: 'Password changed successfully' })
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) return res.status(400).json({ message: 'Session timeout' });
    res.status(500).json({ message: `Cannot change password at this moment: ${error.message}` });
  }
};


exports.updateProfile = async (req, res) => {
  try {
    const file = req.file;
    let profile;
    try {
      const { username, phoneNumber } = req.body;
      const user = await userModel.findById(req.user.id);
      const existingUser = await userModel.findOne({ $or: [{ username: username.toLowerCase() }, { phoneNumber: phoneNumber }] });

      if (!user) {
        await handleFileUpload(file);
        return res.status(404).json({ message: 'User not found' });
      };

      if (existingUser) {
        await handleFileUpload(file);
        return res.status(400).json({ message: 'User with provided username or phone-number already exists' });
      };

      if (file && file.path) {
        await cloudinary.uploader.destroy(user.profile.publicId);
        const cloud = await cloudinary.uploader.upload(file.path)
        await handleFileUpload(file);
        profile = { url: cloud.secure_url, publicId: cloud.public_id }
      };

      const data = {
        username: user.username ?? username,
        phoneNumber: user.phoneNumber ?? phoneNumber,
        profile: user.profile ?? profile
      };

      const updated = await userModel.findByIdAndUpdate(user._id, data, { new: true });
      await updated.save();
      res.status(200).json({ message: 'User profile updated successfully' });
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) return res.status(400).json({ message: 'Session timeout' });
      res.status(500).json({ message: 'Cannot change password at this moment', error: error.message });
    }
  } catch (error) {
    await handleFileUpload(file);
    if (error instanceof jwt.JsonWebTokenError) return res.status(400).json({ message: 'Session timeout' });
    res.status(500).json({ message: `Cannot update profile at this moment: ${error.message}` });
  }
};