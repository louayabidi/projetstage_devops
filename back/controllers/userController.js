const User = require('../models/usersModel');
const mongoose = require('mongoose');

// Get all users
 exports.getAllUsers = async (req, res) => {
	try {
		const page = parseInt(req.query.page) || 1; 
		const limit = parseInt(req.query.limit) || 5; 
		const skip = (page - 1) * limit;

		// Fetch users with pagination
		const users = await User.find()
			.select('-password') 
			.skip(skip)
			.limit(limit);

		// Count total users for pagination
		const totalUsers = await User.countDocuments();

		const totalPages = Math.ceil(totalUsers / limit);

		// Respond with the paginated data
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


// Get all boat owners with their boat information
exports.getAllBoatOwners = async (req, res) => {
  try {
    const boatOwners = await User.find({ role: 'boat_owner' })
      .populate('boat') // Populate the boat information
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



// Update current user profile
exports.updateCurrentUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    const updates = req.body;
    const file = req.file;

    console.log('Updating user:', userId); 
    // Find the user first
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

   console.log('Current user photo:', user.photo);
   
    if (file) {
      // Store the file path (adjust based on your storage setup)
      user.photo = `/uploads/${file.filename}`;
      console.log('New photo path:', user.photo);
    }

    // Apply other updates
    if (updates.firstName) user.firstName = updates.firstName;
    if (updates.lastName) user.lastName = updates.lastName;
    if (updates.phoneNumber) user.phoneNumber = updates.phoneNumber;

    await user.save();

    // Return the full URL for the photo
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

// Get current user profile
exports.getCurrentUser = async (req, res) => {
  try {
    // The user ID is available from the authenticated request
    const userId = req.user.userId;
    
    // Find the user by ID and exclude sensitive fields
    const user = await User.findOne({ userId })
      .select('-password -verificationCode -forgotPasswordCode')
      .populate('boat'); // Populate boat data if exists

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

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

/*
//finfonebyid 
exports.getUserById = async (req, res) => {
	const { id } = req.params;
	try {
		const user = await User.findOne({ userId: id });
		if (!user) {
			return res.status(404).json({ success: false, message: 'User not found!' });
		}
		res.status(200).json({ success: true, data: user });
	} catch (error) {
		console.error(error);
		res
			.status(500)
			.json({ success: false, message: 'An error occurred while fetching the user.' });
	}
};
*/

/*
exports.getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    // Validate the ID is a proper ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: 'An error occurred while fetching the user.' 
    });
  }
};

*/

// Upload profile image
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


// Delete user
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

