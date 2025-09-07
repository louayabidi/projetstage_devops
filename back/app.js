require('dotenv').config();
const express = require("express");
const path = require("path");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("./middlewares/passport");
const moduleRouter = require("./routers/moduleRouter");
const userRouter = require("./routers/userRouter");
const authRouter = require("./routers/authRouter");
const boatRouter = require("./routers/boat");
const bookingRouter = require("./routers/bookingRouter");
const travelInterestRouter = require("./routers/travelInterest");
const app = express();

// Middleware
app.use('/Uploads', express.static(path.join(__dirname, 'Uploads'), {
  setHeaders: (res) => res.set('Cache-Control', 'public, max-age=31536000')
}));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'default-session-secret',
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
app.use('/api/travel-interests', travelInterestRouter);

// Health route for testing
app.get("/health", (req, res) => {
  console.log('Health route accessed');
  res.status(200).send("ok");
});

// Error-handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

app.get('/', (req, res) => res.json({ message: 'Hello from the server' }));

module.exports = app;