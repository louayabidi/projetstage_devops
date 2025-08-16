// backend/middlewares/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/usersModel'); // Use correct model name

exports.authenticate = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token required'
      });
    }
    
    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    const user = await User.findById(decoded.userId); // Match your JWT payload
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }
console.log("Decoded token:", decoded);
console.log("User from DB:", user);

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({
      success: false,
      message: 'Please authenticate',
      error: error.message
    });
  }
};