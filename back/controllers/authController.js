
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/usersModel');
const ActivityLog = require('../models/activityLog');
const nodemailer = require('nodemailer');
const transport = require('../middlewares/sendMail');
const mongoose = require('mongoose');
const Boat = require('../models/boat');
const { sendVerificationEmail } = require('../utils/email');
const {
  signupSchema,
  signinSchema,
  acceptCodeSchema,
  changePasswordSchema,
  acceptFPCodeSchema,
} = require('../middlewares/validator');
const { doHash, doHashValidation, hmacProcess } = require('../utils/hashing');

exports.signup = async (req, res) => {
  try {
    const { error } = signupSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }
    const { firstName, lastName, email, password, phoneNumber, role, photo, age, adminInfo } = req.body;

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    // Hash password
    const trimmedPassword = password.trim();
    const hashedPassword = await bcrypt.hash(trimmedPassword, 12);

    // Set boatInfoComplete and verified based on role
    const boatInfoComplete = role !== 'boat_owner';
    const verified = role === 'admin' || role === 'passenger';

    // Create user
    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phoneNumber,
      photo,
      age,
      role,
      boatInfoComplete,
      verified,
      ...(role === 'admin' && { adminInfo }),
    });

    // Save user and handle errors
    const savedUser = await user.save().catch((err) => {
      console.error('Error saving user:', err);
      throw new Error('Failed to save user to database');
    });

    // Remove password from response
    savedUser.password = undefined;

    // Generate JWT
    const token = jwt.sign(
      { _id: savedUser._id, email: savedUser.email, role: savedUser.role },
      process.env.TOKEN_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: savedUser,
      requiresBoatInfo: role === 'boat_owner',
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ success: false, message: 'Server error during signup', error: error.message });
  }
};

exports.signin = async (req, res) => {
  try {
    // Add validation for injection protection
    const { error } = signinSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const { email, password: rawPassword } = req.body;
    const password = rawPassword.trim();
    const existingUser = await User.findOne({ email }).select('+password');
    if (!existingUser) {
      return res.status(401).json({ success: false, message: 'No account found with this email address' });
    }
    console.log('Stored password hash length:', existingUser.password.length);
    console.log('Raw password received:', rawPassword);
    console.log('Trimmed password:', password);
    const isMatch = await doHashValidation(password, existingUser.password);
    console.log('Password comparison result:', isMatch);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect password' });
    }
    existingUser.password = undefined;
    const token = jwt.sign(
      { _id: existingUser._id, email: existingUser.email, role: existingUser.role },
      process.env.TOKEN_SECRET,
      { expiresIn: '8h' }
    );
    res.status(200).json({ success: true, token, user: existingUser });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

exports.signout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] || req.cookies.Authorization?.split(' ')[1];
    if (token && req.user?._id) {
      await ActivityLog.create({
        userId: req.user._id,
        action: 'LOGOUT',
        ipAddress: req.ip || 'Unknown',
        userAgent: req.headers['user-agent'] || 'Unknown',
      });
    }
    res.clearCookie('Authorization', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Signout error:', error);
    res.status(500).json({ success: false, message: 'Server error during logout' });
  }
};

exports.sendVerificationCode = async (req, res) => {
  const { email } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({ success: false, message: 'User does not exist!' });
    }
    if (existingUser.verified) {
      return res.status(400).json({ success: false, message: 'You are already verified!' });
    }
    if (!process.env.HMAC_VERIFICATION_CODE_SECRET) {
      console.error('HMAC_VERIFICATION_CODE_SECRET is not set in environment variables');
      return res.status(500).json({ success: false, message: 'Server configuration error: HMAC key missing' });
    }

    const codeValue = Math.floor(Math.random() * 1000000).toString();
    const htmlContent = `
      <h1>Account Verification</h1>
      <p>Please use the following code to verify your account:</p>
      <h2 style="color: #2e6da4; font-size: 24px;">${codeValue}</h2>
      <p>This code is valid for 5 minutes.</p>
      <p>If you did not request this, please ignore this email or contact support.</p>
    `;

    let retries = 3;
    while (retries > 0) {
      try {
        const info = await transport.sendMail({
          from: process.env.EMAIL_FROM || 'no-reply@yourapp.com',
          to: existingUser.email,
          subject: 'Account Verification Code',
          html: htmlContent,
        });

        if (info.accepted[0] === existingUser.email) {
          const hashedCodeValue = hmacProcess(codeValue, process.env.HMAC_VERIFICATION_CODE_SECRET);
          existingUser.verificationCode = hashedCodeValue;
          existingUser.verificationCodeValidation = Date.now();
          await existingUser.save();
          console.log(`Verification email sent to ${email}:`, {
            messageId: info.messageId,
            response: info.response,
          });
          return res.status(200).json({ success: true, message: 'Code sent!' });
        }
        return res.status(400).json({ success: false, message: 'Code send failed!' });
      } catch (error) {
        console.error(`Email attempt failed (${retries} retries left):`, {
          error: error.message,
          code: error.code,
          response: error.response,
        });
        retries--;
        if (retries === 0) {
          throw new Error(`Failed to send email to ${email}: ${error.message}`);
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  } catch (error) {
    console.error('Send verification code error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.verifyVerificationCode = async (req, res) => {
  const { email, providedCode } = req.body;
  try {
    const { error } = acceptCodeSchema.validate({ email, providedCode });
    if (error) {
      return res.status(401).json({ success: false, message: error.details[0].message });
    }
    const existingUser = await User.findOne({ email }).select('+verificationCode +verificationCodeValidation');
    if (!existingUser) {
      return res.status(401).json({ success: false, message: 'User does not exist!' });
    }
    if (existingUser.verified) {
      return res.status(400).json({ success: false, message: 'You are already verified!' });
    }
    if (!existingUser.verificationCode || !existingUser.verificationCodeValidation) {
      return res.status(400).json({ success: false, message: 'No valid verification code found. Please request a new code.' });
    }
    if (Date.now() - existingUser.verificationCodeValidation > 5 * 60 * 1000) {
      return res.status(400).json({ success: false, message: 'Code has expired!' });
    }
    if (!process.env.HMAC_VERIFICATION_CODE_SECRET) {
      console.error('HMAC_VERIFICATION_CODE_SECRET is not set in environment variables');
      return res.status(500).json({ success: false, message: 'Server configuration error: HMAC key missing' });
    }

    const hashedCodeValue = hmacProcess(providedCode.toString(), process.env.HMAC_VERIFICATION_CODE_SECRET);
    if (hashedCodeValue === existingUser.verificationCode) {
      existingUser.verified = true;
      existingUser.verificationCode = undefined;
      existingUser.verificationCodeValidation = undefined;
      await existingUser.save();
      return res.status(200).json({ success: true, message: 'Your account has been verified!' });
    }
    return res.status(400).json({ success: false, message: 'Invalid verification code!' });
  } catch (error) {
    console.error('Verify verification code error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.sendForgotPasswordCode = async (req, res) => {
  const { email } = req.body;
  try {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({ success: false, message: 'User does not exist!' });
    }

    if (!process.env.HMAC_VERIFICATION_CODE_SECRET) {
      console.error('HMAC_VERIFICATION_CODE_SECRET is not set in environment variables');
      return res.status(500).json({ success: false, message: 'Server configuration error: HMAC key missing' });
    }

    const codeValue = Math.floor(Math.random() * 1000000).toString();
    const htmlContent = `
      <h1>Password Reset Request</h1>
      <p>You have requested to reset your password. Use the following verification code to proceed:</p>
      <h2 style="color: #2e6da4; font-size: 24px;">${codeValue}</h2>
      <p>This code is valid for 5 minutes.</p>
      <p>If you did not request a password reset, please ignore this email or contact support.</p>
      <p><a href="http://localhost:5173/reset-password">Reset Your Password</a></p>
    `;

    let retries = 3;
    while (retries > 0) {
      try {
        const info = await transport.sendMail({
          from: process.env.EMAIL_FROM || 'no-reply@yourapp.com',
          to: existingUser.email,
          subject: 'Password Reset Verification Code',
          html: htmlContent,
        });

        if (info.accepted[0] === existingUser.email) {
          const hashedCodeValue = hmacProcess(codeValue, process.env.HMAC_VERIFICATION_CODE_SECRET);
          existingUser.forgotPasswordCode = hashedCodeValue;
          existingUser.forgotPasswordCodeValidation = Date.now();
          await existingUser.save();
          console.log(`Password reset email sent to ${email}:`, {
            messageId: info.messageId,
            response: info.response,
          });
          return res.status(200).json({ success: true, message: 'Code sent!' });
        }
        return res.status(400).json({ success: false, message: 'Code send failed!' });
      } catch (error) {
        console.error(`Email attempt failed (${retries} retries left):`, {
          error: error.message,
          code: error.code,
          response: error.response,
        });
        retries--;
        if (retries === 0) {
          throw new Error(`Failed to send email to ${email}: ${error.message}`);
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  } catch (error) {
    console.error('Send forgot password code error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.verifyForgotPasswordCode = async (req, res) => {
  const { email, providedCode, newPassword } = req.body;
  try {
    const { error } = acceptFPCodeSchema.validate({ email, providedCode, newPassword });
    if (error) {
      return res.status(401).json({ success: false, message: error.details[0].message });
    }

    const existingUser = await User.findOne({ email }).select('+forgotPasswordCode +forgotPasswordCodeValidation');
    if (!existingUser) {
      return res.status(401).json({ success: false, message: 'User does not exist!' });
    }

    if (!existingUser.forgotPasswordCode || !existingUser.forgotPasswordCodeValidation) {
      return res.status(400).json({ success: false, message: 'No valid reset code found. Please request a new code.' });
    }

    if (Date.now() - existingUser.forgotPasswordCodeValidation > 5 * 60 * 1000) {
      return res.status(400).json({ success: false, message: 'Code has expired!' });
    }

    if (!process.env.HMAC_VERIFICATION_CODE_SECRET) {
      console.error('HMAC_VERIFICATION_CODE_SECRET is not set in environment variables');
      return res.status(500).json({ success: false, message: 'Server configuration error: HMAC key missing' });
    }

    const hashedCodeValue = hmacProcess(providedCode.toString(), process.env.HMAC_VERIFICATION_CODE_SECRET);
    if (hashedCodeValue === existingUser.forgotPasswordCode) {
      const hashedPassword = await doHash(newPassword, 12);
      existingUser.password = hashedPassword;
      existingUser.forgotPasswordCode = undefined;
      existingUser.forgotPasswordCodeValidation = undefined;
      await existingUser.save();
      return res.status(200).json({ success: true, message: 'Password updated successfully!' });
    }

    return res.status(400).json({ success: false, message: 'Invalid verification code!' });
  } catch (error) {
    console.error('Verify forgot password code error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.changePassword = async (req, res) => {
  const { _id, verified } = req.user;
  const { oldPassword, newPassword } = req.body;
  try {
    const { error } = changePasswordSchema.validate({ oldPassword, newPassword });
    if (error) {
      return res.status(401).json({ success: false, message: error.details[0].message });
    }

    const existingUser = await User.findById(_id).select('+password');
    if (!existingUser) {
      return res.status(401).json({ success: false, message: 'User does not exist!' });
    }
    const result = await doHashValidation(oldPassword, existingUser.password);
    if (!result) {
      return res.status(401).json({ success: false, message: 'Invalid credentials!' });
    }
    const hashedPassword = await doHash(newPassword, 12);
    existingUser.password = hashedPassword;
    await existingUser.save();
    return res.status(200).json({ success: true, message: 'Password updated successfully!' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.verifyBoatOwner = async (req, res) => {
  try {
    console.log('User in request:', req.user);
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied: Admins only' });
    }
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }
    console.log('Verifying user ID:', id);

    const user = await User.findById(id).populate('boat');
    if (!user || user.role !== 'boat_owner') {
      return res.status(404).json({ success: false, message: 'Boat owner not found' });
    }
    console.log('User found:', { email: user.email, boat: user.boat });

    user.verified = true;
    user.rejected = false;
    user.rejectionReason = null;

    if (user.boat) {
      user.boat.isVerified = true;
      user.boat.isRejected = false;
      user.boat.rejectionReason = null;
      await user.boat.save();
      console.log('Boat updated:', user.boat);
    }

    await user.save();
    console.log('User updated:', { verified: user.verified, rejected: user.rejected });

    try {
      await sendVerificationEmail(user.email, true);
      console.log('Verification email sent to:', user.email);
    } catch (emailError) {
      console.error('Failed to send verification email:', {
        error: emailError.message,
        stack: emailError.stack,
        email: user.email,
      });
      return res.status(500).json({
        success: false,
        message: 'Boat owner verified, but failed to send email',
        error: emailError.message,
      });
    }

    res.status(200).json({ success: true, message: 'Boat owner verified successfully', user });
  } catch (error) {
    console.error('Verify boat owner error:', {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.rejectBoatOwner = async (req, res) => {
  try {
    console.log('RejectBoatOwner endpoint hit:', {
      user: req.user,
      params: req.params,
      body: req.body,
    });
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied: Admins only' });
    }
    const { id } = req.params;
    const { rejectionReason } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }
    if (!rejectionReason) {
      return res.status(400).json({ success: false, message: 'Rejection reason is required' });
    }

    const user = await User.findById(id).populate('boat');
    if (!user || user.role !== 'boat_owner') {
      return res.status(404).json({ success: false, message: 'Boat owner not found' });
    }
    console.log('User found for rejection:', { email: user.email, boat: user.boat });

    user.verified = false;
    user.rejected = true;
    user.rejectionReason = rejectionReason;

    if (user.boat) {
      user.boat.isVerified = false;
      user.boat.isRejected = true;
      user.boat.rejectionReason = rejectionReason;
      await user.boat.save();
      console.log('Boat updated:', user.boat);
    }

    await user.save();
    console.log('User updated:', { verified: user.verified, rejected: user.rejected, rejectionReason });

    try {
      await sendVerificationEmail(user.email, false, rejectionReason);
      console.log('Rejection email sent successfully to:', user.email);
    } catch (emailError) {
      console.error('Failed to send rejection email:', {
        error: emailError.message,
        stack: emailError.stack,
        email: user.email,
      });
      return res.status(500).json({
        success: false,
        message: 'Boat owner rejected, but failed to send email',
        error: emailError.message,
      });
    }

    res.status(200).json({ success: true, message: 'Boat owner rejected successfully', user });
  } catch (error) {
    console.error('Reject boat owner error:', {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.fixAllPasswords = async (req, res) => {
  try {
    const users = await User.find({});
    let fixedCount = 0;
    let errorCount = 0;
    for (const user of users) {
      try {
        if (!user.password || typeof user.password !== 'string') {
          errorCount++;
          continue;
        }
        const trimmedPassword = user.password.trim();
        if (trimmedPassword !== user.password) {
          user.password = trimmedPassword;
          await user.save();
          fixedCount++;
        }
      } catch (err) {
        errorCount++;
        console.error(`Error processing user ${user._id}:`, err.message);
      }
    }
    res.json({
      success: true,
      fixedCount,
      errorCount,
      message: `Processed ${users.length} users. Fixed ${fixedCount}, ${errorCount} had issues`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};

exports.verifyHash = async (req, res) => {
  try {
    const user = await User.findOne({ email: 'louay.abidi@esprit.tn' });
    const manualCheck = await bcrypt.compare('Azertyuiop123', user.password);
    res.json({
      storedHash: user.password,
      manualCheckResult: manualCheck,
      hashAlgorithm: user.password.substring(0, 6),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.testPasswordHash = async (req, res) => {
  const testPassword = 'Azertyuiop123';
  const storedHash = '$2b$12$gXM60BMVvZa6qJAKOzUusu3V.LUbIcexcHQp49JXmmRPyYqdrsgde';
  try {
    const isMatch = await bcrypt.compare(testPassword, storedHash);
    res.json({
      testPassword,
      storedHash,
      isMatch,
      hashAlgorithm: storedHash.substring(0, 6),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.emergencyPasswordReset = async (req, res) => {
  const email = 'louay@gmail.com';
  const newPassword = 'Azertyuiop123';
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const newHash = await bcrypt.hash(newPassword, 12);
    await User.updateOne({ _id: user._id }, { $set: { password: newHash } });
    const updatedUser = await User.findById(user._id).select('+password');
    const verify = await bcrypt.compare(newPassword, updatedUser.password);
    res.json({
      success: true,
      newHash: updatedUser.password,
      verificationResult: verify,
      message: verify ? 'Password successfully reset' : 'STILL FAILING - CRITICAL ISSUE',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.studentInfo = async (req, res) => {
  try {
    const { identifier, situation, disease, socialCase } = req.body;
    const userId = req.user._id;
    await User.findByIdAndUpdate(userId, {
      studentInfo: { identifier, situation, disease, socialCase },
    });
    res.status(200).json({ success: true, message: 'Student information saved successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.teacherInfo = async (req, res) => {
  try {
    const { number, bio, cv, diploma, experience, cin } = req.body;
    const userId = req.user._id;
    await User.findByIdAndUpdate(userId, {
      teacherInfo: { number, bio, cv, diploma, experience, cin },
    });
    res.status(200).json({ success: true, message: 'Teacher information saved successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password -verificationCode -forgotPasswordCode').lean();
    console.log('Fetched users count:', users.length);
    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully!',
      users,
    });
  } catch (error) {
    console.error('Error retrieving users:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving users.',
      error: error.message,
    });
  }
};

exports.getActivityLogs = async (req, res) => {
  try {
    const filter = req.user ? { userId: req.user._id } : {};
    const logs = await ActivityLog.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, logs });
  } catch (error) {
    console.error('Error retrieving logs:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
