const nodemailer = require('nodemailer');

let transport;

if (process.env.NODE_ENV === 'test') {
  // Use a fake transport in tests
  transport = nodemailer.createTransport({
    jsonTransport: true, // just logs the emails instead of sending
  });
} else {
  transport = nodemailer.createTransport({
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
}

module.exports = transport;
