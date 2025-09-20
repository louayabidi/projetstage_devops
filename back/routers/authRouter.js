  
const express = require('express');
const authController = require('../controllers/authController');
const { identifier } = require('../middlewares/identification');
const router = express.Router();
const axios = require('axios');
const passport = require('../middlewares/passport');
require('dotenv').config();
const ocrController = require('../controllers/ocrController');
const mongoose = require('mongoose');
const User = require('../models/usersModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const ActivityLog = require('../models/activityLog');
const { transport } = require('../middlewares/sendMail');
const Boat = require('../models/boat');

// authRoutes.js (only Google-related routes for brevity)
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: 'http://localhost:5173/login?error=google_auth_failed',
  }),
  (req, res) => {
    try {
      if (!req.user || !req.user.token) {
        console.error('Google callback: No user or token found');
        return res.redirect('http://localhost:5173/login?error=no_user_or_token');
      }
      const { token } = req.user;
      console.log('Google callback - Token generated:', token ? 'Yes' : 'No');
     console.log('token' , token);
      res.cookie('Authorization', `Bearer ${token}`, {
        expires: new Date(Date.now() + 8 * 3600000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      });

      res.redirect(`http://localhost:5173/home?token=${token}&provider=google`);
    } catch (error) {
      console.error('Google callback error:', error.message);
      res.redirect(`http://localhost:5173/login?error=${encodeURIComponent(error.message)}`);
    }
  }
);

router.get('/facebook', passport.authenticate('facebook', { scope: ['email', 'public_profile', 'user_birthday', 'user_location'] }));

router.get(
  '/facebook/callback',
  passport.authenticate('facebook', {
    session: false,
    failureRedirect: 'http://localhost:5173/login?error=facebook_auth_failed',
  }),
  (req, res) => {
    try {
      const { token } = req.user;
      console.log('Facebook callback - Token generated:', token ? 'Yes' : 'No');

      res.cookie('Authorization', `Bearer ${token}`, {
        expires: new Date(Date.now() + 8 * 3600000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      });

      res.redirect(`http://localhost:5173/home?token=${token}&provider=facebook`);
    } catch (error) {
      console.error('Facebook callback error:', error.message);
      res.redirect(`http://localhost:5173/login?error=${encodeURIComponent(error.message)}`);
    }
  }
);

router.get('/linkedin', (req, res) => {
  const linkedInAuthURL = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${process.env.LINKEDIN_CLIENT_ID}&redirect_uri=${process.env.LINKEDIN_REDIRECT_URI}&scope=openid%20profile%20email`;
  res.redirect(linkedInAuthURL);
});

router.get('/callback', async (req, res) => {
  const { code, error } = req.query;

  if (error) {
    console.error('LinkedIn OAuth error:', error);
    return res.redirect(`http://localhost:5173/login?error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    console.error('LinkedIn callback: No code provided');
    return res.redirect('http://localhost:5173/login?error=linkedin_code_missing');
  }

  try {
    const tokenResponse = await axios.post(
      'https://www.linkedin.com/oauth/v2/accessToken',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.LINKEDIN_REDIRECT_URI,
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const accessToken = tokenResponse.data.access_token;

    const profileResponse = await axios.get('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const { email, given_name, family_name } = profileResponse.data;
    if (!email) {
      console.error('LinkedIn callback: No email found');
      return res.redirect('http://localhost:5173/login?error=no_email_found');
    }

    let user = await User.findOne({ email });

    if (!user) {
      const defaultRole = 'passenger';
      const hashedPassword = await bcrypt.hash(generateRandomPassword(), 12);
      user = new User({
        firstName: given_name || 'LinkedIn',
        lastName: family_name || 'User',
        email,
        role: defaultRole,
        verified: true,
        boatInfoComplete: true,
        password: hashedPassword,
      });
      await user.save();
      console.log('New LinkedIn user created:', { email: user.email, role: user.role });
    } else {
      console.log('Existing LinkedIn user found:', { email: user.email, role: user.role });
    }

    const activityLog = new ActivityLog({
      userId: user._id,
      action: 'LOGIN',
      ipAddress: req.ip || 'Unknown',
      userAgent: req.get('User-Agent') || 'Unknown',
    });
    await activityLog.save();

    const token = jwt.sign(
      { _id: user._id, email: user.email, role: user.role },
      process.env.TOKEN_SECRET,
      { expiresIn: '8h' }
    );

    res.redirect(`http://localhost:5173/home?token=${token}&provider=linkedin`);
  } catch (error) {
    console.error('LinkedIn callback error:', error.message);
    res.redirect(`http://localhost:5173/login?error=${encodeURIComponent(error.message)}`);
  }
});

const generateRandomPassword = (length = 12) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

// Other routes (unchanged)
router.get('/test-hash-length/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email }).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({
      success: true,
      email: user.email,
      hashLength: user.password ? user.password.length : 0,
      hashPreview: user.password ? user.password.slice(0, 20) + '...' : null,
    });
  } catch (error) {
    console.error('Test hash length error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/signup', authController.signup);
router.post('/signin', authController.signin);
router.post('/signout', identifier, authController.signout);
router.patch('/change-password', identifier, authController.changePassword);
router.patch('/send-verification-code', identifier, authController.sendVerificationCode);
router.patch('/verify-verification-code', identifier, authController.verifyVerificationCode);
router.patch('/send-forgot-password-code', authController.sendForgotPasswordCode);
router.patch('/verify-forgot-password-code', authController.verifyForgotPasswordCode);
router.put('/:id/verify', passport.authenticate('jwt', { session: false }), authController.verifyBoatOwner);
router.put('/:id/reject', passport.authenticate('jwt', { session: false }), authController.rejectBoatOwner);
router.get('/verify-hash', authController.verifyHash);
router.get('/activity-logs', identifier, authController.getActivityLogs);
router.get('/users/:id/details', async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    const boat = await Boat.findOne({ owner: userId });
    res.json({ user, boat });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get('/test-auth', identifier, (req, res) => {
  res.json({ success: true, user: req.user });
});
router.post('/ocr', ocrController.uploadImage);
router.post('/upload-image', ocrController.uploadImage);
router.get('/users', authController.getAllUsers);
router.get('/boat-owners/verified', async (req, res) => {
  try {
    const verifiedBoatOwners = await User.find({ role: 'boat_owner', verified: true }).select('-password -verificationCode -forgotPasswordCode');
    res.status(200).json({ success: true, count: verifiedBoatOwners.length, boatOwners: verifiedBoatOwners });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});

module.exports = router;