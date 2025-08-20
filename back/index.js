// backend/index.js
const axios = require('axios');
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
require('dotenv').config();
const bodyParser = require('body-parser');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const moduleRouter = require('./routers/moduleRouter');
const userRouter = require('./routers/userRouter');
const authRouter = require('./routers/authRouter');
const boatRouter = require('./routers/boat');
const passport = require('./middlewares/passport');
const session = require('express-session');
const User = require('./models/usersModel'); // Ensure User model is imported
const Boat = require('./models/boat'); // Import Boat model for Socket.IO
const bookingRouter = require('./routers/bookingRouter');
// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('updateBoatLocation', async ({ boatId, latitude, longitude, token }) => {
    try {
      const decoded = require('jsonwebtoken').verify(token, process.env.TOKEN_SECRET);
      const boat = await Boat.findById(boatId);
      if (!boat || boat.owner.toString() !== decoded.userId) {
        socket.emit('error', { message: 'Unauthorized' });
        return;
      }

      boat.location = {
        type: 'Point',
        coordinates: [longitude, latitude]
      };
      boat.lastLocationUpdate = new Date();
      await boat.save();

      // Broadcast updated boat data to all clients
      io.emit('boatLocationUpdate', {
        boatId: boat._id,
        latitude: boat.location.coordinates[1], // [latitude, longitude] for frontend
        longitude: boat.location.coordinates[0],
        name: boat.name,
        boatType: boat.boatType,
        boatCapacity: boat.boatCapacity,
        owner: { firstName: boat.owner.firstName, lastName: boat.owner.lastName }
      });
    } catch (error) {
      console.error('WebSocket error:', error);
      socket.emit('error', { message: 'Failed to update location' });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

console.log("MongoDB URI:", process.env.MONGODB_URI);
console.log("Port:", process.env.PORT);
console.log("Session Secret:", process.env.SESSION_SECRET);

// Middleware
app.use('/Uploads', express.static(path.join(__dirname, 'Uploads'), {
  setHeaders: (res) => {
    res.set('Cache-Control', 'public, max-age=31536000');
  }
}));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));


//test devops
app.get("/health", (req, res) => res.status(200).send("ok"));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 3600000
  }
}));
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/module', moduleRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/boats', boatRouter);
app.use('/api/bookings', bookingRouter);

app.get('/', (req, res) => {
  res.json({ message: 'Hello from the server' });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('updateBoatLocation', async ({ boatId, latitude, longitude, token }) => {
    try {
      const decoded = require('jsonwebtoken').verify(token, process.env.TOKEN_SECRET);
      const boat = await Boat.findById(boatId);
      if (!boat || boat.owner.toString() !== decoded.userId) {
        socket.emit('error', { message: 'Unauthorized' });
        return;
      }

      boat.location = {
        type: 'Point',
        coordinates: [longitude, latitude]
      };
      boat.lastLocationUpdate = new Date();
      await boat.save();

      io.emit('boatLocationUpdate', {
        boatId,
        latitude,
        longitude,
        name: boat.name
      });
    } catch (error) {
      console.error('WebSocket error:', error);
      socket.emit('error', { message: 'Failed to update location' });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Database connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

// LinkedIn OAuth Strategy
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
passport.use(new LinkedInStrategy({
  clientID: process.env.LINKEDIN_CLIENT_ID,
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
  callbackURL: 'http://localhost:5173/auth/linkedin/callback',
  scope: ['r_emailaddress', 'r_liteprofile']
}, async (token, tokenSecret, profile, done) => {
  try {
    const existingUser = await User.findOne({ email: profile.emails[0].value });
    if (!existingUser) {
      const newUser = new User({
        email: profile.emails[0].value,
        linkedInId: profile.id,
        name: profile.displayName,
        token
      });
      await newUser.save();
      return done(null, newUser);
    }
    return done(null, existingUser);
  } catch (error) {
    console.error(error);
    return done(error, null);
  }
}));

const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.TOKEN_SECRET
}, async (jwt_payload, done) => {
  try {
    const user = await User.findById(jwt_payload.userId);
    if (user) {
      return done(null, { _id: user._id, userId: user._id, role: user.role });
    }
    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

// Start server
server.listen(process.env.PORT || 3000, '0.0.0.0', () => {
  console.log(`Listening on port ${process.env.PORT || 3000}...`);
});
