const User = require('../models/usersModel');
const mongoose = require('mongoose');

exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select('-password')
      .skip(skip)
      .limit(limit);

    const totalUsers = await User.countDocuments();

    const totalPages = Math.ceil(totalUsers / limit);

    res.status(200).json({
      users,
      totalPages,
      currentPage: page,
      totalUsers
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllBoatOwners = async (req, res) => {
  try {
    const boatOwners = await User.find({ role: 'boat_owner' })
      .populate('boat')
      .select('-password -verificationCode -forgotPasswordCode');

    res.status(200).json({
      success: true,
      boatOwners: boatOwners
    });
  } catch (error) {
    console.error('Error fetching boat owners:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching boat owners'
    });
  }
};

exports.updateCurrentUser = async (req, res) => {
  try {
    const userId = req.user._id; // Use _id
    const updates = req.body;
    const file = req.file;

    console.log('Updating user:', userId);
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('Current user photo:', user.photo);
    if (file) {
      user.photo = `/Uploads/${file.filename}`;
      console.log('New photo path:', user.photo);
    }

    if (updates.firstName) user.firstName = updates.firstName;
    if (updates.lastName) user.lastName = updates.lastName;
    if (updates.phoneNumber) user.phoneNumber = updates.phoneNumber;

    await user.save();

    const userResponse = user.toObject();
    if (user.photo) {
      userResponse.photo = `${req.protocol}://${req.get('host')}${user.photo}`;
    }

    res.status(200).json({
      success: true,
      user: userResponse
    });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    console.log('Request user object:', req.user); // DEBUG
    console.log('User ID from request:', req.user._id); // DEBUG
    
    const userId = req.user._id;
    const user = await User.findById(userId)
      .select('-password -verificationCode -forgotPasswordCode')
      .populate('boat');

    if (!user) {
      console.log('User not found in database with ID:', userId);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('User retrieved successfully:', user.email);
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error getting current user:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting current user'
    });
  }
};

exports.uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.photo = req.file.path.replace(/\\/g, '/');
    await user.save();

    res.json({ filePath: user.photo });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};