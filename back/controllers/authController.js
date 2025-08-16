const ActivityLog = require('../models/activityLog');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/usersModel');
const mongoose = require('mongoose');
const Boat = require('../models/boat');
const transport = require("../middlewares/sendMail");
const {
  signupSchema,
  signinSchema,
  acceptCodeSchema,
  changePasswordSchema,
  acceptFPCodeSchema,
} = require("../middlewares/validator");



const { doHash, doHashValidation, hmacProcess } = require("../utils/hashing");



//only admin can verifier the
exports.verifyBoatOwner = async (req, res) => {
  try {
    // Check if the requester is admin
     console.log('User in request:', req.user);
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied: Admins only' });
    }

    const { id } = req.params;

    // Find user and ensure they are a boat owner
    const user = await User.findById(id).populate('boat');
    if (!user || user.role !== 'boat_owner') {
      return res.status(404).json({ success: false, message: 'Boat owner not found' });
    }

    // Mark both user and boat as verified
    user.verified = true;
    if (user.boat) {
      user.boat.isVerified = true;
      await user.boat.save();
    }
    await user.save();

    res.status(200).json({ success: true, message: 'Boat owner verified successfully', user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


exports.signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phoneNumber, role, boatInfo } = req.body;
    
    if (!firstName || !lastName || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const trimmedPassword = password.trim();
    console.log('Signup raw password:', password);
    console.log('Signup trimmed password:', trimmedPassword);

    const hashedPassword = await doHash(trimmedPassword, 12);
    console.log('Hashed password:', hashedPassword);

    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phoneNumber,
      role,
      boatInfoComplete: role !== 'boat_owner',
      verified: role === 'admin' || role === 'passenger',
    });

    const savedUser = await user.save();
    console.log('User saved with password hash:', savedUser.password);

    if (role === 'boat_owner') {
      const boat = new Boat({
        owner: savedUser._id,
        boatLicense: boatInfo?.boatLicense || '',
        boatType: boatInfo?.boatType || '',
        boatCapacity: boatInfo?.boatCapacity || 0,
        isVerified: false,
      });
      await boat.save();
      savedUser.boat = boat._id;
      await savedUser.save();
    }

    // Fetch fresh user from DB with password included to verify
    const userFromDb = await User.findById(savedUser._id).select('+password');
    console.log('User password hash from DB after save:', userFromDb.password);

    savedUser.password = undefined;

    const token = jwt.sign(
      { userId: savedUser._id, email: savedUser.email, role: savedUser.role },
      process.env.TOKEN_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({ success: true, token, user: savedUser });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ success: false, message: 'Server error during signup', error: error.message });
  }
};

exports.fixAllPasswords = async (req, res) => {
  try {
    const users = await User.find({});
    let fixedCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        // Skip if password is missing or not a string
        if (!user.password || typeof user.password !== 'string') {
          errorCount++;
          continue;
        }

        const trimmedPassword = user.password.trim();
        
        // Only update if password actually changes
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
      message: `Processed ${users.length} users. Fixed ${fixedCount}, ${errorCount} had issues`
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};


// In authController.js
exports.verifyHash = async (req, res) => {
  try {
    const user = await User.findOne({ email: "louay.abidi@esprit.tn" });
    const manualCheck = await bcrypt.compare("Azertyuiop123", user.password);
    
    res.json({
      storedHash: user.password,
      manualCheckResult: manualCheck,
      hashAlgorithm: user.password.substring(0, 6) // Should be $2b$12$
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};




exports.signin = async (req, res) => {
  try {
    const { email, password: rawPassword } = req.body;
    const password = rawPassword.trim();

    const existingUser = await User.findOne({ email }).select('+password');
    if (!existingUser) {
      return res.status(401).json({ success: false, message: 'No account found with this email address' });
    }
    console.log('Stored password hash length:', existingUser.password.length);
console.log("Raw password received:", rawPassword);
console.log("Trimmed password:", password);
console.log("Stored hash from DB:", existingUser.password);
    const isMatch = await doHashValidation(password, existingUser.password);
console.log("Password comparison result:", isMatch);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect password' });
    }

    existingUser.password = undefined;

    const token = jwt.sign(
      { userId: existingUser._id, email: existingUser.email, role: existingUser.role },
      process.env.TOKEN_SECRET,
      { expiresIn: '8h' }
    );

    res.status(200).json({ success: true, token, user: existingUser });

  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};


exports.emergencyPasswordReset = async (req, res) => {
  const email = "louay@gmail.com";
  const newPassword = "Azertyuiop123"; // Using the exact test password
  
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Generate new hash with fresh salt
    const newHash = await bcrypt.hash(newPassword, 12);
    
    // Direct MongoDB update bypassing any middleware
    await User.updateOne(
      { _id: user._id },
      { $set: { password: newHash } }
    );

    // Verify the update
    const updatedUser = await User.findById(user._id).select('+password');
    const verify = await bcrypt.compare(newPassword, updatedUser.password);

    res.json({
      success: true,
      newHash: updatedUser.password,
      verificationResult: verify,
      message: verify ? 
        "Password successfully reset" : 
        "STILL FAILING - CRITICAL ISSUE"
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.testPasswordHash = async (req, res) => {
  const testPassword = "Azertyuiop123";
  const storedHash = "$2b$12$gXM60BMVvZa6qJAKOzUusu3V.LUbIcexcHQp49JXmmRPyYqdrsgde";
  
  try {
    const isMatch = await bcrypt.compare(testPassword, storedHash);
    res.json({
      testPassword,
      storedHash,
      isMatch,
      hashAlgorithm: storedHash.substring(0, 6) // Shows $2b$12$
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


//logout
exports.signout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] || req.cookies.Authorization?.split(' ')[1];
    if (token) {
     
      const userId = req.user?.userId;
      if (userId) {
        await ActivityLog.create({
          _id: userId,
          action: 'LOGOUT',
          ipAddress: req.ip || 'Unknown',
          userAgent: req.headers['user-agent'] || 'Unknown',
        });
      }
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









exports.signout = async (req, res) => {
  res
    .clearCookie('Authorization')
    .status(200)
    .json({ success: true, message: 'logged out successfully' });
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password -verificationCode -forgotPasswordCode');
    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully!',
      users: users,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving users.',
    });
  }
};

// Stratégie Facebook pour l'authentification



exports.studentInfo = async (req, res) => {
  try {
    const { identifier, situation, disease, socialCase } = req.body;
    const userId = req.user.id; // Supposons que l'utilisateur est authentifié

    // Mettez à jour l'utilisateur avec les informations de l'étudiant
    await User.findByIdAndUpdate(userId, {
      studentInfo: { identifier, situation, disease, socialCase },
    });

    res.status(200).json({ success: true, message: "Student information saved successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.teacherInfo = async (req, res) => {
  try {
    const { number, bio, cv, diploma, experience, cin } = req.body;
    const userId = req.user.id; // Supposons que l'utilisateur est authentifié

    // Mettez à jour l'utilisateur avec les informations de l'enseignant
    await User.findByIdAndUpdate(userId, {
      teacherInfo: { number, bio, cv, diploma, experience, cin },
    });

    res.status(200).json({ success: true, message: "Teacher information saved successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.sendVerificationCode = async (req, res) => {
  const { email } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({ success: false, message: 'User does not exists!' });
    }
    if (existingUser.verified) {
      return res.status(400).json({ success: false, message: 'You are already verified!' });
    }

    const codeValue = Math.floor(Math.random() * 1000000).toString();
    let info = await transport.sendMail({
      from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
      to: existingUser.email,
      subject: 'verification code',
      html: '<h1>' + codeValue + '</h1>',
    });

    if (info.accepted[0] === existingUser.email) {
      const hashedCodeValue = hmacProcess(
        codeValue,
        process.env.HMAC_VERIFICATION_CODE_SECRET
      );
      existingUser.verificationCode = hashedCodeValue;
      existingUser.verificationCodeValidation = Date.now();
      await existingUser.save();
      return res.status(200).json({ success: true, message: 'Code sent!' });
    }
    res.status(400).json({ success: false, message: 'Code sent failed!' });
  } catch (error) {
    console.log(error);
  }
};

exports.verifyVerificationCode = async (req, res) => {
  const { email, providedCode } = req.body;
  try {
    const { error, value } = acceptCodeSchema.validate({ email, providedCode });
    if (error) {
      return res.status(401).json({ success: false, message: error.details[0].message });
    }

    const codeValue = providedCode.toString();
    const existingUser = await User.findOne({ email }).select(
      '+verificationCode +verificationCodeValidation'
    );

    if (!existingUser) {
      return res.status(401).json({ success: false, message: 'User does not exists!' });
    }
    if (existingUser.verified) {
      return res.status(400).json({ success: false, message: 'you are already verified!' });
    }

    if (
      !existingUser.verificationCode ||
      !existingUser.verificationCodeValidation
    ) {
      return res.status(400).json({ success: false, message: 'something is wrong with the code!' });
    }

    if (Date.now() - existingUser.verificationCodeValidation > 5 * 60 * 1000) {
      return res.status(400).json({ success: false, message: 'code has been expired!' });
    }

    const hashedCodeValue = hmacProcess(
      codeValue,
      process.env.HMAC_VERIFICATION_CODE_SECRET
    );

    if (hashedCodeValue === existingUser.verificationCode) {
      existingUser.verified = true;
      existingUser.verificationCode = undefined;
      existingUser.verificationCodeValidation = undefined;
      await existingUser.save();
      return res.status(200).json({ success: true, message: 'your account has been verified!' });
    }
    return res.status(400).json({ success: false, message: 'unexpected occured!!' });
  } catch (error) {
    console.log(error);
  }
};

exports.changePassword = async (req, res) => {
  const { userId, verified } = req.user;
  const { oldPassword, newPassword } = req.body;
  try {
    const { error, value } = changePasswordSchema.validate({
      oldPassword,
      newPassword,
    });
    if (error) {
      return res.status(401).json({ success: false, message: error.details[0].message });
    }
    if (!verified) {
      return res.status(401).json({ success: false, message: 'You are not verified user!' });
    }
    const existingUser = await User.findOne({ _id: userId }).select(
      '+password'
    );
    if (!existingUser) {
      return res.status(401).json({ success: false, message: 'User does not exists!' });
    }
    const result = await doHashValidation(oldPassword, existingUser.password);
    if (!result) {
      return res.status(401).json({ success: false, message: 'Invalid credentials!' });
    }
    const hashedPassword = await doHash(newPassword, 12);
    existingUser.password = hashedPassword;
    await existingUser.save();
    return res.status(200).json({ success: true, message: 'Password updated!!' });
  } catch (error) {
    console.log(error);
  }
};

exports.sendForgotPasswordCode = async (req, res) => {
  const { email } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({ success: false, message: 'User does not exists!' });
    }

    const codeValue = Math.floor(Math.random() * 1000000).toString();
    let info = await transport.sendMail({
      from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
      to: existingUser.email,
      subject: 'Forgot password code',
      html: '<h1>' + codeValue + '</h1>',
    });

    if (info.accepted[0] === existingUser.email) {
      const hashedCodeValue = hmacProcess(
        codeValue,
        process.env.HMAC_VERIFICATION_CODE_SECRET
      );
      existingUser.forgotPasswordCode = hashedCodeValue;
      existingUser.forgotPasswordCodeValidation = Date.now();
      await existingUser.save();
      return res.status(200).json({ success: true, message: 'Code sent!' });
    }
    res.status(400).json({ success: false, message: 'Code sent failed!' });
  } catch (error) {
    console.log(error);
  }
};

exports.verifyForgotPasswordCode = async (req, res) => {
  const { email, providedCode, newPassword } = req.body;
  try {
    const { error, value } = acceptFPCodeSchema.validate({
      email,
      providedCode,
      newPassword,
    });
    if (error) {
      return res.status(401).json({ success: false, message: error.details[0].message });
    }

    const codeValue = providedCode.toString();
    const existingUser = await User.findOne({ email }).select(
      '+forgotPasswordCode +forgotPasswordCodeValidation'
    );

    if (!existingUser) {
      return res.status(401).json({ success: false, message: 'User does not exists!' });
    }

    if (
      !existingUser.forgotPasswordCode ||
      !existingUser.forgotPasswordCodeValidation
    ) {
      return res.status(400).json({ success: false, message: 'something is wrong with the code!' });
    }

    if (
      Date.now() - existingUser.forgotPasswordCodeValidation >
      5 * 60 * 1000
    ) {
      return res.status(400).json({ success: false, message: 'code has been expired!' });
    }

    const hashedCodeValue = hmacProcess(
      codeValue,
      process.env.HMAC_VERIFICATION_CODE_SECRET
    );

    if (hashedCodeValue === existingUser.forgotPasswordCode) {
      const hashedPassword = await doHash(newPassword, 12);
      existingUser.password = hashedPassword;
      existingUser.forgotPasswordCode = undefined;
      existingUser.forgotPasswordCodeValidation = undefined;
      await existingUser.save();
      return res.status(200).json({ success: true, message: 'Password updated!!' });
    }
    return res.status(400).json({ success: false, message: 'unexpected occured!!' });
  } catch (error) {
    console.log(error);
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password -verificationCode -forgotPasswordCode');
    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully!',
      users: users,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving users.',
    });
  }
};

exports.getActivityLogs = async (req, res) => {
	try {
		const filter = req.user ? { userId: req.user.userId } : {}; // Appliquer le filtre seulement si req.user existe
		const logs = await ActivityLog.find(filter).sort({ createdAt: -1 });

		res.status(200).json({ success: true, logs });
	} catch (error) {
		console.error('Erreur lors de la récupération des logs:', error);
		res.status(500).json({ success: false, message: 'Server error' });
	}
};
