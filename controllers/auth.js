const { verify, reset } = require('../helper/email');
const { sendEmail } = require('../middleware/bravo');
const userModel = require('../models/user');
const cloudinary = require('../config/cloudinary');
const { format } = require('../helper/formatName');
const jwt = require('jsonwebtoken');
const secret = process.env.SECRET;
const bcrypt = require('bcrypt');
const { handleFileUpload } = require('../helper/upload');


exports.register = async (req, res) => {
  try {
    const { fullname, email, password, confirmPassword, phoneNumber } = req.body;
    const existingUser = await userModel.findOne({ $or: [{ email: email }, { phoneNumber: phoneNumber }] });
    if (existingUser) return res.status(400).json({ message: 'User with provided email or phone-number already exists' });
    if (password !== confirmPassword) return res.status(400).json({ message: 'Password do not match' });

    const user = await userModel.create({
      fullname: await format(fullname),
      email,
      password,
      phoneNumber,
    });

    const token = jwt.sign({ id: user._id }, secret, { expiresIn: '10mins' });
    const link = `https://talknet-hazel.vercel.app/verify/${token}`;
    const mail_details = { email, subject: 'Email Verification', html: await verify(user.fullname.split(' ')[0], link) };
    await sendEmail(mail_details);
    res.status(201).json({ message: 'Account created successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Cannot register user at this moment', error: error.message })
  }
};


exports.verify = async (req, res) => {
  try {
    const { token } = req.params;
    if (!token) return res.status(404).json({ message: 'Token not found' });
    jwt.verify(token, secret, async (error, payload) => {
      if (error) {
        if (error instanceof jwt.JsonWebTokenError) {
          const { id } = jwt.decode(token, secret)
          const user = await userModel.findById(id);
          if (!user) return res.status(404).json({ message: 'User not found' })
          if (user.isVerified === true) return res.status(400).json({ message: 'Account already verified', redirect: 'https://www.google.com' })
          const newToken = jwt.sign({ id: user._id }, secret, { expiresIn: '10mins' });
          const link = `https://talknet-hazel.vercel.app/verify/${newToken}`;
          const mail_details = { email: user.email, subject: 'RESEND: Email verification', html: await verify(user.fullname.split(' ')[0], link) };
          await sendEmail(mail_details);
          return res.status(201).json({ message: 'Link expired. A new link has been sent to email' })
        }
      } else {
        const user = await userModel.findById(payload.id);
        if (!user) return res.status(404).json({ message: 'User not found' })
        if (user.isVerified === true) return res.status(400).json({ message: 'Account already verified', redirect: 'https://www.google.com' })
        user.isVerified = true;
        await user.save();
        const accessToken = jwt.sign({ id: user._id, role: user.role }, secret, { expiresIn: '7d' });
        const refreshToken = jwt.sign({ id: user._id, role: user.role }, secret, { expiresIn: '14d' });

        res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 14 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({ message: 'Verified successfully', accessToken })
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Cannot verify user at this moment', error: error.message })
  }
};


exports.forgetPaswword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await userModel.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: 'User not found' })
    const token = jwt.sign({ id: user._id }, secret, { expiresIn: '10mins' });
    const link = `https://talknet-hazel.vercel.app/api/v1/verify/${token}`;
    const mail_details = { email, subject: 'Reset Password', html: await reset(user.fullname.split(' ')[0], link) };
    await sendEmail(mail_details);
    return res.status(200).json({ message: 'Reset link sent to email' })
  } catch (error) {
    res.status(500).json({ message: 'Cannot forget user password at this moment', error: error.message })
  }
};


exports.uploadProfile = async (req, res) => {
  const file = req.file;
  let profile;
  try {
    const { email, username } = req.body;
    const user = await userModel.findOne({ email: email.toLowerCase() });
    const existUsername = await userModel.findOne({ username: username.toLowerCase() });

    if (!user) {
      await handleFileUpload(file)
      return res.status(404).json({ message: 'User not found' });
    };

    if (existUsername) {
      await handleFileUpload(file)
      return res.status(404).json({ message: 'Username already taken' });
    };

    if (file && file.path) {
      const cloud = await cloudinary.uploader.upload(file.path);
      await handleFileUpload(file);
      profile = { url: cloud.secure_url, publicId: cloud.public_id };
    };

    Object.assign(user, { profile, username });
    await user.save();
    res.status(200).json({ message: 'User profile has been updated successfully' });
  } catch (error) {
    await handleFileUpload(file)
    res.status(500).json({ message: 'Cannot upload profile and username at this moment', error: error.message })
  }
};


exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword, confirmPassword } = req.body;
    if (!token) return res.status(404).json({ message: 'Token not found' });
    jwt.verify(token, secret, async (error, payload) => {
      if (error) {
        if (error instanceof jwt.JsonWebTokenError) {
          const { id } = jwt.decode(token, secret)
          const user = await userModel.findById(id);
          if (!user) return res.status(404).json({ message: 'User not found' })
          const newToken = jwt.sign({ id: user._id }, secret, { expiresIn: '10mins' });
          const link = `${req.protocol}://${req.get('host')}/api/v1/reset/${newToken}`;
          const mail_details = { email: user.email, subject: 'RESEND: Reset Password', html: await verify(user.fullname.split(' ')[0], link) };
          await sendEmail(mail_details);
          return res.status(201).json({ message: 'Link expired. A new link has been sent to email' })
        }
      } else {
        const user = await userModel.findById(payload.id);
        if (!user) return res.status(404).json({ message: 'User not found' })
        if (newPassword !== confirmPassword) return res.status(400).json({ message: 'Password do not match' })
        Object.assign(user, { password: newPassword, loginAttempt: 4 });
        await user.save();
        return res.status(200).json({ message: 'Password reset successful' })
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Cannot reset user password at this moment', error: error.message })
  }
};


exports.login = async (req, res) => {
  let query = {};
  try {
    const { identifier, password } = req.body;
    if (identifier.includes('@')) { query.email = identifier.toLowerCase() }
    else if (/^\d+$/.test(identifier)) { query.phoneNumber = identifier }
    else { query.username = identifier.toLowerCase() };
    const user = await userModel.findOne(query)
    if (!user) return res.status(404).json({ message: 'User not found' })
    if (user.loginAttempt <= 0) return res.status(400).json({ message: 'You have exceeded your login attempts. Please reset password.' })
    const correctPassword = await bcrypt.compare(password, user.password);

    if (!correctPassword) {
      user.loginAttempt = user.loginAttempt - 1;
      await user.save();
      return res.status(400).json({ message: `Incorrect password. ${user.loginAttempt} attempt(s) left` })
    };

    const accessToken = jwt.sign({ id: user._id, role: user.role }, secret, { expiresIn: '7d' });
    const refreshToken = jwt.sign({ id: user._id, role: user.role }, secret, { expiresIn: '14d' });
    Object.assign(user, { isLoggedIn: true, loginAttempt: 4 });
    await user.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 14 * 24 * 60 * 60 * 1000
    });

    const data = { _id: user._id, fullname: user.fullname, username: user.username, phoneNumber: user.phoneNumber, profile: user.profile, role: user.role };
    res.status(200).json({ message: 'Login successful', data, accessToken });
  } catch (error) {
    res.status(500).json({ message: 'Cannot login at this moment', error: error.message });
  }
};


exports.refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: 'No refresh token provided' });
    const payload = jwt.verify(token, process.env.secret);
    const user = await userModel.findById(payload.id);
    if (!user || user.refreshToken !== token) return res.status(403).json({ message: 'Invalid refresh token' });
    const newAccessToken = jwt.sign({ id: user._id, role: user.role }, process.env.secret, { expiresIn: '7d' });
    const newRefreshToken = jwt.sign({ id: user._id, role: user.role }, process.env.secret, { expiresIn: '14d' });
    await user.save();

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(401).json({ message: 'Cannot refresh token at this moment', error: error.message });
  }
};