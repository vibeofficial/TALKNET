const jwt = require('jsonwebtoken');

exports.refreshToken = async (payload) => {
  try {
    const token = jwt.sign(payload, process.env.SECRET, { expiresIn: '1day' });
    return token;
  } catch (error) {
    throw new Error("Error creating a refresh token");
  }
};