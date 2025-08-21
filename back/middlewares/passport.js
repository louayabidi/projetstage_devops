const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt'); // Correct import
const User = require('../models/usersModel');

const jwt = require('jsonwebtoken');

const bcrypt = require('bcrypt');
const mongoose = require ('mongoose')
// JWT Strategy

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.TOKEN_SECRET,
  passReqToCallback: true
};


passport.use(
  new JwtStrategy(jwtOptions, async (req, jwtPayload, done) => {
    try {
      console.log('JWT Payload received:', jwtPayload);
      console.log('Verifying with TOKEN_SECRET:', process.env.TOKEN_SECRET);
      if (!jwtPayload._id) {
        console.log('No _id in JWT payload');
        return done(null, false);
      }
      const user = await User.findById(jwtPayload._id);
      if (!user) {
        console.log('User not found for ID:', jwtPayload._id);
        return done(null, false);
      }
      console.log('User found:', user.email, 'Role:', user.role);
      return done(null, { _id: user._id, role: user.role });
    } catch (err) {
      console.error('JWT verification error:', err.message);
      return done(err, false);
    }
  })
);


// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ email: profile.emails[0].value });

        if (!user) {
          user = new User({
            email: profile.emails[0].value,
            verified: true,
            password: await bcrypt.hash('password', 10), // Generate a hashed password
            age: 20,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName || 'Unknown',
          });
          await user.save();
        }
        const token = jwt.sign(
          { userId: user._id, email: user.email, verified: user.verified },
          process.env.TOKEN_SECRET,
          { expiresIn: '8h' }
        );
        return done(null, { user, token });
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Facebook Strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: '/api/auth/facebook/callback',
      profileFields: ['id', 'emails', 'name', 'birthday', 'location'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('Facebook Profile:', profile);

        let user = await User.findOne({ email: profile.emails[0]?.value });

        let age = null;
        if (profile._json.birthday) {
          const birthDate = new Date(profile._json.birthday);
          const today = new Date();
          age = today.getFullYear() - birthDate.getFullYear();
        }

        const now = Math.floor(Date.now() / 1000);
        const firstName = profile.name.givenName.toLowerCase();
        const lastName = profile.name.familyName.toUpperCase();
        const generatedPassword = `${now}${firstName}${lastName}`;

        const hashedPassword = await bcrypt.hash(generatedPassword, 10);

        if (!user) {
          console.log('Creating new user...');
          user = new User({
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            email: profile.emails[0]?.value,
            age: age || 18,
            password: hashedPassword,
            verified: true,
          });
          await user.save();
        } else {
          user.password = hashedPassword;
          await user.save();
        }

        const token = jwt.sign(
          { userId: user._id, email: user.email, verified: user.verified },
          process.env.TOKEN_SECRET,
          { expiresIn: '8h' }
        );

        console.log('Generated Password (Before Hashing):', generatedPassword); // Debug
        return done(null, { user, token });
      } catch (error) {
        console.error('Error in FacebookStrategy:', error);
        done(error, null);
      }
    }
  )
);

// Serialize and Deserialize User
passport.serializeUser((user, done) => {
  done(null, user.id || user.user.id); // Handle both user and { user, token } objects
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
