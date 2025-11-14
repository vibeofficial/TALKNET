const userModel = require('../models/user');
const jwt = require('jsonwebtoken');
const secret = process.env.SECRET;


exports.authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ message: 'Authentication failed: Token missing' });
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, secret);
    const user = await userModel.findById(decoded.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      const payload = jwt.decode(req.headers.authorization.split(' ')[1]);
      return res.status(401).json({ message: 'Access token expired', userId: payload?.id });
    };

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Invalid token' });
    };

    res.status(500).json({ message: 'Cannot authenticate user at this moment', error: error.message });
  }
};


exports.authorization = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ message: 'Authentication failed: Token missing' });
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, secret);
    const user = await userModel.findById(decoded.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if(user.role !== 'admin') return res.status(401).json({message: 'Authorization failed: Contact admin'});
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      const payload = jwt.decode(req.headers.authorization.split(' ')[1]);
      return res.status(401).json({ message: 'Access token expired', userId: payload?.id });
    };

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Invalid token' });
    };

    res.status(500).json({ message: 'Cannot authenticate user at this moment', error: error.message });
  }
};