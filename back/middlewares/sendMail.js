// middlewares/sendMail.js
const nodemailer = require('nodemailer');

function getTransport() {
  if (process.env.NODE_ENV === 'test') {
    return nodemailer.createTransport({
      jsonTransport: true, // logs emails instead of sending
    });
  } else {
    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
        pass: process.env.NODE_CODE_SENDING_EMAIL_PASSWORD,
      },
    });

    transport.verify((error, success) => {
      if (error) {
        console.error('Nodemailer transport verification failed:', error);
      } else {
        console.log('Nodemailer transport is ready to send emails');
      }
    });

    return transport;
  }
}

module.exports = getTransport;
