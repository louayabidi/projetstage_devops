const express = require("express");
const authController = require("../controllers/authController");
const { identifier } = require("../middlewares/identification");
const router = express.Router();
const axios = require('axios');
const passport = require('../middlewares/passport');
require('dotenv').config(); // Load environment variables from .env file
const ocrController = require('../controllers/ocrController');


const User=require('../models/usersModel')
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const ActivityLog= require('../models/activityLog')
const {transport,transport2} = require('../middlewares/sendMail');

router.get('/google/callback', 
  passport.authenticate('google', { session: false }),
  (req, res) => {
      const { token } = req.user;

      res.cookie('Authorization', 'Bearer ' + token, {
          expires: new Date(Date.now() + 8 * 3600000),
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
      });

      res.redirect('http://localhost:5173/home');
  }
);

router.post("/signout", identifier, authController.signout);



router.get('/test-hash-length/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email }).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const hashLength = user.password ? user.password.length : 0;

    res.json({
      success: true,
      email: user.email,
      hashLength,
      hashPreview: user.password ? user.password.slice(0, 20) + '...' : null,
    });
  } catch (error) {
    console.error('Test hash length error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


// Routes pour la gestion des utilisateurs


// Route pour démarrer l'authentification LinkedIn
router.get("/linkedin", passport.authenticate("linkedin"));

// Route de callback après l'authentification LinkedIn
router.get(
  "/callback",
  passport.authenticate("linkedin", {
    failureRedirect: "/login", // Rediriger en cas d'échec
    successRedirect: "/", // Rediriger vers la page d'accueil en cas de succès
  })
);

router.post("/linkedinAuth", async (req, res) => {
  try {
    const { code, redirect_url } = req.body;
    if (!code || !redirect_url) {
      return res
        .status(400)
        .json({ message: "Code and redirect URL are required" });
    }

    const response = await axios.post(
      "https://www.linkedin.com/oauth/v2/accessToken",
      null,
      {
        params: {
          grant_type: "authorization_code",
          code,
          redirect_uri: redirect_url,
          client_id: process.env.LINKEDIN_CLIENT_ID,
          client_secret: process.env.LINKEDIN_CLIENT_SECRET,
        },
      }
    );

    const { access_token } = response.data;
    res.json({ token: access_token });
  } catch (error) {
    console.error(
      "Error during LinkedIn OAuth:",
      error.response ? error.response.data : error.message
    );
    res.status(500).json({
      message: "Error during LinkedIn OAuth process",
      details: error.response ? error.response.data : error.message,
    });
  }
});

router.get("/test-password-hash", authController.testPasswordHash);

router.post("/signin", authController.signin);





router.get('/verify-hash', authController.verifyHash);

// Routes pour la gestion des utilisateurs
router.post("/signup", authController.signup);

router.post("/signout", identifier, authController.signout);
router.post('/fix-passwords', authController.fixAllPasswords);
router.patch('/send-verification-code', identifier, authController.sendVerificationCode);
router.patch('/verify-verification-code', identifier, authController.verifyVerificationCode);
router.patch('/change-password', identifier, authController.changePassword);
router.patch('/send-forgot-password-code', authController.sendForgotPasswordCode);
router.patch('/verify-forgot-password-code', authController.verifyForgotPasswordCode);


router.get('/activity-logs', authController.getActivityLogs )
// Route pour démarrer l'authentification LinkedIn

// Route pour démarrer l'authentification LinkedIn

//******************************************************************************Linkedin********************************************************* */

const CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI;

const generateRandomPassword = (length = 12) => {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};
// Route pour démarrer l'authentification LinkedIn
router.get("/linkedin", (req, res) => {
  const linkedInAuthURL = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=openid%20profile%20email`;
  res.redirect(linkedInAuthURL);
});

// Callback après la connexion
router.get("/callback", async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: "Code de connexion manquant" });
  }

  try {
    const tokenResponse = await axios.post(
      "https://www.linkedin.com/oauth/v2/accessToken",
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.LINKEDIN_REDIRECT_URI, 
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const accessToken = tokenResponse.data.access_token;

    const profileResponse = await axios.get(
      "https://api.linkedin.com/v2/userinfo",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const userEmail = profileResponse.data.email;
    const userName = profileResponse.data.name;
    let user = await User.findOne({ email: userEmail });

    if (!user) {

      const randomPassword = generateRandomPassword();
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      user = new User({
        nom: userName,
        email: userEmail,
        password:hashedPassword
      });
      await user.save();
    }
// Générer un token JWT
const token = jwt.sign(
  {
    userId: user._id,
    email: user.email,
    verified: user.verified,
  },
  process.env.TOKEN_SECRET,
  { expiresIn: "8h" }
);

res.redirect(`http://localhost:5173/home?token=${token}`);



} catch (error) {
res.status(500).json({ error: "Échec de l'authentification LinkedIn" });
}
});

router.patch(
  '/verify-boat-owner/:id',
  identifier, 
  authController.verifyBoatOwner
);

router.get('/users/:id/details', async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select('-password'); // pas renvoyer mdp
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
router.get("/facebook", passport.authenticate('facebook', { scope: ['email', 'public_profile', 'user_birthday', 'user_location'] }));

router.get("/facebook/callback", 
  passport.authenticate('facebook', { session: false }),
  (req, res) => {
    const { token } = req.user;

    // Envoyer le token sous forme de cookie ou de réponse JSON
    res.cookie('Authorization', 'Bearer ' + token, {
      expires: new Date(Date.now() + 8 * 3600000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });
    

    res.json({ success: true, token, message: 'Facebook login successful!' });
  }
);

router.get('/boat-owners/verified', async (req, res) => {
  try {
    const verifiedBoatOwners = await User.find({ role: 'boat_owner', verified: true }).select('-password -verificationCode -verificationCodeValidation');
    res.status(200).json({ success: true, count: verifiedBoatOwners.length, boatOwners: verifiedBoatOwners });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
});




router.patch(
  "/send-verification-code",
  identifier,
  authController.sendVerificationCode
);
router.patch(
  "/verify-verification-code",
  identifier,
  authController.verifyVerificationCode
);
router.patch("/change-password", identifier, authController.changePassword);
router.patch(
  "/send-forgot-password-code",
  authController.sendForgotPasswordCode
);
router.patch(
  "/verify-forgot-password-code",
  authController.verifyForgotPasswordCode
);

router.get('/activity-logs', identifier, authController.getActivityLogs);
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));


module.exports = router;
