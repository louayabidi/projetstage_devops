// passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const User = require('../models/usersModel');
const ActivityLog = require('../models/activityLog');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.TOKEN_SECRET,
  passReqToCallback: true,
};

passport.use(
  new JwtStrategy(jwtOptions, async (req, jwtPayload, done) => {
    try {
      console.log('JWT Payload received:', jwtPayload);
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

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback',
      passReqToCallback: true, // Add this to pass req to callback
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        console.log('Google Profile:', profile);
        const email = profile.emails?.[0]?.value;
        if (!email || !profile.emails[0].verified) {
          console.error('Google Strategy: No verified email found');
          return done(new Error('No verified email found'), null);
        }

        let user = await User.findOne({ email });

        if (!user) {
          const defaultRole = 'passenger';
          const hashedPassword = await bcrypt.hash(Math.random().toString(36).substring(7), 12);

          user = new User({
            email,
            firstName: profile.name.givenName || 'Google',
            lastName: profile.name.familyName || 'User',
            photo: profile.photos?.[0]?.value || '',
            age: null,
            role: defaultRole,
            verified: true,
            boatInfoComplete: true, // Passenger doesn't need boat info
            password: hashedPassword,
          });
          await user.save();
          console.log('New Google user created:', { email: user.email, role: user.role });
        } else {
          if (!user.photo && profile.photos?.[0]?.value) {
            user.photo = profile.photos[0].value;
            await user.save();
          }
          console.log('Existing Google user found:', { email: user.email, role: user.role });
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

        return done(null, { user, token });
      } catch (error) {
        console.error('Google Strategy error:', error.message);
        return done(error, null);
      }
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: '/api/auth/facebook/callback',
      profileFields: ['id', 'emails', 'name', 'birthday', 'location'],
      passReqToCallback: true, // Add this for consistency
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        console.log('Facebook Profile:', profile);
        const email = profile.emails?.[0]?.value;
        if (!email) {
          console.error('Facebook Strategy: No email found');
          return done(new Error('No email found'), null);
        }

        let user = await User.findOne({ email });

        let age = null;
        if (profile._json.birthday) {
          const birthDate = new Date(profile._json.birthday);
          const today = new Date();
          age = today.getFullYear() - birthDate.getFullYear();
        }

        const defaultRole = 'passenger';
        const hashedPassword = await bcrypt.hash(Math.random().toString(36).substring(7), 12);

        if (!user) {
          user = new User({
            firstName: profile.name.givenName || 'Facebook',
            lastName: profile.name.familyName || 'User',
            email,
            age: age || null,
            role: defaultRole,
            verified: true,
            boatInfoComplete: true,
            password: hashedPassword,
          });
          await user.save();
          console.log('New Facebook user created:', { email: user.email, role: user.role });
        } else {
          if (!user.photo && profile.photos?.[0]?.value) {
            user.photo = profile.photos[0].value;
            await user.save();
          }
          console.log('Existing Facebook user found:', { email: user.email, role: user.role });
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

        return done(null, { user, token });
      } catch (error) {
        console.error('Facebook Strategy error:', error.message);
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.user ? user.user._id : user.id);
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