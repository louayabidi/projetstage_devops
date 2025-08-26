const nodemailer = require('nodemailer');

const transport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
    pass: process.env.NODE_CODE_SENDING_EMAIL_PASSWORD,
  },
});

// Test transport configuration on startup
transport.verify((error, success) => {
  if (error) {
    console.error('Nodemailer transport verification failed:', error);
  } else {
    console.log('Nodemailer transport is ready to send emails');
  }
});

module.exports = transport;